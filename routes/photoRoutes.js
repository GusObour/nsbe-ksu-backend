const express = require('express');
const GooglePhotosService = require('../services/GooglePhotosService');

const router = express.Router();
const googlePhotosService = new GooglePhotosService();

router.get('/', (req, res) => {
  const authUrl = googlePhotosService.generateAuthUrl();
  res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const tokens = await googlePhotosService.getToken(code);
    googlePhotosService.setCredentials(tokens);
    res.redirect('/googleapi/photos');
  } catch (error) {
    console.error('Error during OAuth2 callback:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

router.get('/photos', async (req, res) => {
  try {
    const mediaItems = await googlePhotosService.listMediaItemsFromAlbum();
    res.json(mediaItems);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ message: 'Error fetching photos' });
  }
});

module.exports = router;
