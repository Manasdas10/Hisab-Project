import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { sendChatMessage } from "../lib/api";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I am your **Hisab AI Advisor** 💰. I can help you analyze your spending patterns, track your budget status, and suggest ways to save money. What would you like to do today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage.trim();
    if (!text) return;

    if (!textToSend) {
      setInputMessage("");
    }

    const newMessages = [...messages, { id: crypto.randomUUID(), role: "user", content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // API call to backend AI router
      const responseData = await sendChatMessage(
        newMessages.map((m) => ({ role: m.role, content: m.content }))
      );
      
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: responseData?.response || "I didn't receive a response. Please try again.",
        },
      ]);
    } catch (err) {
      console.error("Failed to send chat message:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "❌ Sorry, I encountered an error. Make sure the backend server is running and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Quick suggestion chips
  const suggestionChips = [
    { label: "📊 Analyze my spending", query: "Analyze my spending" },
    { label: "⚖️ Check my budget", query: "How is my budget looking?" },
    { label: "💡 Savings advice", query: "Give me some savings tips" },
  ];

  // Render markdown-like text elements (bold, bullet points, linebreaks)
  const renderMessageContent = (text) => {
    if (!text) return "";
    
    // Split by lines to render linebreaks
    const lines = text.split("\n");
    
    return lines.map((line, lineIndex) => {
      // Check for bullet points
      const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-");
      let cleanLine = line;
      if (isBullet) {
        cleanLine = line.replace(/^[•\-]\s*/, "");
      }
      
      // Handle bold formatting (**text**)
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, partIndex) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={lineIndex} style={{ display: "flex", margin: "4px 0 4px 12px" }}>
            <span style={{ marginRight: "6px" }}>•</span>
            <span>{formattedParts}</span>
          </div>
        );
      }
      
      return (
        <p key={lineIndex} style={{ margin: cleanLine ? "6px 0" : "12px 0", minHeight: cleanLine ? "auto" : "8px" }}>
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        className="chat-fab" 
        onClick={() => setIsOpen(!isOpen)}
        title="AI Finance Advisor"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-avatar">🤖</div>
            <div>
              <h3>Hisab AI Advisor</h3>
              <p>Personal Finance Assistant</p>
            </div>
            <button className="chat-close" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-msg ${msg.role}`}>
                {renderMessageContent(msg.content)}
              </div>
            ))}
            
            {isLoading && (
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="chat-chips">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                className="chat-chip"
                onClick={() => handleSend(chip.query)}
                disabled={isLoading}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Ask anything about your money..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            <button 
              className="chat-send-btn" 
              onClick={() => handleSend()}
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
