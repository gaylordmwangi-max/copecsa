// COPECSA — Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Mobile Navigation Toggle
  const hamburger = document.querySelector('.header__hamburger');
  const mobileNav = document.querySelector('.header__mobile-nav');
  const body = document.body;

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function() {
      this.classList.toggle('active');
      mobileNav.classList.toggle('active');
      body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    const mobileLinks = mobileNav.querySelectorAll('.header__mobile-nav-link');
    mobileLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        body.style.overflow = '';
      });
    });
  }

  // Header scroll effect
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        header.style.backgroundColor = 'rgba(15, 26, 61, 0.98)';
      } else {
        header.style.backgroundColor = 'rgba(15, 26, 61, 0.95)';
      }
    });
  }

  // Active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.header__nav-link, .header__mobile-nav-link');
  navLinks.forEach(function(link) {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('header__nav-link--active');
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
