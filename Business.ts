/**
 * @file models/Business.ts
 * @description Mongoose schema for onboarded businesses.
 *
 * Stores both the raw user input and the AI-generated profile + market analysis
 * returned by Gemini. Acts as the central entity that all other collections
 * (calendars, captions, trends, ads) reference via businessId.
 */

import mongoose, { Schema, Document, Model } from "mongoose";

// ── Sub-document interfaces ───────────────────────────────────────────────────

interface IContentPillar {
  pillar: string;
  description: string;
  postFrequency: string;
}

interface ITargetSegment {
  segment: string;
  size: string;
  insight: string;
}

interface IBusinessProfile {
  brandName: string;
  tagline?: string;
  brandVoice?: string;
  brandPersonality?: string[];
  usp?: string;
  differentiators?: string[];
}

interface IMarketAnalysis {
  targetSegments?: ITargetSegment[];
  competitiveLandscape?: string;
  marketOpportunities?: string[];
  localMarketInsight?: string;
}

interface IDigitalStrategy {
  primaryPlatforms?: string[];
  secondaryPlatforms?: string[];
  contentPillars?: IContentPillar[];
  recommendedPostingFrequency?: string;
}

interface IGrowthProjection {
  q2_2026_focus?: string;
  expectedFollowerGrowthPercent?: number;
  expectedEngagementRate?: string;
  keyMilestones?: string[];
}

// ── Main Document Interface ───────────────────────────────────────────────────

export interface IBusiness extends Document {
  // Raw user input
  websiteUrl: string;
  businessName: string;
  businessType: string;
  products: string;
  targetAudience: string;
  location: string;
  goals: string;

  // AI-generated output (nullable until Gemini responds)
  businessProfile?: IBusinessProfile;
  marketAnalysis?: IMarketAnalysis;
  digitalStrategy?: IDigitalStrategy;
  growthProjection?: IGrowthProjection;

  // Metadata
  fallbackUsed: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ────────────────────────────────────────────────────────────────────

const ContentPillarSchema = new Schema<IContentPillar>(
  {
    pillar: { type: String, required: true },
    description: { type: String },
    postFrequency: { type: String },
  },
  { _id: false }
);

const TargetSegmentSchema = new Schema<ITargetSegment>(
  {
    segment: { type: String },
    size: { type: String },
    insight: { type: String },
  },
  { _id: false }
);

const BusinessSchema = new Schema<IBusiness>(
  {
    // ── User Input ──────────────────────────────────────────
    websiteUrl: {
      type: String,
      default: "https://example.com",
      trim: true,
    },
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      index: true,
    },
    businessType: {
      type: String,
      required: [true, "Business type is required"],
      trim: true,
    },
    products: {
      type: String,
      required: [true, "Products/services description is required"],
    },
    targetAudience: {
      type: String,
      required: [true, "Target audience is required"],
    },
    location: {
      type: String,
      default: "Nashik, Maharashtra, India",
      trim: true,
    },
    goals: {
      type: String,
      required: [true, "Business goals are required"],
    },

    // ── AI-Generated Profile ────────────────────────────────
    businessProfile: {
      brandName: String,
      tagline: String,
      brandVoice: String,
      brandPersonality: [String],
      usp: String,
      differentiators: [String],
    },

    // ── AI-Generated Market Analysis ────────────────────────
    marketAnalysis: {
      targetSegments: [TargetSegmentSchema],
      competitiveLandscape: String,
      marketOpportunities: [String],
      localMarketInsight: String,
    },

    // ── AI-Generated Digital Strategy ───────────────────────
    digitalStrategy: {
      primaryPlatforms: [String],
      secondaryPlatforms: [String],
      contentPillars: [ContentPillarSchema],
      recommendedPostingFrequency: String,
    },

    // ── AI-Generated Growth Projection ──────────────────────
    growthProjection: {
      q2_2026_focus: String,
      expectedFollowerGrowthPercent: Number,
      expectedEngagementRate: String,
      keyMilestones: [String],
    },

    // ── Metadata ────────────────────────────────────────────
    fallbackUsed: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
BusinessSchema.index({ businessName: "text", businessType: "text" });
BusinessSchema.index({ location: 1 });
BusinessSchema.index({ createdAt: -1 });

// ── Model ─────────────────────────────────────────────────────────────────────
const Business: Model<IBusiness> = mongoose.model<IBusiness>(
  "Business",
  BusinessSchema
);

export default Business;