/* ============================================================
   Nutrilite — Gemini AI Integration
   Handles image processing, behavior analysis, and recommendations
   ============================================================ */
const GeminiAI = (() => {
  'use strict';

  // For localhost, we prompt the user for their API key and store it locally.
  // In a real deployed app, this would be handled by a secure backend proxy.
  function getApiKey() {
    // Note: In a production environment, this should ideally be protected by a backend.
    return '';
  }

  async function callGemini(promptText, imageBase64 = null) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('API Key is required for AI features.');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    let parts = [{ text: promptText }];
    
    if (imageBase64) {
      // Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const mimeType = imageBase64.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';
      
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data
        }
      });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: parts }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to connect to Gemini AI');
    }

    const data = await response.json();
    try {
      // Parse the JSON response returned by Gemini
      return JSON.parse(data.candidates[0].content.parts[0].text);
    } catch (e) {
      console.error('Failed to parse Gemini response as JSON', data.candidates[0].content.parts[0].text);
      throw new Error('Invalid response format from AI');
    }
  }

  // Feature 1: Image Processing (Food Detection)
  async function analyzeFoodImage(imageBase64) {
    const prompt = `Analyze this image of food. Identify the main components and estimate nutritional values.
    Respond ONLY with a JSON object in this exact format, no markdown or backticks:
    {
      "mealName": "Name of the meal",
      "components": ["Item 1", "Item 2"],
      "estimatedCalories": 500,
      "macros": {"protein": 20, "carbs": 50, "fat": 15},
      "fatScore": "High/Medium/Low"
    }`;
    return await callGemini(prompt, imageBase64);
  }

  // Feature 2: User Behavior Analysis
  async function analyzeBehavior(logsData) {
    const prompt = `Analyze this user's food logging behavior for the past week:
    ${JSON.stringify(logsData)}
    Identify any unhealthy habits, eating time patterns, and provide a single actionable insight.
    Respond ONLY with a JSON object in this exact format:
    {
      "trendDetected": "Short description of the trend (e.g., 'Late-night junk food trend detected.')",
      "analysis": "Detailed explanation",
      "actionableInsight": "One clear step to improve"
    }`;
    return await callGemini(prompt);
  }

  // Feature 3: Recommendation Engine
  async function getRecommendations(profile, pastMeals) {
    const prompt = `Act as an expert nutritionist. Based on the user's profile and recent meals, provide personalized recommendations.
    Profile: ${JSON.stringify(profile)}
    Recent Meals: ${JSON.stringify(pastMeals)}
    
    Respond ONLY with a JSON object in this exact format:
    {
      "healthyAlternatives": ["Alternative 1", "Alternative 2"],
      "mealSuggestions": ["Breakfast idea", "Lunch idea", "Dinner idea"],
      "habitReminder": "A quick reminder about their goals",
      "groceryRecommendations": ["Item 1", "Item 2", "Item 3"]
    }`;
    return await callGemini(prompt);
  }

  return {
    analyzeFoodImage,
    analyzeBehavior,
    getRecommendations
  };
})();
