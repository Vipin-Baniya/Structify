import mongoose, { Schema, models } from "mongoose";

const CertificateSchema = new Schema(
  {
    ownerId:         { type: String, required: true, index: true },
    title:           { type: String, required: true },
    issuer:          { type: String },
    issueDate:       { type: Date },
    category:        { type: String, enum: ["programming", "ai", "cloud", "systems", "design", "other"], default: "other" },
    skills:          [String],
    imageUrl:        { type: String },
    imagePublicId:   { type: String },
    pdfUrl:          { type: String },
    verificationUrl: { type: String },
    featured:        { type: Boolean, default: false },
    order:           { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Certificate || mongoose.model("Certificate", CertificateSchema);
