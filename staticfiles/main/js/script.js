// Parallax Scrolling Effect
window.addEventListener('scroll', function() {
    const parallax = document.querySelector('.parallax-bg');
    const parallaxContent = document.querySelector('.parallax-content');
    let scrollPosition = window.pageYOffset;
    
    if (parallax) {
        parallax.style.transform = 'translateY(' + scrollPosition * 0.6 + 'px)';
    }
    
    if (parallaxContent) {
        parallaxContent.style.transform = 'translate(-50%, -50%) translateY(' + scrollPosition * -0.8 + 'px)';
    }
});

// Smooth Scroll to Bottom on Button Click
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.parallax-content button, .gallery-button');
    
    buttons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
    });
});

// Show/Hide Password Function
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = 'HIDE';
    } else {
        input.type = 'password';
        button.textContent = 'SHOW';
    }
}

// Logout Button Handler
document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.querySelector('.profile-button-row .logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      document.getElementById('logout-form').submit();
    });
  }
});

// Scroll jacking HIW Gallery
document.addEventListener('DOMContentLoaded', function() {
  const gallery = document.getElementById('gallery');
  const scrollTrack = document.querySelector('.scroll-track');

  if (!gallery || !scrollTrack) return;

  function calculateMaxScroll() {
    const galleryWidth = gallery.scrollWidth;
    const viewportWidth = gallery.parentElement.offsetWidth;
    return galleryWidth - viewportWidth;
  }

  function handleScrollGallery() {
    const trackRect = scrollTrack.getBoundingClientRect();
    const trackTop = trackRect.top;
    const trackHeight = trackRect.height;
    const viewportHeight = window.innerHeight;
    
    let progress = 0;
    
    if (trackTop <= 0 && trackTop > -trackHeight + viewportHeight) {
      progress = Math.abs(trackTop) / (trackHeight - viewportHeight);
      progress = Math.max(0, Math.min(1, progress));
    } else if (trackTop <= -trackHeight + viewportHeight) {
      progress = 1;
    }
    
    const maxScroll = calculateMaxScroll();
    const scrollAmount = progress * maxScroll;
    
    // Direct assignment without smooth interpolation to avoid conflicts
    gallery.style.transform = `translateX(-${scrollAmount}px)`;
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScrollGallery();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', handleScrollGallery);
  handleScrollGallery();
});