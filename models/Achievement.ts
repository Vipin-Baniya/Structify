import mongoose, { Schema, models } from "mongoose";

const AchievementSchema = new Schema(
  {
    ownerId:      { type: String, required: true, index: true },
    title:        { type: String, required: true },
    organization: { type: String },
    type:         { type: String, enum: ["hackathon", "award", "internship", "competition", "research", "other"], default: "other" },
    description:  { type: String },
    impact:       { type: String },
    proofUrl:     { type: String },
    date:         { type: Date },
    tags:         [String],
    featured:     { type: Boolean, default: false },
    order:        { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Achievement || mongoose.model("Achievement", AchievementSchema);
