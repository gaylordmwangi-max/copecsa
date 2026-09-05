// COPECSA — Main JavaScript (Upgraded)
document.addEventListener('DOMContentLoaded', function() {

  // ========================================
  // SCROLL PROGRESS INDICATOR
  // ========================================
  var progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  function updateScrollProgress() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }

  // ========================================
  // MOBILE NAVIGATION TOGGLE
  // ========================================
  var hamburger = document.querySelector('.header__hamburger');
  var mobileNav = document.querySelector('.header__mobile-nav');
  var body = document.body;

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function() {
      var isOpen = this.classList.toggle('active');
      mobileNav.classList.toggle('active');
      body.style.overflow = isOpen ? 'hidden' : '';
      this.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile nav on link click
    var mobileLinks = mobileNav.querySelectorAll('.header__mobile-nav-link');
    mobileLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ========================================
  // HEADER SCROLL EFFECT
  // ========================================
  var header = document.querySelector('.header');
  function updateHeader() {
    if (header) {
      header.style.backgroundColor = window.scrollY > 50
        ? 'rgba(15, 26, 61, 0.98)'
        : 'rgba(15, 26, 61, 0.92)';
    }
  }

  // ========================================
  // SCROLL-TRIGGERED FADE-IN (IntersectionObserver)
  // ========================================
  var fadeElements = document.querySelectorAll('.fade-in');
  var fadeObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  fadeElements.forEach(function(el) { fadeObserver.observe(el); });

  // ========================================
  // COUNT-UP ANIMATION FOR STATS
  // ========================================
  var statNumbers = document.querySelectorAll('.stat__number[data-count]');
  var countObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(function(el) { countObserver.observe(el); });

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1800;
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  // ========================================
  // ACTIVE NAV LINK
  // ========================================
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var navLinks = document.querySelectorAll('.header__nav-link, .header__mobile-nav-link');
  navLinks.forEach(function(link) {
    var href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('header__nav-link--active');
    }
  });

  // ========================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ========================================
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ========================================
  // SCROLL EVENT LISTENER (throttled)
  // ========================================
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        updateScrollProgress();
        updateHeader();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Initial calls
  updateScrollProgress();
  updateHeader();
});
