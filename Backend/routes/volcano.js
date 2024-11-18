var express = require('express');
var router = express.Router();
const authenticate = require('../middleware/authenticate');
var jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET

// Define GET /countries endpoint
// Request:   Get request with no query parameters
// Response:  List of country names ordered alphabetically
router.get("/countries", async function (req, res, next) {
  // Check for query parameters
  if (Object.keys(req.query).length > 0) {
    // Return error message
    return res.status(400).json({ 
      error: true, 
      message: "Query parameters not permitted" });
  }

  try {
    // Access volcanoes database
    const rows = await req.db
      .from("data")           // From data table
      .distinct("country")    // Ensure countries aren't repeated
      .orderBy("country");    // Order country names alphabetically

    const countries = rows.map((row) => row.country); // Map country names
    res.json(countries);                              // Send list of countries as response
  } catch (err) {
    console.log("Error fetching countries:", err);                          // Log error for debugging
    res.status(500).json({ error: true, message: "Error in MySQL query" }); // Send SQL error message back
  }
});

// Define GET /volcanoes endpoint
// Request:   Get request with query parameters:
//            Required country name parameter, and optional populated within query parameter
// Response:  List of volcano objects that match the query parameters. 
//            Each volcano object includes id, name, country, region, subregion
router.get("/volcanoes", async (req, res, next) => {
  // Extract country and populatedWithin query parameters
  const { country, populatedWithin } = req.query;

  // Check for unexpected query parameters
  const allowedParams = ['country', 'populatedWithin'];
  const unexpectedParams = Object.keys(req.query).filter(param => !allowedParams.includes(param));
  if (unexpectedParams.length > 0) {
    // Return error message
    return res.status(400).json({
      error: true,
      message: "Invalid query parameters. Only country and populatedWithin are permitted."
    });
  }

  // Check for country query parameter
  if (!country) {
    // Return error message
    return res.status(400).json({ 
      error: true, 
      message: "Country is a required query parameter" });
  }

  // Define sql query
  let query = req.db
    .from('data')                                           // From data table,
    .select('id', 'name', 'country', 'region', 'subregion') // Get id, name, country, region, and subregion
    .where('country', country);                             // Of volcanoes in specified country

  // If request has populated within parameter, add to sql query
  if (populatedWithin) {
    if (populatedWithin === '100km') {
      query = query.where('population_100km', '>', 0);  // Check for population within 100km
    } else if (populatedWithin === '30km') {
      query = query.where('population_30km', '>', 0);   // Check for population within 30km
    } else if (populatedWithin === '10km') {
      query = query.where('population_10km', '>', 0);   // Check for population within 10km
    } else if (populatedWithin === '5km') {
      query = query.where('population_5km', '>', 0);    // Check for population within 5km
    } else {
      // Return error message
      return res.status(400).json({ 
        error: true, 
        message: "Invalid populatedWithin query parameter. Must be 5km, 10km, 30km, or 100km."});
    }
  }

  try {
    // Query the database
    const volcanoes = await query;

    // Send the list of volcanoes as JSON response
    res.json(volcanoes);
  } catch (error) {
    console.error('Error fetching volcanoes:', error);                        // Log error for debugging
    res.status(500).json({ error: true, message: 'Error in MySQL query' });   // Send error
  }
});

// Define GET /volcano/{id} endpoint
// Request:   Get request with query paramter:
//            id in query is required and represents volcano id.
//            Optionally a valid JWT token is provided in the header to retrieve more volcano information.
// Response:  Returns a volcano object contianing data such as name, country, etc.
router.get('/volcano/:id', authenticate, async function (req, res, next) {
  const { id } = req.params;

  try {
    // Fetch basic volcano data
    const volcano = await req.db.from('data').select('id', 'name', 'country', 'region', 'subregion', 'last_eruption', 'summit', 'elevation', 'latitude', 'longitude').where('id', id).first();

    if (!volcano) {
      return res.status(404).json({
        error: true,
        message: "Volcano not found"
      });
    }

    // If user is authenticated, fetch additional population data
    if (req.isAuthenticated) {
      const populatedData = await req.db.from('data').select('population_5km', 'population_10km', 'population_30km', 'population_100km').where('id', id).first();

      if (populatedData) {
        // Merge the data
        Object.assign(volcano, populatedData);
      }
    }

    // Respond with the volcano data
    res.json(volcano);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: "Internal server error"
    });
  }
});

module.exports = router;