const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "👛",
    },
    color: {
      type: String,
      default: "#6c47ff",
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      default: "expense",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);
