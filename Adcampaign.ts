/**
 * @file models/AdCampaign.ts
 * @description Mongoose schema for AI-generated ad recommendations
 * and performance dashboard data.
 *
 * One AdCampaign document stores both the recommendation (ad copies,
 * targeting, projections) and the performance report (metrics, insights).
 * The `type` field distinguishes which phase the document represents.
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ── Sub-document interfaces ───────────────────────────────────────────────────

interface IAdCopyVariation {
  variationId: string;          // "A", "B", "C"
  format: string;
  headline: string;
  primaryText: string;
  cta: string;
  adType: "image" | "video" | "carousel";
  creativeDirection?: string;
}

interface ITargetingRecommendation {
  demographics?: {
    ageRange?: string;
    gender?: string;
    locations?: string[];
  };
  interests?: string[];
  behaviours?: string[];
  lookalikeSeed?: string;
  lookalikepercent?: string;
  excludeAudiences?: string[];
}

interface IAdSet {
  name: string;
  audience: string;
  budget: string;
  ads: string[];
}

interface ICampaignStructureItem {
  name: string;
  objective: string;
  adSets: IAdSet[];
}

interface IProjectedMetrics {
  estimatedReach?: string;
  estimatedImpressions?: string;
  estimatedCTR?: string;
  estimatedCPC?: string;
  estimatedCPM?: string;
  estimatedConversions?: string;
  conversionRate?: string;
  estimatedROAS?: string;
  estimatedRevenue?: string;
}

interface IABTestPlan {
  hypothesis?: string;
  variableToTest?: string;
  controlGroup?: string;
  testGroup?: string;
  successMetric?: string;
  testDuration?: string;
}

// ── Performance Dashboard sub-docs ────────────────────────────────────────────

interface IMetricValue {
  value: number | string;
  change?: string;
  trend?: "up" | "down" | "stable";
}

interface IPerformanceMetrics {
  reach?: IMetricValue;
  impressions?: IMetricValue;
  clicks?: IMetricValue;
  ctr?: IMetricValue;
  cpc?: IMetricValue;
  conversions?: IMetricValue;
  conversionRate?: IMetricValue;
  amountSpent?: IMetricValue;
  roas?: IMetricValue;
  revenue?: IMetricValue;
}

interface ITopContent {
  postType?: string;
  topic?: string;
  reach?: number;
  engagement?: string;
  conversions?: number;
}

interface IAIInsight {
  insightTitle: string;
  finding: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
  estimatedImpact?: string;
}

// ── Main Document Interface ───────────────────────────────────────────────────

export interface IAdCampaign extends Document {
  businessId?: Types.ObjectId;
  type: "recommendation" | "dashboard";

  // Shared input fields
  businessName: string;
  platform: string;

  // Recommendation-specific input
  businessType?: string;
  product?: string;
  targetAudience?: string;
  budget?: string;
  goal?: string;

  // Recommendation output
  campaignOverview?: Record<string, string>;
  adCopyVariations?: IAdCopyVariation[];
  targetingRecommendations?: ITargetingRecommendation;
  campaignStructure?: { campaigns: ICampaignStructureItem[] };
  projectedMetrics?: IProjectedMetrics;
  optimizationRecommendations?: string[];
  abTestPlan?: IABTestPlan;

  // Dashboard-specific input
  campaignName?: string;
  duration?: string;

  // Dashboard output
  reportPeriod?: string;
  overallHealth?: "excellent" | "good" | "average" | "poor";
  healthScore?: number;
  summary?: string;
  metrics?: IPerformanceMetrics;
  topPerformingContent?: ITopContent[];
  audienceInsights?: Record<string, unknown>;
  aiInsights?: IAIInsight[];
  nextStepRecommendations?: string[];

  // Metadata
  fallbackUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ────────────────────────────────────────────────────────────────────

const MetricValueSchema = new Schema<IMetricValue>(
  {
    value: { type: Schema.Types.Mixed },
    change: String,
    trend: { type: String, enum: ["up", "down", "stable"] },
  },
  { _id: false }
);

const AdCampaignSchema = new Schema<IAdCampaign>(
  {
    // ── Reference ───────────────────────────────────────────
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      index: true,
      default: null,
    },
    type: {
      type: String,
      enum: ["recommendation", "dashboard"],
      required: true,
      index: true,
    },

    // ── Shared Input ────────────────────────────────────────
    businessName: { type: String, required: true, trim: true },
    platform: { type: String, default: "Meta (Instagram + Facebook)" },

    // ── Recommendation Input ─────────────────────────────────
    businessType: String,
    product: String,
    targetAudience: String,
    budget: String,
    goal: String,

    // ── Recommendation Output ────────────────────────────────
    campaignOverview: { type: Map, of: String },
    adCopyVariations: [
      {
        variationId: String,
        format: String,
        headline: String,
        primaryText: String,
        cta: String,
        adType: {
          type: String,
          enum: ["image", "video", "carousel"],
        },
        creativeDirection: String,
        _id: false,
      },
    ],
    targetingRecommendations: {
      demographics: {
        ageRange: String,
        gender: String,
        locations: [String],
      },
      interests: [String],
      behaviours: [String],
      lookalikeSeed: String,
      lookalikepercent: String,
      excludeAudiences: [String],
    },
    campaignStructure: {
      campaigns: [
        {
          name: String,
          objective: String,
          adSets: [
            {
              name: String,
              audience: String,
              budget: String,
              ads: [String],
              _id: false,
            },
          ],
          _id: false,
        },
      ],
    },
    projectedMetrics: {
      estimatedReach: String,
      estimatedImpressions: String,
      estimatedCTR: String,
      estimatedCPC: String,
      estimatedCPM: String,
      estimatedConversions: String,
      conversionRate: String,
      estimatedROAS: String,
      estimatedRevenue: String,
    },
    optimizationRecommendations: [String],
    abTestPlan: {
      hypothesis: String,
      variableToTest: String,
      controlGroup: String,
      testGroup: String,
      successMetric: String,
      testDuration: String,
    },

    // ── Dashboard Input ──────────────────────────────────────
    campaignName: String,
    duration: String,

    // ── Dashboard Output ─────────────────────────────────────
    reportPeriod: String,
    overallHealth: {
      type: String,
      enum: ["excellent", "good", "average", "poor"],
    },
    healthScore: { type: Number, min: 0, max: 100 },
    summary: String,
    metrics: {
      reach: MetricValueSchema,
      impressions: MetricValueSchema,
      clicks: MetricValueSchema,
      ctr: MetricValueSchema,
      cpc: MetricValueSchema,
      conversions: MetricValueSchema,
      conversionRate: MetricValueSchema,
      amountSpent: MetricValueSchema,
      roas: MetricValueSchema,
      revenue: MetricValueSchema,
    },
    topPerformingContent: [
      {
        postType: String,
        topic: String,
        reach: Number,
        engagement: String,
        conversions: Number,
        _id: false,
      },
    ],
    audienceInsights: { type: Schema.Types.Mixed },
    aiInsights: [
      {
        insightTitle: String,
        finding: String,
        recommendation: String,
        priority: {
          type: String,
          enum: ["high", "medium", "low"],
        },
        estimatedImpact: String,
        _id: false,
      },
    ],
    nextStepRecommendations: [String],

    // ── Metadata ────────────────────────────────────────────
    fallbackUsed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
AdCampaignSchema.index({ businessId: 1, type: 1, createdAt: -1 });
AdCampaignSchema.index({ businessName: 1, type: 1 });

// ── Model ─────────────────────────────────────────────────────────────────────
const AdCampaign: Model<IAdCampaign> = mongoose.model<IAdCampaign>(
  "AdCampaign",
  AdCampaignSchema
);

export default AdCampaign;