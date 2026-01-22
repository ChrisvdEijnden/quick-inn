// Cookie utility functions
const CookieManager = {
    set: function(name, value, days = 365) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
    },
    
    get: function(name) {
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length);
            }
        }
        return null;
    },
    
    delete: function(name) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    },
    
    exists: function(name) {
        return this.get(name) !== null;
    }
};

// Cookie Banner Logic
document.addEventListener('DOMContentLoaded', function() {
    const banner = document.getElementById('cookie-banner');
    const modal = document.getElementById('cookie-modal');
    
    // Check if user has already consented
    if (CookieManager.exists('cookie_consent')) {
        banner.style.display = 'none';
    } else {
        banner.style.display = 'flex';
    }
    
    // Accept all cookies
    document.getElementById('accept-cookies')?.addEventListener('click', function() {
        CookieManager.set('cookie_consent', 'all', 365);
        CookieManager.set('analytics_cookies', 'true', 365);
        CookieManager.set('marketing_cookies', 'true', 365);
        banner.style.display = 'none';
        console.log('All cookies accepted');
    });
    
    // Decline all cookies (except essential)
    document.getElementById('decline-cookies')?.addEventListener('click', function() {
        CookieManager.set('cookie_consent', 'essential', 365);
        CookieManager.set('analytics_cookies', 'false', 365);
        CookieManager.set('marketing_cookies', 'false', 365);
        banner.style.display = 'none';
        console.log('Only essential cookies accepted');
    });
    
    // Open customize modal
    document.getElementById('customize-cookies')?.addEventListener('click', function() {
        modal.style.display = 'flex';
        
        // Load current preferences if they exist
        if (CookieManager.get('analytics_cookies') === 'true') {
            document.getElementById('analytics-cookies').checked = true;
        }
        if (CookieManager.get('marketing_cookies') === 'true') {
            document.getElementById('marketing-cookies').checked = true;
        }
    });
    
    // Save custom preferences
    document.getElementById('save-preferences')?.addEventListener('click', function() {
        const analytics = document.getElementById('analytics-cookies').checked;
        const marketing = document.getElementById('marketing-cookies').checked;
        
        CookieManager.set('cookie_consent', 'custom', 365);
        CookieManager.set('analytics_cookies', analytics ? 'true' : 'false', 365);
        CookieManager.set('marketing_cookies', marketing ? 'true' : 'false', 365);
        
        banner.style.display = 'none';
        modal.style.display = 'none';
        console.log('Custom preferences saved');
    });
    
    // Close modal
    document.getElementById('close-modal')?.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    modal?.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});