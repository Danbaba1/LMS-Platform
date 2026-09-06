import request from 'supertest';
import { StudentService } from '../services/app.service.js';
import { StudentController } from '../controllers/app.controller.js';
import { createRouter } from '../routes/app.route.js';
import { createApp } from '../app.js';
import { jest } from '@jest/globals';

let studentService;
let app;

let consoleErrorSpy;

beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

    studentService = new StudentService();
    const controller = new StudentController(studentService);
    const router = createRouter(controller);
    app = createApp(router);
});

afterEach(() => {
    consoleErrorSpy.mockRestore();
});

describe('Students API Endpoints', () => {
    describe('GET /students', () => {
        it('should return an array of students and a 200 status', async () => {
            const response = await request(app).get('/students').expect('Content-Type', 'application/json; charset=utf-8');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.students)).toBe(true);
            expect(response.body.message).toBe('Students returned successfully');
            expect(response.body.students[0].name).toBe('Daniel');
        });

        it('should return 500 for non-operational error', async () => {
            jest.spyOn(studentService, 'getStudents').mockRejectedValue(new Error('Db connection failed'));

            const response = await request(app)
                .get('/students');

            expect(response.status).toBe(500);

            expect(response.body.message).toBe('Server error');
        });
    });

    describe('POST /students', () => {
        it('should create a new student', async () => {
            const response = await request(app)
                .post('/students')
                .send({ name: 'Michael', course: 'History' });

            expect(response.status).toBe(201);
        });

        it('should return 400 when missing either name or course', async () => {
            const response = await request(app)
                .post('/students').send({ name: 'John' });

            expect(response.status).toBe(400);

            expect(response.body.message).toBe('Please complete the fields');
        });

        it('should return 400 when there is a leading whitespace', async () => {
            const response = await request(app)
                .post('/students').send({ name: ' John', course: 'Physics' });

            expect(response.status).toBe(400);

            expect(response.body.message).toBe('Please complete the fields');
        });

        it('should return 400 when there is an invalid name', async () => {
            const response = await request(app)
                .post('/students').send({ name: 'John3', course: 'Physics' });

            expect(response.status).toBe(400);

            expect(response.body.message).toBe('Bad request');
        });
    });

    describe('GET /students/:id', () => {
        it('should return 404 for a non-existent student', async () => {
            const id = 999;
            const response = await request(app).get(`/students/${id}`).expect('Content-Type', 'application/json; charset=utf-8');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Student not found');
        });
    });

    describe('PATCH /students/:id', () => {
        it('should return 200 for successful update', async () => {
            const id = 1;
            const response = await request(app)
                .patch(`/students/${id}`)
                .send({ name: "John" });

            expect(response.status).toBe(200);

            expect(response.body.message).toBe('Student updated successfully');

            expect(response.body.updatedStudent.name).toBe('John');
        });

        it('should return 404 for updating a non-existent student', async () => {
            const id = 999;
            const response = await request(app)
                .patch(`/students/${id}`)
                .send({ name: 'John' });

            expect(response.status).toBe(404);

            expect(response.body.message).toBe('Student not found');
        });

        it('should return 400 for invalid ID', async () => {
            const id = 'abc';
            const response = await request(app)
                .patch(`/students/${id}`)
                .send({ name: 'John' });

            expect(response.status).toBe(400);

            expect(response.body.message).toBe('Invalid ID');
        });

        it('should return 400 when there is no request body', async () => {
            const id = 1;
            const response = await request(app)
                .patch(`/students/${id}`)
                .send();

            expect(response.status).toBe(400);

            expect(response.body.message).toBe('Bad request');
        });

        it('should return 400 when there are no keys in the request body', async () => {
            const id = 1;
            const response = await request(app)
                .patch(`/students/${id}`)
                .send({});

            expect(response.status).toBe(400);

            expect(response.body.message).toBe('Bad request');
        });

        it('should return 400 when either field is an empty string', async () => {
            const id = 1;
            const response = await request(app)
                .patch(`/students/${id}`)
                .send({ name: '' });

            expect(response.status).toBe(400);

            expect(response.body.message).toBe('Bad request');
        });

        it('should return 400 when either field has a trailing space', async () => {
            const id = 1;
            const response = await request(app)
                .patch(`/students/${id}`)
                .send({ name: ' John' });

            expect(response.status).toBe(400);

            expect(response.body.message).toBe('Bad request');
        });

        it('should return 400 when name is invalid', async () => {
            const id = 1;
            const response = await request(app)
                .patch(`/students/${id}`)
                .send({ name: 'John3' });

            expect(response.status).toBe(400);

            expect(response.body.message).toBe('Bad request');
        });
    });

    describe('DELETE /students', () => {
        it('should return 200 for successful delete', async () => {
            const id = 1;
            const response = await request(app)
                .delete(`/students/${id}`);

            const result = await request(app)
                .get(`/students/${id}`);

            expect(response.status).toBe(200);

            expect(result.body.message).toBe('Student not found');

            expect(response.body.message).toBe('Student deleted successfully');
        });

        it('should return 404 for deleting non-existent student', async () => {
            const id = 999;
            const response = await request(app)
                .delete(`/students/${id}`);

            expect(response.status).toBe(404);

            expect(response.body.message).toBe('Student not found');
        });

        it('should return 400 for invalid ID', async () => {
            const id = 'abc';
            const response = await request(app)
                .delete(`/students/${id}`);

            expect(response.status).toBe(400);

            expect(response.body.message).toBe('Invalid ID');
        });
    });
});
