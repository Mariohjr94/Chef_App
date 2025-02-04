const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require('multer');
const upload = multer(); 
const authenticateToken = require("../middleware/authenticateToken");

// Get all recipes (public, no authentication)
router.get('/', async (req, res, next) => {
  try {
    const { rows: recipes } = await db.query('SELECT * FROM recipe');

    // Convert the buffer (image) to base64 format
    const updatedRecipes = recipes.map((recipe) => {
      if (Buffer.isBuffer(recipe.image)) {
        recipe.image = `data:image/jpeg;base64,${Buffer.from(recipe.image).toString('base64')}`;
      }
      return recipe;
    });

    console.log(updatedRecipes);

    res.json(updatedRecipes);
  } catch (error) {
    next(error); // Forward the error to the error handler middleware
  }
});

// Get a recipe by id (public, no authentication)
router.get("/:id", async (req, res, next) => {
  try {
    const {
      rows: [recipe],
    } = await db.query("SELECT * FROM recipe WHERE id = $1", [req.params.id]);

    if (!recipe) {
      return res.status(404).send("Recipe not found.");
    }

    // Convert image to base64 if it's a Buffer
    if (Buffer.isBuffer(recipe.image)) {
      recipe.image = `data:image/jpeg;base64,${Buffer.from(recipe.image).toString('base64')}`;
    }

     // Safely parse ingredients and instructions
    recipe.ingredients =
      typeof recipe.ingredients === "string"
        ? (() => {
            try {
              return JSON.parse(recipe.ingredients);
            } catch {
              console.error("Invalid ingredients format in DB:", recipe.ingredients);
              return [];
            }
          })()
        : recipe.ingredients;

     recipe.instructions =
      Array.isArray(recipe.instructions) // Check if it's already an array
        ? recipe.instructions
        : typeof recipe.instructions === "string" // Check if it's a string
        ? recipe.instructions.includes("[") || recipe.instructions.includes("{")
          ? (() => {
              try {
                return JSON.parse(recipe.instructions);
              } catch {
                console.error("Invalid instructions JSON format:", recipe.instructions);
                return [];
              }
            })()
          : [recipe.instructions] // Treat as a single instruction if it's a plain string
        : [];


    res.send({
  ...recipe,
  instructions: recipe.instructions || [],
});
  } catch (error) {
    next(error);
  }
});

//search recipes
router.get('/search', async (req, res) => {
  const searchTerm = req.query.query;  // Retrieve the query parameter
  try {
    const result = await db.query(
      'SELECT * FROM recipes WHERE name ILIKE $1',
      [`%${searchTerm}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Failed to fetch recipes' });
  }
});


// Protected Routes (require login):
// Create a new recipe
router.post("/", authenticateToken, upload.single('image'), async (req, res, next) => {
  try {
    const { name, ingredients, instructions, category_id } = req.body;
    const image = req.file ? req.file.buffer : null;

    // Validate required fields
    if (!name || !ingredients || !instructions || !category_id) {
      console.log("Validation failed: Missing required fields", { name, ingredients, instructions, category_id });
      return res.status(400).send({ error: "Missing required fields" });
    }

    // Validate file type and size
    if (req.file && !req.file.mimetype.startsWith("image/")) {
      console.log("Validation failed: Invalid file type:", req.file.mimetype);
      return res.status(400).send({ error: "Invalid file type. Only images are allowed." });
    }
    if (req.file && req.file.size > 10 * 1024 * 1024) {
      console.log("Validation failed: File size exceeds limit:", req.file.size);
      return res.status(400).send({ error: "File size exceeds 5MB limit." });
    }

    // Parse JSON fields
    let parsedIngredients, parsedInstructions;
    try {
      parsedIngredients = JSON.parse(ingredients);
      parsedInstructions = JSON.parse(instructions);
    } catch (error) {
      console.log("Validation failed: Invalid JSON format for ingredients or instructions", { ingredients, instructions });
      return res.status(400).send({ error: "Invalid JSON format for ingredients or instructions" });
    }

    // Insert into the database
    const { rows: [recipe] } = await db.query(
      "INSERT INTO recipe (name, ingredients, instructions, image, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, parsedIngredients, parsedInstructions, image, category_id]
    );

    res.status(201).send(recipe);
  } catch (error) {
    console.error("Error inserting recipe:", error);
    next(error);
  }
});



// Update a recipe
router.put("/:id", authenticateToken, upload.single('image'), async (req, res, next) => {
  try {
    const { name, ingredients, instructions, category_id } = req.body;

    const image = req.file ? req.file.buffer : undefined;

     const query = `
      UPDATE recipe 
      SET name = $1, ingredients = $2, instructions = $3, 
          image = COALESCE($4, image), category_id = $5 
      WHERE id = $6 
      RETURNING *`;
    
    const values = [
      name, 
      JSON.parse(ingredients), 
      JSON.parse(instructions),
      image, 
      category_id, 
      req.params.id];

    const { rows: [recipe] } = await db.query(query, values);
   
    if (!recipe) {
      return res.status(404).send("Recipe not found.");
    }

    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

// Delete a recipe by id
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const {
      rows: [recipe],
    } = await db.query(
      "DELETE FROM recipe WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (!recipe) {
      return res.status(404).send("Recipe not found.");
    }

    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
