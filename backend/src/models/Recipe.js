// backend/src/models/Recipe.js
// Mongoose schema matching assessment fields
// collection: securincol in the "securin" DB (as requested)

import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    cuisine: { type: String, default: null },
    title: { type: String, required: true },
    rating: { type: Number, default: null },
    prep_time: { type: Number, default: null },
    cook_time: { type: Number, default: null },
    total_time: { type: Number, default: null },
    description: { type: String, default: "" },
    nutrients: { type: mongoose.Schema.Types.Mixed, default: {} }, // JSON object
    serves: { type: String, default: null },
    // optional original fields
    ingredients: { type: [String], default: [] },
    instructions: { type: [String], default: [] }
  },
  { collection: "securincol", timestamps: true }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
