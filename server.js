const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const videoRoutes = require('./routes/video');
const toolRoutes = require('./routes/tools');

const app = express();

// 1. Create Folders
const dirs = ['uploads', 'outputs'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// 2. Middleware
app.use(cors());
app.use(express.static("public")); 

// --- SITEMAP ROUTE FOR GOOGLE SEO ---
app.get('/sitemap.xml', (req, res) => {
    res.header('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://convertpro.live/</loc>
    <lastmod>2026-03-05</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`);
});
// -----------------------------------

app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. Debug Logger
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

// 4. ROUTES
app.use("/office", require("./routes/office"));
app.use("/ocr", require("./routes/ocr")); 
app.use("/image", require("./routes/image"));
app.use("/media", require("./routes/media"));

app.use('/video', videoRoutes);
app.use('/tools', toolRoutes);

// 5. Port Configuration
const PORT = process.env.PORT || 8080; // Standardized for your Railway setup

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running professionally on port ${PORT}`);
});