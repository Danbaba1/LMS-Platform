import { StudentService } from '../services/app.service.js';
import { jest } from '@jest/globals';

const mockPool = {
    query: jest.fn(),
    connect: jest.fn()
};

const mockAuthService = {
    registerStudentTx: jest.fn()
}

let studentService;

beforeEach(() => {
    studentService = new StudentService(mockPool, mockAuthService);

    jest.clearAllMocks();
});

describe('it should return an array', () => {
    test('an array should be returned', async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "id": 1,
                    "name": "Sharon",
                    "userId": 1
                }
            ]
        });
        const result = await studentService.getStudents();
        expect(result).toEqual(
            [
                {
                    "id": 1,
                    "name": "Sharon",
                    "userId": 1
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
        const mockClient = {
            query: jest.fn(),
            release: jest.fn()
        }

        mockPool.connect.mockResolvedValue(mockClient);

        mockAuthService.registerStudentTx.mockResolvedValue({
            "id": 1
        });

        mockClient.query.mockResolvedValue({
            rows: [
                {
                    "id": 1,
                    "name": "John",
                    "user_id": 1
                }
            ]
        });

        const name = "John";
        const username = 'Johwell34';
        const email = "johnn@gmail.com";
        const password = 'barcabous';
        const newStudent = await studentService.createStudent(name, username, email, password);
        expect(newStudent).toEqual(
            {
                "id": 1,
                "name": "John",
                "user_id": 1
            }
        );

        expect(mockClient.query).toHaveBeenCalledTimes(4);

        expect(mockClient.query).toHaveBeenCalledWith(
            'INSERT INTO student (name, user_id) VALUES ($1, $2) RETURNING *', [name, 1]
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
        const name = "John";
        const updatedStudent = await studentService.updateStudent(name, id);
        expect(updatedStudent).toBeUndefined();

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(
            'UPDATE student SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
    });
});

describe("it should return the updated student when I update an existing student", () => {
    test('should return updated student when I update an existing student', async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "id": 1,
                    "name": "John"
                }
            ]
        });
        const id = 1;
        const name = "John";
        const updatedStudent = await studentService.updateStudent(name, id);
        expect(updatedStudent).toEqual({
            "id": 1,
            "name": "John"
        });

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(
            'UPDATE student SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
    });
});

describe('it should return undefined when deactivating a non-existent student', () => {
    test('undefined should be returned when deactivating a non-existent student', async () => {
        mockPool.query.mockResolvedValue({
            rows: [

            ]
        });
        const id = 999;
        const deactivatedStudent = await studentService.deactivateStudent(id);
        expect(deactivatedStudent).toBeUndefined();

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(
            `WITH updated_user AS (
    UPDATE "user" SET status = 'inactive' WHERE id = (SELECT user_id FROM student WHERE id = $1) RETURNING id
)
SELECT student.* FROM student
JOIN updated_user ON student.user_id = updated_user.id;`,
            [id]
        );
    });
});

describe('it should deactivate an existing student and return the deactivated student', () => {
    test('deactivated student should be returned when deactivating an existing student', async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "id": 1,
                    "name": "Jack Sow"
                }
            ]
        })
        const id = 1;
        const deactivatedStudent = await studentService.deactivateStudent(id);

        expect(deactivatedStudent).toEqual({
            "id": 1,
            "name": "Jack Sow"
        });

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(
            `WITH updated_user AS (
    UPDATE "user" SET status = 'inactive' WHERE id = (SELECT user_id FROM student WHERE id = $1) RETURNING id
)
SELECT student.* FROM student
JOIN updated_user ON student.user_id = updated_user.id;`,
            [id]
        );
    });
});