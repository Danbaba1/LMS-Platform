# Student API

## Project Description

This is a REST API used for managing student records. It is built with Node.js and Express.

## Features

### Get Students

- **Method:** `GET`
- **Endpoint:** `/students`
- **Response:**

```json
{
  "message": "Students returned successfully",
  "students": [...]
}
```

### Get Student By ID

- **Method:** `GET`
- **Endpoint:** `/students/:id`
- **Response:**

```json
{
  "message": "Student returned successfully",
  "student": {
    "id": 1,
    "name": "Daniel",
    "course": "Computer Science"
  }
}
```

### Create Student

- **Method:** `POST`
- **Endpoint:** `/students`
- **JSON Body:**

```json
{
  "name": "John",
  "course": "Physics"
}
```

- **Response:**

```json
{
  "message": "Student created successfully",
  "student": {
    "id": 3,
    "name": "John",
    "course": "Physics"
  }
}
```

### Update Student

- **Method:** `PATCH`
- **Endpoint:** `/students/:id`
- **JSON Body:**

```json
{
  "name": "John",
  "course": "Physics"
}
```

- **Response:**

```json
{
  "message": "Student updated successfully",
  "updatedStudent": {
    "id": 1,
    "name": "John",
    "course": "Physics"
  }
}
```

### Delete Student

- **Method:** `DELETE`
- **Endpoint:** `/students/:id`
- **Response:**

```json
{
  "message": "Student deleted successfully",
  "student": {
    "id": 1,
    "name": "Daniel",
    "course": "Computer Science"
  }
}
```

## Error Handling

The API uses centralized error handling with a custom `CustomError` class.

### Operational Errors

Operational errors are expected errors handled using the `CustomError` class.

Examples include:

- Invalid ID -> `400 Bad Request`
- Bad request -> `400 Bad Request`
- Student not found -> `404 not found`

**Status:** `400 Bad Request`

```json
{
  "message": "Invalid ID"
}
```

### Unexpected Errors

Unexpected errors are errors that are not explicitly handled as operational errors. They are logged by the server and return a generic `500 Internal Server Error` response.

`Example:`

**Status:** `500 Internal Server Error`

```json
{
  "message": "Server error"
}
```

## Installation and Setup

- Clone the GitHub repository: `git clone https://github.com/Danbaba1/Student-API.git`
- Enter the directory: `cd Student-API`
- Install the dependencies: `npm install`
- Start the server: `npm run dev`
- The API will run at: `http://localhost:3000/students`

## Testing

- To run the tests: `npm test`
- To run the test coverage: `npm test -- --coverage`
  | Category | Statements | Branches | Functions | Lines |
  |-------------|:----------:|:--------:|:---------:|:-----:|
  | All files | 100% | 100% | 100% | 100% |
  | controllers | 100% | 100% | 100% | 100% |
  | services | 100% | 100% | 100% | 100% |
  | routes | 100% | 100% | 100% | 100% |
  | app | 100% | 100% | 100% | 100% |
  | errors | 100% | 100% | 100% | 100% |

  | Metric      |        Result        |
  | ----------- | :------------------: |
  | Test Suites |  4 passed / 4 total  |
  | Tests       | 64 passed / 64 total |
