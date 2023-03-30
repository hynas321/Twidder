from flask import Flask, request
from flask_socketio import SocketIO, disconnect, emit
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
from requests.structures import CaseInsensitiveDict

import database_helper as db_helper
import json
import smtplib

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')
active_websockets: dict = {}

#Server.py is a server side of the Twidder website.
#Classes with the "db_helper" module name are from the database_helper.py file.
#Methods inside of database_helper.py classes access the database.db Sqlite file.
#Tables' structure in database.db is made using schema.sql file.

#root() - called when the server starts running.
#Returns: static file "client.html."
@app.route("/", methods = ["GET"])
def root():
    return app.send_static_file("client.html"), 200

#teardown() - closes the connection with the database.
#Arguments: exception
@app.teardown_request
def teardown(exception):
    db_helper.disconnect()

#connect() - called when the user connects to the websocket.
#Emits "acknowledge-connection" with a message to the client.
@socketio.on("connect")
def connect():
    emit('acknowledge-connection', {"message": "Connection opened"})

#handle_user_connection() - terminates the socket connection for the previosuly logged in user
#on the same account and creates a new socket connection for the new logged in user.
#Arguments: msg - message from the client.
@socketio.on("handle-user-connected")
def handle_user_connection(msg):
    try: 
        token_value = msg["token"]
        email = msg["email"]

        token_manager = db_helper.TokenManager()
        
        #Verify token. If incorrect, end the connection with a client.
        if not token_value or not token_manager.verify_token(token_value):
            emit("close-connection", {"message": "Connection authentication error"}, room=request.sid)
            disconnect("Web socket disconnected")
            return
        
        #Check if the same user email already exists in the active websockets. If exists, remove it
        #and close the connection for the previous user.
        if email in active_websockets:
            user_sid = active_websockets[email]
            active_websockets.pop(email)
            emit("close-connection", {"message": "Different user connected to your account"}, room=user_sid)

        #Add a new active websocket.
        active_websockets[email] = request.sid

    #Close connection if unexpected exception occurs.
    except Exception as ex:
        print(ex)
        emit("close-connection", {"message": "Connection error"})
        disconnect("Web socket disconnected")

#disconnect_user() - terminates the connection with the client.
#Arguments: msg - message from the client.
@socketio.on("disconnect-user")
def disconnect_user(msg):
    token_value = msg["token"]
    email = msg["email"]

    token_manager = db_helper.TokenManager()

    #Verify token. If token is invalid or does not exist, end the function.
    if not token_value or not token_manager.verify_token(token_value):
        return

    #Remove the active websocket and end the connection.
    active_websockets.pop(email)
    disconnect("Web socket disconnected")

#sign_in() - logs in user to his/her account.
#Returns: empty string or generated token, the HTTP status code.
@app.route("/sign-in", methods = ["POST"])
def sign_in():
    received_json = request.get_json()

    #Verify the request's body format.
    if ("email" not in received_json or "password" not in received_json
        or len(received_json) != 2):
        #Bad request: incorrect body format.
        return "", 400

    #Verify if credentials are in correct format.
    input_manager = db_helper.InputManager()
    are_credentials_correct = input_manager.verify_credentials(received_json["email"], received_json["password"])

    if not are_credentials_correct:
        #Bad request: Incorrect credentials format: e-mail in the wrong format or password too short.
        return "", 400

    user_DAO = db_helper.UserDAO()
    user = user_DAO.get_user_data_by_email(received_json["email"])

    if user is db_helper.DatabaseOutput.NONE:
        #Data not found: User does not exist.
        return "", 404

    if user is db_helper.DatabaseOutput.ERROR:
        #Internal server error: Exception occured when getting user data.
        return "", 500

    if user.password != received_json["password"]:
        #Unauthorized: Incorrect password.
        return "", 401

    #Generate token for the logged in user.
    token_manager = db_helper.TokenManager()
    generated_token = token_manager.generate_token()

    #Create a new logged in user.
    logged_in_user = db_helper.LoggedInUser(generated_token, user.email)
    logged_in_user_DAO = db_helper.LoggedInUserDAO()
    is_logged_in_user_created = logged_in_user_DAO.create_logged_in_user(logged_in_user)

    if not is_logged_in_user_created:
        #Internal server error: Exception occured when creating a logged in user.
        return "", 500

    #Created: A new logged in user created, return object with a newly generated token.
    return json.dumps({"token": generated_token}), 201

#sign_up() - signs up a new user.
#Returns: empty string, the HTTP status code.
@app.route("/sign-up", methods = ["POST"])
def sign_up():
    received_json = request.get_json()

    #Verify the request's body format.
    if ("email" not in received_json or "password" not in received_json or
        "firstname" not in received_json or "familyname" not in received_json or
        "gender" not in received_json or "city" not in received_json or
        "country" not in received_json or "current_location" not in received_json or
        len(received_json) != 8):

        #Bad request: Incorrect body format.
        return "", 400

    #Verify credentials.
    input_manager = db_helper.InputManager()
    are_credentials_correct = input_manager.verify_credentials(received_json["email"], received_json["password"])

    if not are_credentials_correct:
        #Bad request: Incorrect credentials format: e-mail in the wrong format or password too short.
        return "", 400

    user = db_helper.User(
        received_json["email"],
        received_json["password"],
        received_json["firstname"],
        received_json["familyname"],
        received_json["gender"],
        received_json["city"],
        received_json["country"],
        received_json["current_location"]
    )

    #Create a new user.
    user_DAO = db_helper.UserDAO()
    is_user_created = user_DAO.create_user(user)

    if not is_user_created:
        #OK: Correct request, a new user has not been created.
        return "", 200

    #Created: A new user is created.
    return "", 201

#sign_out() - signs out a user.
#Returns: empty string, the HTTP status code.
@app.route("/sign-out", methods=["DELETE"])
def sign_out():
    received_token = request.headers.get("token")

    #Verify token.
    token_manager = db_helper.TokenManager()
    is_token_correct = token_manager.verify_token(received_token)

    if received_token is None or not is_token_correct:
        #Unauthorized: Incorrect token or token does not exist.
        return "", 401

    #Delete logged in user.
    logged_in_user_DAO = db_helper.LoggedInUserDAO()
    is_logged_in_user_deleted: bool = logged_in_user_DAO.delete_logged_in_user_by_token(received_token)

    if not is_logged_in_user_deleted:
        #Internal server error: Exception occured when deleting the user.
        return "", 500

    #OK: Signed out the user.
    return "", 200

#change_password() - changes the user's password.

#Returns: empty string, the HTTP status code.
@app.route("/change-password", methods=["PUT"])
def change_password():
    received_token = request.headers.get("token")
    received_json = request.get_json()

    #Verify token.
    token_manager = db_helper.TokenManager()
    is_token_correct = token_manager.verify_token(received_token)

    if received_token is None or not is_token_correct:
        #Unauthorized: Incorrect token or token does not exist.
        return "", 401

    #Verify the request's body format.
    if ("old_password" not in received_json or "new_password" not in received_json or
        len(received_json) != 2):
        #Bad request: Incorrect body format.
        return "", 400

    #Verify length of the old and new password.
    input_verifier = db_helper.InputManager()
    is_old_password_correct = input_verifier.verify_password_length(received_json["old_password"])
    is_new_password_correct = input_verifier.verify_password_length(received_json["new_password"])

    if not is_old_password_correct or not is_new_password_correct:
        #Bad request: Incorrect password length.
        return "", 400
    
    #Get user data.
    user_DAO = db_helper.UserDAO()
    user: db_helper.User = user_DAO.get_user_data_by_token(received_token)

    if user is db_helper.DatabaseOutput.NONE:
        #Data not found: User does not exist.
        return "", 404
    
    if user is db_helper.DatabaseOutput.ERROR:
        #Internal server error: Exception occured when getting user data.
        return "", 500

    if user.password != received_json["old_password"]:
        #Conflict: Provided old password is different than the actual old password.
        return "", 409

    if received_json["new_password"] == received_json["old_password"]:
        #Conflict: Provided new password is the same as the old password.
        return "", 409

    #Change the user's password.
    is_password_changed: bool = user_DAO.change_user_password(user.email, received_json["new_password"])

    if not is_password_changed:
        #Internal server error: Exception occured when changing user password.
        return "", 500

    #OK: Password changed.
    return "", 200

#get_user_data_by_token() - gets user data.
#Returns: empty string or user data without password, the HTTP status code.
@app.route("/get-user-data-by-token", methods=["GET"])
def get_user_data_by_token():
    received_token = request.headers.get("token")

    #Verify token.
    token_manager = db_helper.TokenManager()
    is_token_correct = token_manager.verify_token(received_token)

    if received_token is None or not is_token_correct:
        #Unauthorized: Incorrect token or token does not exist.
        return "", 401

    #Get user data.
    user_DAO = db_helper.UserDAO()
    user = user_DAO.get_user_data_by_token(received_token)

    if user is db_helper.DatabaseOutput.NONE:
        #Data not found: User does not exist.
        return "", 404

    if user is db_helper.DatabaseOutput.ERROR:
        #Internal server error: Exception occured when getting user data.
        return "", 500

    user_data_without_password: dict = {
        "email": user.email,
        "firstname": user.firstname,
        "familyname": user.familyname,
        "gender": user.gender,
        "city": user.city,
        "country": user.country,
        "current_location": user.current_location
    }

    #OK: User data without password returned.
    return json.dumps({"data": user_data_without_password}), 200

#get_user_data_by_email() - gets user data.
#Arguments: email
#Returns: empty string or user data without password, the HTTP status code.
@app.route("/get-user-data-by-email/<email>", methods=["GET"])
def get_user_data_by_email(email: str):
    received_token = request.headers.get("token")

    #Verify token.
    token_manager = db_helper.TokenManager()
    is_token_correct = token_manager.verify_token(received_token)

    if received_token is None or not is_token_correct:
        #Unauthorized: Incorrect token or token does not exist.
        return "", 401

    #Get user data.
    user_DAO = db_helper.UserDAO()
    user = user_DAO.get_user_data_by_email(email)

    if user is db_helper.DatabaseOutput.NONE:
        #Data not found: User does not exist.
        return "", 404

    if user is db_helper.DatabaseOutput.ERROR:
        #Internal server error: Exception occured when getting user data.
        return "", 500

    user_data_without_password: dict = {
        "email": user.email,
        "firstname": user.firstname,
        "familyname": user.familyname,
        "gender": user.gender,
        "city": user.city,
        "country": user.country,
        "current_location": user.current_location
    }

    #OK: User data without password returned.
    return json.dumps({"data": user_data_without_password}), 200

#get_user_messages_by_token() - gets user messages.
#Returns: empty string or messages, the HTTP status code.
@app.route("/get-user-messages-by-token", methods=["GET"])
def get_user_messages_by_token():
    received_token = request.headers.get("token")

    #Verify token.
    token_manager = db_helper.TokenManager()
    is_token_correct = token_manager.verify_token(received_token)

    if received_token is None or not is_token_correct:
        #Unauthorized: Incorrect token or token does not exist.
        return "", 401

    #Get user messages.
    message_DAO = db_helper.MessageDao()
    messages = message_DAO.get_user_messages_by_token(received_token)

    if messages is db_helper.DatabaseOutput.NONE:
        #Data not found: Messages do not exist.
        return "", 404
    
    if messages is db_helper.DatabaseOutput.ERROR:
        #Internal server error: Exception occured when getting user messages.
        return "", 500

    #OK: User messages returned.
    return json.dumps({"messages": messages}), 200

#get_user_messages_by_email() - gets user messages.
#Returns: empty string or messages, the HTTP status code.
@app.route("/get-user-messages-by-email/<email>", methods=["GET"])
def get_user_messages_by_email(email: str):
    received_token = request.headers.get("token")

    #Verify token.
    token_manager = db_helper.TokenManager()
    is_token_correct = token_manager.verify_token(received_token)

    if received_token is None or not is_token_correct:
        #Unauthorized: Incorrect token or token does not exist.
        return "", 401
    
    #Get user messages.
    message_DAO = db_helper.MessageDao()
    messages = message_DAO.get_user_messages_by_email(email)

    if messages is db_helper.DatabaseOutput.NONE:
        #Data not found: Messages do not exist.
        return "", 404

    if messages is db_helper.DatabaseOutput.ERROR:
        #Internal server error: Exception occured when getting user messages.
        return "", 500

    #OK: User messages returned.
    return json.dumps({"messages": messages}), 200

#post_message() - post a message to the user's wall.
#Returns: empty string, the HTTP status code.
@app.route("/post-message", methods=["POST"])
def post_message():
    received_token = request.headers.get("token")
    received_json = request.get_json()

    #Verify token.
    token_manager = db_helper.TokenManager()
    is_token_correct = token_manager.verify_token(received_token)

    if received_token is None or not is_token_correct:
        #Unauthorized: Incorrect token or token does not exist.
        return "", 401

    #Verify if the content is not empty.
    input_manager = db_helper.InputManager()
    input_manager.verify_string_not_empty(received_json["content"])

    #Verify the request's body format.
    if ("content" not in received_json or "recipient" not in received_json or
        "writer_location" not in received_json or len(received_json) != 3 or
        not input_manager.verify_string_not_empty(received_json["content"])):
        return "", 400

    #Get user data.
    user_DAO = db_helper.UserDAO()
    user = user_DAO.get_user_data_by_email(received_json["recipient"])

    if user is db_helper.DatabaseOutput.NONE:
        #Data not found: User does not exist.
        return "", 404

    if user is db_helper.DatabaseOutput.ERROR:
        #Internal server error: Exception occured when getting user data.
        return "", 500

    #Add a message.
    message_DAO = db_helper.MessageDao()
    message_DAO.add_message(received_token, received_json["content"], received_json["recipient"], received_json["writer_location"])

    #Created: Message posted.
    return "", 201

#recover_password_via_email() - sends a newly generated password to the user.
#Arguments: email
#Returns: empty string, the HTTP status code.
@app.route("/recover-password-via-email/<email>", methods=["GET"])
def recover_password_via_email(email: str):
    user_DAO = db_helper.UserDAO()
    user = user_DAO.get_user_data_by_email(email)

    if user is db_helper.DatabaseOutput.NONE:
        #Data not found: User does not exist.
        return "", 404
    
    if user is db_helper.DatabaseOutput.ERROR:
        #Internal server error: Exception occured when getting user data.
        return "", 500
    
    #Generate token.
    token_manager = db_helper.TokenManager()
    generated_password = token_manager.generate_token()[0:16]
    
    #Handle the email SMTP server.
    try:
        #Setting server url, port number, email sender's username and password.
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        smtp_username = None    #Replace with e-mail address
        smtp_password = None    #Replace with e-mail password (for applications)

        #Log in to the SMTP server.
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)

        #Set the message's structure: sender, recipient, title, content.
        from_address = smtp_username
        to_address = email
        subject = "Twidder - password recovery"
        body = f"""
        <h2>Your newly generated password: {generated_password}</h2>
        <h3>You are free to change it in the account tab after signing in to your account :)</h3>
        <h3>
            Best regards,<br>
            Twidder support
        </h3>
        """

        #Attach all elements to the email message.
        message = MIMEMultipart()
        message['From'] = from_address
        message['To'] = to_address
        message['Subject'] = subject
        message.attach(MIMEText(body, "html"))

        #Check if password was changed.
        is_password_changed = user_DAO.change_user_password(user.email, generated_password)

        if not is_password_changed:
            #Internal server error: Exception occured when changing password.
            return "", 500

        #Send the email message and close the connection with the server.
        server.sendmail(from_address, to_address, message.as_string())
        server.quit()

    except:
        #Internal server error: Unexpected exception occured.
        return "", 500

    #OK: Email message with the newly generated password was sent.
    return "", 200

#set_user_current_location() - sets the location name received from the Geoapify API.
#Returns: empty string, the HTTP status code.
@app.route("/set-user-current-location", methods=["PUT"])
def set_user_current_location():
    received_token = request.headers.get("token")
    received_json = request.get_json()

    #Verify token.
    token_manager = db_helper.TokenManager()
    is_token_correct = token_manager.verify_token(received_token)

    if received_token is None or not is_token_correct:
        #Unauthorized: Incorrect token or token does not exist.
        return "", 401

    #Verify the request's body format.
    if ("latitude" not in received_json or "longitude" not in received_json or
        len(received_json) != 2):
        return "", 400
    
    #Get user data.
    user_DAO = db_helper.UserDAO()
    user = user_DAO.get_user_data_by_token(received_token)

    if user is db_helper.DatabaseOutput.NONE:
        #Data not found: User does not exist.
        return "", 404

    if user is db_helper.DatabaseOutput.ERROR:
        #Internal server error: Exception occured when getting user data.
        return "", 500
    
    #Set latitude and longitude variables from the request's body.
    latitude = received_json["latitude"]
    longitude = received_json["longitude"]
    
    #Set Geoapify API key and the URL to receive the location's name based on the coordinates received from the browser.
    myAPIKey = "bf7fa01b2f0549bda7a3d044e2082845"
    reverseGeocodingUrl = f"https://api.geoapify.com/v1/geocode/reverse?lat={latitude}&lon={longitude}&apiKey={myAPIKey}"

    #Set headers.
    headers = CaseInsensitiveDict()
    headers["Accept"] = "application/json;charset=UTF-8"

    #Send the request and get the response with the location.
    resp = requests.get(reverseGeocodingUrl, headers=headers)
    
    if resp.status_code != 200:
        #Internal server error: Exception occured when getting the response.
        return 500
    
    #Set country and city from the received JSON in the response.
    country_output = resp.json()["features"][0]["properties"]["country"]
    city_output = resp.json()["features"][0]["properties"]["city"]

    #Change user location.
    is_current_location_changed = user_DAO.change_user_current_location(
        received_token, 
        f"{country_output}, {city_output}"
    )

    if not is_current_location_changed:
        #Internal server error: Exception occured when changing the current location.
        return "", 500
    
    #OK: location changed.
    return "", 200

#remove_user_current_location() - set's user current location to None (NULL).
#Returns: empty string, the HTTP status code.
@app.route("/remove-user-current-location", methods=["DELETE"])
def remove_user_current_location():
    received_token = request.headers.get("token")

    #Verify token.
    token_manager = db_helper.TokenManager()
    is_token_correct = token_manager.verify_token(received_token)

    if received_token is None or not is_token_correct:
        return "", 401
    
    #Change location
    user_DAO = db_helper.UserDAO()
    is_user_current_location_changed = user_DAO.change_user_current_location(received_token, None)

    if not is_user_current_location_changed:
        #Internal server error: Exception occured when changing the current location.
        return "", 500

    #OK: location changed.
    return "", 200
    
if __name__ == "__main__":
    #Runs the server that uses websocket with port 5000.
    socketio.run(app, debug=True, port=5000)
