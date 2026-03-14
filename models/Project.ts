import mongoose, { Schema, models } from "mongoose";

const ProjectSchema = new Schema(
  {
    ownerId:         { type: String, required: true, index: true },
    title:           { type: String, required: true },
    slug:            { type: String, required: true, unique: true },
    description:     { type: String },
    longDescription: { type: String },
    githubOwner:     { type: String },
    githubRepo:      { type: String },
    branch:          { type: String, default: "main" },
    techStack:       [String],
    banner:          { type: String },
    featured:        { type: Boolean, default: false },
    status:          { type: String, enum: ["active", "completed", "research"], default: "active" },
    liveUrl:         { type: String },
    order:           { type: Number, default: 0 },
    views:           { type: Number, default: 0 },
    architectureUrl:     { type: String },  // image URL for architecture diagram
    architectureDiagram: { type: String },  // mermaid or plain text description
  },
  { timestamps: true }
);

export default models.Project || mongoose.model("Project", ProjectSchema);
