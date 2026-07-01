import "./config/env.js";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import { isCloudinaryConfigured } from "./config/cloudinary.js";

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "FindIt API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/claims", claimRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  if (!isCloudinaryConfigured()) {
    console.warn(
      "Warning: Cloudinary env vars missing. Image uploads will fail. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env"
    );
  }
});