from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout, get_user_model, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.conf import settings
from datetime import datetime, date
import requests

User = get_user_model()


def home(request):
    if request.user.is_authenticated:
        return redirect('tickets')
    return render(request, 'main/home.html')


def get_hotel_image(hotel_name, city):
    """Fetch hotel image from Unsplash API"""
    try:
        access_key = settings.UNSPLASH_ACCESS_KEY

        if not access_key:
            return None

        url = 'https://api.unsplash.com/search/photos'
        params = {
            'query': f'{hotel_name}, {city}',
            'per_page': 1,
            'orientation': 'portrait'
        }
        headers = {
            'Authorization': f'Client-ID {access_key}'
        }

        response = requests.get(url, params=params, headers=headers)

        if response.status_code == 200:
            data = response.json()
            if data['results']:
                return data['results'][0]['urls']['regular']

        return None
    except Exception as e:
        print(f"Error fetching image for {hotel_name}: {e}")
        return None


def tickets(request):
    # Handle POST request for creating ticket
    if request.method == 'POST':
        hotel_name = request.POST.get('hotel_name', '').strip()
        checkin = request.POST.get('checkin', '').strip()
        checkout = request.POST.get('checkout', '').strip()

        if hotel_name and checkin and checkout:
            # Here you would save to database
            # For now, just add a success message
            messages.success(request, f'Ticket for {hotel_name} created successfully!')
        else:
            messages.error(request, 'Please fill in all fields.')

        return redirect('tickets')

    # GET request - display tickets
    tickets_list = [
        {
            'id': 1,
            'title': 'Burj Al Arab',
            'city': 'Dubai',
            'checkin': '2026-03-15',
            'checkout': '2026-03-17',
        },
        {
            'id': 2,
            'title': 'Marina Bay Sands',
            'city': 'Singapore',
            'checkin': '2026-07-05',
            'checkout': '2026-07-09',
        },
        {
            'id': 3,
            'title': 'The Ritz Paris',
            'city': 'Paris',
            'checkin': '2026-04-10',
            'checkout': '2026-04-13',
        },
        {
            'id': 4,
            'title': 'Icehotel',
            'city': 'Jukkasjärvi',
            'checkin': '2026-09-22',
            'checkout': '2026-09-24',
        },
        {
            'id': 5,
            'title': 'The Plaza Hotel',
            'city': 'New York',
            'checkin': '2026-11-25',
            'checkout': '2026-11-27',
        },
    ]

    today = date.today()
    for ticket in tickets_list:
        checkin_date = datetime.strptime(ticket['checkin'], '%Y-%m-%d').date()
        checkout_date = datetime.strptime(ticket['checkout'], '%Y-%m-%d').date()

        ticket['checkin_date'] = checkin_date
        ticket['checkout_date'] = checkout_date

        ticket['checkin_formatted'] = checkin_date.strftime('%a %d %b')
        ticket['checkout_formatted'] = checkout_date.strftime('%a %d %b')

        ticket['checkin_formatted_s'] = checkin_date.strftime('%d %b')
        ticket['checkout_formatted_s'] = checkout_date.strftime('%d %b')

        ticket['is_expired'] = checkout_date < today

        # Fetch hotel image
        ticket['image_url'] = get_hotel_image(ticket['title'], ticket['city'])

    # Sort by check-in date (earliest first)
    tickets_list.sort(key=lambda x: x['checkin_date'])

    return render(request, 'main/tickets.html', {
        "tickets": tickets_list
    })

@login_required
def profile_view(request):
    nationalities = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
        "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
        "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
        "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
        "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
        "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon",
        "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile",
        "China", "Colombia", "Comoros", "Congo", "Costa Rica",
        "Côte d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic",
        "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
        "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
        "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
        "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
        "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
        "Guyana", "Haiti", "Honduras", "Hungary", "Iceland",
        "India", "Indonesia", "Iran", "Iraq", "Ireland",
        "Israel", "Italy", "Jamaica", "Japan", "Jordan",
        "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
        "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
        "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
        "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
        "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
        "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
        "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
        "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
        "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
        "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru",
        "Philippines", "Poland", "Portugal", "Qatar", "Romania",
        "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
        "Samoa", "San Marino", "São Tomé and Príncipe", "Saudi Arabia", "Senegal",
        "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
        "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan",
        "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden",
        "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand",
        "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
        "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
        "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
        "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
        "Zambia", "Zimbabwe",
    ]

    if request.method == 'POST':
        if 'new_password' in request.POST:
            current_password = request.POST.get('password', '').strip()
            new_password = request.POST.get('new_password', '').strip()

            if not request.user.check_password(current_password):
                messages.error(request, 'Current password is incorrect.')
                return redirect('profile')

            if len(new_password) < 8:
                messages.error(request, 'Password must be at least 8 characters long.')
                return redirect('profile')

            request.user.set_password(new_password)
            request.user.save()

            update_session_auth_hash(request, request.user)

            messages.success(request, 'Password changed successfully!')
            return redirect('profile')

        else:
            user = request.user

            user.first_name = request.POST.get('first_name', '').strip()
            user.last_name = request.POST.get('last_name', '').strip()
            user.email = request.POST.get('email', '').strip()

            user.country_code = request.POST.get('country_code', '+31')

            phone = request.POST.get('phone_number', '').strip()
            user.phone_number = phone if phone else ''

            gender = request.POST.get('gender', '').strip()
            user.gender = gender if gender else ''

            dob = request.POST.get('date_of_birth', '').strip()
            user.date_of_birth = dob if dob else None

            nat = request.POST.get('nationality', '').strip()
            user.nationality = nat if nat else ''

            user.street_address = request.POST.get('street_address', '').strip()
            user.city = request.POST.get('city', '').strip()
            user.postal_code = request.POST.get('postal_code', '').strip()

            user.save()

            messages.success(request, 'Your profile was successfully updated!')
            return redirect('profile')

    return render(request, 'main/profile.html', {
        'user': request.user,
        'nationalities': nationalities,
    })


def support(request):
    return render(request, 'main/support.html')


def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        try:
            user_obj = User.objects.get(email=email)
            username = user_obj.username
        except User.DoesNotExist:
            messages.error(request, 'Invalid email or password')
            return render(request, 'main/login.html')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, 'Invalid email or password')

    return render(request, 'main/login.html')


def logout_view(request):
    logout(request)
    return redirect('home')


def signup_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        password_confirm = request.POST.get('password_confirm')

        if password != password_confirm:
            messages.error(request, 'Passwords do not match')
            return render(request, 'main/signup.html')

        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already registered')
            return render(request, 'main/signup.html')

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password
        )

        # Log the user in
        login(request, user)
        messages.success(request, 'Account created successfully!')
        return redirect('home')

    return render(request, 'main/signup.html')