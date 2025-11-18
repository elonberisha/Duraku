/**
 * Services API Integration
 * Loads categories from API and displays them as services
 */

// Use window.API_BASE to avoid conflicts when multiple scripts are loaded
if (typeof window.API_BASE === 'undefined') {
    window.API_BASE = 'api';
}
// Use window.API_BASE directly - no local const to avoid conflicts

let categoriesData = [];

/**
 * Load categories from API
 */
async function loadServices() {
    // Try both possible IDs (servicesGrid for services.html, servicesGridPreview for index.html)
    const servicesGrid = document.getElementById('servicesGrid') || document.getElementById('servicesGridPreview');
    if (!servicesGrid) {
        return;
    }
    
    const apiUrl = `${window.API_BASE || 'api'}/categories.php?action=list`;
    
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('Failed to parse JSON:', parseError);
            throw new Error('Invalid JSON response from server');
        }
        
        if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
            categoriesData = data.data;
            renderServices();
        } else {
            console.error('API returned error or no data:', data);
            const currentLang = localStorage.getItem('language') || 'de';
            const noServicesMsg = currentLang === 'sq' 
                ? 'Nuk ka shërbime të disponueshme ende. Ju lutemi shtoni kategori përmes panelit të administratorit.'
                : 'No services available yet. Please add categories through the admin panel.';
            servicesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <p style="color: #a0a0a0; font-size: 1.1rem;">${noServicesMsg}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Failed to load services:', error);
        const currentLang = localStorage.getItem('language') || 'de';
        const errorMsg = currentLang === 'sq' 
            ? `Dështoi ngarkimi i shërbimeve: ${error.message}`
            : `Failed to load services: ${error.message}`;
        servicesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <p style="color: #a0a0a0; font-size: 1.1rem;">${errorMsg}</p>
            </div>
        `;
    }
}

/**
 * Render services from categories
 */
function renderServices() {
    // Try both possible IDs (servicesGrid for services.html, servicesGridPreview for index.html)
    const servicesGrid = document.getElementById('servicesGrid') || document.getElementById('servicesGridPreview');
    if (!servicesGrid) {
        return;
    }
    
    const currentLang = localStorage.getItem('language') || 'de';
    const langSuffix = currentLang === 'sq' ? '_sq' : '_de';
    
    // Clear existing content
    servicesGrid.innerHTML = '';
    
    if (!categoriesData || categoriesData.length === 0) {
        const currentLang = localStorage.getItem('language') || 'de';
        const noServicesMsg = currentLang === 'sq' 
            ? 'Nuk ka shërbime të disponueshme ende. Ju lutemi shtoni kategori përmes panelit të administratorit.'
            : 'No services available yet. Please add categories through the admin panel.';
        servicesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <p style="color: #a0a0a0; font-size: 1.1rem;">${noServicesMsg}</p>
            </div>
        `;
        return;
    }
    
    // Icons array for different services
    const icons = [
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
            <path d="M2 17L12 22L22 17"/>
            <path d="M2 12L12 17L22 12"/>
        </svg>`,
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="0"/>
            <path d="M3 9H21"/>
            <path d="M9 3V21"/>
        </svg>`,
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="4" width="20" height="16" rx="0"/>
            <path d="M2 10H22"/>
            <path d="M6 4V10"/>
            <path d="M18 4V10"/>
        </svg>`,
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
            <path d="M2 17L12 22L22 17"/>
            <path d="M2 12L12 17L22 12"/>
        </svg>`,
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6V12L16 14"/>
        </svg>`
    ];
    
    // Render each category as a service card
    categoriesData.forEach((category, index) => {
        const iconIndex = index % icons.length;
        const name = category[`name${langSuffix}`] || category.name_de || category.name_sq || 'Service';
        const description = category[`description${langSuffix}`] || category.description_de || category.description_sq || '';
        
        const serviceCard = document.createElement('div');
        // Use 'large' class only for services.html, not for index.html preview
        const isPreview = servicesGrid.id === 'servicesGridPreview';
        serviceCard.className = isPreview ? 'service-card-sharp' : 'service-card-sharp large';
        serviceCard.innerHTML = `
            <div class="service-icon-sharp">
                ${icons[iconIndex]}
            </div>
            <h3>${escapeHtml(name)}</h3>
            <p>${escapeHtml(description)}</p>
            ${isPreview ? `<a href="services.html" class="service-link">${langSuffix === '_sq' ? 'Mëso më shumë →' : 'Mehr erfahren →'}</a>` : ''}
        `;
        
        servicesGrid.appendChild(serviceCard);
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Update services when language changes
 */
function updateServicesOnLanguageChange() {
    if (categoriesData.length > 0) {
        renderServices();
    }
}

// Load services on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadServices();
        
        // Listen for language changes
        if (typeof setLanguage === 'function') {
            const originalSetLanguage = setLanguage;
            window.setLanguage = function(lang) {
                originalSetLanguage(lang);
                setTimeout(() => {
                    updateServicesOnLanguageChange();
                }, 150);
            };
        }
        
        // Also listen for storage events (language changes from other tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'language') {
                setTimeout(() => {
                    updateServicesOnLanguageChange();
                }, 150);
            }
        });
    });
} else {
    // DOM already loaded
    loadServices();
    
    // Listen for language changes
    if (typeof setLanguage === 'function') {
        const originalSetLanguage = setLanguage;
        window.setLanguage = function(lang) {
            originalSetLanguage(lang);
            setTimeout(() => {
                updateServicesOnLanguageChange();
            }, 150);
        };
    }
    
    // Also listen for storage events (language changes from other tabs)
    window.addEventListener('storage', (e) => {
        if (e.key === 'language') {
            setTimeout(() => {
                updateServicesOnLanguageChange();
            }, 150);
        }
    });
}

// Export for use in other scripts
window.loadServices = loadServices;
window.updateServicesOnLanguageChange = updateServicesOnLanguageChange;

