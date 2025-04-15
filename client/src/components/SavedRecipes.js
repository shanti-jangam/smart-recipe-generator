import React from 'react';
import { useRecipes } from '../context/RecipeContext';
import { Container, Grid, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import RecipeCard from './RecipeCard'; // We'll create this next

const SavedRecipes = () => {
    const { savedRecipes } = useRecipes();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                    textAlign: 'center',
                    mb: 4,
                    background: 'linear-gradient(45deg, #00bcd4 30%, #ff4081 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}
            >
                Your Saved Recipes
            </Typography>

            {savedRecipes.length === 0 ? (
                <Box 
                    sx={{ 
                        textAlign: 'center',
                        py: 8,
                        color: 'text.secondary'
                    }}
                >
                    <Typography variant="h6">
                        No saved recipes yet. Generate some recipes and save them!
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {savedRecipes.map((recipe, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <RecipeCard recipe={recipe} />
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default SavedRecipes; 