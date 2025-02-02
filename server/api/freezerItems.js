const express = require("express");
const router = express.Router();
const db = require("../db");

//Get all items from freezer database
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT freezer_items.*, freezer_categories.name AS category_name 
      FROM freezer_items 
      LEFT JOIN freezer_categories 
      ON freezer_items.category_id = freezer_categories.id
    `;
    const { rows } = await db.query(query); // Fetch items with category names
    res.json(rows); // Return JSON data
  } catch (err) {
    console.error("Failed to fetch freezer items:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get all freezer categories
router.get("/categories", async (req, res) => {
  try {
    const query = `SELECT * FROM freezer_categories`;
    const { rows } = await db.query(query); // Fetch all categories
    res.json(rows); // Return JSON data
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//add an item to freezer database
router.post("/", async (req, res) => {
  const { name, quantity, category_id } = req.body;
  if (!name || !quantity) {
    return res.status(400).json({ error: "Name and quantity are required." });
  }
  try {
    const query = `
      INSERT INTO freezer_items (name, quantity, category_id) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const { rows } = await db.query(query, [name, quantity, category_id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add freezer item.");
  }
});

//update an item to freezer database
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, quantity, category_id } = req.body;
  if (!name || !quantity) {
    return res.status(400).json({ error: "Name and quantity are required." });
  }
  try {
    const query = `
      UPDATE freezer_items 
      SET name = $1, quantity = $2, category_id = $3 
      WHERE id = $4 
      RETURNING *
    `;
    const { rows } = await db.query(query, [name, quantity, category_id, id]);

    // Fetch the updated item with the category_name
    const itemQuery = `
      SELECT freezer_items.*, freezer_categories.name AS category_name
      FROM freezer_items
      LEFT JOIN freezer_categories
      ON freezer_items.category_id = freezer_categories.id
      WHERE freezer_items.id = $1;
    `;
    const updatedItem = await db.query(itemQuery, [id]);

    res.status(200).json(updatedItem.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to update freezer item.");
  }
});

//delete an item from freezer database
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM freezer_items WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to delete freezer item.");
  }
});

module.exports = router;