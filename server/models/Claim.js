import mongoose from "mongoose";
import { CLAIM_STATUSES } from "../utils/claimStatuses.js";

const claimSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    claimer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: {
      describeItem: {
        type: String,
        required: [true, "Item description is required"],
        trim: true,
      },
      location: {
        type: String,
        required: [true, "Location answer is required"],
        trim: true,
      },
      identifyingMarks: {
        type: String,
        trim: true,
        default: "",
      },
      additionalInfo: {
        type: String,
        trim: true,
        default: "",
      },
    },
    status: {
      type: String,
      enum: {
        values: CLAIM_STATUSES,
        message: "{VALUE} is not a valid claim status.",
      },
      default: "Pending",
    },
  },
  { timestamps: true }
);

// One pending claim per user per post
claimSchema.index(
  { post: 1, claimer: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "Pending" } }
);

export default mongoose.model("Claim", claimSchema);
