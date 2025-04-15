import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Chip,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    CardContent,
    CardMedia,
    Divider
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import TimerIcon from '@mui/icons-material/Timer';
import { fadeIn, scaleIn } from '../utils/animations';
import KitchenIcon from '@mui/icons-material/Kitchen';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import ScaleIcon from '@mui/icons-material/Scale';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { API_URL, UNSPLASH_ACCESS_KEY, SPOONACULAR_API_KEY } from '../config/api.js';
import { useRecipes } from '../context/RecipeContext';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { getRandomFoodImage } from '../utils/constants';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delayChildren: 0.3,
            staggerChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1
    }
};

const RecipeGenerator = () => {
    const [ingredients, setIngredients] = useState('');
    const [dietary, setDietary] = useState('');
    const [servings, setServings] = useState(4);
    const [loading, setLoading] = useState(false);
    const [recipe, setRecipe] = useState(null);
    const [error, setError] = useState(null);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [imageLoading, setImageLoading] = useState(false);
    const { savedRecipes, saveRecipe, removeRecipe } = useRecipes();
    const [isSaved, setIsSaved] = useState(false);

    const dietaryOptions = [
        'Vegetarian', 'Vegan', 'Gluten-Free', 
        'Dairy-Free', 'Keto', 'Paleo'
    ];

    const getRecipeImage = async (title) => {
        try {
            const response = await fetch(
                `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(title)}&apiKey=${SPOONACULAR_API_KEY}&number=1`
            );
            
            const data = await response.json();
            return data.results[0]?.image || 'fallback_image_url';
        } catch (error) {
            console.error('Error fetching image:', error);
            return 'fallback_image_url';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setImageLoading(true);
        // Reset states for new recipe
        setIsSaved(false);
        setCompletedSteps([]);

        try {
            const ingredientsList = ingredients.split(',').map(i => i.trim());
            const response = await fetch(`${API_URL}/recipes/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ingredients: ingredientsList,
                    dietary,
                    servings
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            const newRecipe = {
                ...data,
                imageUrl: getRandomFoodImage()
            };
            
            setRecipe(newRecipe);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setImageLoading(false);
        }
    };

    const handlePrint = () => {
        const printContent = document.querySelector('.recipe-content');
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${recipe.title}</title>
                    <style>
                        body { 
                            font-family: Arial; 
                            padding: 20px;
                            color: #333;
                        }
                        img { 
                            max-width: 100%; 
                            height: auto;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .step { margin: 10px 0; }
                        .completed { 
                            text-decoration: line-through; 
                            color: #666; 
                        }
                        h1 { 
                            color: #00bcd4;
                            margin-bottom: 20px;
                        }
                        .ingredients {
                            background: #f5f5f5;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .instructions {
                            line-height: 1.6;
                        }
                    </style>
                </head>
                <body>
                    <h1>${recipe.title}</h1>
                    <img src="${recipe.imageUrl}" alt="${recipe.title}" />
                    <div class="ingredients">
                        <h2>Ingredients:</h2>
                        <ul>
                            ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="instructions">
                        <h2>Instructions:</h2>
                        <ol>
                            ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
                        </ol>
                    </div>
                    <div>
                        <h2>Nutritional Information (per serving):</h2>
                        <p>Calories: ${recipe.nutritionalInfo.calories}</p>
                        <p>Protein: ${recipe.nutritionalInfo.protein}g</p>
                        <p>Carbs: ${recipe.nutritionalInfo.carbohydrates}g</p>
                        <p>Fat: ${recipe.nutritionalInfo.fat}g</p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const toggleStep = (index) => {
        setCompletedSteps(prev => 
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: recipe.title,
                    text: `Check out this recipe for ${recipe.title}!`,
                    url: window.location.href
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        }
    };

    const handleSaveRecipe = () => {
        if (isSaved) {
            removeRecipe(recipe.title);
            setIsSaved(false);
        } else {
            saveRecipe(recipe);
            setIsSaved(true);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
            >
                <Typography 
                    variant="h3" 
                    gutterBottom 
                    sx={{ 
                        textAlign: 'center',
                        background: 'linear-gradient(45deg, #00bcd4 30%, #ff4081 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2
                    }}
                >
                    <RestaurantMenuIcon sx={{ fontSize: 40 }} />
                    AI Recipe Generator
                </Typography>

                <Paper 
                    component={motion.div}
                    variants={scaleIn}
                    elevation={3}
                    sx={{
                        p: 4,
                        mb: 4,
                        background: 'rgba(30, 30, 30, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Ingredients (comma-separated)"
                            value={ingredients}
                            onChange={(e) => setIngredients(e.target.value)}
                            sx={{ mb: 3 }}
                            placeholder="e.g., chicken, rice, tomatoes"
                        />

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Dietary Requirements</InputLabel>
                            <Select
                                multiple
                                value={dietary.split(',')}
                                onChange={(e) => setDietary(Array.from(e.target.value).join(','))}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )}
                            >
                                {dietaryOptions.map(option => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            type="number"
                            label="Servings"
                            value={servings}
                            onChange={(e) => setServings(parseInt(e.target.value))}
                            InputProps={{ inputProps: { min: 1, max: 12 } }}
                            sx={{ mb: 3 }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            sx={{
                                height: 56,
                                background: 'linear-gradient(45deg, #00bcd4 30%, #ff4081 90%)',
                                boxShadow: '0 3px 5px 2px rgba(0, 188, 212, .3)',
                            }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Generate Recipe'}
                        </Button>
                    </form>
                </Paper>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Typography color="error" textAlign="center">
                            {error}
                        </Typography>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {recipe && (
                        <Card
                            component={motion.div}
                            className="recipe-content"
                            variants={scaleIn}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            sx={{
                                background: 'rgba(30, 30, 30, 0.95)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                overflow: 'hidden'
                            }}
                        >
                            <motion.div
                                initial={{ scale: 1.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <CardMedia
                                    component="img"
                                    height="400"
                                    image={recipe.imageUrl}
                                    alt={recipe.title}
                                    sx={{ 
                                        objectFit: 'cover',
                                        filter: 'brightness(0.8)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            filter: 'brightness(1)',
                                            transform: 'scale(1.02)'
                                        }
                                    }}
                                    onError={(e) => {
                                        console.log('Image failed to load, using fallback');
                                        e.target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1600&h=900&fit=crop';
                                    }}
                                />
                            </motion.div>

                            {imageLoading && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '400px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(0,0,0,0.7)',
                                        backdropFilter: 'blur(5px)'
                                    }}
                                >
                                    <CircularProgress size={60} />
                                </Box>
                            )}

                            <CardContent>
                                <motion.div variants={containerVariants}>
                                    <Typography 
                                        variant="h4" 
                                        gutterBottom
                                        sx={{
                                            background: 'linear-gradient(45deg, #00bcd4 30%, #ff4081 90%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {recipe.title}
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                                        <motion.div variants={itemVariants}>
                                            <Chip 
                                                icon={<TimerIcon />} 
                                                label={`${recipe.cookingTime} mins`}
                                                sx={{ background: 'rgba(0, 188, 212, 0.2)' }}
                                            />
                                        </motion.div>
                                        <motion.div variants={itemVariants}>
                                            <Chip 
                                                icon={<WhatshotIcon />} 
                                                label={recipe.difficulty}
                                                sx={{ background: 'rgba(255, 64, 129, 0.2)' }}
                                            />
                                        </motion.div>
                                        {recipe.dietaryTags.map(tag => (
                                            <motion.div key={tag} variants={itemVariants}>
                                                <Chip 
                                                    icon={<LocalDiningIcon />}
                                                    label={tag}
                                                    sx={{ background: 'rgba(255, 255, 255, 0.1)' }}
                                                />
                                            </motion.div>
                                        ))}
                                    </Box>

                                    <Typography variant="h6" gutterBottom>
                                        Ingredients:
                                    </Typography>
                                    <Box component="ul" sx={{ mb: 3 }}>
                                        {recipe.ingredients.map((ingredient, index) => (
                                            <Typography component="li" key={index} sx={{ mb: 1 }}>
                                                {ingredient}
                                            </Typography>
                                        ))}
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                                            onClick={handleSaveRecipe}
                                            sx={{ 
                                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                                color: isSaved ? 'primary.main' : 'inherit'
                                            }}
                                        >
                                            {isSaved ? 'Saved' : 'Save Recipe'}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<PrintIcon />}
                                            onClick={handlePrint}
                                            sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                                        >
                                            Print Recipe
                                        </Button>
                                        {navigator.share && (
                                            <Button
                                                variant="outlined"
                                                startIcon={<ShareIcon />}
                                                onClick={handleShare}
                                                sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                                            >
                                                Share
                                            </Button>
                                        )}
                                    </Box>

                                    <Typography variant="h6" gutterBottom>
                                        Instructions:
                                    </Typography>
                                    <Box component="ol" sx={{ mb: 3 }}>
                                        {recipe.instructions.map((instruction, index) => (
                                            <Box
                                                component="li"
                                                key={index}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 2,
                                                    mb: 2,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'translateX(10px)'
                                                    }
                                                }}
                                                onClick={() => toggleStep(index)}
                                            >
                                                {completedSteps.includes(index) ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <RadioButtonUncheckedIcon />
                                                )}
                                                <Typography
                                                    paragraph
                                                    sx={{
                                                        textDecoration: completedSteps.includes(index) ? 'line-through' : 'none',
                                                        color: completedSteps.includes(index) ? 'text.secondary' : 'text.primary'
                                                    }}
                                                >
                                                    {instruction.replace(/^\d+\.\s*/, '')}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="h6" gutterBottom>
                                        Nutritional Information (per serving):
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 3 }}>
                                        <Typography>Calories: {recipe.nutritionalInfo.calories}</Typography>
                                        <Typography>Protein: {recipe.nutritionalInfo.protein}g</Typography>
                                        <Typography>Carbs: {recipe.nutritionalInfo.carbohydrates}g</Typography>
                                        <Typography>Fat: {recipe.nutritionalInfo.fat}g</Typography>
                                    </Box>
                                </motion.div>
                            </CardContent>
                        </Card>
                    )}
                </AnimatePresence>
            </motion.div>
        </Container>
    );
};

export default RecipeGenerator;
