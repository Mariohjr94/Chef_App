const router = require("express").Router();

// Include routes for recipes and categories
router.use("/recipes", require("./recipes"));
router.use("/categories", require("./categories"));

module.exports = router;
