const express = require('express');
const router = express.Router();
const GooglePhotosService = require('../services/GooglePhotosService');

const googlePhotosService = new GooglePhotosService();

router.get('/photos', async (req, res) => {
  try {
    googlePhotosService.setCredentials({
      access_token: process.env.GOOGLE_ACCESS_TOKEN,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const albumId = 'jhBdHJpjaakYdiMi6';
    const mediaItems = await googlePhotosService.listMediaItemsFromAlbum(albumId);
    res.json(mediaItems);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Error fetching photos' });
  }
});

module.exports = router;
