const express = require("express");
const router = express.Router();
const db = require("../db");

// Public route to get all categories (no login required)
router.get("/", async (req, res, next) => {
  try {
    const { rows: categories } = await db.query("SELECT * FROM category");
    res.send(categories);
  } catch (error) {
    next(error);
  }
});

// Middleware to check if the user is logged in (for POST and DELETE routes)
router.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).send("You must be logged in to do that.");
  }
  next();
});

// Authenticated route to create a new category
router.post("/", async (req, res, next) => {
  try {
    const { name } = req.body;
    const {
      rows: [category],
    } = await db.query(
      "INSERT INTO category (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).send(category);
  } catch (error) {
    next(error);
  }
});

// Authenticated route to delete a category by id
router.delete("/:id", async (req, res, next) => {
  try {
    const {
      rows: [category],
    } = await db.query(
      "DELETE FROM category WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (!category) {
      return res.status(404).send("Category not found.");
    }

    res.send(category);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
