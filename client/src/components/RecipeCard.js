import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    IconButton,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import TimerIcon from '@mui/icons-material/Timer';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import ScaleIcon from '@mui/icons-material/Scale';
import { useRecipes } from '../context/RecipeContext';
import { getRandomFoodImage } from '../utils/constants';

const RecipeCard = ({ recipe: initialRecipe }) => {
    const { removeRecipe } = useRecipes();
    const [imageError, setImageError] = React.useState(false);
    const [imageLoading, setImageLoading] = React.useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [currentServings, setCurrentServings] = useState(initialRecipe.servings);
    const [recipe, setRecipe] = useState(initialRecipe);

    const handleImageError = () => {
        setImageError(true);
    };

    const scaleIngredient = (ingredient, scale) => {
        // Match quantity and unit from ingredient string
        const match = ingredient.match(/^([\d./]+)\s*([a-zA-Z]+)?\s+(.+)$/);
        if (!match) return ingredient;

        const [, quantity, unit, item] = match;
        // Convert fraction to decimal without eval
        let numericQuantity;
        if (quantity.includes('/')) {
            const [num, denom] = quantity.split('/');
            numericQuantity = parseFloat(num) / parseFloat(denom);
        } else {
            numericQuantity = parseFloat(quantity);
        }
        
        let scaledQuantity = numericQuantity * scale;

        // Round to 1 decimal place
        scaledQuantity = Math.round(scaledQuantity * 10) / 10;

        // Format the scaled ingredient
        return `${scaledQuantity}${unit ? ` ${unit}` : ''} ${item}`;
    };

    const handleServingsChange = (newServings) => {
        if (newServings < 1) return;
        
        const scale = newServings / recipe.servings;
        setCurrentServings(newServings);

        // Scale ingredients
        const scaledIngredients = recipe.ingredients.map(ing => 
            scaleIngredient(ing, scale)
        );

        // Update nutritional info
        const scaledNutritionalInfo = {
            calories: Math.round(recipe.nutritionalInfo.calories * scale),
            protein: Math.round(recipe.nutritionalInfo.protein * scale),
            carbohydrates: Math.round(recipe.nutritionalInfo.carbohydrates * scale),
            fat: Math.round(recipe.nutritionalInfo.fat * scale)
        };

        // Update recipe state
        setRecipe(prev => ({
            ...prev,
            servings: newServings,
            ingredients: scaledIngredients,
            nutritionalInfo: scaledNutritionalInfo
        }));
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handlePrint = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow pop-ups to print the recipe');
            return;
        }

        const printContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${recipe.title} - Recipe</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            max-width: 800px;
                            margin: 20px auto;
                            padding: 20px;
                            color: #333;
                        }
                        img { 
                            max-width: 100%; 
                            height: auto;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .recipe-header {
                            text-align: center;
                            color: #00bcd4;
                            border-bottom: 2px solid #00bcd4;
                            padding-bottom: 10px;
                        }
                        .recipe-meta {
                            display: flex;
                            gap: 20px;
                            justify-content: center;
                            margin: 20px 0;
                            flex-wrap: wrap;
                        }
                        .recipe-section {
                            margin: 30px 0;
                            padding: 20px;
                            background: #f5f5f5;
                            border-radius: 8px;
                        }
                        .recipe-instructions li {
                            margin-bottom: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="recipe-header">
                        <h1>${recipe.title}</h1>
                    </div>
                    <div class="recipe-meta">
                        <span>⏱️ ${recipe.cookingTime} minutes</span>
                        <span>🔥 ${recipe.difficulty}</span>
                        ${recipe.dietaryTags.map(tag => `<span>🍽️ ${tag}</span>`).join('')}
                    </div>
                    <img src="${recipe.imageUrl}" alt="${recipe.title}" />
                    <div class="recipe-section">
                        <h2>Ingredients</h2>
                        <ul>
                            ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="recipe-section recipe-instructions">
                        <h2>Instructions</h2>
                        <ol>
                            ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
                        </ol>
                    </div>
                    <div class="recipe-section">
                        <h2>Nutritional Information (per serving)</h2>
                        <p>
                            Calories: ${recipe.nutritionalInfo.calories} |
                            Protein: ${recipe.nutritionalInfo.protein}g |
                            Carbs: ${recipe.nutritionalInfo.carbohydrates}g |
                            Fat: ${recipe.nutritionalInfo.fat}g
                        </p>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for images to load before printing
        setTimeout(() => {
            printWindow.print();
            // Close the window after printing (or if printing is cancelled)
            const checkPrintDialogClosed = setInterval(() => {
                if (printWindow.closed) {
                    clearInterval(checkPrintDialogClosed);
                } else {
                    printWindow.close();
                }
            }, 1000);
        }, 500);
    };

    const handleShare = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            if (navigator.share) {
                await navigator.share({
                    title: recipe.title,
                    text: `Check out this recipe for ${recipe.title}!\n\n` +
                          `Cooking Time: ${recipe.cookingTime} mins\n` +
                          `Difficulty: ${recipe.difficulty}\n` +
                          `${recipe.dietaryTags.length ? `Dietary: ${recipe.dietaryTags.join(', ')}\n` : ''}`,
                    url: window.location.href
                });
            } else {
                // Fallback for browsers that don't support native sharing
                const recipeText = `${recipe.title}\n\n` +
                                 `Cooking Time: ${recipe.cookingTime} mins\n` +
                                 `Difficulty: ${recipe.difficulty}\n` +
                                 `${recipe.dietaryTags.length ? `Dietary: ${recipe.dietaryTags.join(', ')}\n` : ''}`;
                
                await navigator.clipboard.writeText(recipeText);
                alert('Recipe details copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing recipe:', error);
            alert('Failed to share recipe. Please try again.');
        }
    };

    return (
        <>
            <Card
                component={motion.div}
                whileHover={{ y: -5 }}
                onClick={() => setDetailsOpen(true)}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(30, 30, 30, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    '&:hover': {
                        border: '1px solid rgba(0, 188, 212, 0.5)',
                    }
                }}
            >
                <Box sx={{ position: 'relative' }}>
                    <CardMedia
                        component="img"
                        height="200"
                        image={imageError ? getRandomFoodImage() : recipe.imageUrl}
                        alt={recipe.title}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        sx={{ 
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.05)'
                            }
                        }}
                    />
                    {!imageError && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(0,0,0,0.5)',
                                opacity: imageLoading ? 1 : 0,
                                transition: 'opacity 0.3s ease'
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    )}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{
                                background: 'linear-gradient(45deg, #00bcd4 30%, #ff4081 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            {recipe.title}
                        </Typography>
                        <IconButton 
                            size="small" 
                            onClick={(e) => {
                                e.stopPropagation();
                                removeRecipe(recipe.title);
                            }}
                            sx={{ color: 'error.main' }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip 
                            icon={<TimerIcon />} 
                            label={`${recipe.cookingTime} mins`}
                            size="small"
                            sx={{ background: 'rgba(0, 188, 212, 0.2)' }}
                        />
                        <Chip 
                            icon={<WhatshotIcon />} 
                            label={recipe.difficulty}
                            size="small"
                            sx={{ background: 'rgba(255, 64, 129, 0.2)' }}
                        />
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                        {recipe.ingredients.length} ingredients
                    </Typography>

                    {recipe.dietaryTags.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {recipe.dietaryTags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    size="small"
                                    sx={{ background: 'rgba(255, 255, 255, 0.1)' }}
                                />
                            ))}
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'rgba(30, 30, 30, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(45deg, #00bcd4 30%, #ff4081 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    {recipe.title}
                    <IconButton 
                        onClick={() => setDetailsOpen(false)}
                        sx={{ color: 'text.secondary' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mb: 3 }}>
                        <img 
                            src={imageError ? getRandomFoodImage() : recipe.imageUrl} 
                            alt={recipe.title}
                            style={{ 
                                width: '100%',
                                height: '300px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                            }}
                            onError={handleImageError}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                        <Chip 
                            icon={<TimerIcon />} 
                            label={`${recipe.cookingTime} mins`}
                            sx={{ background: 'rgba(0, 188, 212, 0.2)' }}
                        />
                        <Chip 
                            icon={<WhatshotIcon />} 
                            label={recipe.difficulty}
                            sx={{ background: 'rgba(255, 64, 129, 0.2)' }}
                        />
                        {recipe.dietaryTags.map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                sx={{ background: 'rgba(255, 255, 255, 0.1)' }}
                            />
                        ))}
                    </Box>

                    <Typography variant="h6" gutterBottom>
                        Ingredients:
                    </Typography>
                    <List>
                        {recipe.ingredients.map((ingredient, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={ingredient} />
                            </ListItem>
                        ))}
                    </List>

                    <Typography variant="h6" gutterBottom>
                        Instructions:
                    </Typography>
                    <List>
                        {recipe.instructions.map((instruction, index) => (
                            <ListItem key={index}>
                                <ListItemText 
                                    primary={`${index + 1}. ${instruction}`}
                                    sx={{ '& .MuiListItemText-primary': { color: 'text.primary' } }}
                                />
                            </ListItem>
                        ))}
                    </List>

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Nutritional Information (per serving):
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            gap: 3,
                            flexWrap: 'wrap',
                            background: 'rgba(0, 188, 212, 0.1)',
                            p: 2,
                            borderRadius: 1
                        }}>
                            <Typography>Calories: {recipe.nutritionalInfo.calories}</Typography>
                            <Typography>Protein: {recipe.nutritionalInfo.protein}g</Typography>
                            <Typography>Carbs: {recipe.nutritionalInfo.carbohydrates}g</Typography>
                            <Typography>Fat: {recipe.nutritionalInfo.fat}g</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScaleIcon /> Adjust Servings
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            background: 'rgba(0, 188, 212, 0.1)',
                            padding: 2,
                            borderRadius: 2
                        }}>
                            <Button 
                                variant="contained" 
                                onClick={() => handleServingsChange(currentServings - 1)}
                                disabled={currentServings <= 1}
                                sx={{
                                    minWidth: '40px',
                                    background: 'rgba(0, 188, 212, 0.5)',
                                    '&:hover': {
                                        background: 'rgba(0, 188, 212, 0.7)'
                                    }
                                }}
                            >
                                -
                            </Button>
                            <Typography sx={{ minWidth: '100px', textAlign: 'center' }}>
                                {currentServings} servings
                            </Typography>
                            <Button 
                                variant="contained"
                                onClick={() => handleServingsChange(currentServings + 1)}
                                sx={{
                                    minWidth: '40px',
                                    background: 'rgba(0, 188, 212, 0.5)',
                                    '&:hover': {
                                        background: 'rgba(0, 188, 212, 0.7)'
                                    }
                                }}
                            >
                                +
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ 
                    gap: 2, 
                    p: 2,
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <Button 
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                        variant="outlined"
                        sx={{ 
                            minWidth: '150px',
                            borderColor: 'rgba(0, 188, 212, 0.5)',
                            color: 'primary.main',
                            background: 'rgba(0, 188, 212, 0.05)',
                            '&:hover': {
                                borderColor: 'primary.main',
                                background: 'rgba(0, 188, 212, 0.1)'
                            }
                        }}
                    >
                        Print Recipe
                    </Button>
                    <Button 
                        startIcon={<ShareIcon />}
                        onClick={handleShare}
                        variant="outlined"
                        sx={{ 
                            minWidth: '150px',
                            borderColor: 'rgba(0, 188, 212, 0.5)',
                            color: 'primary.main',
                            background: 'rgba(0, 188, 212, 0.05)',
                            '&:hover': {
                                borderColor: 'primary.main',
                                background: 'rgba(0, 188, 212, 0.1)'
                            }
                        }}
                    >
                        Share
                    </Button>
                    <Button 
                        onClick={() => setDetailsOpen(false)}
                        variant="outlined"
                        startIcon={<CloseIcon />}
                        sx={{ 
                            minWidth: '150px',
                            borderColor: 'rgba(0, 188, 212, 0.5)',
                            color: 'primary.main',
                            background: 'rgba(0, 188, 212, 0.05)',
                            '&:hover': {
                                borderColor: 'primary.main',
                                background: 'rgba(0, 188, 212, 0.1)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RecipeCard; 