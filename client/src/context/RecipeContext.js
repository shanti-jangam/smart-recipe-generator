import React, { createContext, useContext, useState } from 'react';

const RecipeContext = createContext();

export const RecipeProvider = ({ children }) => {
    const [savedRecipes, setSavedRecipes] = useState([]);

    const saveRecipe = (recipe) => {
        setSavedRecipes(prev => {
            // Check if recipe already exists
            const exists = prev.some(r => r.title === recipe.title);
            if (!exists) {
                return [...prev, recipe];
            }
            return prev;
        });
    };

    const removeRecipe = (recipeTitle) => {
        setSavedRecipes(prev => prev.filter(recipe => recipe.title !== recipeTitle));
    };

    return (
        <RecipeContext.Provider value={{ savedRecipes, saveRecipe, removeRecipe }}>
            {children}
        </RecipeContext.Provider>
    );
};

export const useRecipes = () => useContext(RecipeContext); 