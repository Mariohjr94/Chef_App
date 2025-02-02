const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Log for debugging
  console.log("Authorization header:", authHeader);

  // Extract the token from the Bearer header
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "Token not provided." });
  }

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach decoded token data (including user id) to req.user

    console.log("Token verified, user:", decoded);
    next();  // Proceed to the next middleware/route handler
  } catch (err) {
    console.log("JWT verification failed:", err.message);
    return res.status(403).json({ message: "Invalid token." });
  }
};

module.exports = authenticateToken;
