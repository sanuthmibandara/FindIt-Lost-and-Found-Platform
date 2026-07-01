import mongoose from "mongoose";
import {
  POST_CATEGORIES,
  POST_TYPES,
  POST_STATUSES,
} from "../utils/categories.js";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: {
        values: POST_TYPES,
        message: "{VALUE} is not a valid type. Use Lost or Found.",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: POST_CATEGORIES,
        message: "{VALUE} is not a valid category.",
      },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    dateLostOrFound: {
      type: Date,
      required: [true, "Date lost or found is required"],
    },
    images: {
      type: [String],
      default: [],
    },
    reward: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: POST_STATUSES,
        message: "{VALUE} is not a valid status.",
      },
      default: "Open",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
    linkedLostPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export default mongoose.model("Post", postSchema);
