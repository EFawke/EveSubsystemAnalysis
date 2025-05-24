const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const errorHandler = require('errorhandler');
const path = require('path');
const apiRouter = require('./api/routers/apiRouter')

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', true);

  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, 'https://' + req.headers.host + req.url);
    }
    next();
  });
}

app.use('/api', apiRouter);
app.use(morgan('dev'));
app.use(cors());
app.use(errorHandler());

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../frontend/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../', 'frontend', 'build', 'index.html'));
  });
}

app.listen(port);
console.log(`Listening on port ${port}`);