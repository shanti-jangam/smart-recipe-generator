export const DEFAULT_FOOD_IMAGES = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
    'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0'
];

export const getRandomFoodImage = () => {
    return DEFAULT_FOOD_IMAGES[Math.floor(Math.random() * DEFAULT_FOOD_IMAGES.length)];
}; 