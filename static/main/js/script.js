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

    // ---- Smooth Scroll on Button Click ----
    const buttons = Array.from(document.querySelectorAll('.parallax-content button, .gallery-button'));
    buttons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const nextButton = buttons[index + 1];

            if (nextButton) {
                const offset = 450;
                const elementPosition = nextButton.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
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

// ---- Passport handling"
function handleFileSelect(event) {
    const file = event.target.files[0];
    const fileInfo = document.getElementById('file-info');
    const fileUploadText = document.getElementById('file-upload-text');
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes

    if (file) {
        // Check file size
        if (file.size > maxSize) {
            fileInfo.innerHTML = '<span style="color: #dc2c2c;">File size exceeds 5MB limit</span>';
            event.target.value = ''; // Clear the file input
            fileUploadText.textContent = 'Choose File';
            return;
        }

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            fileInfo.innerHTML = '<span style="color: #dc2c2c;">Invalid file type. Please upload JPG, PNG, or PDF</span>';
            event.target.value = ''; // Clear the file input
            fileUploadText.textContent = 'Choose File';
            return;
        }

        const fileSize = (file.size / 1024).toFixed(2);
        fileUploadText.textContent = file.name;
        fileInfo.innerHTML = `<span style="color: #2c72dc;">✓ ${file.name} (${fileSize} KB)</span>`;
    } else {
        fileUploadText.textContent = 'Choose File';
        fileInfo.innerHTML = '';
    }
}