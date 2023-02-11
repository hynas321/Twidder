CREATE TABLE IF NOT EXISTS User(
    email VARCHAR(60) PRIMARY KEY,
    password VARCHAR(60),
    firstname VARCHAR(60),
    familyname VARCHAR(60),
    gender VARCHAR(60),
    city VARCHAR(60),
    country VARCHAR(60)
)

CREATE TABLE IF NOT EXISTS LoggedInUser(
    token VARCHAR(60) PRIMARY KEY,
    email VARCHAR(60)
)

CREATE TABLE IF NOT EXISTS Message(
    email VARCHAR(60),
    writer VARCHAR(60),
    content VARCHAR(240)
)