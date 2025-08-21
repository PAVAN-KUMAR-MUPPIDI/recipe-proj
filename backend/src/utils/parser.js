// backend/src/utils/parser.js
import fs from "fs";

/**
 * Load recipes from filePath (JSON).
 * Convert "NaN" or invalid numeric strings to null.
 * Returns array of objects ready to insert into DB.
 */
export const loadRecipes = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf8");
  let recipes = JSON.parse(raw);

  const cleaned = recipes.map((r) => {
    const copy = { ...r };
    // normalize numeric fields
    ["rating", "prep_time", "cook_time", "total_time"].forEach((f) => {
      if (copy[f] === "NaN" || copy[f] === undefined || copy[f] === null || Number.isNaN(Number(copy[f]))) {
        copy[f] = null;
      } else {
        copy[f] = Number(copy[f]);
      }
    });
    return copy;
  });

  return cleaned;
};
