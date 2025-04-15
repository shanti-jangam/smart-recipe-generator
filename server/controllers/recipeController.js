const Recipe = require('../models/Recipe');
const { CohereClient } = require('cohere-ai');

// Initialize Cohere client
const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

exports.generateRecipe = async (req, res) => {
    try {
        const { ingredients, dietary, servings } = req.body;

        // Validate ingredients
        if (!ingredients || !ingredients.length) {
            return res.status(400).json({ message: 'Please provide ingredients' });
        }

        const ingredientsList = ingredients.filter(ing => ing.trim());
        if (ingredientsList.length === 0) {
            return res.status(400).json({ message: 'Please provide valid ingredients' });
        }

        // Generate recipe using Cohere
        const prompt = `Create a detailed recipe using these ingredients: ${ingredientsList.join(', ')}.
                       ${dietary ? `Make it ${dietary}.` : ''}
                       Include exact measurements and detailed cooking instructions.
                       Format as follows:
                       Title: [creative recipe name]
                       Ingredients: [list with measurements]
                       Instructions: [numbered steps]
                       Cooking Time: [in minutes]
                       Difficulty: [Easy/Medium/Hard]`;

        const response = await cohere.generate({
            model: 'command',
            prompt: prompt,
            max_tokens: 500,
            temperature: 0.7,
            k: 0,
            stop_sequences: [],
            return_likelihoods: 'NONE'
        });

        const recipeText = response.generations[0].text;
        console.log('Generated Recipe:', recipeText);

        const parsedRecipe = parseGeneratedRecipe(recipeText, ingredientsList, dietary, servings);
        const newRecipe = new Recipe({
            ...parsedRecipe,
            imageUrl: `https://source.unsplash.com/800x600/?food,${ingredientsList.join(',')}`,
            dietaryTags: dietary ? dietary.split(',').filter(tag => tag.trim()) : []
        });

        await newRecipe.save();
        return res.json(newRecipe);

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Failed to generate recipe' });
    }
};

function generateFallbackRecipe(ingredients, dietary, servings) {
    const templates = {
        'rice': {
            prefix: 'Mexican-Style',
            cookingTime: 25,
            baseInstructions: [
                "Rinse the rice thoroughly until water runs clear",
                "Heat oil in a large pan over medium heat",
                "Add rice and toast for 2-3 minutes",
                "Add water (2 cups for every cup of rice)",
                "Bring to a boil, then reduce heat and simmer for 18-20 minutes",
                "Let stand for 5 minutes, then fluff with a fork"
            ]
        },
        'beans': {
            prefix: 'Seasoned',
            cookingTime: 30,
            baseInstructions: [
                "Rinse beans thoroughly",
                "Heat oil in a pan over medium heat",
                "Add beans and your preferred seasonings",
                "Simmer for 15-20 minutes until heated through",
                "Mash slightly if desired"
            ]
        },
        'bread': {
            prefix: 'Toasted',
            cookingTime: 10,
            baseInstructions: [
                "Slice bread to desired thickness",
                "Toast until golden brown",
                "Arrange on a serving plate"
            ]
        },
        'salsa': {
            prefix: 'Fresh',
            cookingTime: 15,
            baseInstructions: [
                "Combine salsa with other ingredients",
                "Mix well to incorporate flavors",
                "Let stand for 5 minutes before serving"
            ]
        }
    };

    // Identify common recipe combinations
    const recipeCombinations = {
        'bread,beans': {
            title: 'Bean Toast',
            instructions: [
                "Toast the bread until golden brown",
                "Heat and season the beans",
                "Spread beans over toasted bread",
                "Top with lettuce and salsa if available",
                "Serve immediately while warm"
            ]
        },
        'rice,beans': {
            title: 'Rice and Beans Bowl',
            instructions: [
                "Cook rice according to package instructions",
                "Heat and season the beans",
                "Combine rice and beans in a bowl",
                "Top with lettuce and salsa if available",
                "Garnish with fresh herbs if desired"
            ]
        }
    };

    // Check if we have a matching combination
    const ingredientKey = ingredients.sort().join(',');
    const combination = recipeCombinations[ingredientKey];

    if (combination) {
        return {
            title: combination.title,
            ingredients: ingredients.map(ing => {
                if (ing === 'rice') return '2 cups rice';
                if (ing === 'beans') return '1 can beans, drained and rinsed';
                if (ing === 'bread') return '2 slices bread';
                if (ing === 'salsa') return '1/2 cup salsa';
                if (ing === 'lettuce') return '1 cup shredded lettuce';
                return `1 cup ${ing}`;
            }),
            instructions: combination.instructions,
            cookingTime: 30,
            difficulty: 'Easy',
            servings: servings || 4,
            nutritionalInfo: calculateNutritionalInfo(ingredients, servings)
        };
    }

    // If no combination found, use the first ingredient's template
    const mainIngredient = ingredients[0].toLowerCase();
    const template = templates[mainIngredient] || {
        prefix: 'Fresh',
        cookingTime: 25,
        baseInstructions: [
            "Prepare all ingredients",
            "If using rice or beans, cook them first",
            "Combine ingredients in a large bowl",
            "Add seasonings to taste",
            "For best results, let stand 5 minutes before serving"
        ]
    };

    // Generate a more descriptive title
    const title = dietary ? 
        `${dietary} ${template.prefix} ${ingredients.join(' and ')}` :
        `${template.prefix} ${ingredients.join(' and ')}`;

    return {
        title,
        ingredients: ingredients.map(ing => {
            if (ing === 'rice') return '2 cups rice';
            if (ing === 'beans') return '1 can beans, drained and rinsed';
            if (ing === 'bread') return '2 slices bread';
            if (ing === 'salsa') return '1/2 cup salsa';
            if (ing === 'lettuce') return '1 cup shredded lettuce';
            return `1 cup ${ing}`;
        }),
        instructions: [
            ...template.baseInstructions,
            "Combine with remaining ingredients",
            "Adjust seasonings to taste",
            dietary ? `Ensure all ingredients comply with ${dietary} requirements` : ''
        ].filter(Boolean),
        cookingTime: template.cookingTime,
        difficulty: ingredients.length > 3 ? 'Medium' : 'Easy',
        servings: servings || 4,
        nutritionalInfo: calculateNutritionalInfo(ingredients, servings)
    };
}

function parseGeneratedRecipe(text, ingredients, dietary, servings) {
    try {
        const sections = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const titleMatch = text.match(/Title:\s*(.+)/i);
        const timeMatch = text.match(/Cooking Time:\s*(\d+)/i);
        const difficultyMatch = text.match(/Difficulty:\s*(Easy|Medium|Hard)/i);
        const ingredientsMatch = text.match(/Ingredients:([\s\S]*?)(?=Instructions:|$)/i);
        const instructionsMatch = text.match(/Instructions:([\s\S]*?)(?=Cooking Time:|$)/i);

        return {
            title: titleMatch ? titleMatch[1] : `${ingredients[0].charAt(0).toUpperCase() + ingredients[0].slice(1)} Recipe`,
            ingredients: ingredientsMatch ? 
                ingredientsMatch[1].split('\n').map(i => i.trim()).filter(i => i) :
                ingredients.map(ing => `1 cup ${ing}`),
            instructions: instructionsMatch ?
                instructionsMatch[1].split('\n').map(i => i.trim()).filter(i => i) :
                ["Combine all ingredients", "Cook until done"],
            cookingTime: timeMatch ? parseInt(timeMatch[1]) : 30,
            difficulty: difficultyMatch ? difficultyMatch[1] : 'Medium',
            servings: servings || 4,
            nutritionalInfo: calculateNutritionalInfo(ingredients, servings)
        };
    } catch (error) {
        console.error('Error parsing recipe:', error);
        return {
            title: `${ingredients[0].charAt(0).toUpperCase() + ingredients[0].slice(1)} Recipe`,
            ingredients: ingredients.map(ing => `1 cup ${ing}`),
            instructions: ["Combine all ingredients", "Cook until done"],
            cookingTime: 30,
            difficulty: 'Medium',
            servings: servings || 4,
            nutritionalInfo: calculateNutritionalInfo(ingredients, servings)
        };
    }
}

function calculateNutritionalInfo(ingredients, servings) {
    const baseValues = {
        calories: 150,
        protein: 5,
        carbohydrates: 20,
        fat: 5
    };

    const total = ingredients.length;
    return {
        calories: Math.round((baseValues.calories * total) / servings),
        protein: Math.round((baseValues.protein * total) / servings),
        carbohydrates: Math.round((baseValues.carbohydrates * total) / servings),
        fat: Math.round((baseValues.fat * total) / servings)
    };
}

exports.getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find().sort({ createdAt: -1 });
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.scaleRecipe = async (req, res) => {
    try {
        const { recipeId, newServings } = req.body;
        const recipe = await Recipe.findById(recipeId);
        
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const scalingFactor = newServings / recipe.servings;
        
        // Scale ingredients quantities
        const scaledIngredients = recipe.ingredients.map(ingredient => {
            const match = ingredient.match(/^(\d+(?:\.\d+)?)\s*(\w+)\s+(.+)$/);
            if (match) {
                const [_, amount, unit, item] = match;
                const newAmount = (parseFloat(amount) * scalingFactor).toFixed(1);
                return `${newAmount} ${unit} ${item}`;
            }
            return ingredient;
        });

        // Scale nutritional info
        const scaledNutritionalInfo = {
            calories: Math.round(recipe.nutritionalInfo.calories * scalingFactor),
            protein: Math.round(recipe.nutritionalInfo.protein * scalingFactor),
            carbohydrates: Math.round(recipe.nutritionalInfo.carbohydrates * scalingFactor),
            fat: Math.round(recipe.nutritionalInfo.fat * scalingFactor)
        };

        res.json({
            ...recipe.toObject(),
            servings: newServings,
            ingredients: scaledIngredients,
            nutritionalInfo: scaledNutritionalInfo
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};