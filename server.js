// server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use("/pdf", require("./routes/pdf"));
app.use("/image", require("./routes/image"));
app.use("/media", require("./routes/media"));
app.use("/office", require("./routes/office"));
app.use("/ocr", require("./routes/ocr"));

// حذف الملفات المؤقتة كل 5 دقائق
setInterval(() => {
  fs.readdirSync("outputs").forEach(f => fs.unlinkSync("outputs/" + f));
  fs.readdirSync("uploads").forEach(f => fs.unlinkSync("uploads/" + f));
}, 300000);

app.listen(3000, () => console.log("🚀 ConvertPro running at http://localhost:3000"));