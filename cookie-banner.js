// Cookie Banner Management - GDPR Compliant
(function() {
    'use strict';

    // Debug: Log that script is loaded
    if (typeof console !== 'undefined' && console.log) {
        console.log('Cookie banner script loaded');
    }

    const COOKIE_CONSENT_KEY = 'cookie_consent';
    const COOKIE_CONSENT_DATE_KEY = 'cookie_consent_date';
    
    // Check if user has already given consent
    function hasConsent() {
        try {
            return localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';
        } catch (e) {
            // localStorage might not be available
            return false;
        }
    }
    
    // Get consent date
    function getConsentDate() {
        return localStorage.getItem(COOKIE_CONSENT_DATE_KEY);
    }
    
    // Save consent
    function saveConsent(accepted) {
        try {
            localStorage.setItem(COOKIE_CONSENT_KEY, accepted ? 'accepted' : 'rejected');
            localStorage.setItem(COOKIE_CONSENT_DATE_KEY, new Date().toISOString());
            return true;
        } catch (e) {
            console.error('Failed to save cookie consent:', e);
            return false;
        }
    }
    
    // Initialize Google Tag Manager only if consent is given
    function initGTM() {
        if (hasConsent()) {
            // Initialize GTM script
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KVL43RRL');
            
            // Add noscript iframe for GTM
            const noscript = document.createElement('noscript');
            const iframe = document.createElement('iframe');
            iframe.src = 'https://www.googletagmanager.com/ns.html?id=GTM-KVL43RRL';
            iframe.height = '0';
            iframe.width = '0';
            iframe.style.display = 'none';
            iframe.style.visibility = 'hidden';
            noscript.appendChild(iframe);
            document.body.insertBefore(noscript, document.body.firstChild);
        }
    }
    
    // Add inline styles for cookie banner (fallback if CSS not loaded)
    function addCookieBannerStyles() {
        // Check if styles already added
        if (document.getElementById('cookie-banner-inline-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'cookie-banner-inline-styles';
        style.textContent = `
            .cookie-banner {
                position: fixed !important;
                bottom: 0 !important;
                left: 0 !important;
                right: 0 !important;
                background: #2d2d2d !important;
                border-top: 3px solid #f97316 !important;
                padding: 1.5rem !important;
                z-index: 10000 !important;
                box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5) !important;
                transform: translateY(100%) !important;
                transition: transform 0.3s ease-in-out !important;
                max-width: 100% !important;
                display: block !important;
            }
            .cookie-banner.hidden {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                transform: translateY(100%) !important;
            }
            .cookie-banner-show {
                transform: translateY(0) !important;
            }
            .cookie-banner-content {
                max-width: 1200px !important;
                margin: 0 auto !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 1.5rem !important;
                align-items: flex-start !important;
            }
            .cookie-banner-text {
                flex: 1 !important;
                color: #e5e5e5 !important;
            }
            .cookie-banner-text h3 {
                color: #f97316 !important;
                font-size: 1.3rem !important;
                margin-bottom: 0.75rem !important;
                font-weight: 600 !important;
            }
            .cookie-banner-text p {
                margin-bottom: 0.5rem !important;
                line-height: 1.6 !important;
                font-size: 0.95rem !important;
            }
            .cookie-banner-links {
                margin-top: 0.75rem !important;
            }
            .cookie-banner-links a {
                color: #f97316 !important;
                text-decoration: none !important;
                transition: color 0.3s ease !important;
            }
            .cookie-banner-links a:hover {
                color: #fb923c !important;
                text-decoration: underline !important;
            }
            .cookie-banner-buttons {
                display: flex !important;
                gap: 1rem !important;
                flex-wrap: wrap !important;
                width: 100% !important;
            }
            .cookie-btn {
                padding: 0.75rem 1.5rem !important;
                border: none !important;
                border-radius: 8px !important;
                font-size: 1rem !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
                font-family: 'Poppins', 'Inter', sans-serif !important;
                flex: 1 !important;
                min-width: 140px !important;
            }
            .cookie-btn-accept {
                background: #f97316 !important;
                color: #ffffff !important;
            }
            .cookie-btn-accept:hover {
                background: #fb923c !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4) !important;
            }
            .cookie-btn-reject {
                background: transparent !important;
                color: #e5e5e5 !important;
                border: 2px solid #a0a0a0 !important;
            }
            .cookie-btn-reject:hover {
                background: #3a3a3a !important;
                border-color: #e5e5e5 !important;
                color: #ffffff !important;
            }
            .cookie-btn-settings {
                background: #3a3a3a !important;
                color: #e5e5e5 !important;
                border: 2px solid #a0a0a0 !important;
            }
            .cookie-btn-settings:hover {
                background: #2d2d2d !important;
                border-color: #f97316 !important;
                color: #f97316 !important;
            }
            @media (min-width: 768px) {
                .cookie-banner-content {
                    flex-direction: row !important;
                    align-items: center !important;
                }
                .cookie-banner-buttons {
                    flex: 0 0 auto !important;
                    width: auto !important;
                }
                .cookie-btn {
                    flex: 0 0 auto !important;
                }
            }
            @media (max-width: 767px) {
                .cookie-banner {
                    padding: 1rem !important;
                }
                .cookie-banner-text h3 {
                    font-size: 1.1rem !important;
                }
                .cookie-banner-text p {
                    font-size: 0.9rem !important;
                }
                .cookie-btn {
                    width: 100% !important;
                    min-width: 100% !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create cookie banner HTML
    function createCookieBanner() {
        // Add inline styles first (fallback)
        addCookieBannerStyles();
        
        const banner = document.createElement('div');
        banner.id = 'cookieBanner';
        banner.className = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie-Einstellungen');
        
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-text">
                    <h3 data-i18n="cookies.title">Cookie-Einstellungen</h3>
                    <p data-i18n="cookies.message">
                        Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. 
                        Einige Cookies sind für den Betrieb der Website notwendig, während andere uns helfen, 
                        diese Website und die Nutzererfahrung zu verbessern (Tracking-Cookies). 
                        Sie können selbst entscheiden, ob Sie die Cookies zulassen möchten.
                    </p>
                    <p class="cookie-banner-links">
                        <a href="datenschutz.html" data-i18n="cookies.privacyLink">Datenschutzerklärung</a> | 
                        <a href="impressum.html" data-i18n="cookies.imprintLink">Impressum</a>
                    </p>
                </div>
                <div class="cookie-banner-buttons">
                    <button id="cookieAccept" class="cookie-btn cookie-btn-accept" data-i18n="cookies.accept">
                        Alle akzeptieren
                    </button>
                    <button id="cookieReject" class="cookie-btn cookie-btn-reject" data-i18n="cookies.reject">
                        Ablehnen
                    </button>
                    <button id="cookieSettings" class="cookie-btn cookie-btn-settings" data-i18n="cookies.settings">
                        Einstellungen
                    </button>
                </div>
            </div>
        `;
        
        return banner;
    }
    
    // Show cookie banner
    function showCookieBanner() {
        try {
            // Double check consent before showing
            if (hasConsent()) {
                return; // Don't show if already consented
            }
            
            // Check if banner already exists
            const existingBanner = document.getElementById('cookieBanner');
            if (existingBanner) {
                return; // Banner already exists, don't create another one
            }
            
            // Make sure body exists
            if (!document.body) {
                console.warn('Document body not ready, retrying...');
                setTimeout(showCookieBanner, 100);
                return;
            }
            
            const banner = createCookieBanner();
            document.body.appendChild(banner);
            
            // Wait a bit for DOM to be ready
            setTimeout(function() {
                // Add event listeners
                const acceptBtn = document.getElementById('cookieAccept');
                const rejectBtn = document.getElementById('cookieReject');
                const settingsBtn = document.getElementById('cookieSettings');
                
                if (acceptBtn) {
                    acceptBtn.addEventListener('click', function() {
                        acceptCookies();
                    });
                }
                
                if (rejectBtn) {
                    rejectBtn.addEventListener('click', function() {
                        rejectCookies();
                    });
                }
                
                if (settingsBtn) {
                    settingsBtn.addEventListener('click', function() {
                        showCookieSettings();
                    });
                }
                
                // Animate in
                banner.classList.add('cookie-banner-show');
            }, 50);
        } catch (e) {
            console.error('Error showing cookie banner:', e);
        }
    }
    
    // Accept cookies
    function acceptCookies() {
        // Save consent first
        saveConsent(true);
        
        // Hide banner immediately
        hideCookieBanner();
        
        // Verify consent was saved
        if (!hasConsent()) {
            console.error('Failed to save cookie consent');
            return;
        }
        
        // Initialize GTM
        initGTM();
        
        // Update translations
        if (typeof updatePageContent === 'function') {
            updatePageContent();
        }
        
        // Reload to properly initialize GTM in head
        // Small delay to ensure localStorage is saved
        setTimeout(() => {
            location.reload();
        }, 200);
    }
    
    // Reject cookies
    function rejectCookies() {
        saveConsent(false);
        hideCookieBanner();
    }
    
    // Show cookie settings (for future implementation)
    function showCookieSettings() {
        // For now, just accept all
        // In future, you can add granular cookie settings here
        acceptCookies();
    }
    
    // Hide cookie banner
    function hideCookieBanner() {
        const banner = document.getElementById('cookieBanner');
        if (banner) {
            // Add hidden class immediately
            banner.classList.add('hidden');
            banner.classList.remove('cookie-banner-show');
            // Remove from DOM after animation
            setTimeout(() => {
                if (banner && banner.parentNode) {
                    banner.remove();
                }
            }, 300);
        }
    }
    
    // Check consent immediately (before DOM loads) to prevent flash
    (function() {
        try {
            const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
            if (consent === 'accepted' || consent === 'rejected') {
                // Consent already given, hide banner immediately with CSS
                const style = document.createElement('style');
                style.id = 'cookie-banner-hide-style';
                style.textContent = '#cookieBanner { display: none !important; visibility: hidden !important; opacity: 0 !important; transform: translateY(100%) !important; }';
                if (document.head) {
                    document.head.appendChild(style);
                } else {
                    // If head not ready, wait for it
                    document.addEventListener('DOMContentLoaded', function() {
                        if (!document.getElementById('cookie-banner-hide-style')) {
                            document.head.appendChild(style);
                        }
                    });
                }
            }
        } catch (e) {
            // localStorage might not be available, continue normally
            console.warn('localStorage not available:', e);
        }
    })();
    
    // Initialize cookie banner
    function initializeCookieBanner() {
        try {
            // First, check if banner already exists (shouldn't happen, but safety check)
            const existingBanner = document.getElementById('cookieBanner');
            if (existingBanner) {
                // Check if consent was given before removing
                if (hasConsent()) {
                    existingBanner.remove();
                    return;
                }
            }
            
            // Check if consent was given
            const consent = hasConsent();
            
            if (!consent) {
                // Only show banner if no consent was given
                // Double check that banner doesn't exist
                if (!document.getElementById('cookieBanner')) {
                    showCookieBanner();
                }
            } else {
                // If consent was given, initialize GTM and make sure banner is hidden
                initGTM();
                // Remove any existing banner
                if (existingBanner) {
                    existingBanner.remove();
                }
            }
            
            // Update translations if i18n is available
            if (typeof updatePageContent === 'function') {
                updatePageContent();
            }
        } catch (e) {
            console.error('Error initializing cookie banner:', e);
            // Fallback: try to show banner anyway if there's an error
            try {
                if (!document.getElementById('cookieBanner') && !hasConsent()) {
                    showCookieBanner();
                }
            } catch (e2) {
                console.error('Failed to show cookie banner:', e2);
            }
        }
    }
    
    // Initialize on page load - multiple methods for compatibility
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCookieBanner);
    } else {
        // DOM already loaded, run immediately
        initializeCookieBanner();
    }
    
    // Fallback: also try after a short delay in case DOMContentLoaded didn't fire
    setTimeout(function() {
        if (!document.getElementById('cookieBanner') && !hasConsent()) {
            try {
                initializeCookieBanner();
            } catch (e) {
                console.error('Fallback cookie banner initialization failed:', e);
            }
        }
    }, 1000);
    
    // Export functions for external use
    window.cookieBanner = {
        show: showCookieBanner,
        hide: hideCookieBanner,
        hasConsent: hasConsent,
        getConsentDate: getConsentDate,
        init: initializeCookieBanner
    };
    
    // Make sure initialization runs even if DOMContentLoaded already fired
    // This is a safety net for production environments
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initializeCookieBanner, 100);
    }
})();

