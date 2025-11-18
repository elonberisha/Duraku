/**
 * Hero Section API Integration
 * Loads hero section data from API and updates the page
 */

// Use window.API_BASE to avoid conflicts when multiple scripts are loaded
if (typeof window.API_BASE === 'undefined') {
    window.API_BASE = 'api';
}
// Use window.API_BASE directly - no local const to avoid conflicts

let heroData = null;

/**
 * Load hero section data from API
 */
async function loadHeroData() {
    try {
        const response = await fetch(`${window.API_BASE || 'api'}/hero.php?action=get`);
        const data = await response.json();
        
        if (data.success && data.data) {
            heroData = data.data;
            updateHeroSection();
        }
    } catch (error) {
        console.error('Failed to load hero data:', error);
        // Use default values if API fails
    }
}

/**
 * Update hero section with loaded data
 */
function updateHeroSection() {
    if (!heroData) return;
    
    const currentLang = localStorage.getItem('language') || 'de';
    const langSuffix = currentLang === 'sq' ? '_sq' : '_de';
    
    // Update background image
    const heroBackgroundImage = document.querySelector('.hero-background-image');
    if (heroBackgroundImage && heroData.background_image) {
        // Remove existing img if any
        const existingImg = heroBackgroundImage.querySelector('img');
        if (existingImg) {
            existingImg.remove();
        }
        
        // Add new image
        const img = document.createElement('img');
        img.src = heroData.background_image;
        img.alt = 'Hero Background';
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; object-position: center;';
        heroBackgroundImage.insertBefore(img, heroBackgroundImage.firstChild);
    }
    
    // Update title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && heroData[`title${langSuffix}`]) {
        heroTitle.textContent = heroData[`title${langSuffix}`];
    }
    
    // Update subtitle
    const heroSubtitle = document.querySelector('.hero-subtitle-red');
    if (heroSubtitle && heroData[`subtitle${langSuffix}`]) {
        heroSubtitle.textContent = heroData[`subtitle${langSuffix}`];
    }
    
    // Update tagline
    const heroTagline = document.querySelector('.hero-tagline');
    if (heroTagline && heroData[`tagline${langSuffix}`]) {
        heroTagline.textContent = heroData[`tagline${langSuffix}`];
    }
    
    // Update description
    const heroDescription = document.querySelector('.hero-description');
    if (heroDescription && heroData[`description${langSuffix}`]) {
        heroDescription.textContent = heroData[`description${langSuffix}`];
    }
    
    // Update CTA button
    const heroCta = document.querySelector('.hero .btn-primary');
    if (heroCta && heroData[`cta_text${langSuffix}`]) {
        heroCta.textContent = heroData[`cta_text${langSuffix}`];
    }
}

/**
 * Re-update hero section when language changes
 */
function updateHeroOnLanguageChange() {
    if (heroData) {
        updateHeroSection();
    }
}

// Load hero data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadHeroData();
    
    // Listen for language changes by overriding setLanguage if it exists
    if (typeof setLanguage === 'function') {
        const originalSetLanguage = setLanguage;
        window.setLanguage = function(lang) {
            originalSetLanguage(lang);
            setTimeout(() => {
                updateHeroOnLanguageChange();
            }, 150);
        };
    }
    
    // Also listen for storage events (language changes from other tabs)
    window.addEventListener('storage', (e) => {
        if (e.key === 'language') {
            setTimeout(() => {
                updateHeroOnLanguageChange();
            }, 150);
        }
    });
});

// Export for use in other scripts
window.loadHeroData = loadHeroData;
window.updateHeroOnLanguageChange = updateHeroOnLanguageChange;

