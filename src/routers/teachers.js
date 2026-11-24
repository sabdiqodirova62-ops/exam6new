import express from "express";
import teacherController from "../controllers/teachers.js";
import authGuard from "../guards/auth-guard.js";
import { roleGuard } from "../guards/role-guard.js";

const router = express.Router();

router.get("/teachers/all", authGuard, roleGuard("admin", "teacher"), teacherController.getAllTeachers);

export default router;
