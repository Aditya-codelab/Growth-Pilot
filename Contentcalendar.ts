/**
 * @file models/ContentCalendar.ts
 * @description Mongoose schema for AI-generated weekly content calendars.
 *
 * Each calendar belongs to a Business (via businessId reference) and
 * stores a full 7-day plan including posts, platform, timing, and KPIs.
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ── Sub-document interfaces ───────────────────────────────────────────────────

interface IPost {
  platform: string;
  postType: "carousel" | "reel" | "static" | "story" | "youtube_short";
  time: string;
  topic: string;
  creativeDirection?: string;
  captionHook?: string;
  hashtags?: string[];
  kpiTarget?: string;
  isPublished?: boolean;
}

interface ICalendarDay {
  date: string;             // ISO date string: "2026-04-01"
  dayName: string;
  festivalOccasion?: string | null;
  campaignTheme?: string;
  posts: IPost[];
}

interface IWeeklyKPIs {
  targetReach?: string;
  targetEngagementRate?: string;
  targetLeads?: string;
}

// ── Main Document Interface ───────────────────────────────────────────────────

export interface IContentCalendar extends Document {
  businessId: Types.ObjectId;
  businessName: string;

  // Input params
  platforms: string;
  contentPillars: string;
  targetAudience: string;
  weekStartDate: string;

  // AI-generated output
  weekOf: string;
  overallTheme?: string;
  campaignFocus?: string;
  days: ICalendarDay[];
  weeklyKPIs?: IWeeklyKPIs;

  // Metadata
  fallbackUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ────────────────────────────────────────────────────────────────────

const PostSchema = new Schema<IPost>(
  {
    platform: { type: String, required: true },
    postType: {
      type: String,
      enum: ["carousel", "reel", "static", "story", "youtube_short"],
      required: true,
    },
    time: { type: String },
    topic: { type: String },
    creativeDirection: { type: String },
    captionHook: { type: String },
    hashtags: [String],
    kpiTarget: { type: String },
    isPublished: { type: Boolean, default: false },
  },
  { _id: false }
);

const CalendarDaySchema = new Schema<ICalendarDay>(
  {
    date: { type: String, required: true },
    dayName: { type: String },
    festivalOccasion: { type: String, default: null },
    campaignTheme: { type: String },
    posts: [PostSchema],
  },
  { _id: false }
);

const ContentCalendarSchema = new Schema<IContentCalendar>(
  {
    // ── Reference ───────────────────────────────────────────
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: [true, "businessId is required"],
      index: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    // ── Input ───────────────────────────────────────────────
    platforms: { type: String, default: "Instagram, Facebook" },
    contentPillars: { type: String },
    targetAudience: { type: String },
    weekStartDate: {
      type: String,
      required: [true, "weekStartDate is required"],
      index: true,
    },

    // ── AI Output ───────────────────────────────────────────
    weekOf: { type: String },
    overallTheme: { type: String },
    campaignFocus: { type: String },
    days: { type: [CalendarDaySchema], default: [] },
    weeklyKPIs: {
      targetReach: String,
      targetEngagementRate: String,
      targetLeads: String,
    },

    // ── Metadata ────────────────────────────────────────────
    fallbackUsed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
ContentCalendarSchema.index({ businessId: 1, weekStartDate: -1 });
ContentCalendarSchema.index({ createdAt: -1 });

// ── Model ─────────────────────────────────────────────────────────────────────
const ContentCalendar: Model<IContentCalendar> = mongoose.model<IContentCalendar>(
  "ContentCalendar",
  ContentCalendarSchema
);

export default ContentCalendar;