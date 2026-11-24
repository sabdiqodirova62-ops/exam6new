import pool from "../config/db.js";
import { extname, join } from "path";
import { NotFoundError, InternalServerError } from "../utils/error.js";

class CourseService {
  async getMyCourses(req, next) {
    try {
      const teacherId = req.user.id;
      const courses = await pool.query("select * from courses where user_id = $1", [teacherId]);
      return {
        status: 200,
        data: courses.rows
      };
    } catch (error) {
      next(new InternalServerError(500, error.message));
    }
  }

  async getCourses(req, next) {
    try {
      const courses = await pool.query("select * from courses where approve = true");
      return {
        status: 200,
        data: courses.rows
      };
    } catch (error) {
      next(new InternalServerError(500, error.message));
    }
  }

  async getAllCourses(req, next) {
    try {
      const courses = await pool.query("select * from courses");
      return {
        status: 200,
        data: courses.rows
      };
    } catch (error) {
      next(new InternalServerError(500, error.message));
    }
  }

  async createCourse(req, next) {
    try {
      const { name, description, category_id, level, price } = req.body;
      const { banner, intro_video } = req.files || {};
      const teacherId = req.user.id;

      const existCategory = await pool.query("select * from categories where id=$1", [category_id]);
      if (!existCategory.rows.length) {
        return next(new NotFoundError(404, "category not found with this id"));
      }

      let fileName_banner = null;
      if (banner) {
        fileName_banner = Date.now() + extname(banner.name);
        banner.mv(join(process.cwd(), "src", "uploads", fileName_banner), (err) => {
          if (err) console.log(err);
        });
      }

      let fileName_intro_video = null;
      if (intro_video) {
        fileName_intro_video = Date.now() + extname(intro_video.name);
        intro_video.mv(join(process.cwd(), "src", "uploads", fileName_intro_video), (err) => {
          if (err) console.log(err);
        });
      }

      await pool.query(
        `insert into courses(
          banner,
          intro_video,
          name,
          description,
          category_id,
          level,
          price,
          user_id
        ) values ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [fileName_banner, fileName_intro_video, name, description, category_id, level, price, teacherId]
      );

      return {
        status: 201,
        message: "Course created!"
      };
    } catch (error) {
      next(new InternalServerError(500, error.message));
    }
  }

  async aproveCourse(req, next) {
    try {
      const { courseId } = req.params;
      const existCourse = await pool.query("select * from courses where id = $1", [courseId]);
      if (!existCourse.rows.length) {
        return next(new NotFoundError(404, "course not found"));
      }

      const newApprove = !existCourse.rows[0].approve;
      await pool.query("update courses set approve = $1 where id = $2", [newApprove, courseId]);

      return {
        status: 200,
        message: "course approved"
      };
    } catch (error) {
      next(new InternalServerError(500, error.message));
    }
  }

  async updateCourse(req, next) {
    console.log(req.body);
console.log(req.files);
    try {
      const { courseId } = req.params;
      const { name, description, category_id, level, price } = req.body;

      const existCourse = await pool.query("select * from courses where id = $1", [courseId]);
      if (!existCourse.rows.length) {
        return next(new NotFoundError(404, "course not found with this id"));
      }

      let oldCourse = existCourse.rows[0];
      let fileName_banner = oldCourse.banner;
      let fileName_intro_video = oldCourse.intro_video;

      if (req.files && req.files.banner) {
        fileName_banner = Date.now() + extname(req.files.banner.name);
        req.files.banner.mv(join(process.cwd(), "src", "uploads", fileName_banner), (err) => {
          if (err) console.log(err);
        });
      }

      if (req.files && req.files.intro_video) {
        fileName_intro_video = Date.now() + extname(req.files.intro_video.name);
        req.files.intro_video.mv(join(process.cwd(), "src", "uploads", fileName_intro_video), (err) => {
          if (err) console.log(err);
        });
      }

      await pool.query(
        `update courses set name = $1, description = $2, category_id = $3, level = $4, price = $5, banner = $6, intro_video = $7 where id = $8`,
        [
          name || oldCourse.name,
          description || oldCourse.description,
          category_id || oldCourse.category_id,
          level || oldCourse.level,
          price || oldCourse.price,
          fileName_banner,
          fileName_intro_video,
          courseId
        ]
      );

      return {
        status: 200,
        message: "Course updated successfully"
      };
    } catch (error) {
      next(new InternalServerError(500, error.message));
    }
  }

  async deleteCourse(req, next) {
    try {
      const { courseId } = req.params;

      const existCourse = await pool.query("select * from courses where id = $1", [courseId]);
      if (!existCourse.rows.length) {
        return next(new NotFoundError(404, "course not found with this id"));
      }

      await pool.query("delete from comments where course_id = $1", [courseId]);
      await pool.query("delete from payments where course_id = $1", [courseId]);
      await pool.query("delete from sections where course_id = $1", [courseId]);
      await pool.query("delete from courses where id = $1", [courseId]);

      return {
        status: 200,
        message: "Course deleted successfully"
      };
    } catch (error) {
      next(new InternalServerError(500, error.message));
    }
  }
}

const courseService = new CourseService();
export default courseService;
