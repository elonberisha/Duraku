/**
 * Gallery API Integration
 * Fetches gallery items from PHP API and displays them dynamically
 */

const GALLERY_API = 'api/gallery.php';

// Initialize gallery from API
async function initGalleryFromAPI() {
    try {
        // Get current language
        const currentLang = localStorage.getItem('language') || 'de';
        
        // Load categories
        const categoriesResponse = await fetch(`${GALLERY_API}?action=categories`);
        const categoriesData = await categoriesResponse.json();
        
        if (categoriesData.success) {
            updateCategoryDropdown(categoriesData.data, currentLang);
        }
        
        // Load gallery items
        const response = await fetch(`${GALLERY_API}?action=list`);
        const data = await response.json();
        
        if (data.success) {
            renderGalleryFromAPI(data.data, currentLang);
        } else {
            console.error('Gallery API returned error:', data.error);
        }
    } catch (error) {
        console.error('Failed to load gallery from API:', error);
        // Fallback to static gallery if API fails
    }
}

// Store categories globally for use in filtering
let globalCategories = [];

// Update category dropdown
function updateCategoryDropdown(categories, lang) {
    const dropdown = document.getElementById('galleryCategory');
    if (!dropdown) return;
    
    // Store categories globally
    globalCategories = categories;
    
    // Clear dropdown
    dropdown.innerHTML = '';
    
    // Add "All Categories" option
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = lang === 'sq' ? 'Të Gjitha Kategoritë' : 'Alle Kategorien';
    allOption.setAttribute('data-i18n', 'gallery.allCategories');
    dropdown.appendChild(allOption);
    
    // Add categories from API
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = lang === 'sq' ? cat.name_sq : cat.name_de;
        option.setAttribute('data-category-id', cat.id);
        dropdown.appendChild(option);
    });
    
    // Setup filter event listener
    setupCategoryFilter();
}

// Store gallery items globally for filtering
let globalGalleryItems = [];

// Render gallery items from API
function renderGalleryFromAPI(items, lang, categoryId = 'all') {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) {
        return;
    }
    
    // Store items globally
    globalGalleryItems = items;
    
    // Clear existing items (remove static images and loading spinner)
    galleryGrid.innerHTML = '';
    
    // If no items, show message
    if (!items || items.length === 0) {
        galleryGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <p style="color: #a0a0a0; font-size: 1.1rem;">${lang === 'sq' ? 'Nuk ka artikuj në galeri ende. Ju lutemi shtoni artikuj përmes panelit të administratorit.' : 'Noch keine Galerie-Artikel verfügbar. Bitte fügen Sie Artikel über das Admin-Panel hinzu.'}</p>
            </div>
        `;
        return;
    }
    
    // Filter by category if needed
    let filteredItems = items;
    if (categoryId !== 'all') {
        filteredItems = items.filter(item => item.category_id == categoryId);
    }
    
    // Limit to first 4 items for preview on index page
    const previewItems = filteredItems.slice(0, 4);
    
    // If no items after filtering, show message
    if (previewItems.length === 0) {
        galleryGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <p style="color: #a0a0a0; font-size: 1.1rem;">${lang === 'sq' ? 'Nuk ka artikuj në këtë kategori ende.' : 'Noch keine Artikel in dieser Kategorie.'}</p>
            </div>
        `;
        return;
    }
    
    // Add API items
    previewItems.forEach((item, index) => {
        const galleryItem = createGalleryItemHTML(item, index + 1, lang);
        galleryGrid.insertAdjacentHTML('beforeend', galleryItem);
    });
    
    // Reinitialize sliders for new items
    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
        if (typeof initSliders === 'function') {
            initSliders();
        } else if (typeof window.initSliders === 'function') {
            window.initSliders();
        }
        
        // Setup fullscreen modal click handlers for new images
        setupFullscreenModalHandlers();
    }, 100);
}

// Setup category filter
function setupCategoryFilter() {
    const dropdown = document.getElementById('galleryCategory');
    const categoryInfo = document.getElementById('categoryInfo');
    const categoryName = document.getElementById('categoryName');
    const categoryDescription = document.getElementById('categoryDescription');
    
    if (!dropdown) return;
    
    // Remove existing event listeners by cloning
    const newDropdown = dropdown.cloneNode(true);
    dropdown.parentNode.replaceChild(newDropdown, dropdown);
    
    newDropdown.addEventListener('change', function() {
        const selectedCategoryId = this.value;
        const currentLang = localStorage.getItem('language') || 'de';
        
        // Show/hide category info
        if (selectedCategoryId === 'all') {
            if (categoryInfo) categoryInfo.style.display = 'none';
        } else {
            // Find category data
            const category = globalCategories.find(cat => cat.id == selectedCategoryId);
            if (category && categoryInfo) {
                categoryName.textContent = currentLang === 'sq' ? category.name_sq : category.name_de;
                categoryDescription.textContent = currentLang === 'sq' ? category.description_sq : category.description_de;
                categoryInfo.style.display = 'block';
                categoryInfo.style.opacity = '0';
                setTimeout(() => {
                    categoryInfo.style.transition = 'opacity 0.3s ease';
                    categoryInfo.style.opacity = '1';
                }, 10);
            }
        }
        
        // Re-render gallery with filtered items
        renderGalleryFromAPI(globalGalleryItems, currentLang, selectedCategoryId);
    });
}

// Create gallery item HTML
function createGalleryItemHTML(item, sliderId, lang) {
    const categoryName = lang === 'sq' ? item.category_name_sq : item.category_name_de;
    
    // Get translations
    const beforeText = lang === 'sq' ? 'Para' : 'Vorher';
    const afterText = lang === 'sq' ? 'Pas' : 'Nachher';
    const categoryLabel = lang === 'sq' ? 'Kategoria:' : 'Kategorie:';
    
    return `
        <div class="gallery-item" data-category="${item.category_id}">
            <div class="before-after-slider" data-slider="${sliderId}">
                <div class="slider-container">
                    <div class="slider-image before-image">
                        <img src="${item.before_image}" alt="${beforeText} - ${escapeHtml(item.name)}" loading="lazy">
                        <span class="image-label">${beforeText}</span>
                    </div>
                    <div class="slider-image after-image">
                        <img src="${item.after_image}" alt="${afterText} - ${escapeHtml(item.name)}" loading="lazy">
                        <span class="image-label">${afterText}</span>
                    </div>
                    <div class="slider-handle"></div>
                    <div class="slider-divider"></div>
                </div>
                <p class="slider-hint" data-i18n="gallery.drag">${lang === 'sq' ? 'Tërhiqeni majtas/djathtas për të parë' : 'Ziehen Sie links/rechts zum Ansehen'}</p>
            </div>
            <div class="gallery-info">
                <span class="gallery-category">${categoryLabel} ${escapeHtml(categoryName)}</span>
                <h3>${escapeHtml(item.name)}</h3>
                ${item.description ? `<p class="gallery-description">${escapeHtml(item.description)}</p>` : ''}
                ${item.comment ? `<p class="gallery-comment"><em>${escapeHtml(item.comment)}</em></p>` : ''}
            </div>
        </div>
    `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initGalleryFromAPI();
    });
} else {
    initGalleryFromAPI();
}

// Reinitialize when language changes
document.addEventListener('languageChanged', () => {
    const currentLang = localStorage.getItem('language') || 'de';
    
    // Update dropdown with new language
    if (globalCategories.length > 0) {
        updateCategoryDropdown(globalCategories, currentLang);
    }
    
    // Re-render gallery with current filter
    const dropdown = document.getElementById('galleryCategory');
    const selectedCategory = dropdown ? dropdown.value : 'all';
    if (globalGalleryItems.length > 0) {
        renderGalleryFromAPI(globalGalleryItems, currentLang, selectedCategory);
    } else {
        initGalleryFromAPI();
    }
});

