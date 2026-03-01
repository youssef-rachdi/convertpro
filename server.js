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
app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


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

app.use('/video', videoRoutes);
app.use('/tools', toolRoutes);

const PORT = process.env.PORT || 7860; // Railway provides the PORT variable automatically

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running professionally on port ${PORT}`);
});