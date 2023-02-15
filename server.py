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
    received_json = request.get_json()

    if "email" not in received_json or "password" not in received_json:
        return "", 400

    user_DAO = db_helper.UserDAO()
    user = user_DAO.get_user_data_by_email(received_json["email"])

    if user is None:
        return "", 404

    if user.password != received_json["password"]:
        return "", 401

    token_manager = db_helper.TokenManager()
    generated_token = token_manager.generate_token()

    logged_in_user = db_helper.LoggedInUser(generated_token, user.email)
    logged_in_user_DAO = db_helper.LoggedInUserDAO()
    is_logged_in_user_created = logged_in_user_DAO.create_logged_in_user(logged_in_user)

    if not is_logged_in_user_created:
        return "", 500

    return json.dumps({"token": generated_token}), 200

@app.route("/sign-up", methods = ["POST"])
def sign_up():
    received_json = request.get_json()

    if ("email" not in received_json or "password" not in received_json or
        "firstname" not in received_json or "familyname" not in received_json or
        "gender" not in received_json or "city" not in received_json or
        "country" not in received_json):

        return "", 400

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
        return "", 409

    return "", 201

@app.route("/sign-out", methods=["POST"])
def sign_out():
    received_token = request.headers.get("token")

    token_manager = db_helper.TokenManager()

    if received_token is None or not token_manager.verify_token(received_token):
        return "", 401

    logged_in_user_DAO = db_helper.LoggedInUserDAO()
    is_logged_in_user_deleted: bool = logged_in_user_DAO.delete_logged_in_user(received_token)

    if not is_logged_in_user_deleted:
        return "", 500

    return "", 200

@app.route("/change-password", methods=["PUT"])
def change_password():
    received_token = request.headers.get("token")
    received_json = request.get_json()

    token_manager = db_helper.TokenManager()

    if received_token is None or not token_manager.verify_token(received_token):
        return "", 401

    if "old_password" not in received_json or "new_password" not in received_json:
        return "", 400
    
    user_DAO = db_helper.UserDAO()
    user: db_helper.User = user_DAO.get_user_data_by_token(received_token)

    if user is None:
        return "", 404

    if user.password != received_json["old_password"]:
        return "", 409

    if received_json["new_password"] == received_json["old_password"]:
        return "", 409

    is_password_changed: bool = user_DAO.change_user_password(user.email, received_json["new_password"])

    if not is_password_changed:
        return "", 500

    return "", 200

@app.route("/get-user-data-by-token", methods=["GET"])
def get_user_data_by_token():
    received_token = request.headers.get("token")

    token_manager = db_helper.TokenManager()

    if received_token is None or not token_manager.verify_token(received_token):
        return "", 401

    user_DAO = db_helper.UserDAO()
    user = user_DAO.get_user_data_by_token(received_token)

    if user is None:
        return "", 404

    user_data_without_password: dict = {
        "email": user.email,
        "firstname": user.firstname,
        "familyname": user.familyname,
        "gender": user.gender,
        "city": user.city,
        "country": user.country
    }

    return json.dumps({"data": user_data_without_password}), 200

@app.route("/get-user-data-by-email/<email>", methods=["GET"])
def get_user_data_by_email(email: str):
    received_token = request.headers.get("token")

    token_manager = db_helper.TokenManager()

    if received_token is None or not token_manager.verify_token(received_token):
        return "", 401

    user_DAO = db_helper.UserDAO()
    user = user_DAO.get_user_data_by_email(email)

    if user is None:
        return "", 404

    user_data_without_password: dict = {
        "email": user.email,
        "firstname": user.firstname,
        "familyname": user.familyname,
        "gender": user.gender,
        "city": user.city,
        "country": user.country
    }

    return json.dumps({"data": user_data_without_password}), 200

@app.route("/get-user-messages-by-token", methods=["GET"])
def get_user_messages_by_token():
    received_token = request.headers.get("token")

    token_manager = db_helper.TokenManager()

    if received_token is None or not token_manager.verify_token(received_token):
        return "", 401

    message_DAO = db_helper.MessageDao()
    messages = message_DAO.get_user_messages_by_token(received_token)

    if len(messages) == 0:
        return "", 404
    
    messages_output: list = []

    for message in messages:
        messages_output.append({
            "writer": message[1],
            "content": message[2]
        })

    return json.dumps({"messages": messages_output}), 200

@app.route("/get-user-messages-by-email/<email>", methods=["GET"])
def get_user_messages_by_email(email: str):
    received_token = request.headers.get("token")

    token_manager = db_helper.TokenManager()

    if received_token is None or not token_manager.verify_token(received_token):
        return "", 401
    
    message_DAO = db_helper.MessageDao()
    messages = message_DAO.get_user_messages_by_email(email)

    if len(messages) == 0:
        return "", 404

    return json.dumps({"messages": messages}), 200

@app.route("/post-message", methods=["POST"])
def post_message():
    received_token = request.headers.get("token")
    received_json = request.get_json()

    token_manager = db_helper.TokenManager()

    if received_token is None or not token_manager.verify_token(received_token):
        return "", 401

    if "message" not in received_json or "email" not in received_json:
        return "", 400

    user_DAO = db_helper.UserDAO()
    user = user_DAO.get_user_data_by_email(received_json["email"])

    if user is None:
        return "", 404

    message_DAO = db_helper.MessageDao()
    message_DAO.add_message(received_token, received_json["message"], received_json["email"])

    return "", 201

if __name__ == "__main__":
    app.debug = True
    app.run()

