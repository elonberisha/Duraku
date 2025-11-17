/**
 * Admin Panel JavaScript
 * Handles authentication, gallery management, and UI interactions
 */

const API_BASE = '../api';

// State management
let currentUser = null;
let galleryItems = [];
let categories = [];
let editingItemId = null;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const adminUsername = document.getElementById('adminUsername');
const galleryItemsList = document.getElementById('galleryItemsList');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const addGalleryItemBtn = document.getElementById('addGalleryItemBtn');
const galleryItemModal = document.getElementById('galleryItemModal');
const galleryItemForm = document.getElementById('galleryItemForm');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const modalTitle = document.getElementById('modalTitle');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    
    // Load categories if categories section is active on page load
    setTimeout(() => {
        const categoriesSection = document.getElementById('categoriesSection');
        if (categoriesSection && categoriesSection.classList.contains('active')) {
            loadCategoriesForDisplay();
        }
    }, 500);
});

// Check authentication status
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/auth.php?action=check`);
        const data = await response.json();
        
        if (data.logged_in) {
            currentUser = data.user;
            showDashboard();
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showLogin();
    }
}

// Show login screen
function showLogin() {
    loginScreen.style.display = 'flex';
    adminDashboard.style.display = 'none';
}

// Show dashboard
function showDashboard() {
    loginScreen.style.display = 'none';
    adminDashboard.style.display = 'flex';
    if (currentUser) {
        adminUsername.textContent = currentUser.username;
    }
    loadCategories();
    loadGalleryItems();
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Forget Password
    const forgetPasswordBtn = document.getElementById('forgetPasswordBtn');
    if (forgetPasswordBtn) {
        forgetPasswordBtn.addEventListener('click', openForgetPasswordModal);
    }
    
    const closeForgetPasswordModalBtn = document.getElementById('closeForgetPasswordModal');
    if (closeForgetPasswordModalBtn) {
        closeForgetPasswordModalBtn.addEventListener('click', closeForgetPasswordModal);
    }
    
    const cancelForgetPasswordBtn = document.getElementById('cancelForgetPasswordBtn');
    if (cancelForgetPasswordBtn) {
        cancelForgetPasswordBtn.addEventListener('click', closeForgetPasswordModal);
    }
    
    const sendResetCodeBtn = document.getElementById('sendResetCodeBtn');
    if (sendResetCodeBtn) {
        sendResetCodeBtn.addEventListener('click', handleSendResetCode);
    }
    
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', handleResetPassword);
    }
    
    const resendResetCodeBtn = document.getElementById('resendResetCodeBtn');
    if (resendResetCodeBtn) {
        resendResetCodeBtn.addEventListener('click', handleResendResetCode);
    }
    
    const backToStep1Btn = document.getElementById('backToStep1Btn');
    if (backToStep1Btn) {
        backToStep1Btn.addEventListener('click', () => {
            document.getElementById('forgetPasswordStep1').style.display = 'block';
            document.getElementById('forgetPasswordStep2').style.display = 'none';
            document.getElementById('resetUsername').value = '';
        });
    }
    
    const forgetPasswordModal = document.getElementById('forgetPasswordModal');
    if (forgetPasswordModal) {
        forgetPasswordModal.addEventListener('click', (e) => {
            if (e.target === forgetPasswordModal) {
                closeForgetPasswordModal();
            }
        });
    }
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });
    
    // Gallery management
    addGalleryItemBtn.addEventListener('click', () => openGalleryItemModal());
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    galleryItemModal.addEventListener('click', (e) => {
        if (e.target === galleryItemModal) closeModal();
    });
    
    // Form submission
    galleryItemForm.addEventListener('submit', handleGalleryItemSubmit);
    
    // Image upload previews
    document.getElementById('beforeImage').addEventListener('change', (e) => {
        handleImagePreview(e, 'beforeImagePreview');
    });
    document.getElementById('afterImage').addEventListener('change', (e) => {
        handleImagePreview(e, 'afterImagePreview');
    });
    
    // Filter and search
    categoryFilter.addEventListener('change', filterGalleryItems);
    searchInput.addEventListener('input', filterGalleryItems);
    
    // Hero Page
    const heroForm = document.getElementById('heroForm');
    if (heroForm) {
        heroForm.addEventListener('submit', handleHeroSubmit);
    }
    
    const heroBackgroundImage = document.getElementById('heroBackgroundImage');
    if (heroBackgroundImage) {
        heroBackgroundImage.addEventListener('change', (e) => {
            handleImagePreview(e, 'heroBackgroundPreview');
        });
    }
    
    // About Section
    const aboutForm = document.getElementById('aboutForm');
    if (aboutForm) {
        aboutForm.addEventListener('submit', handleAboutSubmit);
    }
    
    const aboutImage = document.getElementById('aboutImage');
    if (aboutImage) {
        aboutImage.addEventListener('change', (e) => {
            handleImagePreview(e, 'aboutImagePreview');
            const removeBtn = document.getElementById('removeAboutImageBtn');
            if (removeBtn && e.target.files.length > 0) {
                removeBtn.style.display = 'inline-block';
            }
        });
    }
    
    const removeAboutImageBtn = document.getElementById('removeAboutImageBtn');
    if (removeAboutImageBtn) {
        removeAboutImageBtn.addEventListener('click', handleRemoveAboutImage);
    }
    
    // Team Image
    const teamImage = document.getElementById('teamImage');
    if (teamImage) {
        teamImage.addEventListener('change', (e) => {
            handleImagePreview(e, 'teamImagePreview');
        });
    }
    
    const removeTeamImageBtn = document.getElementById('removeTeamImageBtn');
    if (removeTeamImageBtn) {
        removeTeamImageBtn.addEventListener('click', handleRemoveTeamImage);
    }
    
    // Categories
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Add category button clicked');
            if (typeof openCategoryModal === 'function') {
                openCategoryModal();
            } else {
                console.error('openCategoryModal function not found');
            }
        });
    } else {
        console.warn('addCategoryBtn element not found');
    }
    
    const categoryModal = document.getElementById('categoryModal');
    const closeCategoryModalBtn = document.getElementById('closeCategoryModalBtn');
    const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
    const categoryForm = document.getElementById('categoryForm');
    
    if (closeCategoryModalBtn) {
        closeCategoryModalBtn.addEventListener('click', closeCategoryModal);
    }
    if (cancelCategoryBtn) {
        cancelCategoryBtn.addEventListener('click', closeCategoryModal);
    }
    if (categoryModal) {
        categoryModal.addEventListener('click', (e) => {
            if (e.target === categoryModal) closeCategoryModal();
        });
    }
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }
    
    // Settings
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handlePasswordChange);
    }
    
    const enable2FA = document.getElementById('enable2FA');
    const twoFactorEmail = document.getElementById('twoFactorEmail');
    const save2FASettings = document.getElementById('save2FASettings');
    
    if (enable2FA) {
        enable2FA.addEventListener('change', function() {
            twoFactorEmail.style.display = this.checked ? 'block' : 'none';
        });
    }
    
    if (save2FASettings) {
        save2FASettings.addEventListener('click', handleSave2FASettings);
    }
    
    // 2FA Modal
    const verifyCodeBtn = document.getElementById('verifyCodeBtn');
    const resendCodeBtn = document.getElementById('resendCodeBtn');
    
    if (verifyCodeBtn) {
        verifyCodeBtn.addEventListener('click', handleVerify2FACode);
    }
    
    if (resendCodeBtn) {
        resendCodeBtn.addEventListener('click', handleResend2FACode);
    }
    
    // Load 2FA settings when settings section is opened
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.dataset.section === 'settings') {
            item.addEventListener('click', load2FASettings);
        }
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const errorDiv = document.getElementById('loginError');
    errorDiv.classList.remove('show');
    
    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/auth.php?action=login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Check if 2FA is required
            if (data.requires_2fa) {
                // Show 2FA modal
                show2FAModal(formData.username);
            } else {
                currentUser = data.user;
                showDashboard();
                loginForm.reset();
            }
        } else {
            errorDiv.textContent = data.error || 'Login failed';
            errorDiv.classList.add('show');
        }
    } catch (error) {
        errorDiv.textContent = 'Connection error. Please try again.';
        errorDiv.classList.add('show');
    }
}

// Handle logout
async function handleLogout() {
    try {
        await fetch(`${API_BASE}/auth.php?action=logout`, {
            method: 'POST'
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    currentUser = null;
    showLogin();
}

// Switch section
function switchSection(section) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === section) {
            item.classList.add('active');
        }
    });
    
    // Update sections
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${section}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load hero data when hero section is opened
        if (section === 'hero') {
            loadHeroData();
        }
        
        // Load about data when about section is opened
        if (section === 'about') {
            loadAboutData();
        }
        
        // Load categories when categories section is opened
        if (section === 'categories') {
            loadCategoriesForDisplay();
        }
    }
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/gallery.php?action=categories`);
        const data = await response.json();
        
        if (data.success) {
            categories = data.data;
            populateCategorySelects();
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

// Populate category selects
function populateCategorySelects() {
    const selects = [categoryFilter, document.getElementById('itemCategory')];
    
    selects.forEach(select => {
        if (!select) return;
        
        const currentValue = select.value;
        select.innerHTML = select === categoryFilter 
            ? '<option value="all">All Categories</option>'
            : '<option value="">Select Category</option>';
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name_de || cat.name_sq;
            select.appendChild(option);
        });
        
        if (currentValue) {
            select.value = currentValue;
        }
    });
}

// Load gallery items
async function loadGalleryItems() {
    galleryItemsList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/gallery.php?action=list`);
        const data = await response.json();
        
        if (data.success) {
            galleryItems = data.data;
            renderGalleryItems();
        } else {
            showError('Failed to load gallery items');
        }
    } catch (error) {
        console.error('Failed to load gallery items:', error);
        galleryItemsList.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to load gallery items</p></div>';
    }
}

// Render gallery items
function renderGalleryItems(items = galleryItems) {
    if (items.length === 0) {
        galleryItemsList.innerHTML = '<div class="empty-state"><i class="fas fa-images"></i><p>No gallery items found</p></div>';
        return;
    }
    
    galleryItemsList.innerHTML = items.map(item => `
        <div class="gallery-item-card" data-id="${item.id}">
            <div class="gallery-item-images">
                <img src="../${item.before_image}" alt="Before" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Crect fill=\'%23333\' width=\'200\' height=\'200\'/%3E%3Ctext fill=\'%23999\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3EBefore%3C/text%3E%3C/svg%3E'">
                <img src="../${item.after_image}" alt="After" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Crect fill=\'%23333\' width=\'200\' height=\'200\'/%3E%3Ctext fill=\'%23999\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3EAfter%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="gallery-item-info">
                <h3>${escapeHtml(item.name)}</h3>
                <p><strong>Category:</strong> ${escapeHtml(item.category_name_de || item.category_name_sq)}</p>
                ${item.description ? `<p>${escapeHtml(item.description.substring(0, 100))}${item.description.length > 100 ? '...' : ''}</p>` : ''}
                ${item.comment ? `<p><em>${escapeHtml(item.comment.substring(0, 80))}${item.comment.length > 80 ? '...' : ''}</em></p>` : ''}
            </div>
            <div class="gallery-item-actions">
                <button class="btn btn-primary btn-sm" onclick="editGalleryItem(${item.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteGalleryItem(${item.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Filter gallery items
function filterGalleryItems() {
    const categoryId = categoryFilter.value;
    const searchTerm = searchInput.value.toLowerCase();
    
    let filtered = galleryItems;
    
    if (categoryId !== 'all') {
        filtered = filtered.filter(item => item.category_id == categoryId);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            (item.description && item.description.toLowerCase().includes(searchTerm)) ||
            (item.comment && item.comment.toLowerCase().includes(searchTerm))
        );
    }
    
    renderGalleryItems(filtered);
}

// Open gallery item modal
function openGalleryItemModal(itemId = null) {
    editingItemId = itemId;
    modalTitle.textContent = itemId ? 'Edit Gallery Item' : 'Add Gallery Item';
    galleryItemForm.reset();
    
    // Reset image previews
    document.getElementById('beforeImagePreview').innerHTML = '<i class="fas fa-image"></i><span>Click to upload</span>';
    document.getElementById('afterImagePreview').innerHTML = '<i class="fas fa-image"></i><span>Click to upload</span>';
    document.getElementById('beforeImagePreview').classList.remove('has-image');
    document.getElementById('afterImagePreview').classList.remove('has-image');
    
    if (itemId) {
        loadGalleryItemForEdit(itemId);
    }
    
    galleryItemModal.classList.add('active');
}

// Load gallery item for editing
async function loadGalleryItemForEdit(itemId) {
    try {
        const response = await fetch(`${API_BASE}/gallery.php?action=get&id=${itemId}`);
        const data = await response.json();
        
        if (data.success) {
            const item = data.data;
            document.getElementById('itemId').value = item.id;
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemCategory').value = item.category_id;
            document.getElementById('itemDescription').value = item.description || '';
            document.getElementById('itemComment').value = item.comment || '';
            
            // Set image previews
            setImagePreview('beforeImagePreview', `../${item.before_image}`);
            setImagePreview('afterImagePreview', `../${item.after_image}`);
        }
    } catch (error) {
        console.error('Failed to load item:', error);
    }
}

// Set image preview
function setImagePreview(previewId, imageUrl) {
    const preview = document.getElementById(previewId);
    preview.innerHTML = `<img src="${imageUrl}" alt="Preview">`;
    preview.classList.add('has-image');
}

// Handle image preview
function handleImagePreview(e, previewId) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        setImagePreview(previewId, event.target.result);
    };
    reader.readAsDataURL(file);
}

// Handle gallery item form submission
async function handleGalleryItemSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(galleryItemForm);
    const beforeFile = document.getElementById('beforeImage').files[0];
    const afterFile = document.getElementById('afterImage').files[0];
    
    // Upload images if new files are selected
    let beforeImageUrl = null;
    let afterImageUrl = null;
    
    if (beforeFile) {
        beforeImageUrl = await uploadImage(beforeFile);
        if (!beforeImageUrl) {
            showError('Failed to upload before image');
            return;
        }
    }
    
    if (afterFile) {
        afterImageUrl = await uploadImage(afterFile);
        if (!afterImageUrl) {
            showError('Failed to upload after image');
            return;
        }
    }
    
    // If editing and no new images, use existing ones
    if (editingItemId) {
        const existingItem = galleryItems.find(item => item.id == editingItemId);
        if (existingItem) {
            if (!beforeImageUrl) beforeImageUrl = existingItem.before_image;
            if (!afterImageUrl) afterImageUrl = existingItem.after_image;
        }
    }
    
    // Prepare data
    const itemData = {
        category_id: parseInt(formData.get('category_id')),
        name: formData.get('name'),
        description: formData.get('description') || '',
        comment: formData.get('comment') || '',
        before_image: beforeImageUrl,
        after_image: afterImageUrl
    };
    
    // Submit to API
    try {
        const url = editingItemId 
            ? `${API_BASE}/gallery.php?action=update&id=${editingItemId}`
            : `${API_BASE}/gallery.php?action=create`;
        
        const method = editingItemId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            closeModal();
            loadGalleryItems();
            showSuccess(editingItemId ? 'Item updated successfully' : 'Item created successfully');
        } else {
            showError(data.error || 'Failed to save item');
        }
    } catch (error) {
        console.error('Failed to save item:', error);
        showError('Connection error. Please try again.');
    }
}

// Upload image
async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch(`${API_BASE}/upload.php`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            return data.url;
        } else {
            console.error('Upload error:', data.error);
            return null;
        }
    } catch (error) {
        console.error('Upload failed:', error);
        return null;
    }
}

// Edit gallery item
function editGalleryItem(itemId) {
    openGalleryItemModal(itemId);
}

// Delete gallery item
async function deleteGalleryItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/gallery.php?action=delete&id=${itemId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            loadGalleryItems();
            showSuccess('Item deleted successfully');
        } else {
            showError(data.error || 'Failed to delete item');
        }
    } catch (error) {
        console.error('Failed to delete item:', error);
        showError('Connection error. Please try again.');
    }
}

// Close modal
function closeModal() {
    galleryItemModal.classList.remove('active');
    editingItemId = null;
    galleryItemForm.reset();
}

// Password Change
async function handlePasswordChange(e) {
    e.preventDefault();
    const messageDiv = document.getElementById('passwordChangeMessage');
    messageDiv.className = 'form-message';
    messageDiv.textContent = '';
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'New passwords do not match';
        return;
    }
    
    if (newPassword.length < 6) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'New password must be at least 6 characters';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/password.php?action=change`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            messageDiv.className = 'form-message success';
            messageDiv.textContent = 'Password changed successfully';
            document.getElementById('changePasswordForm').reset();
        } else {
            messageDiv.className = 'form-message error';
            messageDiv.textContent = data.error || 'Failed to change password';
        }
    } catch (error) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Connection error. Please try again.';
    }
}

// Hero Page Functions
async function loadHeroData() {
    try {
        const response = await fetch(`${API_BASE}/hero.php?action=get`);
        const data = await response.json();
        
        if (data.success && data.data) {
            const hero = data.data;
            
            // Populate form fields
            if (hero.background_image) {
                setImagePreview('heroBackgroundPreview', hero.background_image);
            }
            
            document.getElementById('heroTitleSq').value = hero.title_sq || '';
            document.getElementById('heroTitleDe').value = hero.title_de || '';
            document.getElementById('heroSubtitleSq').value = hero.subtitle_sq || '';
            document.getElementById('heroSubtitleDe').value = hero.subtitle_de || '';
            document.getElementById('heroTaglineSq').value = hero.tagline_sq || '';
            document.getElementById('heroTaglineDe').value = hero.tagline_de || '';
            document.getElementById('heroDescriptionSq').value = hero.description_sq || '';
            document.getElementById('heroDescriptionDe').value = hero.description_de || '';
            document.getElementById('heroCtaSq').value = hero.cta_text_sq || '';
            document.getElementById('heroCtaDe').value = hero.cta_text_de || '';
        }
    } catch (error) {
        console.error('Failed to load hero data:', error);
    }
}

async function handleHeroSubmit(e) {
    e.preventDefault();
    const messageDiv = document.getElementById('heroMessage');
    messageDiv.className = 'form-message';
    messageDiv.textContent = '';
    
    // Get existing hero data to preserve background_image if not changed
    let existingHeroData = null;
    try {
        const response = await fetch(`${API_BASE}/hero.php?action=get`);
        const data = await response.json();
        if (data.success && data.data) {
            existingHeroData = data.data;
        }
    } catch (error) {
        console.error('Failed to load existing hero data:', error);
    }
    
    const formData = {
        title_sq: document.getElementById('heroTitleSq').value.trim(),
        title_de: document.getElementById('heroTitleDe').value.trim(),
        subtitle_sq: document.getElementById('heroSubtitleSq').value.trim(),
        subtitle_de: document.getElementById('heroSubtitleDe').value.trim(),
        tagline_sq: document.getElementById('heroTaglineSq').value.trim(),
        tagline_de: document.getElementById('heroTaglineDe').value.trim(),
        description_sq: document.getElementById('heroDescriptionSq').value.trim(),
        description_de: document.getElementById('heroDescriptionDe').value.trim(),
        cta_text_sq: document.getElementById('heroCtaSq').value.trim(),
        cta_text_de: document.getElementById('heroCtaDe').value.trim()
    };
    
    // Handle background image upload if file is selected
    const backgroundImageFile = document.getElementById('heroBackgroundImage').files[0];
    if (backgroundImageFile) {
        try {
            const imageUrl = await uploadImage(backgroundImageFile);
            if (imageUrl) {
                formData.background_image = imageUrl;
            }
        } catch (error) {
            messageDiv.className = 'form-message error';
            messageDiv.textContent = 'Failed to upload background image';
            return;
        }
    } else if (existingHeroData && existingHeroData.background_image) {
        // Preserve existing background image if no new file is selected
        formData.background_image = existingHeroData.background_image;
    }
    
    try {
        const response = await fetch(`${API_BASE}/hero.php?action=update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            messageDiv.className = 'form-message success';
            messageDiv.textContent = 'Hero page updated successfully!';
            
            // Update preview if image exists
            if (formData.background_image) {
                setImagePreview('heroBackgroundPreview', formData.background_image);
            }
            
            // Reset file input
            document.getElementById('heroBackgroundImage').value = '';
        } else {
            messageDiv.className = 'form-message error';
            messageDiv.textContent = data.error || 'Failed to update hero page';
        }
    } catch (error) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Connection error. Please try again.';
    }
}

// About Section Functions
async function loadAboutData() {
    try {
        const response = await fetch(`${API_BASE}/about.php?action=get`);
        const data = await response.json();
        
        if (data.success && data.data) {
            const about = data.data;
            
            // Populate form fields
            if (about.image) {
                setImagePreview('aboutImagePreview', about.image);
                const removeBtn = document.getElementById('removeAboutImageBtn');
                if (removeBtn) {
                    removeBtn.style.display = 'inline-block';
                }
            }
            
            document.getElementById('aboutDescriptionSq').value = about.description_sq || '';
            document.getElementById('aboutDescriptionDe').value = about.description_de || '';
            document.getElementById('experienceNumber').value = about.experience_number || '';
            document.getElementById('projectsNumber').value = about.projects_number || '';
            document.getElementById('clientsNumber').value = about.clients_number || '';
            document.getElementById('experienceLabelSq').value = about.experience_sq || '';
            document.getElementById('experienceLabelDe').value = about.experience_de || '';
            document.getElementById('projectsLabelSq').value = about.projects_sq || '';
            document.getElementById('projectsLabelDe').value = about.projects_de || '';
            document.getElementById('clientsLabelSq').value = about.clients_sq || '';
            document.getElementById('clientsLabelDe').value = about.clients_de || '';
        if (about.team_image) {
            setImagePreview('teamImagePreview', about.team_image);
            const removeTeamBtn = document.getElementById('removeTeamImageBtn');
            if (removeTeamBtn) {
                removeTeamBtn.style.display = 'inline-block';
            }
        }
        document.getElementById('teamTitleSq').value = about.team_title_sq || '';
        document.getElementById('teamTitleDe').value = about.team_title_de || '';
        document.getElementById('teamDescriptionSq').value = about.team_description_sq || '';
        document.getElementById('teamDescriptionDe').value = about.team_description_de || '';
        }
    } catch (error) {
        console.error('Failed to load about data:', error);
    }
}

async function handleAboutSubmit(e) {
    e.preventDefault();
    const messageDiv = document.getElementById('aboutMessage');
    messageDiv.className = 'form-message';
    messageDiv.textContent = '';
    
    // Get existing about data to preserve image if not changed
    let existingAboutData = null;
    try {
        const response = await fetch(`${API_BASE}/about.php?action=get`);
        const data = await response.json();
        if (data.success && data.data) {
            existingAboutData = data.data;
        }
    } catch (error) {
        console.error('Failed to load existing about data:', error);
    }
    
    const formData = {
        description_sq: document.getElementById('aboutDescriptionSq').value.trim(),
        description_de: document.getElementById('aboutDescriptionDe').value.trim(),
        experience_number: document.getElementById('experienceNumber').value.trim(),
        projects_number: document.getElementById('projectsNumber').value.trim(),
        clients_number: document.getElementById('clientsNumber').value.trim(),
        experience_sq: document.getElementById('experienceLabelSq').value.trim(),
        experience_de: document.getElementById('experienceLabelDe').value.trim(),
        projects_sq: document.getElementById('projectsLabelSq').value.trim(),
        projects_de: document.getElementById('projectsLabelDe').value.trim(),
        clients_sq: document.getElementById('clientsLabelSq').value.trim(),
        clients_de: document.getElementById('clientsLabelDe').value.trim(),
        team_title_sq: document.getElementById('teamTitleSq').value.trim(),
        team_title_de: document.getElementById('teamTitleDe').value.trim(),
        team_description_sq: document.getElementById('teamDescriptionSq').value.trim(),
        team_description_de: document.getElementById('teamDescriptionDe').value.trim()
    };
    
    // Handle image upload if file is selected
    const aboutImageFile = document.getElementById('aboutImage').files[0];
    if (aboutImageFile) {
        try {
            const imageUrl = await uploadImage(aboutImageFile);
            if (imageUrl) {
                formData.image = imageUrl;
            }
        } catch (error) {
            messageDiv.className = 'form-message error';
            messageDiv.textContent = 'Failed to upload about image';
            return;
        }
    } else if (existingAboutData && existingAboutData.image) {
        // Preserve existing image if no new file is selected
        formData.image = existingAboutData.image;
    }
    
    // Handle team image upload if file is selected
    const teamImageFile = document.getElementById('teamImage').files[0];
    if (teamImageFile) {
        try {
            const imageUrl = await uploadImage(teamImageFile);
            if (imageUrl) {
                formData.team_image = imageUrl;
            }
        } catch (error) {
            messageDiv.className = 'form-message error';
            messageDiv.textContent = 'Failed to upload team image';
            return;
        }
    } else if (existingAboutData && existingAboutData.team_image) {
        // Preserve existing team image if no new file is selected
        formData.team_image = existingAboutData.team_image;
    }
    
    try {
        const response = await fetch(`${API_BASE}/about.php?action=update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            messageDiv.className = 'form-message success';
            messageDiv.textContent = 'About section updated successfully!';
            
            // Update preview if image was uploaded
            if (formData.image) {
                setImagePreview('aboutImagePreview', formData.image);
                const removeBtn = document.getElementById('removeAboutImageBtn');
                if (removeBtn) {
                    removeBtn.style.display = 'inline-block';
                }
            }
            
            // Update team image preview if uploaded
            if (formData.team_image) {
                setImagePreview('teamImagePreview', formData.team_image);
                const removeTeamBtn = document.getElementById('removeTeamImageBtn');
                if (removeTeamBtn) {
                    removeTeamBtn.style.display = 'inline-block';
                }
            }
            
            // Reset file inputs
            document.getElementById('aboutImage').value = '';
            document.getElementById('teamImage').value = '';
        } else {
            messageDiv.className = 'form-message error';
            messageDiv.textContent = data.error || 'Failed to update about section';
        }
    } catch (error) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Connection error. Please try again.';
    }
}

async function handleRemoveAboutImage() {
    if (!confirm('Are you sure you want to remove the about image?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/about.php?action=delete_image&type=about`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Clear preview
            const preview = document.getElementById('aboutImagePreview');
            if (preview) {
                preview.innerHTML = '<i class="fas fa-image"></i><span>Click to upload about image</span>';
                preview.classList.remove('has-image');
            }
            
            // Hide remove button
            const removeBtn = document.getElementById('removeAboutImageBtn');
            if (removeBtn) {
                removeBtn.style.display = 'none';
            }
            
            // Clear file input
            document.getElementById('aboutImage').value = '';
            
            alert('About image removed successfully!');
        } else {
            alert(data.error || 'Failed to remove image');
        }
    } catch (error) {
        alert('Connection error. Please try again.');
    }
}

async function handleRemoveTeamImage() {
    if (!confirm('Are you sure you want to remove the team photo?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/about.php?action=delete_image&type=team`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Clear preview
            const preview = document.getElementById('teamImagePreview');
            preview.innerHTML = '<i class="fas fa-image"></i><span>Click to upload team photo</span>';
            preview.classList.remove('has-image');
            
            const removeBtn = document.getElementById('removeTeamImageBtn');
            if (removeBtn) {
                removeBtn.style.display = 'none';
            }
            
            // Reload about data
            loadAboutData();
            
            // Clear file input
            document.getElementById('teamImage').value = '';
            
            alert('Team photo removed successfully!');
        } else {
            alert(data.error || 'Failed to remove team photo');
        }
    } catch (error) {
        alert('Connection error. Please try again.');
    }
}

// Categories Management Functions
let editingCategoryId = null;

async function loadCategoriesForDisplay() {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList) {
        console.error('categoriesList element not found');
        return;
    }
    
    categoriesList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/categories.php?action=list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            renderCategories(data.data);
        } else {
            console.error('API returned error:', data.error);
            categoriesList.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i> ${data.error || 'Failed to load categories'}</div>`;
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
        categoriesList.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i> Connection error: ${error.message}</div>`;
    }
}

function renderCategories(categories) {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList) {
        console.error('categoriesList element not found in renderCategories');
        return;
    }
    
    if (!categories || categories.length === 0) {
        categoriesList.innerHTML = '<div class="empty-state"><i class="fas fa-tags"></i> No categories yet. Click "Add New Category" to create one.</div>';
        return;
    }
    
    categoriesList.innerHTML = '';
    
    categories.forEach(cat => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        
        // Format date safely
        let createdDate = 'N/A';
        try {
            if (cat.created_at) {
                createdDate = new Date(cat.created_at).toLocaleDateString();
            }
        } catch (e) {
            console.warn('Error parsing date:', e);
        }
        
        categoryCard.innerHTML = `
            <div class="category-info">
                <h3>${escapeHtml(cat.name_de || cat.name_sq || 'Unnamed Category')}</h3>
                <p class="category-name-alt">${escapeHtml(cat.name_sq || '')}</p>
                ${cat.description_de || cat.description_sq ? `<p class="category-description">${escapeHtml(cat.description_de || cat.description_sq)}</p>` : ''}
                <div class="category-meta">
                    <span><i class="fas fa-calendar"></i> Created: ${createdDate}</span>
                </div>
            </div>
            <div class="category-actions">
                <button class="btn btn-secondary btn-sm" onclick="editCategory(${cat.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteCategory(${cat.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        categoriesList.appendChild(categoryCard);
    });
}

function openCategoryModal(categoryId = null) {
    console.log('openCategoryModal called with categoryId:', categoryId);
    editingCategoryId = categoryId;
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    const modalTitle = document.getElementById('categoryModalTitle');
    const messageDiv = document.getElementById('categoryMessage');
    
    if (!modal) {
        console.error('categoryModal element not found');
        alert('Category modal not found. Please refresh the page.');
        return;
    }
    
    if (modalTitle) {
        modalTitle.textContent = categoryId ? 'Edit Category' : 'Add Category';
    }
    
    if (form) {
        form.reset();
        const categoryIdInput = document.getElementById('categoryId');
        if (categoryIdInput) {
            categoryIdInput.value = categoryId || '';
        }
    }
    
    if (messageDiv) {
        messageDiv.textContent = '';
        messageDiv.className = 'form-message';
    }
    
    if (categoryId) {
        loadCategoryForEdit(categoryId);
    }
    
    modal.classList.add('active');
    console.log('Modal opened successfully');
}

function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (modal) {
        modal.classList.remove('active');
    }
    editingCategoryId = null;
    const form = document.getElementById('categoryForm');
    if (form) {
        form.reset();
    }
}

async function loadCategoryForEdit(categoryId) {
    try {
        const response = await fetch(`${API_BASE}/categories.php?action=get&id=${categoryId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            const cat = data.data;
            document.getElementById('categoryNameSq').value = cat.name_sq || '';
            document.getElementById('categoryNameDe').value = cat.name_de || '';
            document.getElementById('categoryDescriptionSq').value = cat.description_sq || '';
            document.getElementById('categoryDescriptionDe').value = cat.description_de || '';
        }
    } catch (error) {
        console.error('Failed to load category:', error);
    }
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    const messageDiv = document.getElementById('categoryMessage');
    messageDiv.className = 'form-message';
    messageDiv.textContent = '';
    
    const formData = {
        name_sq: document.getElementById('categoryNameSq').value.trim(),
        name_de: document.getElementById('categoryNameDe').value.trim(),
        description_sq: document.getElementById('categoryDescriptionSq').value.trim(),
        description_de: document.getElementById('categoryDescriptionDe').value.trim()
    };
    
    if (!formData.name_sq || !formData.name_de) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Name (Albanian and German) is required';
        return;
    }
    
    const categoryId = editingCategoryId;
    const url = categoryId 
        ? `${API_BASE}/categories.php?action=update&id=${categoryId}`
        : `${API_BASE}/categories.php?action=create`;
    const method = categoryId ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            messageDiv.className = 'form-message success';
            messageDiv.textContent = categoryId ? 'Category updated successfully!' : 'Category created successfully!';
            
            // Reload categories list and update dropdowns
            await loadCategoriesForDisplay();
            await loadCategories(); // Reload for dropdowns
            populateCategorySelects();
            
            setTimeout(() => {
                closeCategoryModal();
            }, 1000);
        } else {
            messageDiv.className = 'form-message error';
            messageDiv.textContent = data.error || 'Failed to save category';
        }
    } catch (error) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Connection error. Please try again.';
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/categories.php?action=delete&id=${categoryId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Reload categories list and update dropdowns
            await loadCategoriesForDisplay();
            await loadCategories(); // Reload for dropdowns
            populateCategorySelects();
        } else {
            alert(data.error || 'Failed to delete category');
        }
    } catch (error) {
        alert('Connection error. Please try again.');
    }
}

function editCategory(categoryId) {
    openCategoryModal(categoryId);
}

// Make functions globally available
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;

// 2FA Functions
let currentLoginUsername = '';

async function load2FASettings() {
    try {
        const response = await fetch(`${API_BASE}/twofactor.php?action=settings`);
        const data = await response.json();
        
        if (data.success) {
            const enable2FA = document.getElementById('enable2FA');
            const twoFactorEmail = document.getElementById('twoFactorEmail');
            const twoFactorEmailInput = document.getElementById('twoFactorEmailInput');
            
            if (enable2FA) {
                enable2FA.checked = data.enabled;
                twoFactorEmail.style.display = data.enabled ? 'block' : 'none';
            }
            
            if (twoFactorEmailInput && data.email) {
                twoFactorEmailInput.value = data.email;
            }
        }
    } catch (error) {
        console.error('Failed to load 2FA settings:', error);
    }
}

async function handleSave2FASettings() {
    const messageDiv = document.getElementById('twoFAMessage');
    messageDiv.className = 'form-message';
    messageDiv.textContent = '';
    
    const enable2FA = document.getElementById('enable2FA');
    const twoFactorEmailInput = document.getElementById('twoFactorEmailInput');
    
    if (enable2FA.checked && !twoFactorEmailInput.value) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Email is required when 2FA is enabled';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/twofactor.php?action=update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                enabled: enable2FA.checked,
                email: twoFactorEmailInput.value
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            messageDiv.className = 'form-message success';
            messageDiv.textContent = '2FA settings saved successfully';
        } else {
            messageDiv.className = 'form-message error';
            messageDiv.textContent = data.error || 'Failed to save settings';
        }
    } catch (error) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Connection error. Please try again.';
    }
}

function show2FAModal(username) {
    currentLoginUsername = username;
    const modal = document.getElementById('twoFactorModal');
    const errorDiv = document.getElementById('twoFactorError');
    errorDiv.classList.remove('show');
    errorDiv.textContent = '';
    document.getElementById('verificationCode').value = '';
    
    // Send verification code
    send2FACode(username);
    
    modal.classList.add('active');
}

async function send2FACode(username) {
    try {
        const response = await fetch(`${API_BASE}/twofactor.php?action=send-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            const errorDiv = document.getElementById('twoFactorError');
            errorDiv.textContent = data.error || 'Failed to send verification code';
            errorDiv.classList.add('show');
        }
    } catch (error) {
        const errorDiv = document.getElementById('twoFactorError');
        errorDiv.textContent = 'Connection error. Please try again.';
        errorDiv.classList.add('show');
    }
}

async function handleVerify2FACode() {
    const code = document.getElementById('verificationCode').value;
    const errorDiv = document.getElementById('twoFactorError');
    errorDiv.classList.remove('show');
    errorDiv.textContent = '';
    
    if (!code || code.length !== 6) {
        errorDiv.textContent = 'Please enter a valid 6-digit code';
        errorDiv.classList.add('show');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/twofactor.php?action=verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            currentUser = data.user;
            document.getElementById('twoFactorModal').classList.remove('active');
            showDashboard();
            document.getElementById('loginForm').reset();
        } else {
            errorDiv.textContent = data.error || 'Invalid verification code';
            errorDiv.classList.add('show');
        }
    } catch (error) {
        errorDiv.textContent = 'Connection error. Please try again.';
        errorDiv.classList.add('show');
    }
}

async function handleResend2FACode() {
    const errorDiv = document.getElementById('twoFactorError');
    errorDiv.classList.remove('show');
    errorDiv.textContent = '';
    
    if (currentLoginUsername) {
        await send2FACode(currentLoginUsername);
        errorDiv.textContent = 'Verification code resent!';
        errorDiv.classList.add('show');
        errorDiv.style.color = '#10b981';
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    // Simple error notification - you can enhance this with a toast library
    alert('Error: ' + message);
}

function showSuccess(message) {
    // Simple success notification - you can enhance this with a toast library
    alert('Success: ' + message);
}

// Forget Password Functions
function openForgetPasswordModal() {
    const modal = document.getElementById('forgetPasswordModal');
    if (!modal) {
        console.error('forgetPasswordModal not found');
        return;
    }
    
    modal.classList.add('active');
    
    const step1 = document.getElementById('forgetPasswordStep1');
    const step2 = document.getElementById('forgetPasswordStep2');
    const resetUsername = document.getElementById('resetUsername');
    const resetCode = document.getElementById('resetCode');
    const newPasswordReset = document.getElementById('newPasswordReset');
    const confirmPasswordReset = document.getElementById('confirmPasswordReset');
    
    if (step1) step1.style.display = 'block';
    if (step2) step2.style.display = 'none';
    if (resetUsername) resetUsername.value = '';
    if (resetCode) resetCode.value = '';
    if (newPasswordReset) newPasswordReset.value = '';
    if (confirmPasswordReset) confirmPasswordReset.value = '';
    
    clearForgetPasswordMessages();
}

function closeForgetPasswordModal() {
    const modal = document.getElementById('forgetPasswordModal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('forgetPasswordStep1').style.display = 'block';
        document.getElementById('forgetPasswordStep2').style.display = 'none';
        document.getElementById('resetUsername').value = '';
        document.getElementById('resetCode').value = '';
        document.getElementById('newPasswordReset').value = '';
        document.getElementById('confirmPasswordReset').value = '';
        clearForgetPasswordMessages();
    }
}

function clearForgetPasswordMessages() {
    const errorDiv1 = document.getElementById('forgetPasswordError');
    const successDiv1 = document.getElementById('forgetPasswordSuccess');
    const errorDiv2 = document.getElementById('resetPasswordError');
    const successDiv2 = document.getElementById('resetPasswordSuccess');
    
    if (errorDiv1) {
        errorDiv1.textContent = '';
        errorDiv1.classList.remove('show');
    }
    if (successDiv1) {
        successDiv1.textContent = '';
        successDiv1.classList.remove('show');
    }
    if (errorDiv2) {
        errorDiv2.textContent = '';
        errorDiv2.classList.remove('show');
    }
    if (successDiv2) {
        successDiv2.textContent = '';
        successDiv2.classList.remove('show');
    }
}

async function handleSendResetCode() {
    const usernameInput = document.getElementById('resetUsername');
    if (!usernameInput) {
        console.error('resetUsername input not found');
        return;
    }
    
    const username = usernameInput.value.trim();
    const errorDiv = document.getElementById('forgetPasswordError');
    const successDiv = document.getElementById('forgetPasswordSuccess');
    
    clearForgetPasswordMessages();
    
    if (!username) {
        if (errorDiv) {
            errorDiv.textContent = 'Please enter your username';
            errorDiv.classList.add('show');
        }
        return;
    }
    
    try {
        const url = `${API_BASE}/forget_password.php?action=send`;
        console.log('Sending reset code request to:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin', // Include cookies for session
            body: JSON.stringify({ username })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok && response.status !== 400 && response.status !== 500) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok && data.success) {
            if (successDiv) {
                successDiv.textContent = data.message || 'Reset code has been sent to your email.';
                successDiv.classList.add('show');
            }
            
            // Move to step 2
            setTimeout(() => {
                const step1 = document.getElementById('forgetPasswordStep1');
                const step2 = document.getElementById('forgetPasswordStep2');
                if (step1) step1.style.display = 'none';
                if (step2) step2.style.display = 'block';
            }, 1500);
        } else {
            if (errorDiv) {
                errorDiv.textContent = data.error || 'Failed to send reset code';
                errorDiv.classList.add('show');
            }
        }
    } catch (error) {
        console.error('Error sending reset code:', error);
        if (errorDiv) {
            errorDiv.textContent = 'Connection error. Please try again. Error: ' + error.message;
            errorDiv.classList.add('show');
        }
    }
}

async function handleResetPassword() {
    const code = document.getElementById('resetCode').value.trim();
    const newPassword = document.getElementById('newPasswordReset').value;
    const confirmPassword = document.getElementById('confirmPasswordReset').value;
    const errorDiv = document.getElementById('resetPasswordError');
    const successDiv = document.getElementById('resetPasswordSuccess');
    
    clearForgetPasswordMessages();
    
    // Validation
    if (!code || code.length !== 6) {
        errorDiv.textContent = 'Please enter a valid 6-digit code';
        errorDiv.classList.add('show');
        return;
    }
    
    if (!newPassword || newPassword.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters';
        errorDiv.classList.add('show');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.classList.add('show');
        return;
    }
    
    try {
        const url = `${API_BASE}/forget_password.php?action=reset`;
        console.log('Sending reset request to:', url);
        console.log('Code:', code);
        console.log('New password length:', newPassword.length);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin', // Include cookies for session
            body: JSON.stringify({
                code: code,
                new_password: newPassword
            })
        });
        
        console.log('Response status:', response.status);
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error('Server returned non-JSON response: ' + text.substring(0, 100));
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok && data.success) {
            if (successDiv) {
                successDiv.textContent = data.message || 'Password has been reset successfully!';
                successDiv.classList.add('show');
            }
            
            // Close modal and redirect to login after 2 seconds
            setTimeout(() => {
                closeForgetPasswordModal();
                const loginForm = document.getElementById('loginForm');
                if (loginForm) loginForm.reset();
            }, 2000);
        } else {
            if (errorDiv) {
                errorDiv.textContent = data.error || 'Failed to reset password';
                errorDiv.classList.add('show');
            }
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        if (errorDiv) {
            errorDiv.textContent = 'Connection error. Please try again. Error: ' + error.message;
            errorDiv.classList.add('show');
        }
    }
}

async function handleResendResetCode() {
    // Get username from step 1 input (it's still there, just hidden)
    const usernameInput = document.getElementById('resetUsername');
    if (!usernameInput) {
        console.error('resetUsername input not found');
        return;
    }
    
    const username = usernameInput.value.trim();
    const errorDiv = document.getElementById('resetPasswordError');
    const successDiv = document.getElementById('resetPasswordSuccess');
    
    clearForgetPasswordMessages();
    
    if (!username) {
        if (errorDiv) {
            errorDiv.textContent = 'Please go back and enter your username first';
            errorDiv.classList.add('show');
        }
        return;
    }
    
    // Show loading state
    if (errorDiv) {
        errorDiv.textContent = 'Sending reset code...';
        errorDiv.style.color = '#10b981';
        errorDiv.classList.add('show');
    }
    
    // Use the same function to resend
    try {
        await handleSendResetCode();
        if (successDiv) {
            successDiv.textContent = 'Reset code has been resent to your email.';
            successDiv.classList.add('show');
        }
        if (errorDiv) {
            errorDiv.classList.remove('show');
        }
    } catch (error) {
        console.error('Error resending reset code:', error);
        if (errorDiv) {
            errorDiv.textContent = 'Failed to resend code. Please try again.';
            errorDiv.style.color = '#ef4444';
            errorDiv.classList.add('show');
        }
    }
}

// Make functions globally available
window.editGalleryItem = editGalleryItem;
window.deleteGalleryItem = deleteGalleryItem;

