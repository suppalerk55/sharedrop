if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line global-require
  require('newrelic');
}

// Room server
const http = require('http');
const path = require('path');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const compression = require('compression');
const persona = require('express-persona');
const uuid = require('uuid');
const crypto = require('crypto');
const FirebaseTokenGenerator = require('firebase-token-generator');

const firebaseTokenGenerator = new FirebaseTokenGenerator(process.env.FIREBASE_SECRET);
const app = express();
const personaUrl = process.env.PERSONA_URL;
const secret = process.env.SECRET;
const base = ['dist'];

app.enable('trust proxy');

app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  cookie: {
    // secure: true,
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  secret,
  proxy: true,
}));
app.use(compression());

//
// Web server
//
base.forEach((dir) => {
  const subdirs = ['assets'];

  subdirs.forEach((subdir) => {
    app.use(`/${subdir}`, express.static(`${dir}/${subdir}`, {
      maxAge: 12 * 30 * 24 * 60 * 60 * 1000, // ~1 year
    }));
  });
});

//
// API server
//

// Handle Persona authentication
persona(app, { audience: personaUrl });

app.get('/', (req, res) => {
  const root = path.join(__dirname, base[0]);
  res.sendfile(`${root}/index.html`);
});

app.get('/rooms/:id', (req, res) => {
  const root = path.join(__dirname, base[0]);
  res.sendfile(`${root}/index.html`);
});


app.get('/room', (req, res) => {
  const ip = req.headers['cf-connecting-ip'] || req.ip;
  const name = crypto.createHmac('md5', secret).update(ip).digest('hex');

  res.json({ name });
});

app.get('/auth', (req, res) => {
  const ip = req.headers['cf-connecting-ip'] || req.ip;
  const uid = uuid.v1();
  const token = firebaseTokenGenerator.createToken(
    { uid, id: uid }, // will be available in Firebase security rules as 'auth'
    // eslint-disable-next-line comma-dangle
    { expires: 32503680000 } // 01.01.3000 00:00
  );

  res.json({ id: uid, token, public_ip: ip });
});

http
  .createServer(app)
  .listen(process.env.PORT)
  .on('listening', () => {
    // eslint-disable-next-line no-console
    console.log(`Started ShareDrop web server at http://localhost:${process.env.PORT}...`);
  });
