const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { createWorker } = require("tesseract.js");

// 👇 مهم لويندوز
process.env.TESSDATA_PREFIX = "C:\\Program Files\\Tesseract-OCR\\tessdata";

// إعداد رفع الملفات
const upload = multer({ dest: "uploads/" });

// حذف آمن للملفات
const safeDelete = (filePath) => {
  fs.unlink(filePath, err => {
    if (err) console.log("Delete skipped:", err.code);
  });
};

// 🧠 تحسين الصورة قبل OCR (زيادة الدقة)
async function preprocessImage(inputPath, outputPath) {
  await sharp(inputPath)
    .grayscale()
    .normalize()
    .sharpen()
    .threshold(150)
    .toFile(outputPath);
}

// 📌 Image → Text OCR
router.post("/image-to-text", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const originalPath = req.file.path;
  const processedPath = originalPath + "_processed.png";

  try {
    // تحسين الصورة
    await preprocessImage(originalPath, processedPath);

    // تشغيل OCR
    const worker = await createWorker("ara+eng+fra");

    await worker.setParameters({
      tessedit_pageseg_mode: 6,
      preserve_interword_spaces: 1,
    });

    const {
      data: { text },
    } = await worker.recognize(processedPath);

    await worker.terminate();

    // حذف الملفات
    safeDelete(originalPath);
    safeDelete(processedPath);

    res.send({
      success: true,
      extracted_text: text.trim(),
    });

  } catch (error) {
    console.error(error);
    safeDelete(originalPath);
    safeDelete(processedPath);
    res.status(500).send("OCR processing failed");
  }
});

module.exports = router;