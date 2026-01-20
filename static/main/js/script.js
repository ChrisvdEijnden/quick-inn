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
