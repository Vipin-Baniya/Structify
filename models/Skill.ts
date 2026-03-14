import mongoose, { Schema, models } from "mongoose";

const SkillSchema = new Schema(
  {
    ownerId:     { type: String, required: true, index: true },
    name:        { type: String, required: true },
    category:    {
      type: String,
      enum: ["ai-ml", "full-stack", "systems", "power", "competitive", "tools", "other"],
      default: "other",
    },
    proficiency: { type: Number, min: 1, max: 5, default: 3 }, // 1-5 stars
    iconUrl:     { type: String },   // optional logo URL
    order:       { type: Number, default: 0 },
    featured:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Skill || mongoose.model("Skill", SkillSchema);
