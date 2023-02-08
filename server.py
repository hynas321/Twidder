from flask import Flask, request

import database_helper as db_helper
import json

app = Flask(__name__)

@app.route("/", methods = ["GET"])
def root():
    
    return "", 200

@app.teardown_request
def teardown(exception):
    db_helper.disconnect()

@app.route("/sign-in", methods = ["POST"])
def sign_in():
    received_json = request.get_json()[0]

    if "email" not in received_json or "password" not in received_json:
        return json.dumps({"message:": "Missing credentials"}), 500

    user_DAO = db_helper.UserDAO()
    user = user_DAO.get_user_by_email(received_json["email"])

    if user is None:
        return json.dumps({"message": "User not found"}), 500

    if user.password != received_json["password"]:
        return json.dumps({"message": "Incorrect password"}), 500

    logged_in_user = db_helper.LoggedInUser("sample_token", user.email)
    logged_in_user_DAO = db_helper.LoggedInUserDAO()
    is_logged_in_user_created = logged_in_user_DAO.create_logged_in_user(logged_in_user)

    if not is_logged_in_user_created:
        return json.dumps({"message": "Sign in error"}), 500

    token_manager = db_helper.TokenManager()
    generated_token = token_manager.generate_token()

    return json.dumps({"token": generated_token}), 200

@app.route("/sign-up", methods = ["POST"])
def sign_up():
    received_json = request.get_json()[0]

    if ("email" not in received_json or "password" not in received_json or
        "firstname" not in received_json or "familyname" not in received_json or
        "gender" not in received_json or "city" not in received_json or
        "country" not in received_json):

        return json.dumps({""}), 500

    user = db_helper.User(
        received_json["email"],
        received_json["password"],
        received_json["firstname"],
        received_json["familyname"],
        received_json["gender"],
        received_json["city"],
        received_json["country"]
    )

    user_DAO = db_helper.UserDAO()
    is_user_created = user_DAO.create_user(user)

    if not is_user_created:
        return json.dumps({"message:": "User"}), 500

    return json.dumps({""}), 200

@app.route("/sign-out", methods=["POST"])
def sign_out():
    received_token = request.headers.get("token")

    if received_token is None:
        return json.dumps({""}), 500

    token_manager = db_helper.TokenManager()
    
    if not token_manager.verify_token(received_token):
        return json.dumps({""}), 500

    logged_in_user_DAO = db_helper.LoggedInUserDAO()
    is_logged_in_user_deleted: bool = logged_in_user_DAO.delete_logged_in_user(received_token)

    if not is_logged_in_user_deleted:
        return json.dumps({""}), 500

    return json.dumps({""}), 200

@app.route("/change-password", methods=["POST"])
def change_password():
    received_token = request.headers.get("token")
    received_json = request.get_json()[0]

    if (received_token is None or
        "oldPassword" not in received_json or "newPassword" not in received_json):
        return json.dumps({""}), 500

    token_manager = db_helper.TokenManager()
    
    if not token_manager.verify_token(received_token):
        return json.dumps({""}), 500
    
    user_DAO = db_helper.UserDAO()
    user: db_helper.User = user_DAO.get_user_by_token(received_token)

    if user is None:
        return json.dumps({""}), 500

    is_password_changed: bool = user_DAO.change_user_password(received_token, received_json["newPassword"])

    if not is_password_changed:
        return json.dumps({""}), 500

    return json.dumps({""}), 200

@app.route("/get-user-data-by-token", methods=["GET"])
def get_user_data_by_token():
    received_token = request.headers.get("token")

    if received_token is None:
        return json.dumps({""}), 500

    token_manager = db_helper.TokenManager()
    
    if not token_manager.verify_token(received_token):
        return json.dumps({""}), 500

    user_DAO = db_helper.UserDAO()
    user_data = user_DAO.get_user_by_token(received_token)

    if user_data is None:
        return json.dumps({""}), 500

    return json.dumps({""}), 200

@app.route("/get-user-data-by-email/<email>", methods=["GET"])
def get_user_data_by_email(email: str):
    received_token = request.headers.get("token")

    if received_token is None:
        return json.dumps({""}), 500

    token_manager = db_helper.TokenManager()
    
    if not token_manager.verify_token(received_token):
        return json.dumps({""}), 500

    user_DAO = db_helper.UserDAO()
    user_data = user_DAO.get_user_by_email(email)

    if user_data is None:
        return json.dumps({""}), 500

    return json.dumps({""}), 200

@app.route("/get-user-messages-by-token", methods=["GET"])
def get_user_messages_by_token():
    received_token = request.headers.get("token")

    if received_token is None:
        return json.dumps({""}), 500

    token_manager = db_helper.TokenManager()
    
    if not token_manager.verify_token(received_token):
        return json.dumps({""}), 500

    userMessages: list = []

    return json.dumps({""}), 200

@app.route("/get-user-messages-by-email/<email>", methods=["GET"])
def get_user_messages_by_email(email: str):
    received_token = request.headers.get("token")

    if received_token is None:
        return json.dumps({""}), 500

    token_manager = db_helper.TokenManager()
    
    if not token_manager.verify_token(received_token):
        return json.dumps({}), 500
    
    message_DAO = db_helper.MessageDao()
    messages = message_DAO.get_user_messages_by_email(email)

    if messages is None:
        return json.dumps({""}), 500

    return json.dumps({messages}), 200

@app.route("/post-message", methods=["POST"])
def post_message():
    received_token = request.headers.get("token")
    received_json = request.get_json()[0]

    if (received_token is None or 
        "message" not in received_json or "email" not in received_json):
        return json.dumps({}), 500

    token_manager = db_helper.TokenManager()

    if not token_manager.verify_token(received_token):
        return json.dumps({}), 500

    user_DAO = db_helper.UserDAO()
    user_data = user_DAO.get_user_by_email(received_json["email"])

    if user_data is None:
        return json.dumps({""}), 500

    message_DAO = db_helper.MessageDao()
    message_DAO.add_message(received_token, received_json["message"], received_json["email"])

    return json.dumps({""}), 200

if __name__ == "__main__":
    app.debug = True
    app.run()

