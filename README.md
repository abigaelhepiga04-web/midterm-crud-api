## Project Description

The Midterm CRUD API is a RESTful API developed using Node.js, TypeScript, Express.js, TypeORM, and MySQL.

The purpose of this lab activity is to demonstrate the basic CRUD (Create, Read, Update, Delete) operations through a REST API. The application manages user information stored in a MySQL database.

The project uses TypeORM as the Object-Relational Mapping (ORM) tool to connect the TypeScript application to the MySQL database. The User entity represents the users table in the database.


## Setup Instructions

Prerequisites:
[ ] MySQL Server is installed and running
[ ] MySQL Workbench (or DBeaver) is installed
[ ] Node.js (v20 or v22 LTS) is installed
[ ] You have VS Code with TypeScript support
[ ] You have Postman or Insomnia installed
[ ] You have completed Activity 6 (TypeScript Basics Lab)
[ ] You understand REST principles from Module 4


STEP A: Create the Database

Step B: Create a Database User (Optional but Recommended)


Step C: Create the Project Structure

Step 1: Open the Project/Folder
Open the project folder:

midterm-crud-api

Then open the folder in Visual Studio Code.

npm init -y

Step 2: Install Dependencies

`npm install express typeorm mysql2 reflect-metadata dotenv`

`npm install @types/node --save-dev`

`npm install typescript ts-node ts-node-dev --save-dev`

Initialize Typescript
`npx  tsc --init`

Update `tsconfig.json` to match this configuration:

Create the folder structure:

Update `package.json` scripts:


Step D: Create Environment Variables

Create a `.env` file in the root:


Step E: Create `.gitignore`

Create a `.gitignore` file:

Step F: Create the DataSource

Open `src/config/data-source.ts` and paste:

Step G: Create the User Entity

Open `src/entities/User.ts` and paste:


Step H: Create the User Controller

Open `src/controllers/userController.ts` and copy:

Step I: Create the User Routes

Open `src/routes/userRoutes.ts` and paste:

Step J: Create the Express App Entry Point

Open `src/index.ts` and paste:


Step K: Install CORS

`npm install cors`
`npm install @types/cors --save-dev`

## How to Run the Application

Step L: Start the Development Server

`npm run dev`

The application should display a successful database connection and server startup similar to:

Database connected successfully!
Server running on http://localhost:3000
Health check: http://localhost:3000/health
Users API: http://localhost:3000/api/users


## API endpoints documentation

The base URL of the API is:

http://localhost:3000

1. Health Check
GET /health

Checks whether the API server is running.

Request:

GET http://localhost:3000/health

Purpose:
Returns a response confirming that the server is operational.

2. Get All Users (Empty)
Method: `GET`
URL: `http://localhost:3000/api/users`
Expected: `200 OK` with `{ "success": true, "count": 0, "data": [] }`


3. Create User 1
POST /api/users

Creates a new user in the database.

Request:

POST http://localhost:3000/api/users

Example JSON body:

{
  "name": "Abigael Hepiga",
  "email": "abigael@example.com",
  "password": "password1234"
}


Purpose:
Creates and stores a new user record in the users table.

4. Create User 2
Method: `POST`
URL: `http://localhost:3000/api/users`
Body (raw JSON):
{
   "name": "Art Hepiga",
   "email": "art@example.com",
   "password": "securepass"
} 
Expected: `201 Created`


5. Get All Users (Should Have 2)
Method: `GET`
URL: `http://localhost:3000/api/users`
Expected: `200 OK` with `count: 2` and both users


6. Get User by ID
GET /api/users/1

Retrieves a specific user using their ID.

Example:

GET http://localhost:3000/api/users/1

Purpose:
Used to retrieve the details of a specific user.

7.  Get Non-Existent User
Method: `GET`
URL: `http://localhost:3000/api/users/999`
Expected: `404 Not Found` with error message


8.  Create User with Duplicate Email
Method: `POST`
URL: `http://localhost:3000/api/users`
Body:
  {
      "name": "Abigael Duplicate",
      "email": "abigael@example.com",
      "password": "password"
  }
Expected: `409 Conflict` with "email already exists" error


9. Create User with Missing Fields
POST /api/users

URL: `http://localhost:3000/api/users`
Body:
{
      "name": "Incomplete User"
}
Expected: `400 Bad Request` with "missing fields" error



10. Update a User
PUT /api/users/:id

Updates an existing user's information.

Example:

PUT http://localhost:3000/api/users/1

Example JSON body:

{
  "name": "Abigael Updated",
  "isActive": false
}

Purpose:
Modifies the information of an existing user based on their ID.


11. Delete a User
DELETE /api/users/2

Deletes a user from the database.

Example:

DELETE `http://localhost:3000/api/users/2`

Purpose:
Removes the specified user record from the database.


12.  Verify Deletion

Method: `GET`
URL: `http://localhost:3000/api/users`
Expected: `200 OK` with only 1 user remaining


13. Test 404 Route

Route does not exist

Method: `GET`
URL: `http://localhost:3000/api/nonexistent`
Expected: `404 Not Found` with route not found error


## Reflection Answers

1. What was the most challenging part of building this API?

Handling all the validation edge cases like properly casting route parameter strings into numbers, checking for existing emails before saving, and making sure the password field doesn't leak in the API response.

2. How does TypeORM make database operations easier compared to raw SQL?

It replaces long SQL strings with plain JavaScript/TypeScript functions like `.find()` or `.save()`. It gives us auto-completion, prevents SQL injection, and lets us define table structures directly inside TypeScript classes using decorators.

3. Why is it important to exclude the password field from API responses? How did you implement this?

It is important to exclude the password field from API responses because returning passwords in API responses exposes sensitive data. I implemented it by setting { select: false } on the password column in the User entity so TypeORM doesn't select it by default, and used object destructuring (const { password: _, ...userWithoutPassword } = savedUser) in the controller to strip it out before sending the response.

4. Describe a scenario where you would need to use database transactions instead of individual operations.

Creating an order while deducting stock in an e-commerce app. If deducting stock works but creating the order fails halfway through, a transaction rolls everything back so you don't lose stock without an order record.

5. What is the difference between `synchronize: true` and migrations? When should you use each?
`synchronize: true` automatically updates database tables whenever you change entity classes while migrations are SQL scripts that track schema changes step-by-step. We use `synchronize: true` for Development only, because it can accidentally drop tables or columns and wipe data. And as for migrations we use it for Production, where schema updates must be tested, controlled, and safe.   

6. If you had to add a `Product` entity with a relationship to `User` (a user can have many products), how would you modify the code?
``// User.ts
import { OneToMany } from 'typeorm';
import { Product } from './Product';

@OneToMany(() => Product, (product) => product.user)
products!: Product[];
``
``// Product.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @ManyToOne(() => User, (user) => user.products)
  user!: User;
}
``
7. What security improvements would you make before deploying this API to production? (Hint: password hashing, rate limiting, authentication, etc.)

Password Hashing: Use bcrypt to hash passwords before saving them.   
Authentication: Protect endpoints using JWT tokens.
Rate Limiting: Add express-rate-limit to prevent spam and brute-force attacks.
Input Validation: Use class-validator or zod to validate incoming body data.
Environment Safety: Turn off synchronize: true in production and use environment variables for database credentials.
