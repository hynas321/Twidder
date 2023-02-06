from flask import Flask, request

import database_helper as db_helper
import json

app = Flask(__name__)
database = db_helper.Database("database.db")

@app.route("/", methods = ["GET"])
def root():
    return json.dumps({"Hello"}), 200

@app.teardown_request
def teardown(exception):
    db_helper.disconnect()

@app.route("/sign-in", methods = ["POST"])
def sign_in():
    received_json = request.get_json()[0]

    if "email" not in received_json or "password" not in received_json:
        return json.dumps({""}), 500

    user_DAO = db_helper.UserDAO()
    user = user_DAO.get_user_by_email(received_json.email)

    if user is None:
        return json.dumps({""}), 500

    if user.password != received_json.password:
        return json.dumps({""}), 500

    logged_in_user = db_helper.LoggedInUser("sample_token", user.email)
    logged_in_user_DAO = db_helper.LoggedInUserDAO(logged_in_user)
    is_logged_in_user_created = logged_in_user_DAO.create_logged_in_user(logged_in_user)

    if not is_logged_in_user_created:
        return json.dumps({""}), 500

    return json.dumps({""}), 200

@app.route("/sign-up", methods = ["POST"])
def sign_up():
    received_json = request.get_json()[0]

    if ("email" not in received_json or "password" not in received_json or
        "firstname" not in received_json or "familyname" not in received_json or
        "gender" not in received_json or "city" not in received_json or
        "country" not in received_json):

        return json.dumps({""}), 500

    user = db_helper.User(
        received_json['email'],
        received_json['password'],
        received_json['firstname'],
        received_json['familyname'],
        received_json['gender'],
        received_json['city'],
        received_json['country']
    )

    user_DAO = db_helper.UserDAO()
    is_user_created = user_DAO.create_user(user)

    if not is_user_created:
        return json.dumps({""}), 500

    return json.dumps({""}), 200

@app.route("/sign-out", methods=["POST"])
def sign_out(token: str):
    logged_in_user_DAO = db_helper.LoggedInUserDAO(database)
    is_logged_in_user_deleted: bool = logged_in_user_DAO.delete_logged_in_user(token)

    if not is_logged_in_user_deleted:
        return json.dumps({""}), 500

    return json.dumps({""}), 200

@app.route("/change-password")
def change_password(token: str, newPassword: str):
    user_DAO = db_helper.UserDAO(database)
    user: db_helper.User = user_DAO.get_user_by_token(token)

    if user is None:
        return json.dumps({""}), 500

    is_password_changed: bool = user_DAO.change_user_password(user.token, newPassword)

    if not is_password_changed:
        return json.dumps({""}), 500

    return json.dumps({""}), 200

@app.route("/get-user-data-by-token")
def get_user_data_by_token(token: str):
    user_DAO = db_helper.UserDAO(database)
    user_data = user_DAO.get_user_by_token(token)

    if user_data is None:
        return json.dumps({""}), 500

    return json.dumps({""}), 200

@app.route("/get-user-data-by-email")
def get_user_data_by_email(token: str, email: str):
    user_DAO = db_helper.UserDAO(database)
    user_data = user_DAO.get_user_by_email(email)

    if user_data is None:
        return json.dumps({""}), 500

    return json.dumps({""}), 200

@app.route("/get-user-messages-by-token")
def get_user_messages_by_token(token: str):
    
    userMessages: list = []

    return json.dumps({""}), 200

@app.route("/get-user-messages-by-email")
def get_user_messages_by_email(token: str, email: str):
    userMessages: list = []

    return json.dumps({""}), 200

@app.route("/post-message")
def post_message(token: str, message: str, email: str):

    pass

if __name__ == "__main__":
    app.debug = True
    app.run()

