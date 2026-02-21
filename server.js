const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();

// 1. Create Folders
const dirs = ['uploads', 'outputs'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// 2. Middleware
app.use(cors());
app.use(express.static("public")); 
app.use(express.json());

// 3. Debug Logger (Watch your terminal when you click convert!)
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

// 4. ROUTES - Ensure this matches the HTML values
app.use("/office", require("./routes/office"));
app.use("/ocr", require("./routes/ocr")); // ADD THIS LINE
app.use("/image", require("./routes/image"));
app.use("/media", require("./routes/media"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
});