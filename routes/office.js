const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { Document, Packer, Paragraph, TextRun } = require("docx");

const upload = multer({ dest: 'uploads/' });

router.post("/pdf-to-word", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const data = await pdfParse(fs.readFileSync(filePath));
    const docxPath = filePath + ".docx";

    const doc = new Document({
      sections: [{ children: [new Paragraph({ children: [new TextRun(data.text)] })] }],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(docxPath, buffer);

    res.download(docxPath, "converted.docx", (err) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (fs.existsSync(docxPath)) fs.unlinkSync(docxPath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Conversion failed");
  }
});

module.exports = router; // <--- THIS IS CRITICAL