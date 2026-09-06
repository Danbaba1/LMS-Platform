import { StudentController } from "../controllers/app.controller.js";
import express from 'express';

export function createRouter(studentController = new StudentController()) {
    const router = express.Router();

    router.get('/', studentController.asyncHandler(studentController.getStudents));
    router.get('/:id', studentController.asyncHandler(studentController.getStudentById));
    router.post('/', studentController.asyncHandler(studentController.createStudent));
    router.patch('/:id', studentController.asyncHandler(studentController.updateStudent));
    router.delete('/:id', studentController.asyncHandler(studentController.deleteStudent));

    return router;
}
