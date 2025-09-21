// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get analysis data from localStorage
    const analysisData = localStorage.getItem('foodAnalysisData');
    
    if (analysisData) {
        const data = JSON.parse(analysisData);
        displayResults(data);
    } else {
        // If no data, redirect to home
        window.location.href = 'index.html';
    }
    
    // Add PDF export functionality
    const exportPdfButton = document.getElementById('export-pdf');
    if (exportPdfButton) {
        exportPdfButton.addEventListener('click', exportToPdf);
    }
    
    // Add entrance animations to results section elements
    const resultsElements = document.querySelectorAll('.metric-card, .chart-container, .key-insights-card, #health-compatibility, #user-health-info');
    resultsElements.forEach((element, index) => {
        // Add a staggered delay for each element
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 200 * index);
    });
    
    // Animate the hero section elements
    const heroElements = document.querySelectorAll('.animate-fade-in-up');
    heroElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 300 * index);
    });
    
    // Function to display results
    function displayResults(data) {
        // Update summary text
        document.getElementById('summary-text').textContent = data.summary || 'Analysis completed';
        
        // Update user health information
        const userHealthInfoDiv = document.getElementById('user-health-info');
        const diseasesValue = document.getElementById('diseases-value');
        const allergiesValue = document.getElementById('allergies-value');
        
        if (data.diseases || data.allergies) {
            userHealthInfoDiv.classList.remove('hidden');
            
            if (data.diseases) {
                diseasesValue.textContent = data.diseases;
            } else {
                diseasesValue.textContent = 'None provided';
            }
            
            if (data.allergies) {
                allergiesValue.textContent = data.allergies;
            } else {
                allergiesValue.textContent = 'None provided';
            }
        }
        
        // Update health compatibility
        if (data.healthCompatibility) {
            const healthDiv = document.getElementById('health-compatibility');
            const healthContentDiv = document.getElementById('health-compatibility-content');
            healthDiv.classList.remove('hidden');
            
            // Remove previous classes
            healthContentDiv.classList.remove('health-compatibility-safe', 'health-compatibility-risk');
            
            // Add appropriate classes based on compatibility
            if (data.healthCompatibility.includes('Caution') || data.healthCompatibility.includes('risk') || data.healthCompatibility.includes('Risk')) {
                healthContentDiv.classList.add('health-compatibility-risk');
            } else {
                healthContentDiv.classList.add('health-compatibility-safe');
            }
            
            document.getElementById('health-value').textContent = data.healthCompatibility;
        }
        
        // Update metric values with fallback to '-'
        document.getElementById('calories-value').textContent = data.calories || '-';
        document.getElementById('protein-value').textContent = data.protein || '-';
        document.getElementById('carbs-value').textContent = data.carbs || '-';
        document.getElementById('fat-value').textContent = data.fat || '-';
        
        // Update additional nutrients with fallback to '-'
        document.getElementById('fiber-value').textContent = data.fiber || '-';
        document.getElementById('sugar-value').textContent = data.sugar || '-';
        document.getElementById('sodium-value').textContent = data.sodium || '-';
        
        // Update key nutrients if available
        if (data.keyNutrients && data.keyNutrients.length > 0) {
            const keyNutrientsContainer = document.getElementById('key-nutrients-container');
            keyNutrientsContainer.innerHTML = data.keyNutrients.map(nutrient => 
                `<span class="bg-gradient-to-r from-blue-100 to-teal-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">${nutrient}</span>`
            ).join('');
        }
        
        // Create charts
        createCharts(data);
        
        // Display health benefits and risks if available
        if ((data.healthBenefits && data.healthBenefits.length > 0) || (data.healthRisks && data.healthRisks.length > 0)) {
            const healthInsightsSection = document.getElementById('health-insights-section');
            healthInsightsSection.classList.remove('hidden');
            
            // Update health benefits
            if (data.healthBenefits && data.healthBenefits.length > 0) {
                const benefitsContainer = document.getElementById('health-benefits-container');
                benefitsContainer.innerHTML = data.healthBenefits.map(benefit => 
                    `<div class="benefit-item p-4 rounded-lg border border-green-100">
                        <p class="text-green-800">${benefit}</p>
                    </div>`
                ).join('');
            }
            
            // Update health risks
            if (data.healthRisks && data.healthRisks.length > 0) {
                const risksContainer = document.getElementById('health-risks-container');
                risksContainer.innerHTML = data.healthRisks.map(risk => 
                    `<div class="risk-item p-4 rounded-lg border border-red-100">
                        <p class="text-red-800">${risk}</p>
                    </div>`
                ).join('');
            }
        }
    }
    
    // Function to create charts
    function createCharts(data) {
        // Pie chart for nutritional breakdown
        const pieCtx = document.getElementById('nutritionChart').getContext('2d');
        new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: ['Protein', 'Carbs', 'Fat'],
                datasets: [{
                    data: [
                        parseFloat(data.protein) || 0,
                        parseFloat(data.carbs) || 0,
                        parseFloat(data.fat) || 0
                    ],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(255, 99, 132, 0.8)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Macronutrient Distribution',
                        font: {
                            size: 16
                        }
                    }
                }
            }
        });
        
        // Bar chart for nutritional values
        const barCtx = document.getElementById('valuesChart').getContext('2d');
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
                datasets: [{
                    label: 'Nutritional Values',
                    data: [
                        parseFloat(data.calories) || 0,
                        parseFloat(data.protein) || 0,
                        parseFloat(data.carbs) || 0,
                        parseFloat(data.fat) || 0
                    ],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(255, 99, 132, 0.8)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Nutritional Values',
                        font: {
                            size: 16
                        }
                    }
                }
            }
        });
    }
    
    // PDF Export Function
    function exportToPdf() {
        // Get jsPDF from the global window object
        const { jsPDF } = window.jspdf;
        
        // Create a new PDF document
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Set document properties
        doc.setProperties({
            title: 'Food Analysis Report - All Possibilities'
        });
        
        // Add title
        doc.setFontSize(22);
        doc.setTextColor(54, 72, 228); // Blue color
        doc.setFont(undefined, 'bold');
        doc.text('Food Analysis Report', 105, 20, null, null, 'center');
        
        // Add subtitle
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        doc.text('Generated by All Possibilities', 105, 30, null, null, 'center');
        
        // Add date
        const date = new Date().toLocaleDateString();
        doc.setFontSize(12);
        doc.text(`Date: ${date}`, 105, 40, null, null, 'center');
        
        // Add food image if available
        const imageData = localStorage.getItem('foodImage');
        let yOffset = 50;
        
        if (imageData) {
            try {
                // Add image to PDF (position: x, y, width, height)
                doc.addImage(imageData, 'JPEG', 20, yOffset, 60, 60);
                yOffset += 70; // Adjust vertical position for next content
            } catch (error) {
                console.error('Error adding image to PDF:', error);
            }
        }
        
        // Add user health information if available
        const diseases = document.getElementById('diseases-value').textContent;
        const allergies = document.getElementById('allergies-value').textContent;
        
        if (diseases !== 'None provided' || allergies !== 'None provided') {
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(54, 72, 228);
            doc.text('Your Health Profile', 20, yOffset);
            
            yOffset += 10;
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            
            if (diseases !== 'None provided') {
                doc.setFont(undefined, 'bold');
                doc.text('Health Conditions:', 20, yOffset);
                doc.setFont(undefined, 'normal');
                const diseasesLines = doc.splitTextToSize(diseases, 170);
                doc.text(diseasesLines, 25, yOffset + 5);
                yOffset += 5 + (diseasesLines.length * 7);
            }
            
            if (allergies !== 'None provided') {
                doc.setFont(undefined, 'bold');
                doc.text('Food Allergies:', 20, yOffset);
                doc.setFont(undefined, 'normal');
                const allergiesLines = doc.splitTextToSize(allergies, 170);
                doc.text(allergiesLines, 25, yOffset + 5);
                yOffset += 5 + (allergiesLines.length * 7);
            }
            
            yOffset += 10;
        }
        
        // Add health compatibility
        const healthCompatibility = document.getElementById('health-value').textContent;
        if (healthCompatibility) {
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(54, 72, 228);
            doc.text('Health Compatibility', 20, yOffset);
            
            yOffset += 10;
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            const healthLines = doc.splitTextToSize(healthCompatibility, 170);
            doc.text(healthLines, 20, yOffset);
            yOffset += 5 + (healthLines.length * 7);
            yOffset += 10;
        }
        
        // Add nutritional information
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(54, 72, 228);
        doc.text('Nutritional Information', 20, yOffset);
        
        yOffset += 10;
        
        // Add key metrics
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        
        const calories = document.getElementById('calories-value').textContent;
        const protein = document.getElementById('protein-value').textContent;
        const carbs = document.getElementById('carbs-value').textContent;
        const fat = document.getElementById('fat-value').textContent;
        
        doc.text(`Calories: ${calories}`, 20, yOffset);
        doc.text(`Protein: ${protein}`, 80, yOffset);
        doc.text(`Carbs: ${carbs}`, 140, yOffset);
        
        yOffset += 7;
        
        doc.text(`Fat: ${fat}`, 20, yOffset);
        
        // Add additional nutrients
        const fiber = document.getElementById('fiber-value').textContent;
        const sugar = document.getElementById('sugar-value').textContent;
        const sodium = document.getElementById('sodium-value').textContent;
        
        yOffset += 10;
        doc.text(`Fiber: ${fiber}`, 20, yOffset);
        doc.text(`Sugar: ${sugar}`, 80, yOffset);
        doc.text(`Sodium: ${sodium}`, 140, yOffset);
        
        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('Generated by All Possibilities - Health & Nutrition Analysis', 105, 290, null, null, 'center');
        }
        
        // Save the PDF
        doc.save('food-analysis-report.pdf');
    }
});