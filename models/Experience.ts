import mongoose, { Schema, models } from "mongoose";

const ExperienceSchema = new Schema(
  {
    ownerId:       { type: String, required: true, index: true },
    organization:  { type: String, required: true },
    role:          { type: String, required: true },
    type:          { type: String, enum: ["internship", "full-time", "part-time", "freelance", "research", "volunteer"], default: "internship" },
    startDate:     { type: Date },
    endDate:       { type: Date },
    current:       { type: Boolean, default: false },
    description:   { type: String },
    technologies:  [String],
    impactMetrics: [String],
    logoUrl:       { type: String },
    order:         { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Experience || mongoose.model("Experience", ExperienceSchema);
