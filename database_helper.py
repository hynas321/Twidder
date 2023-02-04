import sqlite3
from flask import g

class Database:
    def __init__(self, database_file):
        self.db = sqlite3.connect(database_file)

        self.db.execute(
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

        self.db.execute(
            """CREATE TABLE IF NOT EXISTS LoggedInUser(
                    token VARCHAR(60) PRIMARY KEY,
                    email VARCHAR(60)
                )"""
        )

    def close(self):
        self.db.close()
        
    def get_connection(self):
        return self.db

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

class UserDAO:
    def __init__(self, database: Database):
        self.db = database.get_connection()

    def create_user(self, user: User) -> bool:
        try:
            cursor = self.db.cursor()
            cursor.execute("INSERT INTO User VALUES (?, ?, ?, ?, ?, ?, ?)",
                (
                    user.email,
                    user.password,
                    user.firstname,
                    user.familyname,
                    user.gender,
                    user.city,
                    user.country
                )
            )
            self.db.commit()

            return True

        except Exception as ex:
            print(ex)
            self.db.rollback()

            return False

    def get_user_by_email(self, email: str) :
        try:
            cursor = self.db.cursor()
            cursor.execute("SELECT * FROM User WHERE email=?", (email,))

            cursor_output = cursor.fetchone()

            user = User(
                cursor_output[0],
                cursor_output[1],
                cursor_output[2],
                cursor_output[3],
                cursor_output[4],
                cursor_output[5],
                cursor_output[6]
            )

            return user

        except Exception as ex:
            print(ex)
            self.db.rollback()

            return None
