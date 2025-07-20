// import express from "express";
// import axios from "axios";
// import fs from "fs";
// import path from "path";
// import ffmpeg from "fluent-ffmpeg";
// import dotenv from "dotenv";
// import cors from "cors";
// import FormData from "form-data";

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 3000;
// const ffmpegPath =
//   process.env.FFMPEG_PATH ||
//   "D:\\Code\\ai video\\BE\\ffmpeg-2025-03-24-git-cbbc927a67-essentials_build\\ffmpeg-2025-03-24-git-cbbc927a67-essentials_build\\bin\\ffmpeg.exe";

// ffmpeg.setFfmpegPath(ffmpegPath);

// // Ensure the output directory exists
// const outputDir = path.join(process.cwd(), "output");
// if (!fs.existsSync(outputDir)) {
//   fs.mkdirSync(outputDir, { recursive: true });
// }

// // Use CORS middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.static("output"));

// // Helper function to download the image
// const downloadImage = (url, filePath) => {
//   return new Promise((resolve, reject) => {
//     const writer = fs.createWriteStream(filePath);
//     axios
//       .get(url, { responseType: "stream" })
//       .then((response) => {
//         response.data.pipe(writer);
//         writer.on("finish", resolve);
//         writer.on("error", reject);
//       })
//       .catch(reject);
//   });
// };

// // Generate AI Video
// app.post("/generate", async (req, res) => {
//   try {
//     const { prompt } = req.body;

//     // Create FormData for Stability AI API
//     const formData = new FormData();
//     formData.append("prompt", prompt);
//     formData.append("output_format", "webp");

//     // Call Stability AI API to generate an image
//     const response = await axios.post(
//       "https://api.stability.ai/v2beta/stable-image/generate/core",
//       formData,
//       {
//         headers: {
//           ...formData.getHeaders(),
//           Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
//           Accept: "image/*",
//         },
//         responseType: "arraybuffer",
//       }
//     );

//     if (response.status === 200) {
//       // Define the image path
//       const imagePath = path.join(outputDir, "frame.jpg");
//       // Save the image to a file
//       fs.writeFileSync(imagePath, Buffer.from(response.data));

//       // Convert the image to a video
//       const videoPath = path.join(outputDir, `${Date.now()}.mp4`);
//       ffmpeg(imagePath)
//         .loop(3) // Loop the image for 3 seconds
//         .output(videoPath)
//         .on("end", () => {
//           res.json({
//             video_url: `http://localhost:${PORT}/${path.basename(videoPath)}`,
//           });
//         })
//         .on("error", (error) => {
//           console.error("FFmpeg error:", error);
//           res.status(500).json({ error: "Failed to generate video" });
//         })
//         .run();
//     } else {
//       res.status(response.status).json({ error: "Failed to generate image" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to generate video" });
//   }
// });

// app.listen(PORT, () =>
//   console.log(`Server running on http://localhost:${PORT}`)
// );

import express from "express";
import fs from "fs";
import path from "path";
import { exec } from "child_process"; // Import exec to run Python script
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Ensure the output directory exists
const outputDir = path.join(process.cwd(), "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Use CORS middleware
app.use(cors());
app.use(express.json());
app.use(express.static("output"));

// Generate AI Video
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    // Path to Python script
    const pythonScriptPath = path.join(process.cwd(), "AIVIDEO", "animate.py");

    // Run the Python script using exec
    exec(`python ${pythonScriptPath} "${prompt}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).json({ error: "Failed to generate video" });
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ error: "Failed to generate video" });
      }

      // Assume the Python script saved the video as output_video.mp4
      const videoPath = path.join(outputDir, "output_video.mp4");
      res.json({
        video_url: `http://localhost:${PORT}/output_video.mp4`,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate video" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
