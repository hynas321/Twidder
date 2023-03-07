import sqlite3
import uuid
import re
from flask import g
from enum import Enum

DATABASE_URI = "database.db"

#get_db() - connects to the database if the connection was not made before
#or accesses the database.
def get_db():
    db = getattr(g, 'db', None)

    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)

    return db

#disconnect() - disconnect the database connection if such a connection exists.
def disconnect():
    db = getattr(g, 'db', None)

    if db is not None:
        g.db.close()
        g.db = None

#Class User represents table User in schema.sql.
class User:
    def __init__(
        self, 
        email: str, 
        password: str, 
        firstname: str, 
        familyname: str, 
        gender: str, 
        city: str, 
        country: str,
        current_location: str
    ):
        self.email = email
        self.password = password
        self.firstname = firstname
        self.familyname = familyname
        self.gender = gender
        self.city = city
        self.country = country
        self.current_location = current_location

#Class LoggedInUser represents table LoggedInUser in schema.sql.
class LoggedInUser:
    def __init__(self, token: str, email: str):
        self.token = token
        self.email = email

#Class Message represents table Message in schema.sql.
class Message:
    def __init__(self, email: str, writer: str, content: str, writer_location: str):
        self.email = email
        self.writer = writer
        self.content = content
        self.writer_location = writer_location

#Class UserDAO has access to the User table and its data.
class UserDAO:
    #create_user() creates a new user in the database.
    #Arguments: User object.
    #Returns: boolean.
    def create_user(self, user: User) -> bool:
        try:
            get_db().execute("INSERT INTO User VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    user.email,
                    user.password,
                    user.firstname,
                    user.familyname,
                    user.gender,
                    user.city,
                    user.country,
                    user.current_location
                ]
            )
            get_db().commit()

            return True

        except Exception as ex:
            print(ex)

            return False

    #get_user_data_by_email() gets user data from the database by email.
    #Arguments: email string.
    #Returns: DatabaseOutput Enum (NONE, ERROR) or User object.
    def get_user_data_by_email(self, email: str):
        try:
            cursor = get_db().cursor()
            cursor.execute("SELECT * FROM User WHERE email = ?", [email])
            cursor_output = cursor.fetchone()

            if cursor_output is None:
                return DatabaseOutput.NONE
            
            user = User(
                cursor_output[0],
                cursor_output[1],
                cursor_output[2],
                cursor_output[3],
                cursor_output[4],
                cursor_output[5],
                cursor_output[6],
                cursor_output[7]
            )

            cursor.close()

            return user

        except Exception as ex:
            print(ex)

            return DatabaseOutput.ERROR

    #get_user_data_by_token() gets user data from the database by token.
    #Arguments: token string.
    #Returns: DatabaseOutput Enum (NONE, ERROR) or User object.
    def get_user_data_by_token(self, token: str):
        try:
            cursor = get_db().cursor()
            cursor.execute("SELECT email FROM LoggedInUser WHERE token = ?", [token])
            cursor_output = cursor.fetchone()

            if cursor_output is None:
                return DatabaseOutput.NONE

            user_email = cursor_output[0]
            cursor.close()

            cursor = get_db().cursor()
            cursor.execute("SELECT * FROM User WHERE email = ?", [user_email])
            cursor_output = cursor.fetchone()

            if cursor_output is None:
                return DatabaseOutput.NONE

            user = User(
                cursor_output[0],
                cursor_output[1],
                cursor_output[2],
                cursor_output[3],
                cursor_output[4],
                cursor_output[5],
                cursor_output[6],
                cursor_output[7]
            )

            cursor.close()

            return user

        except Exception as ex:
            print(ex)

            return DatabaseOutput.ERROR

    #change_user_password() changes user's password in the database.
    #Arguments: email and new_password strings.
    #Returns: boolean.
    def change_user_password(self, email: str, new_password: str) -> bool:
        try:
            get_db().execute("UPDATE User SET password = ? WHERE email = ?", [new_password, email])
            get_db().commit()

            return True

        except Exception as ex:
            print(ex)

            return False
    
    #change_user_current_location() changes user's current location in the database.
    #Arguments: token and current_location strings.
    #Returns: boolean.
    def change_user_current_location(self, token: str, current_location: str) -> bool:
        try:
            user_dao = UserDAO()

            user = user_dao.get_user_data_by_token(token)

            if user is DatabaseOutput.NONE:
                return False
        
            get_db().execute("UPDATE User SET current_location = ? WHERE EMAIL = ?", [current_location, user.email])
            get_db().commit()

            return True
        
        except Exception as ex:
            print(ex)

            return False

#Class LoggedInUserDAO has access to the LoggedInUser table and its data.
class LoggedInUserDAO:
    #create_logged_in_user() - creates a new logged in user.
    #Arguments: LoggedInUser object.
    #Returns: boolean.
    def create_logged_in_user(self, logged_in_user: LoggedInUser) -> bool:
        try:
            get_db().execute("INSERT INTO LoggedInUser VALUES (?, ?)",
                [
                    logged_in_user.token,
                    logged_in_user.email
                ]
            )
            get_db().commit()
            return True

        except Exception as ex:
            print(ex)

            return False

    #delete_logged_in_user_by_token() - deletes user from the database by token.
    #Arguments: token string.
    #Returns: boolean.
    def delete_logged_in_user_by_token(self, token: str) -> bool:
        try:
            get_db().execute("DELETE FROM LoggedInUser WHERE token = ?", [token])
            get_db().commit()

            return True

        except Exception as ex:
            print(ex)

            return False

    #delete_logged_in_user_by_email() - deletes user from the database by email.
    #Arguments: email string.
    #Returns: boolean.
    def delete_logged_in_user_by_email(self, email: str) -> bool:
        try:
            get_db().execute("DELETE FROM LoggedInUser WHERE email = ?", [email])
            get_db().commit()

            return True

        except Exception as ex:
            print(ex)

            return False

    #get_logged_in_user_by_token() - gets logged in user by token from the database.
    #Arguments: token string.
    #Returns: DatabaseOutput Enum (NONE, ERROR) or LoggedInUser object.
    def get_logged_in_user_by_token(self, token: str):
        try:
            cursor = get_db().cursor()
            cursor.execute("SELECT * FROM LoggedInUser WHERE token = ?", [token])

            cursor_output = cursor.fetchone()

            if cursor_output is None:
                return DatabaseOutput.NONE

            logged_in_user = LoggedInUser(
                cursor_output[0],
                cursor_output[1]
            )

            cursor.close()

            return logged_in_user

        except Exception as ex:
            print(ex)

            return DatabaseOutput.ERROR

    #get_logged_in_user_by_email() - gets logged in user by email from the database.
    #Arguments: email string.
    #Returns: DatabaseOutput Enum (NONE, ERROR) or LoggedInUser object.
    def get_logged_in_user_by_email(self, email: str):
        try:
            cursor = get_db().cursor()
            cursor.execute("SELECT * FROM LoggedInUser WHERE email = ?", [email])
            cursor_output = cursor.fetchone()

            if cursor_output is None:
                return DatabaseOutput.NONE

            logged_in_user = LoggedInUser(
                cursor_output[0],
                cursor_output[1]
            )

            cursor.close()

            return logged_in_user

        except Exception as ex:
            print(ex)

            return DatabaseOutput.ERROR

#Class MessageDAO has access to the Message table and its data.
class MessageDao:
    #add_message() - adds a new message to the database.
    #Arguments: token, content, email, writer_location strings.
    #Returns: DatabaseOutput Enum (NONE, ERROR) or boolean.
    def add_message(self, token: str, content: str, email: str, writer_location: str) -> bool:
        try:
            user_dao = UserDAO()

            writer_user = user_dao.get_user_data_by_token(token)

            if writer_user is DatabaseOutput.NONE:
                return False

            recipient_user = user_dao.get_user_data_by_email(email)

            if recipient_user is DatabaseOutput.NONE:
                return False
            
            if writer_location == "null":
                writer_location = None

            get_db().execute("INSERT INTO Message VALUES (?, ?, ?, ?)",
                [
                    recipient_user.email,
                    writer_user.email,
                    content,
                    writer_location
                ]
            )
            get_db().commit()

            return True

        except Exception as ex:
            print(ex)

            return False
    
    #get_user_messages_by_token() - gets user messages by token from the database.
    #Arguments: token string.
    #Returns: DatabaseOutput Enum (NONE, ERROR) or list.
    def get_user_messages_by_token(self, token: str):
        try:
            logged_in_user_DAO = LoggedInUserDAO()
            logged_in_user = logged_in_user_DAO.get_logged_in_user_by_token(token)

            if logged_in_user is DatabaseOutput.NONE:
                return DatabaseOutput.NONE

            cursor = get_db().cursor()
            cursor.execute("SELECT * FROM Message WHERE recipient = ?", [logged_in_user.email])

            cursor_output = cursor.fetchall()

            if len(cursor_output) == 0:
                return DatabaseOutput.NONE

            result: list = []
            for output in cursor_output:
                result.append({"recipient": output[0], "writer": output[1], 
                               "content": output[2], "writer_location": output[3]}
                )

            cursor.close()

            return result

        except Exception as ex:
            print(ex)

            return DatabaseOutput.ERROR

    #get_user_messages_by_email() - gets user messages by email from the database.
    #Arguments: email string.
    #Returns: DatabaseOutput Enum (NONE, ERROR) or list.
    def get_user_messages_by_email(self, email: str):
        try:
            cursor = get_db().cursor()
            cursor.execute("SELECT * FROM Message WHERE recipient = ?", [email])

            cursor_output = cursor.fetchall()

            if len(cursor_output) == 0:
                return DatabaseOutput.NONE

            result: list = []
            for output in cursor_output:
                if not output[3] == "null":
                    result.append({"recipient": output[0], "writer": output[1], 
                        "content": output[2], "writer_location": output[3]}
                    )
                else:
                    result.append({"recipient": output[0], "writer": output[1], 
                        "content": output[2]}
                    )

            cursor.close()

            return result

        except Exception as ex:
            print(ex)

            return DatabaseOutput.ERROR

#Class TokenManager handles token generation and verification.
class TokenManager:
    #generate_token() - generates token using hexadecimal notation.
    #Returns: boolean.
    def generate_token(self) -> str:
        return uuid.uuid4().hex

    #verify_token() - verifies token by checking if the logged in user with such a token exists.
    #Returns: boolean.
    def verify_token(self, token: str) -> bool:
        logged_in_user_DAO = LoggedInUserDAO()
        logged_in_user = logged_in_user_DAO.get_logged_in_user_by_token(token)

        if logged_in_user is DatabaseOutput.NONE:
            return False
        
        return True

#Class InputManager handles string verification.
class InputManager:
    #verify_credentials() - verifies email format and password length.
    #Arguments: email, password strings.
    #Returns: boolean.
    def verify_credentials(self, email, password) -> bool:
        return self.verify_email_format(email) and self.verify_password_length(password)

    #verify_email_format() - verifies email format by regular expressions.
    #Arguments: email string.
    #Returns: boolean.
    def verify_email_format(self, email) -> bool:
        email_format = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

        return re.match(email_format, email) is not None
    
    #verify_password_length() - verifies password length.
    #Arguments: password string.
    #Returns: boolean.
    def verify_password_length(self, password) -> bool:
        min_password_length = 6

        return len(password) >= min_password_length

    #verify_string_not_empty() - checks if the string is not empty.
    #Arguments: string
    #Returns: boolean.
    def verify_string_not_empty(self, string) -> bool:
        return len(string.strip()) != 0

#Enum DatabaseOutput has two values: 
#NONE - when nothing is returned from the database,
#ERROR - when the exception is raised while accessing the database.
class DatabaseOutput(Enum):
    NONE = 1,
    ERROR = 2,