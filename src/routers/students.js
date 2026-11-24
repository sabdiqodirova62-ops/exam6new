import express from "express";
import studentsController from "../controllers/students.js";
import authGuard from "../guards/auth-guard.js";
import { roleGuard } from "../guards/role-guard.js";

const router = express.Router();

router
  .get("/students/courses/my", authGuard, roleGuard("student"), studentsController.getMyCourses)
  .post("/students/courses/buy/:courseId", authGuard, roleGuard("student"), studentsController.buyCourses)
  .get("/students", authGuard, studentsController.getAllStudents)
  .get("/students/:lessonId", authGuard, studentsController.getAllStudents)
  .post("/students", authGuard, roleGuard("admin", "teacher"), studentsController.createStudent)
  .post("/students/register", authGuard, roleGuard("admin", "teacher"), studentsController.createStudent)
  .delete("/students/:studentId", authGuard, roleGuard("admin", "teacher"), studentsController.deleteStudent)
  .put("/students/:studentId", authGuard, studentsController.updateStudent);

export default router;
