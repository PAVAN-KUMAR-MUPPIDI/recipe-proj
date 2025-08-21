// backend/src/controllers/recipeController.js
// Business logic for routes. Exposes:
// getRecipes (GET /api/recipes) - paginated, sorted by rating desc by default
// getRecipeById (GET /api/recipes/:id)
// addRecipe (POST /api/recipes)
// updateRecipe (PUT /api/recipes/:id)
// deleteRecipe (DELETE /api/recipes/:id)
// searchRecipes (GET /api/recipes/search) - supports operators like <=, >=, = for numeric fields

import Recipe from "../models/Recipe.js";

/**
 * Parse operator strings like ">=4.5" or "<=400" or "=300" into mongoose query
 * returns an object suitable for query e.g. { $gte: 4.5 }
 */
function parseNumericFilter(filterStr) {
  if (!filterStr) return null;
  const match = filterStr.match(/^(>=|<=|=|>|<)?\s*(\d+(\.\d+)?)$/);
  if (!match) return null;
  const op = match[1] || "=";
  const val = parseFloat(match[2]);
  switch (op) {
    case ">": return { $gt: val };
    case "<": return { $lt: val };
    case ">=": return { $gte: val };
    case "<=": return { $lte: val };
    default: return { $eq: val };
  }
}

export const getRecipes = async (req, res) => {
  try {
    // page, limit, sort by rating desc by default (assessment requested sort by rating)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    // default sorting: rating desc
    let sortBy = {};
    if (req.query.sort) {
      // allow sort param like "rating:desc" or "title:asc"
      const parts = req.query.sort.split(":");
      const field = parts[0];
      const dir = parts[1] === "asc" ? 1 : -1;
      sortBy[field] = dir;
    } else {
      sortBy = { rating: -1 }; // default
    }

    // basic filters (title partial, cuisine exact)
    const filter = {};
    if (req.query.title) {
      filter.title = { $regex: req.query.title, $options: "i" };
    }
    if (req.query.cuisine) {
      filter.cuisine = req.query.cuisine;
    }

    // support rating and total_time numeric filter via query param e.g. rating=>=4.5
    if (req.query.rating) {
      const parsed = parseNumericFilter(req.query.rating);
      if (parsed) filter.rating = parsed;
    }
    if (req.query.total_time) {
      const parsed = parseNumericFilter(req.query.total_time);
      if (parsed) filter.total_time = parsed;
    }

    // calories filter (stored as string like "389 kcal" in some datasets).
    // To support numeric filtering, we assume nutrients.calories may contain digits; we will parse int.
    if (req.query.calories) {
      // expected format: <=400 or >=300 etc.
      const parsed = parseNumericFilter(req.query.calories);
      if (parsed) {
        // We'll use aggregation to convert nutrients.calories string to number; but to keep things simple and performant,
        // we handle common case where nutrients.calories stored as "389 kcal" or "389" - we match by numeric substring
        // Implement by finding documents where nutrients.calories exists and numeric part meets criteria.
        // For simplicity, handle eq only and range using $expr with $toDouble when possible.
        const operator = Object.keys(parsed)[0]; // $gte, $lte, etc
        const value = parsed[operator];

        // Use $expr to convert string to number if possible
        filter["$expr"] = {
          [operator]: [
            {
              $toDouble: {
                $trim: { input: { $arrayElemAt: [{ $split: ["$nutrients.calories", " "] }, 0] } }
              }
            },
            value
          ]
        };
      }
    }

    const total = await Recipe.countDocuments(filter);
    const recipes = await Recipe.find(filter)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({
      page,
      limit,
      total,
      data: recipes
    });
  } catch (error) {
    console.error("getRecipes error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id).lean();
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    return res.json(recipe);
  } catch (error) {
    console.error("getRecipeById error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const addRecipe = async (req, res) => {
  try {
    const payload = req.body;
    // Basic NaN handling: if numeric fields provided as "NaN" or invalid, set to null
    ["rating", "prep_time", "cook_time", "total_time"].forEach((f) => {
      if (payload[f] === "NaN" || payload[f] === "" || Number.isNaN(Number(payload[f]))) {
        payload[f] = null;
      } else {
        if (payload[f] !== undefined && payload[f] !== null) payload[f] = Number(payload[f]);
      }
    });

    const recipe = new Recipe(payload);
    const saved = await recipe.save();
    return res.status(201).json(saved);
  } catch (error) {
    console.error("addRecipe error:", error);
    return res.status(400).json({ message: error.message });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const updated = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Recipe not found" });
    return res.json(updated);
  } catch (error) {
    console.error("updateRecipe error:", error);
    return res.status(400).json({ message: error.message });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const removed = await Recipe.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: "Recipe not found" });
    return res.json({ message: "Recipe deleted" });
  } catch (error) {
    console.error("deleteRecipe error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Search endpoint that accepts flexible query parameters:
 * - calories (e.g. <=400, >=300)
 * - title (partial)
 * - cuisine (exact)
 * - total_time (<= or >= etc)
 * - rating (>=4.5 etc)
 */
export const searchRecipes = async (req, res) => {
  try {
    const q = req.query; // expecting strings like calories=<=400 etc.
    const filter = {};

    if (q.title) filter.title = { $regex: q.title, $options: "i" };
    if (q.cuisine) filter.cuisine = q.cuisine;
    if (q.rating) {
      const parsed = parseNumericFilter(q.rating);
      if (parsed) filter.rating = parsed;
    }
    if (q.total_time) {
      const parsed = parseNumericFilter(q.total_time);
      if (parsed) filter.total_time = parsed;
    }
    if (q.calories) {
      const parsed = parseNumericFilter(q.calories);
      if (parsed) {
        const operator = Object.keys(parsed)[0];
        const value = parsed[operator];
        filter["$expr"] = {
          [operator]: [
            {
              $toDouble: {
                $trim: { input: { $arrayElemAt: [{ $split: ["$nutrients.calories", " "] }, 0] } }
              }
            },
            value
          ]
        };
      }
    }

    const results = await Recipe.find(filter).lean();
    return res.json({ data: results });
  } catch (error) {
    console.error("searchRecipes error:", error);
    return res.status(500).json({ message: error.message });
  }
};
