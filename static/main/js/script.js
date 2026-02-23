// Alles binnen DOMContentLoaded zodat de DOM beschikbaar is
document.addEventListener('DOMContentLoaded', function() {

    // ---- Parallax Scrolling Effect ----
    const parallax = document.querySelector('.parallax-bg');
    const parallaxContent = document.querySelector('.parallax-content');

    window.addEventListener('scroll', function() {
        const scrollPosition = window.pageYOffset;

        if (parallax) {
            parallax.style.transform = 'translateY(' + scrollPosition * 0.6 + 'px)';
        }

        if (parallaxContent) {
            parallaxContent.style.transform = 'translate(-50%, -50%) translateY(' + scrollPosition * -0.8 + 'px)';
        }
    });

    // ---- Smooth Scroll to Bottom on Button Click ----
    const buttons = document.querySelectorAll('.parallax-content button, .gallery-button');
    buttons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
    });

    // ---- Logout Button Handler ----
    const logoutBtn = document.querySelector('.profile-button-row .logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            const logoutForm = document.getElementById('logout-form');
            if (logoutForm) {
                logoutForm.submit();
            }
        });
    }

    // ---- Intersection Observer voor .hiw-item ----
    const hiwItems = document.querySelectorAll(".hiw-item");
    if (hiwItems.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                }
            });
        }, {});
        hiwItems.forEach(el => observer.observe(el));
    }

});

// ---- Show/Hide Password Function ----
// Staat buiten DOMContentLoaded omdat dit via onClick kan worden aangeroepen
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input || !button) return;

    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = 'HIDE';
    } else {
        input.type = 'password';
        button.textContent = 'SHOW';
    }
}

// ---- HiW Gallery Scroll Buttons ----
const gallery = document.getElementById('gallery');
const btnLeft = document.getElementById('chevron-btn-left');
const btnRight = document.getElementById('chevron-btn-right');

if (gallery) {
    const scrollAmount = 400; // pixels per klik

    if (btnLeft) {
        btnLeft.addEventListener('click', () => {
            gallery.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }

    if (btnRight) {
        btnRight.addEventListener('click', () => {
            gallery.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }
}