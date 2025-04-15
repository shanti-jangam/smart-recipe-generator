import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { motion, LazyMotion, domAnimation } from 'framer-motion';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import BookmarkIcon from '@mui/icons-material/Bookmark';

const Navbar = () => {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <LazyMotion features={domAnimation}>
            <AppBar 
                position="sticky" 
                sx={{
                    background: scrolled 
                        ? 'rgba(18, 18, 18, 0.9)'
                        : 'transparent',
                    backdropFilter: scrolled ? 'blur(10px)' : 'none',
                    boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.1)' : 'none',
                    transition: 'all 0.3s ease-in-out'
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Typography 
                                variant="h6" 
                                component={Link} 
                                to="/" 
                                sx={{
                                    textDecoration: 'none',
                                    color: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    fontWeight: 600,
                                    letterSpacing: 1
                                }}
                            >
                                <RestaurantIcon />
                                Recipe Generator
                            </Typography>
                        </motion.div>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {[
                                { path: '/', label: 'Generate Recipe', icon: <RestaurantIcon /> },
                                { path: '/recipes', label: 'Saved Recipes', icon: <BookmarkIcon /> }
                            ].map((item) => (
                                <motion.div
                                    key={item.path}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        component={Link}
                                        to={item.path}
                                        color={location.pathname === item.path ? "primary" : "inherit"}
                                        sx={{
                                            borderRadius: 2,
                                            px: 2,
                                            py: 1,
                                            backgroundColor: location.pathname === item.path 
                                                ? 'rgba(0, 188, 212, 0.1)'
                                                : 'transparent',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 188, 212, 0.2)'
                                            }
                                        }}
                                        startIcon={item.icon}
                                    >
                                        {item.label}
                                    </Button>
                                </motion.div>
                            ))}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </LazyMotion>
    );
};

export default Navbar;
