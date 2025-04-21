<div align="center">

#  Smart Recipe Generator

An AI-powered kitchen companion that transforms random ingredients into delicious recipes! Combining my love for cooking and coding into something magical.

<img width="387" alt="Screenshot 2025-04-15 at 2 02 19 PM" src="https://github.com/user-attachments/assets/0aa6a50f-2545-4f25-b22c-d8216810021f" />


</div>

## The Story Behind This Project 

You know that feeling when you open your fridge, stare at random ingredients, and think "What can I possibly make with these?" That's exactly what inspired me to build this! I was tired of:
- Wasting food because I couldn't think of recipes
- Ordering takeout when I had perfectly good ingredients
- Following rigid recipes that didn't match what I had

So, I thought, "Why not let AI help us get creative in the kitchen?"

## The Cool AI Stuff 

The magic happens through Cohere's language model (LLM), and let me tell you, it's pretty amazing! Here's how it works:

### How the AI Brain Works:
1. **Input Processing**: When you list your ingredients, the AI model first understands what you have available. It's like having a chef look at your ingredients and think about all the possibilities.

2. **Recipe Generation**: The model then:
   - Analyzes ingredient combinations
   - Considers cooking techniques that work well together
   - Thinks about flavor profiles and complementary tastes
   - Generates step-by-step instructions

3. **Smart Adaptations**: The coolest part? It can:
   - Adjust recipes based on dietary restrictions (vegetarian, gluten-free, etc.)
   - Scale portions up or down intelligently
   - Suggest substitutions if you're missing something

## What I Built It With 

### Frontend:
- React with Material-UI 
- React Context for state management 

### Backend:
- Node.js & Express 
- MongoDB 
- Cohere's API 

## My Favorite Features 

I'm particularly proud of how the app:
- Generates creative recipes from literally any ingredients
- Adapts to your dietary needs
- Saves your favorite recipes
- Lets you track cooking progress
- Makes sharing recipes super easy

## Want to Try It Out? 

If you're interested in running this locally, here's what you'll need:

1. **Get These First**:
   - Node.js (v14 or newer)
   - MongoDB
   - A Cohere API key (you can get one from their website)

2. **Quick Setup**:
   ```bash
   # Clone it
   git clone https://github.com/yourusername/smart-recipe-generator.git
   cd smart-recipe-generator

   # Install everything
   cd server && npm install
   cd ../client && npm install
   ```

3. **Set Up Your Environment**:
   Create a `.env` file in the server folder with:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   COHERE_API_KEY=your_cohere_api_key
   ```

## What's Next? 

I've got some exciting plans for the future:
1. Adding AI-generated food images (DALL-E or Midjourney)
2. Implementing voice commands (for those messy-hands cooking moments!)
3. Building a community feature for sharing recipes
4. Adding meal planning tools
5. Improving nutritional analysis
6. Making it more personalized to your taste
