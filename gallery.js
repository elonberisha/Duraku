// Gallery Before/After Slider Functionality
let globalIsDragging = false;

// Function to initialize sliders (can be called multiple times)
function initSliders() {
    const sliders = document.querySelectorAll('.before-after-slider');
    
    sliders.forEach(slider => {
        // Skip if already initialized
        if (slider.dataset.initialized === 'true') return;
        
        // Mark as initialized
        slider.dataset.initialized = 'true';
        
        const container = slider.querySelector('.slider-container');
        const afterImage = slider.querySelector('.after-image');
        const handle = slider.querySelector('.slider-handle');
        const divider = slider.querySelector('.slider-divider');
        
        if (!container || !afterImage || !handle || !divider) {
            console.warn('Slider elements not found, skipping initialization');
            return;
        }
        
        let isDragging = false;
        let startX = 0;
        let currentX = 0;
        let sliderWidth = 0;
        
        // Initialize slider position (50% - showing both images)
        let sliderPosition = 50;
        
        function updateSliderPosition() {
            // Clip the after image based on slider position
            // When slider is at 0% (left), show only before (after is clipped 100%)
            // When slider is at 100% (right), show only after (after is clipped 0%)
            afterImage.style.clipPath = `inset(0 ${100 - sliderPosition}% 0 0)`;
            handle.style.left = `${sliderPosition}%`;
            divider.style.left = `${sliderPosition}%`;
        }
        
        function getEventX(e) {
            return e.touches ? e.touches[0].clientX : e.clientX;
        }
        
        function startDrag(e) {
            isDragging = true;
            globalIsDragging = true;
            sliderWidth = slider.offsetWidth;
            startX = getEventX(e) - slider.getBoundingClientRect().left;
            slider.style.cursor = 'grabbing';
            e.preventDefault();
            e.stopPropagation();
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            currentX = getEventX(e) - slider.getBoundingClientRect().left;
            const percentage = (currentX / sliderWidth) * 100;
            
            // Constrain between 0 and 100
            sliderPosition = Math.max(0, Math.min(100, percentage));
            updateSliderPosition();
        }
        
        function stopDrag(e) {
            if (!isDragging) return;
            isDragging = false;
            globalIsDragging = false;
            slider.style.cursor = 'grab';
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Mouse events
        slider.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('mouseleave', stopDrag);
        
        // Touch events - improved for mobile
        slider.addEventListener('touchstart', (e) => {
            startDrag(e);
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            drag(e);
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            stopDrag(e);
        }, { passive: false });
        
        document.addEventListener('touchcancel', (e) => {
            stopDrag(e);
        }, { passive: false });
        
        // Handle click on slider
        slider.addEventListener('click', (e) => {
            if (!isDragging) {
                sliderWidth = slider.offsetWidth;
                currentX = getEventX(e) - slider.getBoundingClientRect().left;
                const percentage = (currentX / sliderWidth) * 100;
                sliderPosition = Math.max(0, Math.min(100, percentage));
                updateSliderPosition();
            }
        });
        
        // Initialize position
        updateSliderPosition();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            updateSliderPosition();
        });
    });
}

// Initialize sliders on page load
document.addEventListener('DOMContentLoaded', () => {
    initSliders();
    
    // Gallery Dropdown Filter Functionality
    const galleryDropdown = document.getElementById('galleryCategory');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const categoryInfo = document.getElementById('categoryInfo');
    const categoryName = document.getElementById('categoryName');
    const categoryDescription = document.getElementById('categoryDescription');
    
    // Category data
    const categoryData = {
        industrial: {
            name: { sq: "Dyshet Industriale", de: "Industrieböden" },
            description: { sq: "Veshje dhe restaurim i dysheveve industriale për qëndrueshmëri dhe ngarkesë maksimale. Zgjidhje profesionale për ambiente industriale.", de: "Beschichtung und Sanierung von Industrieböden für maximale Haltbarkeit und Belastbarkeit. Professionelle Lösungen für Industrieumgebungen." }
        },
        parking: {
            name: { sq: "Parkingje & Garazhe Nëntokësore", de: "Parkhäuser & Tiefgaragen" },
            description: { sq: "Veshje të specializuara për parkingje dhe garazhe nëntokësore me mbrojtje optimale kundër ujit dhe konsumit.", de: "Spezialisierte Beschichtungen für Parkhäuser und Tiefgaragen mit optimalem Schutz gegen Wasser und Verschleiß." }
        },
        coating: {
            name: { sq: "Veshje të Të Gjitha Llojeve", de: "Beschichtung aller Art" },
            description: { sq: "Veshje profesionale për të gjitha kërkesat - nga epoksi deri te poliuretani. Zgjidhje të personalizuara për çdo projekt.", de: "Professionelle Beschichtungen für alle Anforderungen - von Epoxidharz bis Polyurethan. Maßgeschneiderte Lösungen für jedes Projekt." }
        }
    };
    
    // Get current language
    function getCurrentLang() {
        return localStorage.getItem('language') || 'sq';
    }
    
    if (galleryDropdown) {
        galleryDropdown.addEventListener('change', function() {
            const selectedCategory = this.value;
            const currentLang = getCurrentLang();
            
            // Show/hide category info
            if (selectedCategory === 'all') {
                categoryInfo.style.display = 'none';
            } else {
                const data = categoryData[selectedCategory];
                if (data) {
                    categoryName.textContent = data.name[currentLang] || data.name.de;
                    categoryDescription.textContent = data.description[currentLang] || data.description.de;
                    categoryInfo.style.display = 'block';
                    categoryInfo.style.opacity = '0';
                    setTimeout(() => {
                        categoryInfo.style.transition = 'opacity 0.3s ease';
                        categoryInfo.style.opacity = '1';
                    }, 10);
                }
            }
            
            // Filter gallery items
            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (selectedCategory === 'all' || itemCategory === selectedCategory) {
                    item.classList.remove('hidden');
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.transition = 'opacity 0.3s ease';
                        item.style.opacity = '1';
                    }, 10);
                } else {
                    item.style.transition = 'opacity 0.3s ease';
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.classList.add('hidden');
                    }, 300);
                }
            });
        });
        
        // Update category info when language changes
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                setTimeout(() => {
                    const selectedCategory = galleryDropdown.value;
                    if (selectedCategory !== 'all') {
                        const currentLang = getCurrentLang();
                        const data = categoryData[selectedCategory];
                        if (data) {
                            categoryName.textContent = data.name[currentLang] || data.name.de;
                            categoryDescription.textContent = data.description[currentLang] || data.description.de;
                        }
                    }
                }, 200);
            });
        });
    }
    
    // Fullscreen Image Modal Functionality with Navigation
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalLabel = document.getElementById('modalLabel');
    const modalClose = document.querySelector('.modal-close');
    const modalPrev = document.querySelector('.modal-prev');
    const modalNext = document.querySelector('.modal-next');
    const galleryImages = document.querySelectorAll('.slider-image img');
    
    // Store all images and current index
    let allImages = [];
    let currentImageIndex = 0;
    
    // Collect all images from gallery
    function collectAllImages() {
        allImages = [];
        galleryImages.forEach((img, index) => {
            const label = img.closest('.slider-image').querySelector('.image-label');
            allImages.push({
                src: img.src,
                alt: img.alt,
                label: label ? label.textContent : '',
                index: index
            });
        });
    }
    
    // Initialize image collection
    collectAllImages();
    
    if (modal && modalImage && modalLabel && modalClose) {
        // Function to open modal with specific image
        function openModal(imageIndex) {
            if (imageIndex < 0 || imageIndex >= allImages.length) return;
            
            currentImageIndex = imageIndex;
            const image = allImages[currentImageIndex];
            modalImage.src = image.src;
            modalLabel.textContent = image.label;
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Update navigation buttons visibility
            if (modalPrev) {
                modalPrev.style.display = allImages.length > 1 ? 'flex' : 'none';
            }
            if (modalNext) {
                modalNext.style.display = allImages.length > 1 ? 'flex' : 'none';
            }
        }
        
        // Function to navigate to previous image
        function showPrevious() {
            if (allImages.length === 0) return;
            currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
            const image = allImages[currentImageIndex];
            modalImage.src = image.src;
            modalLabel.textContent = image.label;
        }
        
        // Function to navigate to next image
        function showNext() {
            if (allImages.length === 0) return;
            currentImageIndex = (currentImageIndex + 1) % allImages.length;
            const image = allImages[currentImageIndex];
            modalImage.src = image.src;
            modalLabel.textContent = image.label;
        }
        
        // Open modal on image click
        galleryImages.forEach((img, index) => {
            img.addEventListener('click', function(e) {
                // Don't open modal if dragging
                if (globalIsDragging) return;
                
                // Find the index in allImages array
                const clickedIndex = allImages.findIndex(imgData => imgData.src === this.src);
                if (clickedIndex !== -1) {
                    openModal(clickedIndex);
                } else {
                    // Fallback: use current index
                    collectAllImages();
                    const label = this.closest('.slider-image').querySelector('.image-label');
                    const newIndex = allImages.findIndex(imgData => 
                        imgData.src === this.src && imgData.label === (label ? label.textContent : '')
                    );
                    openModal(newIndex !== -1 ? newIndex : 0);
                }
            });
        });
        
        // Navigation buttons
        if (modalPrev) {
            modalPrev.addEventListener('click', function(e) {
                e.stopPropagation();
                showPrevious();
            });
        }
        
        if (modalNext) {
            modalNext.addEventListener('click', function(e) {
                e.stopPropagation();
                showNext();
            });
        }
        
        // Close modal
        function closeModal() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        
        modalClose.addEventListener('click', closeModal);
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (modal.style.display !== 'flex') return;
            
            if (e.key === 'Escape') {
                closeModal();
            } else if (e.key === 'ArrowLeft') {
                showPrevious();
            } else if (e.key === 'ArrowRight') {
                showNext();
            }
        });
        
        // Touch swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        modal.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        modal.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next image
                    showNext();
                } else {
                    // Swipe right - previous image
                    showPrevious();
                }
            }
        }
    }
});

