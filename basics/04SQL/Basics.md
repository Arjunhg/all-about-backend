--> After installation of MySQL, you can start using it by opening a terminal/command prompt.
    : mysql --version -> check if mysql is installed
    : mysql -u username -p -> enter password
        : once password is entered, you are now connected to the mysql server.
    : Now we can start sql commands.

--> Case-Sensitive:
    : Database and table names-
        - ✅ Yes (on Linux/macOS), no (on Windows). users ≠ Users (on linux)
    : Aliases-
        - ✅ Yes. SELECT name AS FullName ≠ SELECT name AS fullname
    : Stored Procedures & Functions-
        - ✅ Yes. CALL myFunction(); ≠ CALL MYFUNCTION();

--> Case-Insensitive:
    : SQL Keywords & Commands-
        - ❌ No. SELECT * FROM users; = select * from USERS;
    : Column Names-
        - ❌ No. SELECT name FROM users; = SELECT NAME FROM users;
    : Data Types (INT, VARCHAR, etc.)-
        - ❌ No. VARCHAR(100) = varchar(100)
    : Constraints (PRIMARY KEY, NOT NULL, etc.)-
        - ❌ No. PRIMARY KEY = primary key
    : Operators (AND, OR, IN, etc.)
        - ❌ No. WHERE age IN (10, 20, 30) = where AGE in (10, 20, 30)

--> In SQL, you can control case sensitivity in different ways depending on your database system. Both UTF8_BIN and BINARY are approaches to enforce case sensitivity.
    : UTF8_BIN is a MySQL collation that makes string comparisons case-sensitive. 
    : BINARY keyword can be used in several ways:
        - As a column attribute to force binary comparison
        - In queries to force case-sensitive comparison etc.

--> mysql> show databases; -> This list all the databases in the server.
    : mysql> create database database_name; -> This will create a new database. And we can run show databases to check if the database is created or not.