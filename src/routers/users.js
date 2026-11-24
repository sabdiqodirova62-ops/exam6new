import express from "express";

import roleController from "../controllers/roles.js";
import userController from "../controllers/users.js";
import middlewares from "../middleware/validation.js";
import authGuard from "../guards/auth-guard.js";
import { roleGuard } from "../guards/role-guard.js"
const router = express.Router();

router.post("/roles", roleController.createRole);
router.get("/roles/all", roleController.getAllRoles);
router.get("/admins", userController.getAdmins);
router.post("/admins", authGuard, roleGuard("admin"), middlewares.createUsers, userController.createAdmin);
router.post("/teachers", userController.createTeachers);
router.post("/teachers", middlewares.createUsers, userController.createTeachers);
router.post("/users", middlewares.createUsers, userController.createUser);

router.delete("/users/:userId", userController.deleteUser)

export default router;
