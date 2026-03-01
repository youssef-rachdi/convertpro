const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const upload = multer({ dest: 'uploads/' });

// Tool 1: Compress Image
router.post("/compress", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded");
    const inputPath = req.file.path;
    const outputPath = path.join(__dirname, '../outputs', `compressed_${req.file.filename}.jpg`);

    try {
        await sharp(inputPath).jpeg({ quality: 60 }).toFile(outputPath);
        res.download(outputPath, "compressed.jpg", () => {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        });
    } catch (err) {
        res.status(500).send("Compression failed");
    }
});

// Tool 2: Image to PDF
router.post("/img-to-pdf", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded");
    const inputPath = req.file.path;
    const outputPath = path.join(__dirname, '../outputs', `${req.file.filename}.pdf`);

    try {
        const metadata = await sharp(inputPath).metadata();
        const doc = new PDFDocument({ size: [metadata.width, metadata.height], margin: 0 });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);
        doc.image(inputPath, 0, 0, { width: metadata.width, height: metadata.height });
        doc.end();
        stream.on('finish', () => {
            res.download(outputPath, "converted.pdf", () => {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            });
        });
    } catch (err) {
        res.status(500).send("PDF Conversion failed");
    }
});


const { removeBackground } = require("@imgly/background-removal-node");

// Add this alongside your compression route  //remove background
router.post("/remove-bg", upload.single("file"), async (req, res) => {
    console.log("Incoming Request: POST /image/remove-bg");
    if (!req.file) return res.status(400).send("No file uploaded");

    const inputPath = req.file.path;
    const outputPath = path.join(__dirname, '../outputs', `no-bg_${Date.now()}.png`);

    try {
        // Dynamic require: only loads the heavy AI library when the button is clicked
        const { removeBackground } = require("@imgly/background-removal-node");

        const blob = await removeBackground(inputPath);
        const buffer = Buffer.from(await blob.arrayBuffer());
        
        fs.writeFileSync(outputPath, buffer);

        res.download(outputPath, "no-background.png", () => {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        });
    } catch (err) {
        console.error("AI Initialization Error:", err.message);
        
        // Cleanup the uploaded file so your server doesn't get full
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        
        // Tell the frontend what happened without crashing the server
        res.status(500).send("AI Background removal failed. This usually happens on local Windows due to missing GLib libraries. It will work on Hugging Face (Linux).");
    }
});

module.exports = router;