import { StudentService } from "../services/app.service.js";
import { CustomError } from '../errors/customError.js';

export class StudentController {
    constructor(studentService = new StudentService()) {
        this.studentService = studentService;
    }

    asyncHandler(fn) {
        return (req, res, next) => {
            fn.call(this, req, res).catch((error) => next(error));
        }
    }

    async getStudents(req, res) {
        const students = await this.studentService.getStudents();

        return res.status(200).json({
            message: "Students returned successfully",
            students
        });
    }

    async getStudentById(req, res) {
        const { id } = req.params;

        if (Number.isNaN(Number(id))) {
            throw new CustomError('Invalid ID', 400);
        }

        const student = await this.studentService.getStudentById(id);

        if (student === undefined) {
            throw new CustomError('Student not found', 404);
        }

        return res.status(200).json({
            message: "Student returned successfully",
            student
        });
    }

    async createStudent(req, res) {
        const { name } = req.body;

        if (!name) {
            throw new CustomError('Please complete the fields', 400);
        }

        if (name !== name.trim()) {
            throw new CustomError('Please complete the fields', 400)
        }

        if (!(/^[a-zA-Z'-]+(\s[a-zA-Z'-]+)*$/.test(name))) {
            throw new CustomError('Bad request', 400);
        }

        const student = await this.studentService.createStudent(name);
        return res.status(201).json({
            message: "Student created successfully",
            student
        });
    }

    async updateStudent(req, res) {
        const { id } = req.params;
        const studentData = req.body;

        if (Number.isNaN(Number(id))) {
            throw new CustomError('Invalid ID', 400);
        }

        if (studentData === undefined) {
            throw new CustomError('Bad request', 400);
        }

        if (Object.keys(studentData).length === 0) {
            throw new CustomError('Bad request', 400);
        }

        if (studentData.name !== studentData.name?.trim() || studentData.course !== studentData.course?.trim()) {
            throw new CustomError('Bad request', 400);
        }

        if (studentData.name === "" || studentData.course === "") {
            throw new CustomError('Bad request', 400);
        }

        if (studentData.name !== undefined && !/^[a-zA-Z'-]+(\s[a-zA-Z'-]+)*$/.test(studentData.name)) {
            throw new CustomError('Bad request', 400);
        }

        const updatedStudent = await this.studentService.updateStudent(studentData, id);

        if (!updatedStudent) {
            throw new CustomError('Student not found', 404);
        }

        return res.status(200).json({
            message: "Student updated successfully",
            updatedStudent
        });
    }

    async deleteStudent(req, res) {
        const { id } = req.params;

        if (Number.isNaN(Number(id))) {
            throw new CustomError('Invalid ID', 400);
        }

        const student = await this.studentService.deleteStudent(id);

        if (student === undefined) {
            throw new CustomError('Student not found', 404);
        }

        return res.status(200).json({
            message: "Student deleted successfully",
            student
        });
    }
}