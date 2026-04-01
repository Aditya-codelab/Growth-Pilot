/**
 * @file models/TrendReport.ts
 * @description Mongoose schema for AI-generated festival & trend reports.
 *
 * Each TrendReport captures the detected opportunities, trending topics,
 * and viral moment idea for a specific business type + location + date.
 * Reports are cached for 24 hours to avoid redundant Gemini calls.
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ── Sub-document interfaces ───────────────────────────────────────────────────

interface ICampaignIdea {
  title: string;
  concept: string;
  postTypes: string[];
  estimatedReach?: string;
  effort: "low" | "medium" | "high";
}

interface IFestivalOpportunity {
  festival: string;
  date: string;
  relevanceScore: number;       // 1–10
  relevanceReason: string;
  campaignIdeas: ICampaignIdea[];
}

interface ITrendingTopic {
  topic: string;
  relevance: string;
  contentAngle: string;
  urgency: "post within 48hrs" | "this week" | "this month";
}

interface IViralMoment {
  concept: string;
  timing: string;
  executionGuide: string;
}

// ── Main Document Interface ───────────────────────────────────────────────────

export interface ITrendReport extends Document {
  businessId?: Types.ObjectId;

  // Input params
  businessType: string;
  location: string;
  targetAudience: string;
  reportDate: string;           // "2026-04-01" – the date when report was generated

  // AI output
  detectedOpportunities: IFestivalOpportunity[];
  trendingTopics: ITrendingTopic[];
  viralMomentOpportunity?: IViralMoment;
  summary?: string;

  // Metadata
  fallbackUsed: boolean;
  expiresAt: Date;              // TTL: 24 hours after creation
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ────────────────────────────────────────────────────────────────────

const CampaignIdeaSchema = new Schema<ICampaignIdea>(
  {
    title: { type: String },
    concept: { type: String },
    postTypes: [String],
    estimatedReach: { type: String },
    effort: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { _id: false }
);

const FestivalOpportunitySchema = new Schema<IFestivalOpportunity>(
  {
    festival: { type: String, required: true },
    date: { type: String },
    relevanceScore: {
      type: Number,
      min: 1,
      max: 10,
    },
    relevanceReason: { type: String },
    campaignIdeas: [CampaignIdeaSchema],
  },
  { _id: false }
);

const TrendingTopicSchema = new Schema<ITrendingTopic>(
  {
    topic: { type: String },
    relevance: { type: String },
    contentAngle: { type: String },
    urgency: {
      type: String,
      enum: ["post within 48hrs", "this week", "this month"],
      default: "this week",
    },
  },
  { _id: false }
);

const TrendReportSchema = new Schema<ITrendReport>(
  {
    // ── Reference ───────────────────────────────────────────
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      index: true,
      default: null,
    },

    // ── Input ───────────────────────────────────────────────
    businessType: {
      type: String,
      required: [true, "Business type is required"],
    },
    location: {
      type: String,
      default: "Nashik, Maharashtra, India",
    },
    targetAudience: { type: String },
    reportDate: {
      type: String,
      required: true,
      index: true,
    },

    // ── AI Output ───────────────────────────────────────────
    detectedOpportunities: [FestivalOpportunitySchema],
    trendingTopics: [TrendingTopicSchema],
    viralMomentOpportunity: {
      concept: String,
      timing: String,
      executionGuide: String,
    },
    summary: { type: String },

    // ── Metadata ────────────────────────────────────────────
    fallbackUsed: { type: Boolean, default: false },

    // TTL index – MongoDB auto-deletes documents 24h after creation
    // so trend reports stay fresh and don't accumulate stale data.
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Compound Indexes ──────────────────────────────────────────────────────────
// Allows efficient lookup: "has this business type + location been fetched today?"
TrendReportSchema.index({ businessType: 1, location: 1, reportDate: 1 });

// ── Model ─────────────────────────────────────────────────────────────────────
const TrendReport: Model<ITrendReport> = mongoose.model<ITrendReport>(
  "TrendReport",
  TrendReportSchema
);

export default TrendReport;