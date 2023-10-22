const express = require('express');
const cors = require('cors');
const sharp = require('sharp');
const getColors = require('get-image-colors');
const multer = require('multer');

const app = express();
const port = 3000;
const upload = multer({ dest: 'uploads/' });

app.use(cors());

app.post('/processImage', upload.single('image'), async (req, res) => {
  const { dimensions, colorCount } = req.body;
  const filePath = req.file.path;

  // Downscale image
  const buffer = await sharp(filePath)
    .resize({ width: parseInt(dimensions), height: parseInt(dimensions) })
    .toBuffer();

  // Get color palette
  const colors = await getColors(buffer, 'image/png', parseInt(colorCount));

  res.json({ colors: colors.map(c => c.hex()) });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
