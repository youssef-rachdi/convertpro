const express = require("express");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const router = express.Router();
const upload = multer({ dest: "uploads/" });

// دمج PDF
router.post("/merge", upload.array("file"), async (req, res) => {
  const mergedPdf = await PDFDocument.create();
  for (const file of req.files) {
    const pdfBytes = fs.readFileSync(file.path);
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(p => mergedPdf.addPage(p));
  }
  const output = `outputs/merged.pdf`;
  const bytes = await mergedPdf.save();
  fs.writeFileSync(output, bytes);
  res.download(output);
});

// تقسيم PDF (أول صفحة)
router.post("/split", upload.single("file"), async (req, res) => {
  const pdfBytes = fs.readFileSync(req.file.path);
  const pdf = await PDFDocument.load(pdfBytes);
  const newPdf = await PDFDocument.create();
  const [page] = await newPdf.copyPages(pdf, [0]);
  newPdf.addPage(page);
  const bytes = await newPdf.save();
  const output = `outputs/page1.pdf`;
  fs.writeFileSync(output, bytes);
  res.download(output);
});

module.exports = router;