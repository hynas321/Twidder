from flask import Flask, request

import database_helper as db_helper

app = Flask(__name__)

@app.route("/", methods = ["GET"])
def root():
    return { "status": 200 }

@app.teardown_request
def teardown(exception):
    db_helper.disconnect()

@app.route("/test/<email>/<password>", methods = ["GET"])
def sign_in(email: str, password: str):

    return { "status": 200, "token": "abc" }

@app.route("/user/create/", methods = ["POST"])
def sign_up():
    received_json = request.get_json()[0]

    user = db_helper.User(
        received_json['email'],
        received_json['password'],
        received_json['firstname'],
        received_json['familyname'],
        received_json['gender'],
        received_json['city'],
        received_json['country']
    )

    is_operation_successful = db_helper.create_user(user)

    if is_operation_successful is False:
        return { "status:": 500 }

    return { "status": 201 }

def sign_out(token: str):
    pass

def change_password(token: str, oldPassword: str, newPassword: str):
    pass

def get_user_data_by_token(token: str):
    userData: dict = { "email": "", "firstname": "", "familyname": "", "gender": "", "city": "", "country": "" }

    return { "status": 200, "data": userData }

@app.route("/user/get/<token>/<email>")
def get_user_data_by_email(token: str, email: str):
    user_data = db_helper.get_user_data(token, email)

    if user_data is None:
        return { "status": 404, "data": "" }

    return { "status": 200, "data": user_data }

def get_user_messages_by_token(token: str):
    userMessages: list = []

    return { "status": 200, "data": userMessages }

def get_user_messages_by_email(token: str, email: str):
    userMessages: list = []

    return { "status": 200, "data": userMessages }

def post_message(token: str, message: str, email: str):
    pass

if __name__ == "__main__":
    app.debug = True
    app.run()

