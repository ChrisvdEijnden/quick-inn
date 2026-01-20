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

function handleGoogleLogin() {
    window.location.href = "{% url 'social:begin' 'google-oauth2' %}";
}

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

const gallery = document.getElementById('gallery'); // or querySelector('.hiw-gallery')
const scrollTrack = document.querySelector('.scroll-track');

function calculateMaxScroll() {
  const galleryWidth = gallery.scrollWidth;
  const viewportWidth = gallery.parentElement.offsetWidth;
  return galleryWidth - viewportWidth;
}

function handleScroll() {
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
  gallery.style.transform = `translateX(-${scrollAmount}px)`;
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      handleScroll();
      ticking = false;
    });
    ticking = true;
  }
});

window.addEventListener('resize', handleScroll);
handleScroll();
