const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit'); // Import PDFKit

const upload = multer({ dest: 'uploads/' });

// --- KEEP YOUR COMPRESS ROUTE AS IS ---
router.post("/compress", upload.single("file"), async (req, res) => {
    /* ... your existing compress code ... */
});

// --- UPDATED IMAGE TO PDF ROUTE ---
router.post("/img-to-pdf", upload.single("file"), async (req, res) => {
    console.log("Image Request: Convert to PDF (Using PDFKit)");
    if (!req.file) return res.status(400).send("No file uploaded");

    const inputPath = req.file.path;
    const outputPath = path.join(__dirname, '../outputs', `${req.file.filename}.pdf`);

    try {
        // 1. Get image dimensions using sharp so the PDF page matches the image
        const metadata = await sharp(inputPath).metadata();
        
        // 2. Create a new PDF document with image dimensions
        const doc = new PDFDocument({
            size: [metadata.width, metadata.height],
            margin: 0
        });

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // 3. Add the image to the PDF
        doc.image(inputPath, 0, 0, {
            width: metadata.width,
            height: metadata.height
        });

        doc.end();

        // 4. Wait for the file to finish writing before downloading
        stream.on('finish', () => {
            res.download(outputPath, "Converted_Image.pdf", () => {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            });
        });

    } catch (err) {
        console.error("PDFKit Error:", err);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        res.status(500).send("Conversion to PDF failed");
    }
});

module.exports = router;