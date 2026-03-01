const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');

router.post("/generate-qr", async (req, res) => {
    console.log("QR Request Received for:", req.body.text); // Debug log

    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: "No text provided" });
        }

        // Generate the QR
        const qrImage = await QRCode.toDataURL(text);
        
        // Send the result back as JSON
        res.json({ qrCode: qrImage });
        
    } catch (err) {
        console.error("QR Error:", err);
        res.status(500).json({ error: "Failed to generate QR" });
    }
});

module.exports = router;