import pool from "../config/db.js";
import { NotFoundError, InternalServerError } from "../utils/error.js";

class CommentsService {
  async getAllComments(req, next) {
    try {
      const comments = await pool.query(`
        select c.id, c.comment, c.created_at, u.fullname, u.photo 
        from comments c 
        join users u on c.user_id = u.id
      `);

      return {
        status: 200,
        data: comments.rows
      };
    } catch (error) {
      next(new InternalServerError(500, error.message));
    }
  }

  async createComment(req, next) {
    try {
      const { comment, course_id } = req.body;
      const userId = req.user.id;

      await pool.query(
        "insert into comments(user_id, course_id, comment) values ($1, $2, $3)",
        [userId, course_id || null, comment]
      );

      return {
        status: 201,
        message: "Comment created"
      };
    } catch (error) {
      next(new InternalServerError(500, error.message));
    }
  }

  async updateComment(req, next) {
    try {
      const { commentId } = req.params;
      const { comment } = req.body;

      const existComment = await pool.query("select * from comments where id = $1", [commentId]);
      if (!existComment.rows.length) {
        return next(new NotFoundError(404, "Comment not found with this id"));
      }

      await pool.query("update comments set comment = $1 where id = $2", [comment, commentId]);

      return {
        status: 200,
        message: "Comment updated"
      };
    } catch (error) {
      next(new InternalServerError(500, error.message));
    }
  }

  async deleteComment(req, next) {
    try {
      const { commentId } = req.params;

      const existComment = await pool.query("select * from comments where id = $1", [commentId]);
      if (!existComment.rows.length) {
        return next(new NotFoundError(404, "Comment not found with this id"));
      }

      await pool.query("delete from comments where id = $1", [commentId]);

      return {
        status: 200,
        message: "Comment deleted"
      };
    } catch (error) {
      next(new InternalServerError(500, error.message));
    }
  }
}

const commentsService = new CommentsService();
export default commentsService;
