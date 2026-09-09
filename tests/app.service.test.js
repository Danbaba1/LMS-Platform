import { StudentService } from '../services/app.service.js';
import { jest } from '@jest/globals';

const mockPool = {
    query: jest.fn()
};

let studentService;

beforeEach(() => {
    studentService = new StudentService(mockPool);

    jest.clearAllMocks();
});

describe('it should return an array', () => {
    test('an array should be returned', async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "id": 3,
                    "name": "John Smith",
                    "course": "Physics"
                },
                {
                    "id": 4,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 5,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 6,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 7,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 8,
                    "name": "Michael",
                    "course": "History"
                }
            ]
        });
        const result = await studentService.getStudents();
        expect(result).toEqual(
            [
                {
                    "id": 3,
                    "name": "John Smith",
                    "course": "Physics"
                },
                {
                    "id": 4,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 5,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 6,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 7,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 8,
                    "name": "Michael",
                    "course": "History"
                }
            ]
        );
        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(
            'SELECT * FROM student'
        );
    });
});

describe('it should return all the students', () => {
    test('all the students should be returned', async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "id": 3,
                    "name": "John Smith",
                    "course": "Physics"
                },
                {
                    "id": 4,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 5,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 6,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 7,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 8,
                    "name": "Michael",
                    "course": "History"
                }
            ]
        });

        const result = await studentService.getStudents();
        expect(result).toEqual(
            [
                {
                    "id": 3,
                    "name": "John Smith",
                    "course": "Physics"
                },
                {
                    "id": 4,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 5,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 6,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 7,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 8,
                    "name": "Michael",
                    "course": "History"
                }
            ]
        );
        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(
            'SELECT * FROM student'
        );
    });
});

describe('it should return the correct student with an existing id', () => {
    test('the correct student with the existing id should be returned', async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "id": 3,
                    "name": "John Smith",
                    "course": "Physics"
                },
                {
                    "id": 4,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 5,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 6,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 7,
                    "name": "John",
                    "course": "Physics"
                },
                {
                    "id": 8,
                    "name": "Michael",
                    "course": "History"
                }
            ]
        });
        const id = 3;
        const result = await studentService.getStudentById(id);
        expect(result).toEqual({
            "id": 3,
            "name": "John Smith",
            "course": "Physics"
        });

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(
            'SELECT * FROM student WHERE id = $1', [id]
        );
    });
});

describe('it should return undefined with a non-existing id', () => {
    test('undefined should be returned with a non-existing id', async () => {
        mockPool.query.mockResolvedValue({
            rows: [

            ]
        });
        const id = 999;
        const result = await studentService.getStudentById(id);
        expect(result).toBeUndefined();

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(
            'SELECT * FROM student WHERE id = $1', [id]
        );
    });
});

describe('it should return the newly created student', () => {
    test('the newly created student should be returned', async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "id": 1,
                    "name": "Jack Sow",
                    "course": "Pics"
                }
            ]
        });
        const name = "John";
        const course = "Physics";
        const newStudent = await studentService.createStudent(name, course);
        expect(newStudent).toEqual(
            {
                "id": 1,
                "name": "Jack Sow",
                "course": "Pics"
            }
        );

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(
            'INSERT INTO student (name, course) VALUES ($1, $2) RETURNING *', [name, course]
        );
    });
});

describe("it should return undefined when I try to update a student that doesn't exist", () => {
    test('should return undefined when trying to update a non-existent student', async () => {
        mockPool.query.mockResolvedValue({
            rows: [

            ]
        });
        const id = 999;
        const studentData = { name: "John" };
        const updatedStudent = await studentService.updateStudent(studentData, id);
        expect(updatedStudent).toBeUndefined();

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(
            'UPDATE student SET name = COALESCE($1, name), course = COALESCE($2, course) WHERE id = $3 RETURNING *',
            [studentData.name, studentData.course, id]
        );
    });
});

describe("it should return the updated student when I update an existing student", () => {
    test('should return updated student when I update an existing student', async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "id": 1,
                    "name": "John",
                    "course": "Physics"
                }
            ]
        });
        const id = 1;
        const studentData = { name: "John", course: "Physics" }
        const updatedStudent = await studentService.updateStudent(studentData, id);
        expect(updatedStudent).toEqual({
            "id": 1,
            "name": "John",
            "course": "Physics"
        });

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(
            'UPDATE student SET name = COALESCE($1, name), course = COALESCE($2, course) WHERE id = $3 RETURNING *',
            [studentData.name, studentData.course, id]
        );
    });
});

describe("it should return the updated student when I update only the name of an existing student", () => {
    test('should return updated student when I update only the name of an existing student', async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "id": 1,
                    "name": "John",
                    "course": "Physics"
                }
            ]
        });
        const id = 1;
        const studentData = { name: "John" }
        const updatedStudent = await studentService.updateStudent(studentData, id);
        expect(updatedStudent).toEqual({
            "id": 1,
            "name": "John",
            "course": "Physics"
        });

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(
            'UPDATE student SET name = COALESCE($1, name), course = COALESCE($2, course) WHERE id = $3 RETURNING *',
            [studentData.name, studentData.course, id]
        );
    });
});

describe("it should return the updated student when I update only the course of an existing student", () => {
    test('should return updated student when I update only the course of an existing student', async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "id": 1,
                    "name": "Jack",
                    "course": "Physics"
                }
            ]
        });
        const id = 1;
        const studentData = { course: "Physics" }
        const updatedStudent = await studentService.updateStudent(studentData, id);
        expect(updatedStudent).toEqual({
            "id": 1,
            "name": "Jack",
            "course": "Physics"
        });

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(
            'UPDATE student SET name = COALESCE($1, name), course = COALESCE($2, course) WHERE id = $3 RETURNING *',
            [studentData.name, studentData.course, id]
        );
    });
});

describe('it should return undefined when deleting a non-existent student', () => {
    test('undefined should be returned when deleting a non-existent student', async () => {
        mockPool.query.mockResolvedValue({
            rows: [

            ]
        });
        const id = 999;
        const deletedStudent = await studentService.deleteStudent(id);
        expect(deletedStudent).toBeUndefined();

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(
            'DELETE FROM student WHERE id = $1 RETURNING *',
            [id]
        );
    });
});

describe('it should delete an existing student and return the deleted student', () => {
    test('deleted student should be returned when deleting an existing student', async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "id": 1,
                    "name": "Jack Sow",
                    "course": "Pics"
                }
            ]
        })
        const id = 1;
        const deletedStudent = await studentService.deleteStudent(id);

        expect(deletedStudent).toEqual({
            "id": 1,
            "name": "Jack Sow",
            "course": "Pics"
        });

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(
            'DELETE FROM student WHERE id = $1 RETURNING *',
            [id]
        );
    });
});