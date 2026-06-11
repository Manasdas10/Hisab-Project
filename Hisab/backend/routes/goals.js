const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");

// GET all goals for active user
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const goals = await Goal.find({ userId });
    return res.json(goals);
  } catch (err) {
    console.error("Fetch goals error:", err);
    return res.status(500).json({ message: "Server error while fetching goals." });
  }
});

// POST new goal
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, targetAmount, deadline, milestones } = req.body || {};

    if (!title || !targetAmount) {
      return res.status(400).json({ message: "Title and Target Amount are required." });
    }

    const newGoal = await Goal.create({
      userId,
      title: title.trim(),
      targetAmount: Number(targetAmount),
      currentAmount: 0,
      deadline: deadline ? new Date(deadline) : null,
      milestones: Array.isArray(milestones)
        ? milestones.map((m) => ({
            title: m.title.trim(),
            amount: Number(m.amount),
            isCompleted: false,
          }))
        : [],
    });

    return res.status(201).json(newGoal);
  } catch (err) {
    console.error("Create goal error:", err);
    return res.status(500).json({ message: "Server error while creating goal." });
  }
});

// PUT update goal (Add Funds / Update milestones / General Update)
router.put("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const { amountToAdd, milestones, title, targetAmount, deadline } = req.body || {};

    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found." });
    }

    // General fields update
    if (title !== undefined) goal.title = title.trim();
    
    if (deadline !== undefined) {
      goal.deadline = deadline ? new Date(deadline) : null;
    }

    if (targetAmount !== undefined && !isNaN(Number(targetAmount))) {
      const newTarget = Number(targetAmount);
      goal.targetAmount = newTarget;
      
      // Update milestones' amounts based on new target amount
      goal.milestones.forEach((m) => {
        const match = m.title.match(/(\d+)%/);
        if (match) {
          const pct = parseInt(match[1]);
          m.amount = Math.round((newTarget * pct) / 100);
        } else if (m.title.toLowerCase().includes("100%")) {
          m.amount = newTarget;
        }
      });
    }

    // Update current progress amount and push to contributions
    if (amountToAdd && !isNaN(Number(amountToAdd))) {
      const addedVal = Number(amountToAdd);
      goal.currentAmount = Math.max(0, goal.currentAmount + addedVal);
      
      // Add to contributions history
      goal.contributions.push({
        amount: addedVal,
        createdAt: new Date(),
      });
    }

    // Auto-check/uncheck milestone status based on accumulated amount
    goal.milestones.forEach((m) => {
      m.isCompleted = (goal.currentAmount >= m.amount);
    });

    // Manual milestone toggles if passed
    if (Array.isArray(milestones)) {
      milestones.forEach((updateItem) => {
        const dbMilestone = goal.milestones.id(updateItem._id);
        if (dbMilestone) {
          dbMilestone.isCompleted = !!updateItem.isCompleted;
        }
      });
    }

    await goal.save();
    return res.json(goal);
  } catch (err) {
    console.error("Update goal error:", err);
    return res.status(500).json({ message: "Server error while updating goal." });
  }
});

// DELETE goal
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;

    const deleted = await Goal.findOneAndDelete({ _id: goalId, userId });
    if (!deleted) {
      return res.status(404).json({ message: "Goal not found or unauthorized." });
    }

    return res.json({ message: "Goal deleted successfully.", deleted });
  } catch (err) {
    console.error("Delete goal error:", err);
    return res.status(500).json({ message: "Server error while deleting goal." });
  }
});

module.exports = router;
