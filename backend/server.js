const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const prisma = new PrismaClient();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Generate Short URL
app.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) return res.status(400).json({ error: "URL is required" });

  // Generate a random short string
  const shortId = Math.random().toString(36).substr(2, 8);
  const shortUrl = `http://localhost:5000/${shortId}`;

  try {
    const newUrl = await prisma.url.create({
      data: {
        originalUrl,
        shortUrl,
      },
    });

    res.status(201).json({ shortUrl: newUrl.shortUrl });
  } catch (error) {
    res.status(500).json({ error: "Failed to shorten URL" });
  }
});

// Redirect to Original URL
app.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;
  const fullShortUrl = `http://localhost:5000/${shortId}`;

  try {
    const urlRecord = await prisma.url.findUnique({
      where: { shortUrl: fullShortUrl },
    });

    if (urlRecord) {
      res.redirect(urlRecord.originalUrl);
    } else {
      res.status(404).json({ error: "URL not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to redirect" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
