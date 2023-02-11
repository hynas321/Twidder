import sqlite3
import uuid
from flask import g

DATABASE_URI = "database.db"

def get_db():
    db = getattr(g, 'db', None)

    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)

        db.execute(
            """CREATE TABLE IF NOT EXISTS User(
                    email VARCHAR(60) PRIMARY KEY,
                    password VARCHAR(60),
                    firstname VARCHAR(60),
                    familyname VARCHAR(60),
                    gender VARCHAR(60),
                    city VARCHAR(60),
                    country VARCHAR(60)
                )"""
        )

        db.execute(
            """CREATE TABLE IF NOT EXISTS LoggedInUser(
                    token VARCHAR(60) PRIMARY KEY,
                    email VARCHAR(60)
                )"""
        )

        db.execute(
            """CREATE TABLE IF NOT EXISTS Message(
                email VARCHAR(60) PRIMARY KEY,
                writer VARCHAR(60),
                content VARCHAR(240)
            )"""
        )
    return db

def disconnect():
    db = getattr(g, 'db', None)

    if db is not None:
        g.db.close()
        g.db = None

class User:
    def __init__(
        self, 
        email: str, 
        password: str, 
        firstname: str, 
        familyname: str, 
        gender: str, 
        city: str, 
        country: str
    ):
        self.email = email
        self.password = password
        self.firstname = firstname
        self.familyname = familyname
        self.gender = gender
        self.city = city
        self.country = country

class LoggedInUser:
    def __init__(self, token: str, email: str):
        self.token = token
        self.email = email

class Message:
    def __init__(self, email: str, writer: str, content: str):
        self.email = email
        self.writer = writer
        self.content = content

class UserDAO:
    def create_user(self, user: User) -> bool:
        try:
            get_db().execute("INSERT INTO User VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    user.email,
                    user.password,
                    user.firstname,
                    user.familyname,
                    user.gender,
                    user.city,
                    user.country
                ]
            )
            get_db().commit()

            return True

        except Exception as ex:
            print(ex)

            return False

    def get_user_data_by_email(self, email: str):
        try:
            cursor = get_db().cursor()
            cursor.execute("SELECT * FROM User WHERE email = ?", [email])
            cursor_output = cursor.fetchone()

            if cursor_output is None:
                return None
            
            user = User(
                cursor_output[0],
                cursor_output[1],
                cursor_output[2],
                cursor_output[3],
                cursor_output[4],
                cursor_output[5],
                cursor_output[6]
            )

            cursor.close()

            return user

        except Exception as ex:
            print(ex)

            return None

    def get_user_data_by_token(self, token: str):
        try:
            cursor = get_db().cursor()
            cursor.execute("SELECT email FROM LoggedInUser WHERE token = ?", [token])
            cursor_output = cursor.fetchone()

            if cursor_output is None:
                return None
            user_email = cursor_output[0]
            cursor.close()

            cursor = get_db().cursor()
            cursor.execute("SELECT * FROM User WHERE email = ?", [user_email])
            cursor_output = cursor.fetchone()

            if cursor_output is None:
                return None

            user = User(
                cursor_output[0],
                cursor_output[1],
                cursor_output[2],
                cursor_output[3],
                cursor_output[4],
                cursor_output[5],
                cursor_output[6]
            )

            cursor.close()

            return user

        except Exception as ex:
            print(ex)

            return None

    def change_user_password(self, email: str, new_password: str) -> bool:
        try:
            get_db().execute("UPDATE User SET password = ? WHERE email = ?", [new_password, email])
            get_db().commit()

            return True

        except Exception as ex:
            print(ex)

            return False
        
class LoggedInUserDAO:
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

    def delete_logged_in_user(self, token: str) -> bool:
        try:
            get_db().execute("DELETE FROM LoggedInUser WHERE token = ?", [token])
            get_db().commit()

            return True

        except Exception as ex:
            print(ex)

            return False

    def get_logged_in_user_by_token(self, token: str):
        try:
            cursor = get_db().cursor()
            cursor.execute("SELECT * FROM LoggedInUser WHERE token = ?", [token])

            cursor_output = cursor.fetchone()

            if cursor_output is None:
                return None

            logged_in_user = LoggedInUser(
                cursor_output[0],
                cursor_output[1]
            )

            cursor.close()

            return logged_in_user

        except Exception as ex:
            print(ex)

            return None

    def get_logged_in_user_by_email(self, email: str):
        try:
            cursor = get_db().cursor()
            cursor.execute("SELECT * FROM LoggedInUser WHERE email = ?", [email])
            cursor_output = cursor.fetchone()

            if cursor_output is None:
                return None

            logged_in_user = LoggedInUser(
                cursor_output[0],
                cursor_output[1]
            )

            cursor.close()

            return logged_in_user

        except Exception as ex:
            print(ex)

            return None

class MessageDao:
    def add_message(self, token: str, message: str, email: str) -> bool:
        try:
            user_dao = UserDAO()

            writer_user = user_dao.get_user_data_by_token(token)

            if writer_user is None:
                return False

            recipient_user = user_dao.get_user_data_by_email(email)

            if recipient_user is None:
                return False

            get_db().execute("INSERT INTO Message VALUES (?, ?, ?)",
                [
                    recipient_user.email,
                    writer_user.email,
                    message
                ]
            )
            get_db().commit()

            return True

        except Exception as ex:
            print(ex)

            return False
    
    def get_user_messages_by_token(self, token: str):
        try:
            logged_in_user_DAO = LoggedInUserDAO()
            logged_in_user = logged_in_user_DAO.get_logged_in_user_by_token(token)

            if logged_in_user is None:
                return None

            cursor = get_db().cursor()
            cursor.execute("SELECT * FROM Message WHERE email = ?", [logged_in_user.email])

            cursor_output = cursor.fetchall()

            if cursor_output is None:
                return None

            result: list = []
            for output in cursor_output:
                result.append(output)

            cursor.close()

            return result

        except Exception as ex:
            print(ex)

            return None

    def get_user_messages_by_email(self, email: str):
        try:
            cursor = get_db().cursor()
            cursor.execute("SELECT * FROM Message WHERE email = ?", [email])

            cursor_output = cursor.fetchall()

            if cursor_output is None:
                return None

            result: list = []
            for output in cursor_output:
                result.append(output)

            cursor.close()

            return result

        except Exception as ex:
            print(ex)

            return None
        
class TokenManager:
    def generate_token(self) -> str:
        return uuid.uuid4().hex

    def verify_token(self, token: str) -> bool:
        logged_in_user_DAO = LoggedInUserDAO()
        logged_in_user = logged_in_user_DAO.get_logged_in_user_by_token(token)

        if logged_in_user is None:
            return False
        
        return True

