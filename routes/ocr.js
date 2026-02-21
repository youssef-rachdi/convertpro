const express = require('express');
const router = express.Router();
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit'); // Use pdfkit for consistent PDF output

const upload = multer({ dest: 'uploads/' });

router.post("/extract-text", upload.single("file"), async (req, res) => {
    console.log("OCR Request Received: Image to PDF");
    
    if (!req.file) return res.status(400).send("No file uploaded");

    // DEFINING VARIABLES FIRST
    const inputPath = req.file.path;
    const finalPdfPath = path.join(__dirname, '../outputs', `${req.file.filename}.pdf`);

    try {
        // 1. Run OCR
        console.log("Starting OCR process...");
        const { data: { text } } = await Tesseract.recognize(inputPath, 'eng+ara+fra', {
            logger: m => console.log(m.status, Math.round(m.progress * 100) + "%")
        });

        // 2. Create PDF using PDFKit (much more stable than docx-pdf for text)
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(finalPdfPath);
        doc.pipe(stream);

        // Add the extracted text to the PDF
        doc.fontSize(12).text(text, 50, 50);
        doc.end();

        // 3. Wait for stream to finish then download
        stream.on('finish', () => {
            console.log("OCR PDF Created ✅");
            res.download(finalPdfPath, "Extracted_Text.pdf", () => {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(finalPdfPath)) fs.unlinkSync(finalPdfPath);
            });
        });

    } catch (err) {
        console.error("OCR Error:", err);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        res.status(500).send("OCR Processing Failed");
    }
});

module.exports = router;