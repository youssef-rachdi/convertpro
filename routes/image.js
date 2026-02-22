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


module.exports = router;