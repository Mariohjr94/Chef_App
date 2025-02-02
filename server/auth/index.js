const router = require("express").Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authenticateToken = require("../middleware/authenticateToken")

// Register a new  account
router.post("/register", async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const {
      rows: [admin],
    } = await db.query(
      "INSERT INTO admin (username, password) VALUES ($1, $2) RETURNING *",
      [req.body.username, hashedPassword]
    );

    // Create a token with the instructor id
    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET);

    res.status(201).send({ token });
  } catch (error) {
    next(error);
  }
});

// Login to an existing admin account
router.post("/login", async (req, res, next) => {
  try {
    const {
      rows: [admin],
    } = await db.query(
      "SELECT * FROM admin WHERE username = $1",
      [req.body.username]
    );

    if (!admin) {
      return res.status(401).send("Invalid login credentials.");
    }

    // Compare the provided password with the stored hashed password
    const validPassword = await bcrypt.compare(
      req.body.password,
      admin.password
    );

    if (!validPassword) {
      return res.status(401).send("Invalid login credentials.");
    }

    // Create a token with the instructor id
    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET);

    res.send({ token });
  } catch (error) {
    next(error);
  }
});

// Get the currently logged in admin
router.get("/me", authenticateToken, async (req, res, next) => {
  console.log("User ID from token:", req.user?.id);
  try {
    const {
      rows: [admin],
    } = await db.query("SELECT * FROM admin WHERE id = $1", [
      req.user?.id,
    ]);

    console.log("Admin from database:", admin);  // Check if admin is found

   if (!admin) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(admin);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
