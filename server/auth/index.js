const router = require("express").Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const upload = multer();
const authenticateToken = require("../middleware/authenticateToken");

// 🟢 **Register a new admin**
router.post("/register", upload.single("avatar"), async (req, res) => {
  const { username, password, name } = req.body;
  const avatar = req.file;

  if (!username || !password || !name) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into database
    const { rows: [admin] } = await db.query(
      "INSERT INTO admin (username, password, name, avatar) VALUES ($1, $2, $3, $4) RETURNING id, username, name",
      [username, hashedPassword, name, avatar ? avatar.buffer : null]
    );

    // Generate JWT token
    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Return token and user info
    res.status(201).json({
      token,
      user: admin,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Failed to register user." });
  }
});

// 🟢 **Login an existing admin**
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch user from database
    const { rows: [admin] } = await db.query(
      "SELECT * FROM admin WHERE username = $1",
      [username]
    );

    if (!admin) {
      return res.status(401).json({ message: "Invalid login credentials." });
    }

    // Compare passwords
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid login credentials." });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, user: { id: admin.id, username: admin.username, name: admin.name } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 🟢 **Get currently logged-in admin**
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows: [admin] } = await db.query(
      "SELECT id, username, name, avatar FROM admin WHERE id = $1",
      [userId]
    );

    if (!admin) {
      return res.status(404).json({ error: "User not found." });
    }

    // Convert avatar to base64 if it exists
    if (admin.avatar) {
      admin.avatar = `data:image/jpeg;base64,${Buffer.from(admin.avatar).toString("base64")}`;
    }

    res.json(admin);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🟢 **Update user profile**
router.put("/me", authenticateToken, upload.single("avatar"), async (req, res) => {
  const { name, username } = req.body;
  const userId = req.user.id;

  if (!name || !username) {
    return res.status(400).json({ error: "Name and username are required." });
  }

  try {
    const avatarBuffer = req.file ? req.file.buffer : null;

    const query = `
      UPDATE admin
      SET name = $1, username = $2, avatar = COALESCE($3, avatar)
      WHERE id = $4
      RETURNING id, name, username, avatar;
    `;

    const { rows: [updatedUser] } = await db.query(query, [name, username, avatarBuffer, userId]);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    // Convert avatar buffer to Base64
    if (updatedUser.avatar) {
      updatedUser.avatar = `data:image/jpeg;base64,${updatedUser.avatar.toString("base64")}`;
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
