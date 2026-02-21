const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const docxConverter = require('docx-pdf'); // For Word to PDF
const pdfParse = require('pdf-parse');    // For PDF to Word
const { Document, Packer, Paragraph, TextRun } = require("docx");

const upload = multer({ dest: 'uploads/' });

// --- PDF to WORD ---
router.post("/pdf-to-word", upload.single("file"), async (req, res) => {
    console.log("File received for PDF-to-Word conversion");
    if (!req.file) return res.status(400).send("No file uploaded");

    const inputPath = req.file.path;
    const outputPath = path.join(__dirname, '../outputs', `${req.file.filename}.docx`);

    try {
        const dataBuffer = fs.readFileSync(inputPath);
        const data = await pdfParse(dataBuffer);

        // Split text by lines to create paragraphs
        const lines = data.text.split('\n');
        const docChildren = lines.map(line => new Paragraph({
            children: [new TextRun(line)],
        }));

        const doc = new Document({
            sections: [{ children: docChildren }],
        });

        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(outputPath, buffer);

        res.download(outputPath, "converted.docx", (err) => {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        });
    } catch (err) {
        console.error("PDF to Word Error:", err);
        res.status(500).send("Conversion failed");
    }
});

// --- WORD to PDF (Keep your existing working one) ---
router.post("/word-to-pdf", upload.single("file"), (req, res) => {
    console.log("File received for Word-to-PDF conversion");
    if (!req.file) return res.status(400).send("No file uploaded");

    const inputPath = req.file.path;
    const tempDocxPath = inputPath + ".docx";
    fs.renameSync(inputPath, tempDocxPath);

    const outputPath = path.join(__dirname, '../outputs', `${req.file.filename}.pdf`);
    
    docxConverter(tempDocxPath, outputPath, (err, result) => {
        if (err) {
            if (fs.existsSync(tempDocxPath)) fs.unlinkSync(tempDocxPath);
            return res.status(500).send("Conversion failed");
        }
        res.download(outputPath, "converted.pdf", () => {
            if (fs.existsSync(tempDocxPath)) fs.unlinkSync(tempDocxPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        });
    });
});

module.exports = router;