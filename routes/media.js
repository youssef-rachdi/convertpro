const express = require('express');
const router = express.Router();
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static'); // Add this line
const path = require('path');
const fs = require('fs');

// Tell fluent-ffmpeg where the binary is
ffmpeg.setFfmpegPath(ffmpegPath);

const upload = multer({ dest: 'uploads/' });

router.post("/mp4-mp3", upload.single("file"), (req, res) => {
    console.log("Media Request: MP4 to MP3");
    if (!req.file) return res.status(400).send("No file uploaded");

    const inputPath = req.file.path;
    const outputPath = path.join(__dirname, '../outputs', `${req.file.filename}.mp3`);

    ffmpeg(inputPath)
        .toFormat('mp3')
        .on('start', (commandLine) => {
            console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .on('end', () => {
            console.log("Conversion Finished");
            res.download(outputPath, "converted.mp3", (err) => {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            });
        })
        .on('error', (err) => {
            console.error("FFmpeg Error: ", err.message);
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            res.status(500).send("Conversion error");
        })
        .save(outputPath);
});

module.exports = router;