const express = require('express');
const router = express.Router();
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

router.post("/video-to-gif", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).send("No video uploaded");
    
    const inputPath = req.file.path;
    const outputPath = path.join(__dirname, '../outputs', `anim_${Date.now()}.gif`);

    // High-quality palette generation filter
    ffmpeg(inputPath)
        .complexFilter([
            'fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse'
        ])
        .output(outputPath)
        .on('end', () => {
            res.download(outputPath, "animation.gif", () => {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            });
        })
        .on('error', (err) => {
            console.error(err);
            res.status(500).send("GIF conversion failed");
        })
        .run();
});

module.exports = router;