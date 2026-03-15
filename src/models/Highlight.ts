import mongoose, { Schema, models } from "mongoose";

const HighlightSchema = new Schema(
  {
    ownerId:      { type: String, required: true, index: true },
    projectSlug:  { type: String, required: true, index: true },
    filePath:     { type: String, required: true },
    title:        { type: String, required: true },
    description:  { type: String },
    tag:          {
      type: String,
      enum: ["architecture", "performance", "ai-logic", "security", "core", "other"],
      default: "other",
    },
    startLine:    { type: Number },
    endLine:      { type: Number },
    order:        { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Highlight || mongoose.model("Highlight", HighlightSchema);
