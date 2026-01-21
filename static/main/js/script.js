document.addEventListener("DOMContentLoaded", () => {
  console.log("script.js loaded");

// Parallax effect
  window.addEventListener("scroll", () => {
    const parallax = document.querySelector(".parallax-bg");
    const parallaxContent = document.querySelector(".parallax-content");
    const scrollY = window.pageYOffset;

    if (parallax) {
      parallax.style.transform = `translateY(${scrollY * 0.6}px)`;
    }

    if (parallaxContent) {
      parallaxContent.style.transform =
        `translate(-50%, -50%) translateY(${scrollY * -0.8}px)`;
    }
  });

// Parallax button
  document
    .querySelectorAll(".parallax-content button, .gallery-button")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth"
        });
      });
    });

// Logout button
  const logoutBtn = document.querySelector(".profile-button-row .logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      document.getElementById("logout-form")?.submit();
    });
  }

// Scroll jacking
  const gallery = document.getElementById("gallery");
  const scrollTrack = document.querySelector(".scroll-track");

  if (gallery && scrollTrack) {
    let currentX = 0; let targetX = 0; let maxScroll = 0;
    let trackStart = 0; let trackEnd = 0;

    function measure() {
      const rect = scrollTrack.getBoundingClientRect();
      trackStart = window.scrollY + rect.top;
      trackEnd = trackStart + rect.height - window.innerHeight;

      maxScroll =
        gallery.scrollWidth - gallery.parentElement.offsetWidth;
    }

    function updateTarget() {
      const y = window.scrollY;
      let progress = (y - trackStart) / (trackEnd - trackStart);
      progress = Math.max(0, Math.min(1, progress));
      targetX = progress * maxScroll;
    }

    function animate() {
      const delta = targetX - currentX;

      // Value first converging asymptotically towards 0: snap to 0 when smaller than 0.1
      if (Math.abs(delta) < 0.1) {
        currentX = targetX;
      } else {
        currentX += delta * 0.12;
      }

      gallery.style.transform =
        `translate3d(-${currentX}px, 0, 0)`;

      requestAnimationFrame(animate);
    }

    window.addEventListener("scroll", updateTarget);
    window.addEventListener("resize", () => {
      measure();
      updateTarget();
    });

    measure();
    updateTarget();
    animate();
  }

});

// Password show/hide
function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";
  button.textContent = isPassword ? "HIDE" : "SHOW";
}
