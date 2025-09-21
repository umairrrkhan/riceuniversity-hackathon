// Simple test script to verify Gemini API connection
async function testGeminiAPI() {
    try {
        console.log("Testing Gemini API connection...");
        
        // Import configuration
        const apiKey = 'AIzaSyCErflHqnsJ8WyYAMr2uS5CE7fSPOD6hA8';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
        
        // Simple test prompt
        const requestBody = {
            contents: [{
                parts: [
                    {
                        text: "In one sentence, explain what you can do with food image analysis."
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 100
            }
        };
        
        // Send request to Google Gemini API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }
        
        const data = await response.json();
        console.log("API Test Successful!");
        console.log("Response:", JSON.stringify(data, null, 2));
        
        // Extract and display the response text
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const responseText = data.candidates[0].content.parts[0].text;
            console.log("Generated Text:", responseText);
        }
        
        return true;
    } catch (error) {
        console.error("API Test Failed:", error);
        return false;
    }
}

// Run the test
testGeminiAPI().then(success => {
    if (success) {
        console.log("Gemini API is properly configured and working!");
    } else {
        console.log("There was an issue with the Gemini API connection.");
    }
});