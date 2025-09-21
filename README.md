# All Possibilities - Health & Nutrition AI

##  Problem Statement
In today's health-conscious world, individuals often struggle to make informed dietary choices, especially those with pre-existing health conditions or food allergies. The sheer volume of information, coupled with complex nutritional data and ingredient lists, can be overwhelming. This leads to uncertainty, potential health risks, and a lack of personalized guidance for safe and beneficial food consumption.

##  Solution
All Possibilities is an innovative web application that leverages the power of AI to provide personalized health and nutrition analysis. Users can input their health conditions and food allergies, then upload an image of any food item. Our intelligent AI agents analyze the food's nutritional content and cross-reference it with the user's health profile to determine its safety and suitability, offering clear, actionable recommendations.

##  Beneficiaries
This application is designed for:
*   **Individuals with chronic health conditions:** (e.g., diabetes, hypertension, heart disease) who need to carefully manage their diet.
*   **People with food allergies or intolerances:** (e.g., peanut allergy, lactose intolerance, gluten sensitivity) who require strict avoidance of certain ingredients.
*   **Health-conscious individuals:** who want to understand the nutritional impact of their food choices.
*   **Caregivers and dietitians:** who can use the tool to quickly assess food suitability for their patients or loved ones.

##  Technology Stack
*   **Frontend:** HTML, Tailwind CSS, DaisyUI, JavaScript
*   **Backend/AI:** Google Gemini API

##  Features
*   **Personalized Health Profile:** Users can input existing health conditions and food allergies.
*   **Food Image Analysis:** Upload an image of any food item for instant AI-powered nutritional breakdown.
*   **Safety Recommendations:** Receive clear indications of whether a food is safe, potentially harmful, or beneficial based on your profile.
*   **Intuitive User Interface:** A clean and responsive design for a seamless user experience.
*   **Real-time AI Processing:** Fast and efficient analysis using advanced AI models.

##  Installation and Usage
To set up and run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/umairrrkhan/riceuniversity-hackathon.git
    cd riceuniversity-hackathon
    ```

2.  **Obtain a Google Gemini API Key:**
    *   Go to the [Google AI Studio](https://aistudio.google.com/)
    *   Create a new API key.

3.  **Configure your API Key:**
    *   Open `config.js` in the project directory.
    *   Replace `YOUR_GOOGLE_API_KEY_HERE` with your actual Google Gemini API key:
        ```javascript
        const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY_HERE";
        ```

4.  **Open `index.html`:**
    Simply open the `index.html` file in your web browser to start using the application.

##  Future Enhancements
*   **User Authentication:** Implement user accounts to save health profiles and analysis history.
*   **Dietary Tracking:** Allow users to track their food intake over time and generate reports.
*   **Recipe Suggestions:** Provide personalized recipe recommendations based on health profiles and safe ingredients.
*   **Multi-language Support:** Expand accessibility by supporting multiple languages.
*   **Mobile Application:** Develop native mobile applications for iOS and Android.