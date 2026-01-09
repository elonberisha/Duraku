// Cookie Banner Management - GDPR Compliant
(function() {
    'use strict';

    const COOKIE_CONSENT_KEY = 'cookie_consent';
    const COOKIE_CONSENT_DATE_KEY = 'cookie_consent_date';
    
    // Check if user has already given consent
    function hasConsent() {
        return localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';
    }
    
    // Get consent date
    function getConsentDate() {
        return localStorage.getItem(COOKIE_CONSENT_DATE_KEY);
    }
    
    // Save consent
    function saveConsent(accepted) {
        localStorage.setItem(COOKIE_CONSENT_KEY, accepted ? 'accepted' : 'rejected');
        localStorage.setItem(COOKIE_CONSENT_DATE_KEY, new Date().toISOString());
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
    
    // Create cookie banner HTML
    function createCookieBanner() {
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
        // Double check consent before showing
        if (hasConsent()) {
            return; // Don't show if already consented
        }
        
        // Check if banner already exists
        const existingBanner = document.getElementById('cookieBanner');
        if (existingBanner) {
            return; // Banner already exists, don't create another one
        }
        
        const banner = createCookieBanner();
        document.body.appendChild(banner);
        
        // Add event listeners
        document.getElementById('cookieAccept').addEventListener('click', function() {
            acceptCookies();
        });
        
        document.getElementById('cookieReject').addEventListener('click', function() {
            rejectCookies();
        });
        
        document.getElementById('cookieSettings').addEventListener('click', function() {
            showCookieSettings();
        });
        
        // Animate in
        setTimeout(() => {
            banner.classList.add('cookie-banner-show');
        }, 100);
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
    
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
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
    });
    
    // Export functions for external use
    window.cookieBanner = {
        show: showCookieBanner,
        hide: hideCookieBanner,
        hasConsent: hasConsent,
        getConsentDate: getConsentDate
    };
})();

