const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const puppeteer = require("puppeteer");
const { Document, Packer, Paragraph, TextRun } = require("docx");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ---------------- Word -> PDF ----------------
router.post("/word-to-pdf", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // تحويل Word -> نص خام
    const { value: text } = await mammoth.extractRawText({ path: filePath });

    // تحويل النص -> PDF باستخدام Puppeteer
    const outputPath = path.join("outputs", `${Date.now()}.pdf`);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(`<pre style="font-family: Arial;">${text}</pre>`);
    await page.pdf({ path: outputPath, format: "A4" });
    await browser.close();

    res.download(outputPath, () => {
      fs.unlinkSync(filePath);
      fs.unlinkSync(outputPath);
    });
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).send("Conversion error");
  }
});

const pdfParse = require("pdf-parse");

// PDF -> Word
router.post("/pdf-to-word", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // استخراج النص من PDF
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    // إنشاء ملف Word
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun(text)],
            }),
          ],
        },
      ],
    });

    const outputPath = path.join("outputs", Date.now() + ".docx");
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);

    res.download(outputPath, () => {
      fs.unlinkSync(filePath);
      fs.unlinkSync(outputPath);
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Conversion error");
  }
});

module.exports = router;