var express = require('express');
var router = express.Router();
const authenticate = require('../middleware/authenticate');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Define POST /user/register endpoint
// Request:   Post request with no query parameters but includes body.
//            Body contains an email and password. Both with type string.
// Response:  Confirmation that the account has been registered.
router.post('/register', async function (req, res, next) {
  try {
    // Retrieve email and password from req.body
    const { email, password } = req.body;

    // Verify body includes email and password
    if (!email || !password) {
      // Return error message
      return res.status(400).json({
        error: true,
        message: "Request body incomplete, both email and password are required"
      });
    }

    // Determine if user already exists in table
    const users = await req.db.from("users").select("*").where("email", "=", email);  // Query users table
    if (users.length > 0) { // Check for atleast one user
      // Return error message
      return res.status(409).json({
        error: true,
        message: "User already exists"
      });
    }

    // Hash password for security
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    // Add new user's email and hash into database
    await req.db.from("users").insert({ email, hash });

    // Return success message
    res.status(201).json({
      message: "User created"
    });
  } catch (e) {
    // Return error message
    res.status(500).json({
      error: true,
      message: "Error in MySQL query"
    });
  }
});

// Define POST /user/login endpoint
// Request:   Post request with no query parameters but includes body.
//            Body contains an email and password of registered account. Bothj with type string.
// Response:  If successful, receives an object with jwt token, token type, and an expires in value.
router.post('/login', async function (req, res, next) {
  try {
    // Retrieve email and password from req.body
    const { email, password } = req.body;

    // Verify body includes email and password
    if (!email || !password) {
      // Return error message
      return res.status(400).json({
        error: true,
        message: "Request body incomplete, email and password are required"
      });
    }

    // Determine if user exists in table
    const users = await req.db.from("users").select("*").where("email", "=", email);
    if (users.length === 0) {     // If user with given email was not found
      // Return error message
      return res.status(401).json({
        error: true,
        message: "Incorrect email or password"
      });
    }

    // Compare password hashes
    const user = users[0];
    const match = await bcrypt.compare(password, user.hash);
    if (!match) {             // If passwords do not match
      // Return error message
      return res.status(401).json({
        error: true,
        message: "Incorrect email or password"
      });
    }

    // Create JWT token
    const expires_in = 60 * 60 * 24; // 24 hours
    const exp = Math.floor(Date.now() / 1000) + expires_in;
    const token = jwt.sign({ email: user.email, exp }, JWT_SECRET);

    // Return token, token type, and expiration time
    res.status(200).json({
      token,
      token_type: "Bearer",
      expires_in
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Error in MySQL query"
    });
  }
});


// Define GET /user/{email}/profile endpoint
// Request:   Post request sent with email as path parameter. Optionally an authentication token to be sent in header.
// Response:  Response body with email, firstName, lastName, and if authenticated dob and address.
// Define GET /user/{email}/profile endpoint
router.get('/:email/profile', authenticate, async function (req, res, next) {
  try {
    // Retrieve email from path parameter
    const email = req.params.email;

    // Verify that the email is a user in the database
    const users = await req.db.from('users')
      .select('email', 'firstName', 'lastName', 'dob', 'address')
      .where('email', '=', email);

    if (users.length === 0) {
      // Return error message if user is not found
      res.status(404).json({
        error: true,
        message: "User not found"
      });
      return;
    }

    // Store user info
    const user = users[0];

    // Ensure all user properties are not undefined
    const userInfo = {
      email: user.email ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      dob: user.dob ? user.dob.toISOString().split('T')[0] : null,
      address: user.address ?? null
    };

    // Check if the user is authenticated and email matches
    if (req.isAuthenticated && req.email == email) {
      // User is authenticated, return full information
      res.status(200).json(userInfo);
      return;
    }

    // User is not authenticated or email does not match, return limited information
    const limitedUserInfo = {
      email: userInfo.email,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName
    };
    res.status(200).json(limitedUserInfo);
    return;
  } catch (err) {
    // Return error message for any other errors
    res.status(500).json({
      error: true,
      message: "Internal server error"
    });
    return;
  }
});


// Define PUT /user/{email}/profile endpoint
// Request:   Put request sent with email path parameter, authorization in header, and a body with profile data.
//            Token must be provided in the header and must be signed with same email address as the email in path parameter.
//            Body must include updated firstName, lastName, dob, and address.
// Response:  If successful, endpoint returns object with updated email, firstName, lastName, dob, and address.
router.put('/:email/profile', authenticate, async function (req, res, next) {
  try {
    if (!req.isAuthenticated) {
      // Return error message
      res.status(401).json({
        error: true,
        message: "Authorization header not found. Must be logged in to access account data"
      });
      return;
    }

    // Extract email, firstName, lastName, dob, and address from request body
    const email = req.params.email;
    const { firstName, lastName, dob, address } = req.body;

    // Check if the email in the token matches the email being edited
    if (req.email !== email) {
      res.status(403).json({
        error: true,
        message: "Forbidden"
      });
      return;
    }

    // Check body contains all values
    if (!firstName || !lastName || !dob || !address) {
      // Return error message
      res.status(400).json({
        error: true,
        message: "Request body incomplete: firstName, lastName, dob and address are required."
      });
      return;
    }

    // Check if firstName, lastName, and address are strings
    if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof address !== 'string') {
      // Return error message
      res.status(400).json({
        error: true,
        message: "Request body invalid: firstName, lastName and address must be strings only."
      });
      return;
    }

    // Check format of dob is YYYY-MM-DD
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(dob)) {
      return res.status(400).json({
        error: true,
        message: "Invalid input: dob must be a real date in format YYYY-MM-DD."
      });
    }

    // Split up dob components
    const [year, month, day] = dob.split('-').map(Number);

    // Check if it is a valid date
    if (!isValidDate(year, month, day)) {
      return res.status(400).json({
        error: true,
        message: "Invalid input: dob must be a real date in format YYYY-MM-DD."
      });
    }

    // Get current time
    const currentDate = new Date();
    const currentYear = currentDate.getUTCFullYear();
    const currentMonth = currentDate.getUTCMonth() + 1;
    const currentDay = currentDate.getUTCDate();

    // Check if date is in the future
    if (year > currentYear || (year === currentYear && (month > currentMonth || (month === currentMonth && day > currentDay)))) {
      return res.status(400).json({
        error: true,
        message: "Invalid input: dob must be a date in the past."
      });
    }

    // Check if the user exists
    const users = await req.db.from('users').select('*').where('email', '=', email);

    // If user does not exist, return a Not Found error
    if (users.length === 0) {
      res.status(404).json({
        error: true,
        message: "User not found"
      });
      return;
    }

    // Update user information in the database
    await req.db.from('users').where('email', '=', email).update({ firstName, lastName, dob, address });

    // Retrieve updated user information from the database
    const updatedUser = await req.db.from('users').select('email', 'firstName', 'lastName', 'dob', 'address').where('email', '=', email);

    // Extract user data
    const user = updatedUser[0];

    // Return the updated user information
    res.status(200).json({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dob: user.dob.toISOString().split('T')[0],
      address: user.address
    });
  } catch (err) {
    // Return error message
    res.status(500).json({
      error: true,
      message: "Internal server error"
    });
    return;
  }
});

// Helper function to check if a year is a leap year
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Helper function to check if a date is valid
function isValidDate(year, month, day) {
  // Check if year, month, and day are numbers
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return false;
  }

  // Check if month is valid
  if (month < 1 || month > 12) {
    return false;
  }

  // Define the number of days in each month
  const daysInMonth = [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Check if day is valid for the given month
  if (day < 1 || day > daysInMonth[month - 1]) {
    return false;
  }

  return true;
}

module.exports = router;
