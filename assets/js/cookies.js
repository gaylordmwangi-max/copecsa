// COPECSA — GDPR Cookie Consent Manager
(function() {
  'use strict';

  var COOKIE_NAME = 'copecsa_cookie_consent';
  var COOKIE_EXPIRY_DAYS = 365;

  // Default cookie preferences
  var defaultPreferences = {
    essential: true,
    analytics: false,
    preferences: false
  };

  // Check if consent already given
  function getConsent() {
    var consent = getCookie(COOKIE_NAME);
    if (consent) {
      try {
        return JSON.parse(consent);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Set cookie
  function setCookie(name, value, days) {
    var expires = '';
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(JSON.stringify(value)) + expires + '; path=/; SameSite=Lax';
  }

  // Get cookie
  function getCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  }

  // Delete cookie
  function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
  }

  // Apply consent preferences
  function applyConsent(preferences) {
    // Essential cookies are always enabled
    // Analytics cookies (e.g., Google Analytics)
    if (preferences.analytics) {
      // Enable analytics
      console.log('[Cookies] Analytics enabled');
    } else {
      // Disable analytics
      console.log('[Cookies] Analytics disabled');
      // Remove Google Analytics cookies if present
      deleteCookie('_ga');
      deleteCookie('_gid');
      deleteCookie('_gat');
    }

    // Preference cookies
    if (preferences.preferences) {
      console.log('[Cookies] Preferences enabled');
    } else {
      console.log('[Cookies] Preferences disabled');
    }
  }

  // Create consent banner HTML
  function createBanner() {
    var consent = getConsent();
    if (consent) {
      applyConsent(consent);
      return; // Already consented
    }

    var banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = '<div class="cookie-banner__inner">' +
      '<div class="cookie-banner__content">' +
        '<h3 class="cookie-banner__title">Cookie Preferences</h3>' +
        '<p class="cookie-banner__text">We use cookies to enhance your experience. You can choose which cookies you allow. Essential cookies are always enabled as they are necessary for the website to function.</p>' +
      '</div>' +
      '<div class="cookie-banner__options">' +
        '<label class="cookie-option">' +
          '<input type="checkbox" checked disabled class="cookie-option__input">' +
          '<span class="cookie-option__label">Essential</span>' +
          '<span class="cookie-option__desc">Required for the website to function</span>' +
        '</label>' +
        '<label class="cookie-option">' +
          '<input type="checkbox" id="cookie-analytics" class="cookie-option__input">' +
          '<span class="cookie-option__label">Analytics</span>' +
          '<span class="cookie-option__desc">Help us understand how visitors use our site</span>' +
        '</label>' +
        '<label class="cookie-option">' +
          '<input type="checkbox" id="cookie-preferences" class="cookie-option__input">' +
          '<span class="cookie-option__label">Preferences</span>' +
          '<span class="cookie-option__desc">Remember your settings and preferences</span>' +
        '</label>' +
      '</div>' +
      '<div class="cookie-banner__actions">' +
        '<button class="btn btn--secondary btn--sm cookie-banner__btn cookie-banner__btn--reject" aria-label="Reject optional cookies">Reject All</button>' +
        '<button class="btn btn--primary btn--sm cookie-banner__btn cookie-banner__btn--save" aria-label="Save cookie preferences">Save Preferences</button>' +
        '<button class="btn btn--primary btn--sm cookie-banner__btn cookie-banner__btn--accept" aria-label="Accept all cookies">Accept All</button>' +
      '</div>' +
      '<a href="privacy.html" class="cookie-banner__link" target="_blank">Privacy Policy</a>' +
    '</div>';

    document.body.appendChild(banner);

    // Event listeners
    var analyticsCheckbox = banner.querySelector('#cookie-analytics');
    var preferencesCheckbox = banner.querySelector('#cookie-preferences');
    var rejectBtn = banner.querySelector('.cookie-banner__btn--reject');
    var saveBtn = banner.querySelector('.cookie-banner__btn--save');
    var acceptBtn = banner.querySelector('.cookie-banner__btn--accept');

    rejectBtn.addEventListener('click', function() {
      saveConsent({ essential: true, analytics: false, preferences: false });
      removeBanner(banner);
    });

    saveBtn.addEventListener('click', function() {
      saveConsent({
        essential: true,
        analytics: analyticsCheckbox.checked,
        preferences: preferencesCheckbox.checked
      });
      removeBanner(banner);
    });

    acceptBtn.addEventListener('click', function() {
      saveConsent({ essential: true, analytics: true, preferences: true });
      removeBanner(banner);
    });

    // Animate in
    setTimeout(function() {
      banner.classList.add('cookie-banner--visible');
    }, 500);
  }

  // Save consent and apply
  function saveConsent(preferences) {
    setCookie(COOKIE_NAME, preferences, COOKIE_EXPIRY_DAYS);
    applyConsent(preferences);
    console.log('[Cookies] Consent saved:', preferences);
  }

  // Remove banner with animation
  function removeBanner(banner) {
    banner.classList.remove('cookie-banner--visible');
    banner.classList.add('cookie-banner--hiding');
    setTimeout(function() {
      banner.remove();
    }, 400);
  }

  // Create cookie settings link in footer
  function addSettingsLink() {
    var footerLinks = document.querySelectorAll('.footer__links');
    if (footerLinks.length > 0) {
      var lastFooter = footerLinks[footerLinks.length - 1];
      var link = document.createElement('a');
      link.href = '#';
      link.className = 'footer__link';
      link.textContent = 'Cookie Settings';
      link.addEventListener('click', function(e) {
        e.preventDefault();
        createBanner();
      });
      lastFooter.appendChild(link);
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    createBanner();
    addSettingsLink();
  });

  // Expose for external use
  window.CopeCSACookies = {
    getConsent: getConsent,
    showSettings: function() {
      createBanner();
    },
    revokeConsent: function() {
      deleteCookie(COOKIE_NAME);
      location.reload();
    }
  };

})();