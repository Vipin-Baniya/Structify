import mongoose, { Schema, models } from "mongoose";

const ProjectSchema = new Schema(
  {
    ownerId:             { type: String, required: true, index: true },
    title:               { type: String, required: true },
    slug:                { type: String, required: true, unique: true },
    description:         { type: String },
    longDescription:     { type: String },
    githubOwner:         { type: String },
    githubRepo:          { type: String },
    branch:              { type: String, default: "main" },
    techStack:           [String],
    banner:              { type: String },
    featured:            { type: Boolean, default: false },
    status:              { type: String, enum: ["active", "completed", "research"], default: "active" },
    liveUrl:             { type: String },
    demoUrl:             { type: String },          // separate demo URL
    videoUrl:            { type: String },          // demo video (YouTube/Vimeo)
    order:               { type: Number, default: 0 },
    views:               { type: Number, default: 0 },
    likes:               { type: Number, default: 0 },
    architectureUrl:     { type: String },
    architectureDiagram: { type: String },
    // GitHub enriched data (cached)
    githubStars:         { type: Number, default: 0 },
    githubForks:         { type: Number, default: 0 },
    githubLanguage:      { type: String },
    githubUpdatedAt:     { type: String },
    openIssues:          { type: Number, default: 0 },
    license:             { type: String },
    topics:              [String],          // GitHub repo topics/tags
    color:               { type: String },  // accent color for card
    pinned:              { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Project || mongoose.model("Project", ProjectSchema);
