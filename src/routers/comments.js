import express from "express";
import commentsController from "../controllers/comments.js";
import authGuard from "../guards/auth-guard.js";

const router = express.Router();

router
  .get("/comments", authGuard, commentsController.getAllComments)
  .post("/comments", authGuard, commentsController.createComment)
  .put("/comments/:commentId", authGuard, commentsController.updateComment)
  .delete("/comments/:commentId", authGuard, commentsController.deleteComment);

export default router;
