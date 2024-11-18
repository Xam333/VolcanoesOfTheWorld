const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  // Extract authorization header
  const authorizationHeader = req.headers.authorization;
  let token = null;

  // Check if authorization header is present and properly formatted
  if (authorizationHeader) {
    const authComponents = authorizationHeader.split(' ');
    if (authComponents.length === 2 && authComponents[0] === 'Bearer') {
      token = authComponents[1];
    } else {
      // Malformed authorization header
      res.status(401).json({
        error: true,
        message: "Authorization header is malformed"
      });
      return;
    }
  } else {
    // If no authorization header is present, set email and isAuthenticated flag to false
    req.email = null;
    req.isAuthenticated = false;
    next();
    return;
  }

  try {
    // Verify JWT token
    const userData = jwt.verify(token, process.env.JWT_SECRET);
    
    // If token is valid, set email and isAuthenticated flag
    req.email = userData.email;
    req.isAuthenticated = true;
    next();
    return;
  } catch (err) {
    // Handle JWT errors
    if (err instanceof jwt.TokenExpiredError) {
      // Token expired
      res.status(401).json({
        error: true,
        message: "JWT token has expired"
      });
      return;
    } else {
      // Invalid JWT token
      res.status(401).json({
        error: true,
        message: "Invalid JWT token"
      });
      return;
    }
  }
};

module.exports = authenticate;