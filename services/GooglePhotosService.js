const { google } = require('googleapis');
const Photos = require('googlephotos');

class GooglePhotosService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    this.SCOPES = [Photos.Scopes.READ_ONLY, Photos.Scopes.SHARING];
    this.albumId = process.env.GOOGLE_PHOTOS_ALBUM_ID;
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

  async listMediaItemsFromAlbum() {
    const photos = new Photos(this.oauth2Client.credentials.access_token);
    const response = await photos.mediaItems.search(this.albumId, 5);
    return response.mediaItems;
  }
}

module.exports = GooglePhotosService;
