require('dotenv').config(); // Load environment variables from .env file

var createError = require('http-errors');
var express = require('express');
const cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Setup options and knex
const options = require('./knexfile.js');
const knex = require('knex')(options);

// Setup swagger UI
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./docs/openapi.json');

// Setup routers
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user.js');
const volcanoRouter = require('./routes/volcano');
const reviewRouter = require('./routes/review');

var app = express();

// Use CORS middleware
app.use(cors());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Store reference to knex object
app.use((req, res, next) => {
  req.db = knex;
  next();
});

// Route setup
app.use('/user', userRouter);
app.use('/', volcanoRouter);
app.use('/review', reviewRouter);

// Swagger route
app.use('/', swaggerUI.serve);
app.get('/', swaggerUI.setup(swaggerDocument));

// Test knex connection
app.get("/knex", function (req, res, next) {
  req.db
    .raw("SELECT VERSION()")
    .then((version) => console.log(version[0][0]))
    .catch((err) => {
      console.log(err);
      throw err;
    });
  res.send("Version Logged Successfully");
});

// Define /me endpoint
app.get('/me', function(req, res) {
  // My information object
  var meObject = {
    "name": "Samuel van Zuylen",
    "student_number": "n11078472"
  };

  // Send the object as a JSON response
  res.json(meObject);
});

// Add review POST endpoint
app.post('/review/:volcanoID', function (req, res, next) {
  const volcanoID = req.params.volcanoID;
  const { userID, rating, comment } = req.body;

  const authorizationHeader = req.headers.authorization;
  let token = null;

  if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
    token = authorizationHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(403).json({
      error: true,
      message: "Forbidden - No token provided"
    });
  }

  jwt.verify(token, JWT_SECRET, (err, userData) => {
    if (err) {
      return res.status(403).json({
        error: true,
        message: "Forbidden - Invalid token"
      });
    }

    if (!userID || !rating) {
      return res.status(400).json({
        error: true,
        message: "Request body incomplete - userID and rating required"
      });
    }

    if (![1, 2, 3, 4, 5].includes(rating)) {
      return res.status(400).json({
        error: true,
        message: "Invalid rating - must be 1, 2, 3, 4, or 5"
      });
    }

    req.db.from('users').select('*').where('id', '=', userID)
      .then(users => {
        if (users.length === 0) {
          return res.status(404).json({
            error: true,
            message: "User not found"
          });
        }

        return req.db.from('reviews').insert({ volcanoID, userID, rating, comment });
      })
      .then(() => {
        res.status(201).json({
          success: true,
          message: "Review added"
        });
      })
      .catch(err => {
        res.status(500).json({
          error: true,
          message: "Internal server error"
        });
      });
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
