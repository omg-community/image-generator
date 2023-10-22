const express = require('express');
const cors = require('cors');
const sharp = require('sharp');
const getColors = require('get-image-colors');
const multer = require('multer');
const kmeans = require('node-kmeans');

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

app.use(cors());

const closestColor = (pixel, colors) => {
  let minDist = Infinity;
  let closest = null;

  colors.forEach(color => {
    const dist = Math.sqrt(
      Math.pow(color[0] - pixel[0], 2) +
        Math.pow(color[1] - pixel[1], 2) +
        Math.pow(color[2] - pixel[2], 2)
    );

    if (dist < minDist) {
      minDist = dist;
      closest = color;
    }
  });

  return closest;
};

app.post('/processImage', upload.single('image'), async (req, res) => {
  try {
    const dimension = parseInt(req.body.dimension, 10);

    const buffer = await sharp(req.file.path)
      .resize({ width: dimension, height: dimension })
      .raw()
      .toBuffer({ resolveWithObject: true });

    // console.log(buffer.info);

    const { data, info } = buffer;
    const colorCount = parseInt(req.body.colorCount, 10);

    const pixels = [];
    for (let i = 0; i < data.length; i += info.channels) {
      pixels.push([data[i], data[i + 1], data[i + 2]]);
    }

    // console.log(pixels);

    kmeans.clusterize(pixels, {k: colorCount}, async (err, result) => {  // Changed here
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'K-means clustering failed' });
        return;
      }
      
      const representativeColors = result.map(cluster => {
        return cluster.centroid;
      });
      
      const newData = new Uint8Array(info.width * info.height * 3);

      for (let i = 0; i < pixels.length; i++) {
        const pixel = pixels[i];
        const color = closestColor(pixel, representativeColors);
        newData[i * 3] = color[0];
        newData[i * 3 + 1] = color[1];
        newData[i * 3 + 2] = color[2];
      }

      const newImageBuffer = await sharp({
        create: {
          width: info.width,
          height: info.height,
          channels: 3,
          background: { r: 0, g: 0, b: 0 },
        },
      })
        .composite([{ input: newData, raw: { width: info.width, height: info.height, channels: 3 }}])
        .png()
        .toBuffer();

      res.json({
        colors: representativeColors,
        newImage: newImageBuffer.toString('base64'),
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Image processing failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
