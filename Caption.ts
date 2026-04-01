/**
 * @file models/Caption.ts
 * @description Mongoose schema for AI-generated caption sets.
 *
 * Each Caption document stores all 3 variations (emotional, aspirational,
 * offer-direct) generated for a single product + platform + goal combination.
 * Optionally linked to a Business via businessId.
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ── Sub-document interfaces ───────────────────────────────────────────────────

export type CaptionStyle =
  | "emotional_connect"
  | "aspirational_push"
  | "offer_direct";

interface ICaptionVariation {
  style: CaptionStyle;
  caption: string;
  hashtags: string[];
  cta: string;
  estimatedEngagementScore?: number;
  scoreRationale?: string;
}

// ── Main Document Interface ───────────────────────────────────────────────────

export interface ICaption extends Document {
  businessId?: Types.ObjectId;

  // Input params
  productDescription: string;
  brandTone: string;
  platform: string;
  targetAudience: string;
  campaignGoal: string;
  language: string;

  // AI output
  captions: ICaptionVariation[];
  bestPickRecommendation?: string;
  postingTip?: string;

  // Metadata
  fallbackUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ────────────────────────────────────────────────────────────────────

const CaptionVariationSchema = new Schema<ICaptionVariation>(
  {
    style: {
      type: String,
      enum: ["emotional_connect", "aspirational_push", "offer_direct"],
      required: true,
    },
    caption: { type: String, required: true },
    hashtags: [String],
    cta: { type: String },
    estimatedEngagementScore: {
      type: Number,
      min: 1,
      max: 10,
    },
    scoreRationale: { type: String },
  },
  { _id: false }
);

const CaptionSchema = new Schema<ICaption>(
  {
    // ── Reference (optional – captions can be generated without onboarding) ──
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      index: true,
      default: null,
    },

    // ── Input ───────────────────────────────────────────────
    productDescription: {
      type: String,
      required: [true, "Product description is required"],
    },
    brandTone: {
      type: String,
      default: "Warm, aspirational, proudly Indian",
    },
    platform: {
      type: String,
      enum: ["Instagram", "Facebook", "LinkedIn", "Twitter", "YouTube"],
      default: "Instagram",
    },
    targetAudience: { type: String },
    campaignGoal: {
      type: String,
      enum: ["awareness", "engagement", "sales", "leads", "traffic"],
      default: "engagement",
    },
    language: {
      type: String,
      enum: ["English", "Hinglish", "Hindi", "Marathi"],
      default: "English",
    },

    // ── AI Output ───────────────────────────────────────────
    captions: {
      type: [CaptionVariationSchema],
      default: [],
    },
    bestPickRecommendation: { type: String },
    postingTip: { type: String },

    // ── Metadata ────────────────────────────────────────────
    fallbackUsed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
CaptionSchema.index({ businessId: 1, createdAt: -1 });
CaptionSchema.index({ platform: 1, campaignGoal: 1 });
CaptionSchema.index({ createdAt: -1 });

// ── Model ─────────────────────────────────────────────────────────────────────
const Caption: Model<ICaption> = mongoose.model<ICaption>(
  "Caption",
  CaptionSchema
);

export default Caption;