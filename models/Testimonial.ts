import mongoose, { Schema, models } from "mongoose";

const TestimonialSchema = new Schema(
  {
    ownerId:      { type: String, required: true, index: true },
    name:         { type: String, required: true },
    role:         { type: String },           // "Professor at IIT" / "Senior Engineer at Google"
    organization: { type: String },
    quote:        { type: String, required: true },
    avatarUrl:    { type: String },
    linkedinUrl:  { type: String },
    featured:     { type: Boolean, default: false },
    order:        { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Testimonial || mongoose.model("Testimonial", TestimonialSchema);
