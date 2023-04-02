# WebProgramming

## Description
The Twidder website is a part of the course TDDD97 conducted at Linköping University. https://www.ida.liu.se/~TDDD97/labs/index.en.shtml

The website allows users to set up their own profile, post messages to walls and see other users' walls with their profiles.

## Frontend
HTML, CSS (Bootstrap), Javascript

## Backend
Python, Flask, Sqlite

## Setting up server
1. Set up virtual environment https://flask.palletsprojects.com/en/2.2.x/installation/
2. Download additional modules in the virtual environment:
- Flask `pip install flask`
- Flask SocketIO `pip install flask-socketio`
- requests `pip install requests`
- email.mime `pip install email` (only if not available by default)

## Running the website
1. Run the server in the command line (for Windows: `python server.py`)
2. Type `http://127.0.0.1:5000/static/client.html` URL in the browser

## Additional features implemented:
+ Testing Using Selenium
+ Styling and Responsive Design
+ Geolocation
+ Password recovery

## Geolocation - configuration
The current API key from Geoapify is required in the server.py file in order for the geolocation to work.

## Password recovery - configuration
The current e-mail username and password for SMTP is required in the server.py file for the password recovery to work.

## Selenium tests - how to configure and run them
1. Download Microsoft Edge WebDriver https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/
2. Set it in the same location as `test.py`
3. Use the command `python test.py` in the command line
