// ============================================================================
// TYPE DEFINITIONS (for IDE autocomplete)
// ============================================================================

/**
 * @typedef {Object} google
 * @property {Object} maps
 */

/**
 * @typedef {Object} google.maps.Map
 * @typedef {Object} google.maps.Marker
 * @typedef {Object} google.maps.Geocoder
 */

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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

function handleFileSelect(event) {
    const file = event.target.files[0];
    const fileInfo = document.getElementById('file-info');
    const fileUploadText = document.getElementById('file-upload-text');
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!file) {
        fileUploadText.textContent = 'Choose File';
        fileInfo.innerHTML = '';
        return;
    }

    // Validate file size
    if (file.size > maxSize) {
        fileInfo.innerHTML = '<span style="color: #dc2c2c;">File size exceeds 5MB limit</span>';
        event.target.value = '';
        fileUploadText.textContent = 'Choose File';
        return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
        fileInfo.innerHTML = '<span style="color: #dc2c2c;">Invalid file type. Please upload JPG, PNG, or PDF</span>';
        event.target.value = '';
        fileUploadText.textContent = 'Choose File';
        return;
    }

    // File is valid
    const fileSize = (file.size / 1024).toFixed(2);
    fileUploadText.textContent = file.name;
    fileInfo.innerHTML = `<span style="color: #2c72dc;">✓ ${file.name} (${fileSize} KB)</span>`;
}

// ============================================================================
// MODAL HANDLERS
// ============================================================================

function initCreateTicketModal() {
    const modal = document.getElementById("create-ticket-modal");
    const btn = document.getElementById("createTicketModal");
    const closeBtn = modal?.querySelector(".close");
    const cancelBtn = document.getElementById("cancelBtn");

    if (!modal || !btn) return;

    const openModal = () => {
        modal.style.display = "flex";
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.style.display = "none";
        document.body.style.overflow = 'auto';
    };

    // Event listeners
    btn.onclick = (e) => {
        e.preventDefault();
        openModal();
    };

    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }

    if (cancelBtn) {
        cancelBtn.onclick = closeModal;
    }

    // Close on outside click
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
}

// Add this to your script.js - replace the initTicketModal function

function initTicketModal() {
    const modal = document.getElementById("ticket-modal");

    if (!modal) {
        console.log('Ticket modal not found - skipping initialization');
        return;
    }

    const closeBtn = modal.querySelector(".close");
    const modalTitle = document.getElementById("modal-ticket-title");
    const modalLocation = document.getElementById("modal-ticket-location");
    const modalDates = document.getElementById("modal-ticket-dates");
    const modalQR = document.getElementById("modal-qr-code");
    const qrContainer = document.querySelector(".ticket-modal-qr");
    const cancelBtn = document.getElementById("cancelBtn");
    const deleteBtn = document.querySelector(".delete-btn");  // ← Get delete button

    // Track current ticket ID
    let currentTicketId = null;  // ← Store ticket ID

    const closeModal = () => {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        currentTicketId = null;
    };

    if (cancelBtn) {
        cancelBtn.onclick = closeModal;
    }

    // Attach click handlers to all ticket cards
    document.querySelectorAll(".ticket").forEach((ticket) => {
        ticket.addEventListener("click", (e) => {
            e.preventDefault();

            // Extract ticket data - INCLUDING ID
            const ticketId = ticket.getAttribute("data-id");  // ← Get ID
            const title = ticket.getAttribute("data-title");
            const city = ticket.getAttribute("data-city");
            const country = ticket.getAttribute("data-country");
            const checkin = ticket.getAttribute("data-checkin");
            const checkout = ticket.getAttribute("data-checkout");
            const qrCode = ticket.getAttribute("data-qr");

            console.log('Opening ticket:', title, 'ID:', ticketId);

            // Store the ticket ID
            currentTicketId = ticketId;  // ← Save it

            // Populate modal content
            if (modalTitle) modalTitle.textContent = title;
            if (modalLocation) modalLocation.textContent = `${city}, ${country}`;
            if (modalDates) modalDates.textContent = `${checkin} - ${checkout}`;

            // Handle QR code
            if (modalQR && qrContainer) {
                if (qrCode && qrCode.startsWith('data:image/png;base64,')) {
                    modalQR.src = qrCode;
                    qrContainer.style.display = 'flex';
                    console.log('✓ QR code loaded');
                } else {
                    qrContainer.style.display = 'none';
                    console.log('✗ No QR code available');
                }
            }

            // Show modal
            modal.style.display = "flex";
            document.body.style.overflow = "hidden";

            // Update Google Map after modal is visible
            setTimeout(() => {
                if (typeof window.geocodeHotel === 'function' && window.map) {
                    google.maps.event.trigger(window.map, 'resize');
                    window.geocodeHotel(title, city, country);
                    console.log('✓ Map updated for:', title);
                } else {
                    console.log('⏳ Waiting for Google Maps to load...');
                }
            }, 100);
        });
    });

    // Close button handler
    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }

    // Close on outside click
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });

    // Delete button handler - THE IMPORTANT PART
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            if (!currentTicketId) {
                alert('No ticket selected');
                return;
            }

            if (confirm('Are you sure you want to delete this ticket?')) {
                // Create form
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/tickets/delete/';

                // Add CSRF token
                const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrfmiddlewaretoken';
                csrfInput.value = csrfToken;
                form.appendChild(csrfInput);

                // Add ticket ID
                const idInput = document.createElement('input');
                idInput.type = 'hidden';
                idInput.name = 'ticket_id';
                idInput.value = currentTicketId;
                form.appendChild(idInput);

                // Submit
                document.body.appendChild(form);
                form.submit();
            }
        };
    }
}


// ============================================================================
// HOMEPAGE EFFECTS
// ============================================================================

function initParallaxEffects() {
    const parallax = document.querySelector('.parallax-bg');
    const parallaxContent = document.querySelector('.parallax-content');

    if (!parallax && !parallaxContent) return;

    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;

        if (parallax) {
            parallax.style.transform = `translateY(${scrollPosition * 0.6}px)`;
        }

        if (parallaxContent) {
            parallaxContent.style.transform = `translate(-50%, -50%) translateY(${scrollPosition * -0.8}px)`;
        }
    });
}

function initSmoothScroll() {
    const buttons = Array.from(
        document.querySelectorAll('.parallax-content button, .gallery-button')
    ).filter(Boolean);

    buttons.forEach((btn, index) => {
        if (!btn) return;

        btn.addEventListener('click', () => {
            const nextButton = buttons[index + 1];

            if (nextButton && nextButton.getBoundingClientRect) {
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
}

function initHowItWorksAnimation() {
    const hiwItems = document.querySelectorAll(".hiw-item");

    if (hiwItems.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    });

    hiwItems.forEach(el => observer.observe(el));
}

function initGalleryScrollButtons() {
    const gallery = document.getElementById('gallery');
    const btnLeft = document.getElementById('chevron-btn-left');
    const btnRight = document.getElementById('chevron-btn-right');

    if (!gallery) return;

    const scrollAmount = 400;

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

// ============================================================================
// PROFILE PAGE
// ============================================================================

function initLogoutButton() {
    const logoutBtn = document.querySelector('.profile-button-row .logout-btn');

    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', () => {
        const logoutForm = document.getElementById('logout-form');
        if (logoutForm) {
            logoutForm.submit();
        }
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Homepage features
    initParallaxEffects();
    initSmoothScroll();
    initHowItWorksAnimation();
    initGalleryScrollButtons();

    // Profile features
    initLogoutButton();

    // Modal features
    initCreateTicketModal();
    initTicketModal();

    console.log('✓ All scripts initialized');
});