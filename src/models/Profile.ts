import mongoose, { Schema, models } from "mongoose";

const ProfileSchema = new Schema(
  {
    ownerId:     { type: String, required: true, unique: true },
    name:        { type: String, default: "" },
    tagline:     { type: String, default: "" },   // "The architect behind Structify."
    bio:         { type: String, default: "" },   // main paragraph
    avatarUrl:   { type: String, default: "" },
    resumeUrl:   { type: String, default: "" },
    philosophy: [
      {
        title:       { type: String },
        description: { type: String },
      },
    ],
    links: [
      {
        label: { type: String },
        href:  { type: String },
        icon:  { type: String },   // mono character e.g. "⌥"
        color: { type: String },   // hex e.g. "#EAEAEA"
      },
    ],
  },
  { timestamps: true }
);

export default models.Profile || mongoose.model("Profile", ProfileSchema);
