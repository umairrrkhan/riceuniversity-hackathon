// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const healthForm = document.getElementById('health-form');
    const foodImageInput = document.getElementById('food-image');
    const imagePreview = document.getElementById('image-preview');
    const analyzeButton = document.getElementById('analyze-button');
    const agentLoading = document.getElementById('agent-loading');
    const beginButton = document.getElementById('begin-button');
    
    // Trigger animation for the main section
    const mainSection = document.querySelector('.section-animate');
    if (mainSection) {
        setTimeout(() => {
            mainSection.classList.add('animate');
        }, 100);
    }
    
    // Add entrance animations to hero section elements
    const heroElements = document.querySelectorAll('.animate-fade-in-up');
    heroElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 300 * index);
    });
    
    // Add scroll functionality to begin button
    if (beginButton) {
        beginButton.addEventListener('click', function(e) {
            e.preventDefault();
            const analysisSection = document.getElementById('analysis');
            if (analysisSection) {
                analysisSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
    // Handle health form submission
    healthForm.addEventListener('submit', function(e) {
        // Prevent default form submission
        e.preventDefault();
        // Form submission is handled by the analyze button
    });
    
    // Function to validate user inputs
    function validateUserInputs(diseaseInfo, allergiesInfo) {
        // Check for potentially inappropriate content
        const inappropriateKeywords = [
            'stupid', 'dumb', 'idiot', 'fool', 'hate', 'kill', 'die', 'death',
            'weapon', 'bomb', 'drugs', 'alcohol', 'porn', 'nude', 'sex'
        ];
        
        const combinedInfo = (diseaseInfo + ' ' + allergiesInfo).toLowerCase();
        
        for (const keyword of inappropriateKeywords) {
            if (combinedInfo.includes(keyword)) {
                return {
                    valid: false,
                    message: 'Please provide relevant health information only.'
                };
            }
        }
        
        // If inputs are too short or empty, that's okay - they're optional
        return { valid: true };
    }
    
    // Handle food image upload
    foodImageInput.addEventListener('change', function(e) {
        // Check if a file was selected
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            // Check if the file is an image
            if (!file.type.match('image.*')) {
                showNotification('Please select an image file (JPEG, PNG, etc.)', 'error');
                return;
            }
            
            // Enable the analyze button
            analyzeButton.disabled = false;
            
            // Create a preview of the image
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Clear previous content
                imagePreview.innerHTML = '';
                
                // Create image element
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Food preview';
                img.classList.add('rounded-xl', 'max-w-full', 'max-h-80', 'object-contain');
                
                // Add image to preview
                imagePreview.appendChild(img);
            };
            
            // Read the file as a data URL
            reader.readAsDataURL(file);
        }
    });
    
    // Handle image paste functionality
    document.addEventListener('paste', function(e) {
        // Get the pasted data
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        
        // Loop through items to find image
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                // Get the image file
                const file = item.getAsFile();
                
                // Set the file to the file input
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                foodImageInput.files = dataTransfer.files;
                
                // Trigger the change event
                const event = new Event('change', { bubbles: true });
                foodImageInput.dispatchEvent(event);
                
                // Show notification
                showNotification('Image pasted successfully!', 'success');
                break;
            }
        }
    });
    
    // Handle analyze button click
    analyzeButton.addEventListener('click', function() {
        // Show spinner
        const spinner = document.getElementById('analyze-spinner');
        if (spinner) {
            spinner.classList.remove('hidden');
        }
        
        // Change button text
        this.innerHTML = 'Analyzing...';
        
        // Check if API key is set
        if (typeof GOOGLE_API_KEY === 'undefined' || GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY_HERE') {
            showNotification('Please set your Google API key in config.js', 'error');
            resetAnalyzeButton();
            return;
        }
        
        // Get the image data
        const fileInput = document.getElementById('food-image');
        if (!fileInput.files || !fileInput.files[0]) {
            showNotification('Please select a food image first.', 'error');
            resetAnalyzeButton();
            return;
        }
        
        // Get health information
        const diseaseInfo = document.getElementById('disease').value || '';
        const allergiesInfo = document.getElementById('allergies').value || '';
        
        // Validate user inputs
        const validation = validateUserInputs(diseaseInfo, allergiesInfo);
        if (!validation.valid) {
            showNotification(validation.message, 'error');
            resetAnalyzeButton();
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const imageData = e.target.result;
            const healthInfo = {
                diseases: diseaseInfo,
                allergies: allergiesInfo
            };
            
            // Show agent loading indicators
            agentLoading.classList.remove('hidden');
            
            // Reset circles
            resetCircles();
            
            // Start enhanced pipeline loading
            startEnhancedPipelineLoading();
            
            // Save image data to localStorage for PDF generation
            localStorage.setItem('foodImage', imageData);
            
            // Analyze food with Gemini API
            analyzeFoodWithGeminiAPI(imageData, healthInfo);
        };
        
        reader.readAsDataURL(file);
    });
    
    // Function to reset the analyze button
    function resetAnalyzeButton() {
        const spinner = document.getElementById('analyze-spinner');
        if (spinner) {
            spinner.classList.add('hidden');
        }
        
        const analyzeButton = document.getElementById('analyze-button');
        if (analyzeButton) {
            analyzeButton.innerHTML = 'Analyze Food' + 
                '<span id="analyze-spinner" class="hidden ml-2">' +
                '<svg class="animate-spin h-5 w-5 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">' +
                '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
                '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>' +
                '</svg>' +
                '</span>';
        }
    }
    
    // Function to analyze food image using Google Gemini API
    async function analyzeFoodWithGeminiAPI(imageData, healthInfo) {
        try {
            // Show loading state
            showNotification('Analyzing food image with Google Gemini API...', 'success');
            
            // Prepare health information text
            let healthInfoText = '';
            if (healthInfo.diseases || healthInfo.allergies) {
                healthInfoText = 'The user has the following health conditions:\n';
                if (healthInfo.diseases) {
                    healthInfoText += `- Diseases: ${healthInfo.diseases}\n`;
                }
                if (healthInfo.allergies) {
                    healthInfoText += `- Allergies: ${healthInfo.allergies}\n`;
                }
            } else {
                healthInfoText = 'The user has no specific health conditions.';
            }
            
            // Enhanced prompt with better instructions and abuse prevention
            const requestBody = {
                contents: [{
                    parts: [
                        {
                            text: `You are an expert nutritionist and food safety analyst. Your task is to analyze food images and provide detailed nutritional information and health recommendations.
                        
                        INSTRUCTIONS:
                        1. First, determine if the image actually contains food. If it doesn't, respond with a JSON object containing ONLY: {"error": "non_food_image", "message": "The uploaded image does not appear to contain food. Please upload a clear image of food."}
                        2. If the image contains food, analyze it and respond ONLY with a JSON object containing the following keys:
                        
                        RESPONSE FORMAT:
                        {
                          "foodItem": "Name of the food item",
                          "summary": "A brief 1-2 sentence summary of the analysis",
                          "calories": "Calories content (e.g., '250 kcal')",
                          "protein": "Protein content (e.g., '15g')",
                          "carbs": "Carbohydrate content (e.g., '30g')",
                          "fat": "Fat content (e.g., '10g')",
                          "fiber": "Fiber content (e.g., '5g')",
                          "sugar": "Sugar content (e.g., '8g')",
                          "sodium": "Sodium content (e.g., '450mg')",
                          "healthCompatibility": "Personalized health recommendation based on the provided conditions",
                          "confidence": 0.95,
                          "keyNutrients": ["Nutrient 1", "Nutrient 2", "Nutrient 3"],
                          "healthBenefits": ["Benefit 1", "Benefit 2"],
                          "healthRisks": ["Risk 1", "Risk 2"]
                        }
                        
                        USER HEALTH INFORMATION:
                        ${healthInfoText}
                        
                        IMPORTANT GUIDELINES:
                        - If the user provides non-health related information, acknowledge it but focus on actual health conditions
                        - If the user provides irrelevant or inappropriate content, respond with health-focused analysis anyway
                        - Always provide constructive health advice
                        - NEVER respond with harmful or misleading information
                        - If you cannot identify the food, respond with: {"error": "unidentifiable_food", "message": "Could not identify the food in the image. Please try another image."}
                        
                        Analyze the food image and provide detailed nutritional information.`
                        },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: imageData.split(',')[1] // Remove data:image/jpeg;base64, part
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.4, // Lower temperature for more consistent responses
                    maxOutputTokens: 1024,
                    response_mime_type: "application/json"
                }
            };
            
            // Send request to Google Gemini API
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
            }
            
            const apiData = await response.json();
            
            // Extract the JSON response from the Gemini API
            let analysisData;
            try {
                const responseText = apiData.candidates[0].content.parts[0].text;
                analysisData = JSON.parse(responseText);
                
                // Check if the AI detected a non-food image
                if (analysisData.error) {
                    throw new Error(analysisData.message || 'The uploaded image is not recognized as food.');
                }
            } catch (parseError) {
                // If JSON parsing fails, create a fallback response
                console.error('Error parsing Gemini API response:', parseError);
                analysisData = createFallbackAnalysisData(apiData, healthInfo);
                
                // Check if it's a non-food image error
                if (analysisData.error) {
                    throw new Error(analysisData.message);
                }
            }
            
            // Validate the analysis data
            if (!analysisData || (!analysisData.foodItem && !analysisData.error)) {
                throw new Error('Invalid analysis data received from Gemini API');
            }
            
            // Add health information to analysis data
            analysisData.diseases = healthInfo.diseases;
            analysisData.allergies = healthInfo.allergies;
            
            // Save to localStorage for the results page
            localStorage.setItem('foodAnalysisData', JSON.stringify(analysisData));
            
            // Reset analyze button
            resetAnalyzeButton();
            
            // Redirect to results page
            window.location.href = 'results.html';
        } catch (error) {
            console.error('Error analyzing food image:', error);
            showNotification(`Error analyzing food image: ${error.message}`, 'error');
            // Hide loading indicators
            agentLoading.classList.add('hidden');
            // Reset analyze button
            resetAnalyzeButton();
        }
    }
    
    // Function to create fallback analysis data when JSON parsing fails
    function createFallbackAnalysisData(apiData, healthInfo) {
        // Extract text response
        const responseText = apiData.candidates[0].content.parts[0].text;
        
        // Check if the response indicates a non-food image
        if (responseText && responseText.toLowerCase().includes("not food") || responseText.toLowerCase().includes("non-food")) {
            return {
                error: "non_food_image",
                message: "The uploaded image does not appear to contain food. Please upload a clear image of food."
            };
        }
        
        // Create a basic analysis data object
        return {
            foodItem: "Unknown food item",
            summary: "Analysis completed with limitations.",
            calories: "N/A",
            protein: "N/A",
            carbs: "N/A",
            fat: "N/A",
            fiber: "N/A",
            sugar: "N/A",
            sodium: "N/A",
            healthCompatibility: "Unable to determine health compatibility due to analysis limitations.",
            confidence: 0.5,
            keyNutrients: ["Unable to determine nutrients"],
            healthBenefits: ["Unable to determine benefits"],
            healthRisks: ["Unable to determine risks"],
            diseases: healthInfo.diseases,
            allergies: healthInfo.allergies
        };
    }
    
    // Function to reset circles
    function resetCircles() {
        // Reset Agent 1 circles
        for (let i = 1; i <= 9; i++) {
            const circle = document.getElementById(`agent1-circle${i}`);
            circle.classList.remove('bg-blue-500', 'circle-active', 'circle-completed');
            circle.classList.add('bg-gray-300');
            circle.style.animation = 'none';
        }
        
        // Reset Agent 2 circles
        for (let i = 1; i <= 9; i++) {
            const circle = document.getElementById(`agent2-circle${i}`);
            circle.classList.remove('bg-green-500', 'circle-active', 'circle-completed');
            circle.classList.add('bg-gray-300');
            circle.style.animation = 'none';
        }
    }
    
    // Function to start enhanced pipeline loading
    function startEnhancedPipelineLoading() {
        // Define the order for filling circles (spiral pattern from center)
        const fillOrder = [5, 2, 3, 6, 9, 8, 7, 4, 1];
        
        let agent1Index = 0;
        let agent2Index = 0;
        let agent1Complete = false;
        
        // Add subtle pulse animation to all circles initially
        for (let i = 1; i <= 9; i++) {
            const circle1 = document.getElementById(`agent1-circle${i}`);
            const circle2 = document.getElementById(`agent2-circle${i}`);
            circle1.style.animation = 'pulse 2s infinite ease-in-out';
            circle2.style.animation = 'pulse 2s infinite ease-in-out';
        }
        
        // Start Agent 1 loading with enhanced animations
        const agent1Interval = setInterval(() => {
            if (agent1Index < fillOrder.length) {
                // Remove pulse animation
                const circleIndex = fillOrder[agent1Index];
                const circle = document.getElementById(`agent1-circle${circleIndex}`);
                circle.style.animation = 'none';
                
                // Add active animation
                circle.classList.add('circle-active');
                
                // After a short delay, change color and add completed animation
                setTimeout(() => {
                    circle.classList.remove('bg-gray-300');
                    circle.classList.add('bg-blue-500');
                    circle.classList.add('circle-completed');
                }, 150);
                
                agent1Index++;
            } else {
                clearInterval(agent1Interval);
                agent1Complete = true;
                
                // Add pulse animation to Agent 2 circles to indicate it's starting
                for (let i = 1; i <= 9; i++) {
                    const circle = document.getElementById(`agent2-circle${i}`);
                    circle.style.animation = 'pulse 1s infinite ease-in-out';
                }
            }
        }, 250); // 250ms between each circle for Agent 1
        
        // Start Agent 2 loading with delay (pipeline effect)
        const agent2Interval = setInterval(() => {
            if (agent1Complete && agent2Index < fillOrder.length) {
                // Remove pulse animation
                const circleIndex = fillOrder[agent2Index];
                const circle = document.getElementById(`agent2-circle${circleIndex}`);
                circle.style.animation = 'none';
                
                // Add active animation
                circle.classList.add('circle-active');
                
                // After a short delay, change color and add completed animation
                setTimeout(() => {
                    circle.classList.remove('bg-gray-300');
                    circle.classList.add('bg-green-500');
                    circle.classList.add('circle-completed');
                }, 150);
                
                agent2Index++;
            } else if (agent1Complete && agent2Index >= fillOrder.length) {
                clearInterval(agent2Interval);
                // Both agents complete, prepare data and redirect to results page
                setTimeout(() => {
                    // Prepare analysis data
                    prepareAndRedirectToResults();
                }, 500);
            }
        }, 250); // 250ms between each circle for Agent 2
    }
    
    // Function to prepare data and redirect to results page
    function prepareAndRedirectToResults() {
        // Get health information
        const diseaseInfo = document.getElementById('disease').value || '';
        const allergiesInfo = document.getElementById('allergies').value || '';
        
        const healthInfo = {
            diseases: diseaseInfo,
            allergies: allergiesInfo
        };
        
        // Generate mock analysis data
        const analysisData = generateMockAnalysisData(healthInfo);
        
        // Add health information to analysis data
        analysisData.diseases = diseaseInfo;
        analysisData.allergies = allergiesInfo;
        
        // Save to localStorage for the results page
        localStorage.setItem('foodAnalysisData', JSON.stringify(analysisData));
        
        // Redirect to results page
        window.location.href = 'results.html';
    }
    
    // Function to generate mock analysis data
    function generateMockAnalysisData(healthInfo) {
        // Generate random nutritional values
        const calories = Math.floor(Math.random() * 500) + 100; // Between 100-600
        const protein = (Math.random() * 30 + 5).toFixed(1); // Between 5-35g
        const carbs = (Math.random() * 60 + 10).toFixed(1); // Between 10-70g
        const fat = (Math.random() * 25 + 3).toFixed(1); // Between 3-28g
        const fiber = (Math.random() * 10 + 2).toFixed(1); // Between 2-12g
        const sugar = (Math.random() * 20 + 1).toFixed(1); // Between 1-21g
        const sodium = Math.floor(Math.random() * 800) + 100; // Between 100-900mg
        
        // Generate safety analysis based on health conditions
        let healthCompatibility = "This food appears to be compatible with your health conditions.";
        
        const diseases = healthInfo.diseases ? healthInfo.diseases.toLowerCase() : '';
        const allergies = healthInfo.allergies ? healthInfo.allergies.toLowerCase() : '';
        
        // Check for inappropriate content and provide a generic response
        const inappropriateKeywords = [
            'stupid', 'dumb', 'idiot', 'fool', 'hate', 'kill', 'die', 'death',
            'weapon', 'bomb', 'drugs', 'alcohol', 'porn', 'nude', 'sex'
        ];
        
        let hasInappropriateContent = false;
        for (const keyword of inappropriateKeywords) {
            if (diseases.includes(keyword) || allergies.includes(keyword)) {
                hasInappropriateContent = true;
                break;
            }
        }
        
        if (hasInappropriateContent) {
            healthCompatibility = "We focus on providing health and nutrition advice. Please provide relevant health information for personalized recommendations.";
        } else if (diseases.includes('diabetes') && carbs > 40) {
            healthCompatibility = "Caution: This food is high in carbohydrates which may not be suitable for diabetics.";
        } else if (diseases.includes('hypertension') && sodium > 500) {
            healthCompatibility = "Caution: This food is high in sodium which may not be suitable for those with hypertension.";
        } else if (allergies.includes('allergy') && Math.random() > 0.7) {
            healthCompatibility = "Caution: This food may contain allergens. Please check the ingredients carefully.";
        }
        
        // Return analysis data object
        return {
            foodItem: "Sample Food Item",
            summary: "Your food has been successfully analyzed. See detailed results below.",
            calories: `${calories} kcal`,
            protein: `${protein}g`,
            carbs: `${carbs}g`,
            fat: `${fat}g`,
            fiber: `${fiber}g`,
            sugar: `${sugar}g`,
            sodium: `${sodium}mg`,
            healthCompatibility: healthCompatibility,
            confidence: 0.8,
            keyNutrients: ["Vitamin C", "Fiber", "Iron"],
            healthBenefits: ["Supports immune system", "Aids digestion"],
            healthRisks: ["May cause allergies in sensitive individuals"]
        };
    }
    
    // Function to show modern notifications
    function showNotification(message, type) {
        const notificationContainer = document.getElementById('notification-container');
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Set notification content based on type
        let icon, iconColor;
        if (type === 'success') {
            icon = 'M5 13l4 4L19 7';
            iconColor = 'text-green-600';
        } else {
            icon = 'M6 18L18 6M6 6l12 12';
            iconColor = 'text-red-600';
        }
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ${iconColor}" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="${icon}" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="notification-message">
                    ${message}
                </div>
                <button class="notification-close">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        `;
        
        // Add notification to container
        notificationContainer.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Add close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto dismiss after 5 seconds for success notifications
        if (type === 'success') {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        notification.remove();
                    }, 300);
                }
            }, 5000);
        }
    }
});