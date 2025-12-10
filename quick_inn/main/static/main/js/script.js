
// Parallax Scrolling Effect
window.addEventListener('scroll', function() {
    const parallax = document.querySelector('.parallax');
    const bigHeader = document.querySelector('.big-header');
    
    if (parallax && bigHeader) {
        const scrolled = window.pageYOffset;
        const parallaxTop = parallax.offsetTop;
        const parallaxHeight = parallax.offsetHeight;
        
        if (scrolled <= parallaxTop + parallaxHeight) {
            const maxScroll = parallaxTop + parallaxHeight;
            const scrollPercent = Math.min((scrolled / maxScroll * 1.1) * 100, 100);
            const bgPositionY = 100 - scrollPercent;
            
            parallax.style.backgroundPosition = `center ${bgPositionY}%`;
            const opacity = Math.max(1 - (scrollPercent / 100), 0);
            bigHeader.style.opacity = opacity;
        }
    }
});


// QR Code Generator
const qrcodeURL = document.getElementById("qrcode-url");
const qrcodeButton = document.getElementById("qrcode-button");
const qrcodeImage = document.getElementById("qrcode-image");

if (qrcodeButton) {
    qrcodeButton.addEventListener("click", async function() {
        if (qrcodeURL.value) {
            QRCode.toDataURL(qrcodeURL.value).then(dataURL => {
                qrcodeImage.src = dataURL;
            }).catch(err => console.error('QR Code error:', err));
        }
    });
}


// Google Sign In
        // Initialize Google Sign-In
        function initGoogleSignIn() {
            if (window.google) {
                google.accounts.id.initialize({
                    client_id: '1089055923184-69op3q7b53tvk3m148apld56bjekpe5a.apps.googleusercontent.com',
                    callback: handleGoogleCallback
                });
            }
        }

        // Wait for Google library to load
        window.addEventListener('load', function() {
            setTimeout(initGoogleSignIn, 500);
        });

        // Handle Google Sign-In
        function handleGoogleLogin() {
            if (window.google) {
                google.accounts.id.prompt();
            } else {
                alert('Google Sign-In wordt geladen, probeer het over een paar seconden opnieuw.');
            }
        }

        // Google Sign-In Callback
        function handleGoogleCallback(response) {
            // Decode JWT token to get user info
            const userInfo = JSON.parse(atob(response.credential.split('.')[1]));
            
            // Display user info
            document.getElementById('user-picture').src = userInfo.picture;
            document.getElementById('user-name').textContent = userInfo.name;
            document.getElementById('user-email').textContent = userInfo.email;
            document.getElementById('user-info').classList.add('show');
            
            alert(`Welkom ${userInfo.name}!`);
            
            // Store in sessionStorage
            sessionStorage.setItem('user', JSON.stringify({
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture
            }));
        }

        // Handle traditional login
        function handleLogin(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            alert('Login functionaliteit komt binnenkort!\nEmail: ' + email);
        }

        // Handle registration
        function handleRegister() {
            alert('Registratie komt binnenkort!');
        }

        // Go to home page
        function goHome() {
            window.location.href = '/';
        }

        // Check if user is already logged in
        window.addEventListener('load', function() {
            const user = sessionStorage.getItem('user');
            if (user) {
                const userInfo = JSON.parse(user);
                document.getElementById('user-picture').src = userInfo.picture;
                document.getElementById('user-name').textContent = userInfo.name;
                document.getElementById('user-email').textContent = userInfo.email;
                document.getElementById('user-info').classList.add('show');
            }
        });