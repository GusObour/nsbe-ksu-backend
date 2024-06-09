const { google } = require('googleapis');

class GooglePhotosService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    this.SCOPES = ['https://www.googleapis.com/auth/photoslibrary.readonly'];
  }

  generateAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
    });
  }

  async getToken(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  setCredentials(token) {
    this.oauth2Client.setCredentials(token);
  }

  async listMediaItemsFromAlbum(albumId) {
    const photos = google.photos({ version: 'v1', auth: this.oauth2Client });
    const res = await photos.mediaItems.search({
      requestBody: {
        albumId,
        pageSize: 50,
      },
    });
    return res.data.mediaItems;
  }
}

module.exports = GooglePhotosService;
