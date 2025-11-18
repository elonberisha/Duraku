/**
 * Contact Information API Integration
 * Fetches contact information from PHP API and displays it dynamically
 */

const CONTACT_API = 'api/contact_info.php';

// Store contact data globally
let contactData = null;

// Initialize contact information from API
async function initContactInfo() {
    try {
        const response = await fetch(`${CONTACT_API}?action=get`);
        const data = await response.json();
        
        if (data.success) {
            contactData = data.data;
            updateContactInfo();
        } else {
            console.error('Contact API returned error:', data.error);
            // Use default values if API fails
            useDefaultContactInfo();
        }
    } catch (error) {
        console.error('Failed to load contact information from API:', error);
        // Use default values if API fails
        useDefaultContactInfo();
    }
}

// Update contact information in the page
function updateContactInfo() {
    if (!contactData) return;
    
    // Update phone - find all phone links and update them
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
        link.href = `tel:${contactData.phone_link}`;
        // Only update text if it's a phone number display
        const parent = link.closest('.contact-item-sharp');
        if (parent) {
            const phoneDisplay = parent.querySelector('a[href^="tel:"]');
            if (phoneDisplay && (phoneDisplay.textContent.includes('0174') || phoneDisplay.textContent.includes('210') || phoneDisplay.textContent.includes('/'))) {
                phoneDisplay.textContent = contactData.phone;
            }
        }
    });
    
    // Update email - find all email links and update them
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.href = `mailto:${contactData.email}`;
        // Only update text if it's an email display
        const parent = link.closest('.contact-item-sharp');
        if (parent) {
            const emailDisplay = parent.querySelector('a[href^="mailto:"]');
            if (emailDisplay && (emailDisplay.textContent.includes('@') || emailDisplay.textContent.includes('duraku'))) {
                emailDisplay.textContent = contactData.email;
            }
        }
    });
    
    // Update address - find address paragraphs
    const addressElements = document.querySelectorAll('.contact-item-sharp p');
    addressElements.forEach(element => {
        const parent = element.closest('.contact-item-sharp');
        if (parent) {
            const icon = parent.querySelector('.fa-map-marker-alt');
            if (icon) {
                element.innerHTML = `${contactData.address}<br>${contactData.postal_code} ${contactData.city}`;
            }
        }
    });
    
    // Update WhatsApp links
    const whatsappLinks = document.querySelectorAll('a[href^="https://wa.me/"], a.social-link.whatsapp');
    whatsappLinks.forEach(link => {
        if (contactData.whatsapp) {
            link.href = `https://wa.me/${contactData.whatsapp}`;
        }
    });
    
    // Update Viber links
    const viberLinks = document.querySelectorAll('a[href^="viber://"], a.social-link.viber');
    viberLinks.forEach(link => {
        if (contactData.viber) {
            link.href = `viber://chat?number=${contactData.viber}`;
        }
    });
    
    // Update Facebook links
    const facebookLinks = document.querySelectorAll('a.social-link.facebook');
    facebookLinks.forEach(link => {
        if (contactData.facebook) {
            link.href = contactData.facebook;
        }
    });
    
    // Update Instagram links
    const instagramLinks = document.querySelectorAll('a.social-link.instagram');
    instagramLinks.forEach(link => {
        if (contactData.instagram) {
            link.href = contactData.instagram;
        }
    });
}

// Use default contact information if API fails
function useDefaultContactInfo() {
    contactData = {
        phone: '0174/210 97 35',
        phone_link: '+491742109735',
        email: 'duraku_xhevdet@icloud.com',
        address: 'Zandter Str. 14',
        postal_code: '85095',
        city: 'Denkendorf',
        country: 'Germany',
        whatsapp: '491742109735',
        viber: '+491742109735',
        facebook: 'https://www.facebook.com',
        instagram: 'https://www.instagram.com'
    };
    updateContactInfo();
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactInfo);
} else {
    initContactInfo();
}

