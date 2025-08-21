// backend/src/routes/recipeRoutes.js
import express from "express";
import {
  getRecipes,
  getRecipeById,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  searchRecipes
} from "../controllers/recipeController.js";

const router = express.Router();

// GET /api/recipes?page=1&limit=10 (sorted by rating desc by default)
router.get("/", getRecipes);

// GET /api/recipes/search?calories=<=400&title=pie&rating=>=4.5
router.get("/search", searchRecipes);

// CRUD
router.post("/", addRecipe);
router.get("/:id", getRecipeById);
router.put("/:id", updateRecipe);
router.delete("/:id", deleteRecipe);

export default router;
