const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const router = express.Router();
const upload = multer({ dest: "uploads/" });

// MP4 → MP3
router.post("/mp4-mp3", upload.single("file"), (req, res) => {
  const output = `outputs/audio.mp3`;
  ffmpeg(req.file.path)
    .toFormat("mp3")
    .on("end", () => res.download(output))
    .save(output);
});

module.exports = router;