// review.js
var express = require('express');
var router = express.Router();
const authenticate = require('../middleware/authenticate');
var jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is defined in your environment variables

// Define POST /review/{id} endpoint
// Request:
// Response:
router.post('/:volcanoID', authenticate, async function (req, res, next) {
  try {
    // Get volcano id from path parameter, and ratings and comment from body
    const volcanoID = req.params.volcanoID;
    const { rating, comment } = req.body;

    // Check if user is authenticated
    if (!req.isAuthenticated) {
      //Return error message
      return res.status(401).json({
        error: true,
        message: "Authorization header not found. Must be logged in to post a review"
      });
    }

    // Extract user email from token
    const userEmail = req.email;

    // Check for rating value
    if (!rating) {
      // Return error message
      return res.status(400).json({
        error: true,
        message: "Request body incomplete: a rating is required"
      });
    }

    // Check rating is correct type
    if (!["1", "2", "3", "4", "5"].includes(rating.toString()) && ![1, 2, 3, 4, 5].includes(parseInt(rating))) {
      // Return error message
      return res.status(400).json({
        error: true,
        message: "Invalid rating: must be 1, 2, 3, 4, or 5"
      });
    }

    // Find user in database
    const users = await req.db.from('users').select('id').where('email', '=', userEmail);

    // Check user exists
    if (users.length === 0) {
      // Return error message
      return res.status(404).json({
        error: true,
        message: "User not found"
      });
    }

    // Get user's ID
    const userID = users[0].id;

    // Add review to database
    await req.db.from('reviews').insert({ volcanoID, userID, rating, comment });

    // Return success message
    res.status(200).json({
      message: "Review successfully added"
    });
  } catch (err) {
    // Return error message
    res.status(500).json({
      error: true,
      message: "Internal server error"
    });
  }
});


// Define GET /review/{id} endpoint
// Request:
// Response:
router.get('/:volcanoID', async function (req, res, next) {
  try {
      // Extract volcano ID from request parameters
      const volcanoID = req.params.volcanoID;

      // Join users and reviews database to retrieve ratings, comments, firstName, and lastNames that match the volcano ID
      const reviews = await req.db.from('reviews')
          .innerJoin('users', 'reviews.userID', 'users.id')
          .select('reviews.rating', 'reviews.comment', 'users.firstName', 'users.lastName')
          .where('reviews.volcanoID', '=', volcanoID);

      // If no reviews found, return 404 error
      if (reviews.length === 0) {
          return res.status(404).json({
              error: true,
              message: "No reviews found for this volcano"
          });
      }

      // Return reviews
      res.status(200).json(reviews);
  } catch (err) {
      // Handle internal server error
      res.status(500).json({
          error: true,
          message: "Internal server error"
      });
  }
});


// Define GET /review/ratings/{id} endpoint
// Request:
// Response:
router.get('/ratings/:volcanoID', async function (req, res, next) {
  try {
      // Extract volcano ID from request parameters
      const volcanoID = req.params.volcanoID;
      
      // Query the database for the average rating of the specified volcano
      const rows = await req.db.from('reviews')
          .where('volcanoID', '=', volcanoID)
          .avg('rating as averageRating');

      // Check if no reviews were found or the average rating is null
      if (rows.length === 0 || rows[0].averageRating === null) {
          return res.status(404).json({
              error: true,
              message: "No reviews found for this volcano"
          });
      }

      // Calculate the average rating and format it to two decimal places
      const averageRating = parseFloat(rows[0].averageRating).toFixed(2);

      // Return the average rating in the response
      res.status(200).json({ averageRating: averageRating });
  } catch (err) {
      // Handle internal server error
      res.status(500).json({
          error: true,
          message: "Internal server error"
      });
  }
});

module.exports = router;
