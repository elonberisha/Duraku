/**
 * About Section API Integration
 * Loads about section data from API and updates the page
 */

// Use window.API_BASE to avoid conflicts when multiple scripts are loaded
if (typeof window.API_BASE === 'undefined') {
    window.API_BASE = 'api';
}
// Use window.API_BASE directly - no local const to avoid conflicts

let aboutData = null;

/**
 * Load about section data from API
 */
async function loadAboutData() {
    console.log('loadAboutData() called, API_BASE:', window.API_BASE || 'api');
    try {
        const apiUrl = `${window.API_BASE || 'api'}/about.php?action=get`;
        console.log('Fetching about data from:', apiUrl);
        const response = await fetch(apiUrl);
        
        console.log('About API response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('About API response text:', text);
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('Failed to parse about JSON:', parseError);
            throw new Error('Invalid JSON response from server');
        }
        
        if (data.success && data.data) {
            aboutData = data.data;
            console.log('About data loaded:', aboutData);
            updateAboutSection();
        } else {
            console.error('API returned error:', data.error);
        }
    } catch (error) {
        console.error('Failed to load about data:', error);
        // Use default values if API fails
    }
}

/**
 * Update about section with loaded data
 */
function updateAboutSection() {
    if (!aboutData) {
        console.warn('updateAboutSection() called but aboutData is null');
        return;
    }
    
    console.log('updateAboutSection() called, aboutData:', aboutData);
    
    const currentLang = localStorage.getItem('language') || 'sq';
    const langSuffix = currentLang === 'sq' ? '_sq' : '_de';
    
    // Update about preview image (index.html)
    const aboutPreviewImage = document.querySelector('.about-preview-image');
    console.log('About preview image element:', aboutPreviewImage);
    if (aboutPreviewImage) {
        if (aboutData.image) {
            // Fix path separators (convert backslashes to forward slashes)
            const imagePath = aboutData.image.replace(/\\/g, '/');
            aboutPreviewImage.innerHTML = `<img src="${imagePath}" alt="About Us" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">`;
            console.log('About image updated:', imagePath);
        } else {
            // Clear image if no image is set
            aboutPreviewImage.innerHTML = '';
            console.log('No about image to display (image field is empty)');
        }
    } else {
        console.warn('About preview image element (.about-preview-image) not found');
    }
    
    // Update description - update all description elements
    const aboutDescriptions = document.querySelectorAll('.about-description, .about-preview-description');
    aboutDescriptions.forEach(desc => {
        if (aboutData[`description${langSuffix}`]) {
            desc.textContent = aboutData[`description${langSuffix}`];
        }
    });
    
    // Update statistics numbers - update all stat numbers
    // Find stat cards and update them in order
    const statCards = document.querySelectorAll('.stat-card-sharp, .stat-mini');
    statCards.forEach((card, index) => {
        const statNumber = card.querySelector('.stat-number, .stat-number-mini');
        const statLabel = card.querySelector('.stat-label, .stat-label-mini');
        
        if (statNumber) {
            if (index === 0 && aboutData.experience_number) {
                statNumber.textContent = aboutData.experience_number;
            } else if (index === 1 && aboutData.projects_number) {
                statNumber.textContent = aboutData.projects_number;
            } else if (index === 2 && aboutData.clients_number) {
                statNumber.textContent = aboutData.clients_number;
            }
        }
        
        if (statLabel) {
            if (index === 0 && aboutData[`experience${langSuffix}`]) {
                statLabel.textContent = aboutData[`experience${langSuffix}`];
            } else if (index === 1 && aboutData[`projects${langSuffix}`]) {
                statLabel.textContent = aboutData[`projects${langSuffix}`];
            } else if (index === 2 && aboutData[`clients${langSuffix}`]) {
                statLabel.textContent = aboutData[`clients${langSuffix}`];
            }
        }
    });
    
    // Update team section (about.html)
    const teamTitle = document.querySelector('.team-section .section-title');
    if (teamTitle && aboutData[`team_title${langSuffix}`]) {
        teamTitle.textContent = aboutData[`team_title${langSuffix}`];
    }
    
    const teamDescription = document.querySelector('.team-description');
    if (teamDescription && aboutData[`team_description${langSuffix}`]) {
        teamDescription.textContent = aboutData[`team_description${langSuffix}`];
    }
    
    // Update team image (about.html)
    const teamImageContainer = document.getElementById('teamImageContainer');
    const teamImage = document.getElementById('teamImage');
    if (teamImageContainer && teamImage) {
        if (aboutData.team_image) {
            // Fix path separators (convert backslashes to forward slashes)
            const imagePath = aboutData.team_image.replace(/\\/g, '/');
            teamImage.src = imagePath;
            teamImageContainer.style.display = 'block';
            console.log('Team image updated:', imagePath);
        } else {
            teamImageContainer.style.display = 'none';
            console.log('No team image to display');
        }
    }
}

/**
 * Re-update about section when language changes
 */
function updateAboutOnLanguageChange() {
    if (aboutData) {
        updateAboutSection();
    }
}

// Load about data on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded - Loading about data...');
        loadAboutData();
        
        // Listen for language changes
        if (typeof setLanguage === 'function') {
            const originalSetLanguage = setLanguage;
            window.setLanguage = function(lang) {
                originalSetLanguage(lang);
                setTimeout(() => {
                    updateAboutOnLanguageChange();
                }, 150);
            };
        }
        
        // Also listen for storage events (language changes from other tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'language') {
                setTimeout(() => {
                    updateAboutOnLanguageChange();
                }, 150);
            }
        });
    });
} else {
    // DOM already loaded
    console.log('DOM already loaded - Loading about data...');
    loadAboutData();
    
    // Listen for language changes
    if (typeof setLanguage === 'function') {
        const originalSetLanguage = setLanguage;
        window.setLanguage = function(lang) {
            originalSetLanguage(lang);
            setTimeout(() => {
                updateAboutOnLanguageChange();
            }, 150);
        };
    }
    
    // Also listen for storage events (language changes from other tabs)
    window.addEventListener('storage', (e) => {
        if (e.key === 'language') {
            setTimeout(() => {
                updateAboutOnLanguageChange();
            }, 150);
        }
    });
}

// Export for use in other scripts
window.loadAboutData = loadAboutData;
window.updateAboutOnLanguageChange = updateAboutOnLanguageChange;

