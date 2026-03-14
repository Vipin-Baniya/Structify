import mongoose, { Schema, models } from "mongoose";

const PostSchema = new Schema(
  {
    ownerId:     { type: String, required: true, index: true },
    title:       { type: String, required: true },
    slug:        { type: String, required: true, unique: true },
    excerpt:     { type: String },           // short summary
    content:     { type: String },           // markdown body
    tags:        [String],
    published:   { type: Boolean, default: false },
    featured:    { type: Boolean, default: false },
    coverUrl:    { type: String },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Post || mongoose.model("Post", PostSchema);
