import express from "express";

import roleController from "../controllers/roles.js";
import CategoryController from "../controllers/categories.js";
import authGuard from "../guards/auth-guard.js";
import { roleGuard } from "../guards/role-guard.js"
const router = express.Router();

router.get("/categories/all", authGuard, roleGuard("admin"), CategoryController.getAllCategories);
router.post("/categories", authGuard, roleGuard("admin"), CategoryController.createCategory);
router.delete("/categories/:categoryId", authGuard, roleGuard("admin"), CategoryController.deleteCategory);
export default router;
