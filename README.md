# WebProgramming


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

## Selenium tests - how to configure and run them
1. Download Microsoft Edge WebDriver https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/
2. Set it in the same location as `test.py`
3. Use the command `python test.py` in the command line

## Tasks implemented:
+ Use of HTML5 for Drag and Drop [1 point]
+ Testing Using Selenium [2 points]
+ Styling and Responsive Design [2 points]
+ Geolocation [2 points]
+ Recover Your Password [2 points]
+ Bonus: Status Codes [2 points]

Total: 11 points