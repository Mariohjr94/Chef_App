const path = require("path");
const express = require("express");
const morgan = require("morgan");
const app = express();
const jwt = require("jsonwebtoken");
const helmet = require("helmet")
const cors = require("cors");

require('dotenv').config();

app.use(helmet());
app.use(cors());
// Logging middleware
app.use(morgan("dev"));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file-serving middleware
app.use(express.static(path.join(__dirname, "..", "client/dist")));

// Backend routes
const authRoutes = require("./auth");
const recipeRoutes = require("./api/recipes");
const categoryRoutes = require("./api/categories");
const freezerItemsRoutes = require("./api/freezerItems");

app.use("/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/categories" ,categoryRoutes);
app.use("/api/freezer-items", freezerItemsRoutes);

// Serves the HTML file that Vite builds
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client/dist/index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || "Internal server error.");
});

// Default to 404 if no other route matched
app.use((req, res) => {
  res.status(404).send("Not found.");
});

module.exports = app;