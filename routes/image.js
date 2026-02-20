const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Image → PNG
router.post("/convert", upload.single("file"), async (req, res) => {
  const output = `outputs/img.png`;
  await sharp(req.file.path).png().toFile(output);
  res.download(output);
});

// Compress Image
router.post("/compress", upload.single("file"), async (req, res) => {
  const output = `outputs/compressed.jpg`;
  await sharp(req.file.path).jpeg({ quality: 60 }).toFile(output);
  res.download(output);
});

// Image → PDF
router.post("/img-to-pdf", upload.single("file"), async (req, res) => {
  const pdfDoc = await PDFDocument.create();
  const imgBytes = fs.readFileSync(req.file.path);
  const img = await pdfDoc.embedJpg(imgBytes);
  const page = pdfDoc.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0 });
  const output = `outputs/${Date.now()}.pdf`;
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(output, pdfBytes);
  res.download(output);
});

module.exports = router;