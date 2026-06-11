const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

const defaultCategories = [
  { _id: "default_food", name: "Food", icon: "🍔", color: "#f59e0b", type: "expense" },
  { _id: "default_travel", name: "Travel", icon: "🚗", color: "#3b82f6", type: "expense" },
  { _id: "default_shopping", name: "Shopping", icon: "🛒", color: "#8b5cf6", type: "expense" },
  { _id: "default_bills", name: "Bills", icon: "📄", color: "#ef4444", type: "expense" },
  { _id: "default_salary", name: "Salary", icon: "💰", color: "#10b981", type: "income" },
  { _id: "default_entertainment", name: "Entertainment", icon: "🎬", color: "#ec4899", type: "expense" },
  { _id: "default_health", name: "Health", icon: "❤️", color: "#f43f5e", type: "expense" },
  { _id: "default_education", name: "Education", icon: "📚", color: "#06b6d4", type: "expense" },
  { _id: "default_other", name: "Other", icon: "💵", color: "#6b7280", type: "expense" }
];

// GET categories (returns user's custom + defaults)
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const customCats = await Category.find({ userId });
    
    // Combine defaults and custom categories
    const combined = [...defaultCategories, ...customCats];
    return res.json(combined);
  } catch (err) {
    console.error("Fetch categories error:", err);
    return res.status(500).json({ message: "Server error while fetching categories." });
  }
});

// POST category
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, icon, color, type } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }

    const newCategory = await Category.create({
      userId,
      name: name.trim(),
      icon: icon || "👛",
      color: color || "#6c47ff",
      type: type || "expense",
    });

    return res.status(201).json(newCategory);
  } catch (err) {
    console.error("Create category error:", err);
    return res.status(500).json({ message: "Server error while creating category." });
  }
});

// DELETE category
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const catId = req.params.id;

    if (catId.startsWith("default_")) {
      return res.status(400).json({ message: "Cannot delete system default categories." });
    }

    const deleted = await Category.findOneAndDelete({ _id: catId, userId });
    if (!deleted) {
      return res.status(404).json({ message: "Category not found or unauthorized." });
    }

    return res.json({ message: "Category deleted successfully.", deleted });
  } catch (err) {
    console.error("Delete category error:", err);
    return res.status(500).json({ message: "Server error while deleting category." });
  }
});

module.exports = router;
