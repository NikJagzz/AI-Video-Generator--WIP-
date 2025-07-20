import React, { useState } from "react";
import axios from "axios";

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");

  const generateVideo = async () => {
    try {
      const response = await axios.post("http://localhost:3000/generate", {
        prompt: prompt,
      });
      setVideoUrl(response.data.video_url);
    } catch (error) {
      console.error("Error generating video:", error);
    }
  };

  return (
    <div>
      <h1>AI Video Generator</h1>
      <input
        type="text"
        placeholder="Enter a prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={generateVideo}>Generate Video</button>
      {videoUrl && <video src={videoUrl} controls />}
    </div>
  );
};

export default App;
