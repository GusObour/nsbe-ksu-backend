const session = require('express-session');
const MongoStore = require('connect-mongo');

class SessionManager {
  constructor(app, mongooseConnection) {
    this.app = app;
    this.mongooseConnection = mongooseConnection;
  }

  initialize() {
    this.app.use(
      session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          mongoUrl: this.mongooseConnection.connection._connectionString,
        }),
        cookie: {
          maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
      })
    );
  }
}

module.exports = SessionManager;
