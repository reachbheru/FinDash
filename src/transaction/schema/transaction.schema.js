import mongoose from "mongoose";
import { transactionType, transactionCategory } from "../../common/enum.js";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: Object.values(transactionType),
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(transactionCategory),
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Index for common queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1, date: -1 });
transactionSchema.index({ userId: 1, isDeleted: 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
