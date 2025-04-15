import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AnimatePresence } from 'framer-motion';
import { theme } from './theme';
import Navbar from './components/Navbar';
import RecipeGenerator from './components/RecipeGenerator';
import SavedRecipes from './components/SavedRecipes';
import { RecipeProvider } from './context/RecipeContext';

// Separate component for animated routes
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RecipeGenerator />} />
        <Route path="/recipes" element={<SavedRecipes />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <RecipeProvider>
        <CssBaseline />
        <Router>
          <div className="App">
            <Navbar />
            <AnimatedRoutes />
          </div>
        </Router>
      </RecipeProvider>
    </ThemeProvider>
  );
}

export default App;
