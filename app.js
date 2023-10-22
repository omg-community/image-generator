const express = require('express');
const sharp = require('sharp');
const getColors = require('get-image-colors');

const app = express();
const port = 3000;

app.use(express.json());

app.post('/processImage', async (req, res) => {
  const { imageUrl, dimensions, colorCount } = req.body;

  // Downscale image
  const buffer = await sharp(imageUrl)
    .resize({ width: dimensions, height: dimensions })
    .toBuffer();

  // Get color palette
  const colors = await getColors(buffer, 'image/png', colorCount);

  res.json({ colors: colors.map(c => c.hex()) });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
