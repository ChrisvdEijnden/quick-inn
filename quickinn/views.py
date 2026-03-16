from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout, get_user_model, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.conf import settings
from datetime import datetime, date
import requests
import qrcode
from io import BytesIO
import base64

import json
import os

User = get_user_model()

# Path to store tickets
TICKETS_FILE = os.path.join(settings.BASE_DIR, 'tickets_data.json')


def load_tickets():
    """Load tickets from JSON file"""
    if os.path.exists(TICKETS_FILE):
        try:
            with open(TICKETS_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return get_default_tickets()
    return get_default_tickets()


def save_tickets(tickets_list):
    """Save tickets to JSON file"""
    try:
        with open(TICKETS_FILE, 'w') as f:
            json.dump(tickets_list, f, indent=2)
        return True
    except IOError as e:
        print(f"Error saving tickets: {e}")
        return False


def get_default_tickets():
    with open("tickets_data.json", "r") as file:
        data = json.load(file)
    return data


def home(request):
    if request.user.is_authenticated:
        return redirect('tickets')
    return render(request, 'main/home.html')


def generate_qr_code(data):
    """Generate a QR code and return it as a base64 encoded image"""
    try:
        # Create QR code instance
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )

        # Add data
        qr.add_data(data)
        qr.make(fit=True)

        # Create image
        img = qr.make_image(fill_color="black", back_color="white")

        # Save to bytes
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()

        result = f"data:image/png;base64,{img_str}"
        print(f"✓ QR code generated successfully")
        return result

    except Exception as e:
        print(f"ERROR generating QR code: {e}")
        import traceback
        traceback.print_exc()
        return ""


def get_hotel_image(hotel_name, city, country=None):
    """Fetch hotel image from Unsplash API with multiple fallback options"""
    try:
        access_key = settings.UNSPLASH_ACCESS_KEY

        if not access_key:
            return None

        url = 'https://api.unsplash.com/search/photos'
        headers = {
            'Authorization': f'Client-ID {access_key}'
        }

        # List of query attempts in order of preference
        queries = [
            hotel_name,  # Hotel only
            f'{hotel_name}, {city}',  # Most specific
            city,  # City only
            country,
        ]

        # Add country if provided
        if country:
            queries.append(country)

        # Try each query until we get results
        for query in queries:
            params = {
                'query': query,
                'per_page': 1,
                'orientation': 'portrait'
            }
            response = requests.get(url, params=params, headers=headers)

            if response.status_code == 200:
                data = response.json()
                if data['results']:
                    print(f"Found image using query: {query}")
                    return data['results'][0]['urls']['regular']

        print(f"No images found for {hotel_name}, {city}")
        return None

    except Exception as e:
        print(f"Error fetching image for {hotel_name}: {e}")
        return None


def tickets(request):
    # Load tickets from file
    tickets_list = load_tickets()

    # Handle POST request for creating ticket
    if request.method == 'POST':
        hotel_name = request.POST.get('hotel_name', '').strip()
        city = request.POST.get('city', '').strip()
        country = request.POST.get('country', '').strip()
        checkin = request.POST.get('checkin', '').strip()
        checkout = request.POST.get('checkout', '').strip()

        if hotel_name and city and country and checkin and checkout:
            # Generate new ID
            max_id = max([t['id'] for t in tickets_list]) if tickets_list else 0
            new_id = max_id + 1

            # Create new ticket
            new_ticket = {
                'id': new_id,
                'title': hotel_name,
                'city': city,
                'country': country,
                'checkin': checkin,
                'checkout': checkout,
            }

            # Append to list and save
            tickets_list.append(new_ticket)
            save_tickets(tickets_list)

            messages.success(request, f'Ticket for {hotel_name} created successfully!')
        else:
            messages.error(request, 'Please fill in all fields.')

        return redirect('tickets')

    # GET request - display tickets
    # Create a display copy of tickets (don't modify original data)
    display_tickets = []
    today = date.today()

    for ticket in tickets_list:
        # Create a copy to avoid modifying original data
        display_ticket = ticket.copy()

        checkin_date = datetime.strptime(ticket['checkin'], '%Y-%m-%d').date()
        checkout_date = datetime.strptime(ticket['checkout'], '%Y-%m-%d').date()

        display_ticket['checkin_date'] = checkin_date
        display_ticket['checkout_date'] = checkout_date

        display_ticket['checkin_formatted'] = checkin_date.strftime('%a %d %b')
        display_ticket['checkout_formatted'] = checkout_date.strftime('%a %d %b')

        display_ticket['checkin_formatted_s'] = checkin_date.strftime('%d %b')
        display_ticket['checkout_formatted_s'] = checkout_date.strftime('%d %b')

        display_ticket['is_expired'] = checkout_date < today

        # Fetch hotel image
        display_ticket['image_url'] = get_hotel_image(ticket['title'], ticket['city'])

        # Generate QR code with ticket information
        qr_data = f"Hotel: {ticket['title']}\nCity: {ticket['city']}, {ticket['country']}\nCheck-in: {ticket['checkin']}\nCheck-out: {ticket['checkout']}\nBooking ID: {ticket['id']}"
        display_ticket['qr_code'] = generate_qr_code(qr_data)

        display_tickets.append(display_ticket)

    # Sort by check-in date (earliest first)
    display_tickets.sort(key=lambda x: x['checkin_date'])

    return render(request, 'main/tickets.html', {
        "tickets": display_tickets,
        "google_maps_api_key": settings.GOOGLE_MAPS_API_KEY,
    })


def delete_ticket(request):
    """Delete a ticket from the file"""
    if request.method == 'POST':
        ticket_id = request.POST.get('ticket_id')

        if ticket_id:
            try:
                ticket_id = int(ticket_id)
                tickets_list = load_tickets()  # Load from JSON

                # Remove the ticket
                tickets_list = [t for t in tickets_list if t['id'] != ticket_id]

                save_tickets(tickets_list)  # Save back to JSON
                messages.success(request, 'Ticket deleted successfully!')
            except (ValueError, TypeError):
                messages.error(request, 'Invalid ticket ID.')

    return redirect('tickets')


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

        login(request, user)
        messages.success(request, 'Account created successfully!')
        return redirect('home')

    return render(request, 'main/signup.html')