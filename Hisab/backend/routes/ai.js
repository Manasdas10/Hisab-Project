const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const User = require("../models/User");

// Helper to format currency
function fmtCurrency(v) {
  return "₹" + Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

// Smart Mock Advice Engine when GEMINI_API_KEY is not configured
function generateMockResponse(user, transactions, query) {
  const lowercaseQuery = query.toLowerCase();
  
  // Calculate stats
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryMap = {};
  
  transactions.forEach((t) => {
    const amt = Number(t.amount || 0);
    if (t.type === "income") {
      totalIncome += amt;
    } else {
      totalExpense += amt;
      const cat = t.category || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + amt;
    }
  });
  
  const balance = totalIncome - totalExpense;
  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const topCategoryStr = sortedCategories.length > 0 
    ? `"${sortedCategories[0][0]}" (${fmtCurrency(sortedCategories[0][1])})`
    : "none yet";

  const banner = "\n\n💡 *Note: Add `GEMINI_API_KEY` in `backend/.env` to unlock live, customized AI intelligence!*";

  if (lowercaseQuery.includes("spend") || lowercaseQuery.includes("expense") || lowercaseQuery.includes("analyze")) {
    let advice = `Hello ${user.name}! Here is a quick analysis of your expenses:\n\n`;
    advice += `• **Total Expenses:** ${fmtCurrency(totalExpense)} across ${transactions.filter(t => t.type === 'expense').length} items.\n`;
    if (sortedCategories.length > 0) {
      advice += `• **Top Category:** You spent the most on ${topCategoryStr}.\n`;
      advice += `• **Category breakdown:**\n`;
      sortedCategories.slice(0, 3).forEach(([cat, val]) => {
        advice += `  - ${cat}: ${fmtCurrency(val)} (${((val / totalExpense) * 100).toFixed(1)}%)\n`;
      });
    } else {
      advice += `• No expenses recorded yet. Start logging expenses to see an analysis!\n`;
    }
    
    if (balance < 0) {
      advice += `\n⚠️ *Warning:* Your expenses exceed your income by ${fmtCurrency(Math.abs(balance))}. Try to review your top categories and reduce non-essential spending.`;
    } else {
      advice += `\n✅ *Status:* You have a positive net balance of ${fmtCurrency(balance)}. Keep it up!`;
    }
    
    return advice + banner;
  }

  if (lowercaseQuery.includes("budget") || lowercaseQuery.includes("goal")) {
    let advice = `Here is your budget status, ${user.name}:\n\n`;
    advice += `• **Total Spent this Month:** ${fmtCurrency(totalExpense)}\n`;
    advice += `• **Remaining Balance:** ${fmtCurrency(balance)}\n\n`;
    
    if (balance < 0) {
      advice += `⚠️ You are currently overspending (negative balance of ${fmtCurrency(balance)}). Consider postponing non-essential purchases.`;
    } else {
      advice += `💰 Your current financial status is healthy with ${fmtCurrency(balance)} left to spend or save!`;
    }
    return advice + banner;
  }

  if (lowercaseQuery.includes("save") || lowercaseQuery.includes("tip") || lowercaseQuery.includes("advice")) {
    let advice = `Here are 3 personalized savings tips for you, ${user.name}:\n\n`;
    if (sortedCategories.length > 0) {
      advice += `1. **Target ${sortedCategories[0][0]}:** Since ${topCategoryStr} is your highest category, cutting back just 10% here could save you ${fmtCurrency(sortedCategories[0][1] * 0.1)}!\n`;
    } else {
      advice += `1. **Track everything:** Try to log even small daily expenses like tea, coffee, or snacks. They add up quickly!\n`;
    }
    advice += `2. **Adopt the 50/30/20 rule:** Allocate 50% of your income for Needs, 30% for Wants, and 20% directly into Savings/Investments.\n`;
    advice += `3. **Set a Monthly Goal:** Use our "Monthly Expense Goal" card on the dashboard to restrict monthly outgoing funds.\n`;
    
    return advice + banner;
  }

  // Default welcome response
  return `Hi ${user.name}! I am your **Hisab AI Advisor** 💰.\n\nHere are some things you can ask me:\n` +
    `• *"Analyze my spending"* (category-wise split and alerts)\n` +
    `• *"How is my budget looking?"* (balance and health check)\n` +
    `• *"Give me some savings tips"* (actionable financial rules)\n\n` +
    `Feel free to type any of these or click the quick-action chips above!` + banner;
}

// Chat API Endpoint
router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body || {};
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "Messages history is required." });
    }

    const userQuery = messages[messages.length - 1].content;
    const userId = req.user.id;

    // Fetch user details and transactions for context
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Missing API key -> Fallback to smart advice engine
      const responseText = generateMockResponse(user, transactions, userQuery);
      return res.json({ response: responseText });
    }

    // Call Gemini API directly
    // Generate context summary
    let totalIncome = 0;
    let totalExpense = 0;
    const categories = {};
    const recentTx = [];

    transactions.forEach((t, i) => {
      const amt = Number(t.amount || 0);
      if (t.type === "income") {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        categories[t.category] = (categories[t.category] || 0) + amt;
      }

      // Keep only last 10 transactions in detail to keep context concise
      if (i < 10) {
        recentTx.push({
          type: t.type,
          amount: amt,
          category: t.category,
          date: t.date ? new Date(t.date).toDateString() : "",
          notes: t.notes || "",
        });
      }
    });

    const systemInstruction = 
      `You are "Hisab AI", a friendly, professional personal finance advisor. ` +
      `You help users manage their budget, analyze their expenses, and save money. ` +
      `Here is the user's financial profile:\n` +
      `- User Name: ${user.name}\n` +
      `- Total Income: ${fmtCurrency(totalIncome)}\n` +
      `- Total Expense: ${fmtCurrency(totalExpense)}\n` +
      `- Remaining Balance: ${fmtCurrency(totalIncome - totalExpense)}\n` +
      `- Expense Categories Breakdown: ${JSON.stringify(categories)}\n` +
      `- Last 10 Transactions: ${JSON.stringify(recentTx)}\n\n` +
      `Guidelines:\n` +
      `1. Keep responses short, concise, and easy to read (max 3 short paragraphs).\n` +
      `2. Use bullet points and bold text for visual structure.\n` +
      `3. Be encouraging and suggest actionable tips.\n` +
      `4. Format all monetary values in INR using the ₹ symbol.\n` +
      `5. Do not include technical setup jargon.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Map history to Gemini API format
    const formattedContents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: formattedContents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error:", errText);
      // Fallback on Gemini request failure
      const responseText = generateMockResponse(user, transactions, userQuery);
      return res.json({ response: responseText });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I could not generate a response right now. Please try again.";

    return res.json({ response: generatedText });

  } catch (err) {
    console.error("AI chat endpoint error:", err);
    return res.status(500).json({ message: "Server error while processing advice request." });
  }
});

module.exports = router;
