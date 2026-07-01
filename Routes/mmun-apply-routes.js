// ─────────────────────────────────────────────────────────────────────────────
// MMUN Team Application Routes
// Add these to your main Express app file (app.js / server.js / routes/...)
// Requires: authenticate middleware, userModel, imagekit, multer, fs, mongoose
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require("mongoose");
const fs = require("fs");

// ── APPLICATION SCHEMA ────────────────────────────────────────────────────────
const applicationSchema = new mongoose.Schema(
  {
    // Linked MMUN account
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: { type: String, required: true },

    // Personal
    firstName: { type: String, required: true, trim: true, maxlength: 60 },
    lastName:  { type: String, required: true, trim: true, maxlength: 60 },
    email:     { type: String, required: true, trim: true, lowercase: true },
    phone:     { type: String, required: true, trim: true },
    dob:       { type: String, required: true },          // ISO date string YYYY-MM-DD
    gender:    { type: String, required: true },

    // Academic (pulled from account, user can override)
    institution: { type: String, required: true, trim: true },
    programme:   { type: String, required: true, trim: true },
    acYear:      { type: String, required: true },

    // Role
    role:               { type: String, required: true },
    roleSpecialization: { type: String, default: null },

    // Skills & motivation
    skills:        { type: [String], required: true },
    skillLevel:    { type: String, required: true },
    hoursPerWeek:  { type: String, required: true },
    portfolio:     { type: String, default: "" },
    motivation:    { type: String, required: true, trim: true },
    availableDays: { type: [String], default: [] },

    // Signature
    signatureUrl: { type: String, required: true },
    legalName:    { type: String, required: true, trim: true },

    // Status
    status: {
      type: String,
      enum: ["pending", "reviewing", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications per user per role
applicationSchema.index({ userId: true, role: true }, { unique: true });



// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────


