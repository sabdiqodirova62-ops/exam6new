import pool from "../config/db.js";
import argon from "argon2";
import { extname, join } from "path";
import { ConflictError, ForbiddenError, NotFoundError, InternalServerError } from "../utils/error.js";

class StudentService {
  async getMyCourses(req, next) {
    try {
      let studentId = req.user.id;
      let courses = await pool.query(
        `select c.id, c.name, c.banner, u.photo, u.fullname 
         from payments p 
         join courses c on p.course_id = c.id 
         join users u on c.user_id = u.id 
         where p.student_id = $1`,
        [studentId]
      );
      let coursesData = courses.rows.map((course) => {
        return {
          id: course.id,
          course_name: course.name,
          banner: course.banner,
          teacher: {
            fullname: course.fullname,
            photo: course.photo
          }
        };
      });
      return {
        status: 200,
        data: coursesData
      };
    } catch (error) {
      next(new InternalServerError(500, error.message));
    }
  }

  async getAllStudents(req, next) {
    try {
      const { lessonId } = req.params;

      if (lessonId && lessonId !== "all") {
        const teacherId = req.user.id;
        const existLesson = await pool.query(
          "select c.user_id, c.id as course_id from lessons l inner join sections s on l.section_id = s.id inner join courses c on s.course_id = c.id where l.id = $1",
          [lessonId]
        );
        if (!existLesson.rows.length) {
          return next(new NotFoundError(404, "lesson not found"));
        }

        let lessonTeacherId = existLesson.rows[0].user_id;

        if (req.user.role == "teacher" && teacherId != lessonTeacherId) {
          return next(new ForbiddenError(403, "you can't get students of this lesson"));
        }

        const students = await pool.query(
          `select u.id, u.fullname, u.phone, u.photo, u.status, u.created_at 
           from users u 
           inner join payments p on p.student_id = u.id 
           where p.course_id = $1`,
          [existLesson.rows[0].course_id]
        );

        return {
          status: 200,
          data: students.rows
        };
      }

      const students = await pool.query(
        `select u.id, u.fullname, u.phone, u.photo, u.status, u.created_at 
         from users u 
         inner join roles r on r.id = u.role_id 
         where r.name = 'student'`
      );

      return {
        status: 200,
        data: students.rows
      };
    } catch (error) {
      next(new InternalServerError(500, error.message));
    }
  }

  async buyCourses(req, next) {
    try {
      const { courseId } = req.params;
      const studentId = req.user.id;
      const existCourse = await pool.query("select * from courses where id = $1", [courseId]);
      if (!existCourse.rows.length) {
        return next(new NotFoundError(404, "course not found"));
      }

      const isApproved = existCourse.rows[0].approve ?? existCourse.rows[0].aprove;
      if (!isApproved) {
        return next(new ForbiddenError(403, "you can't buy this course"));
      }

      const existPayment = await pool.query(
        "select * from payments where student_id = $1 and course_id = $2",
        [studentId, courseId]
      );
      if (existPayment.rows.length) {
        return next(new ConflictError(409, "you already bought this course"));
      }

      await pool.query("insert into payments(student_id, course_id) values ($1, $2)", [studentId, courseId]);
      return {
        status: 201,
        message: "you bought this course successfully"
      };
    } catch (error) {
      next(new InternalServerError(500, error.message));
    }
  }

  async createStudent(req, next) {
    try {
      const { fullname, phone, password, course_id } = req.body;

      const existStudent = await pool.query("select * from users where phone = $1", [phone]);
      if (existStudent.rows.length) {
        return next(new ConflictError(409, "student already registered this phone"));
      }

      const role = await pool.query("select id from roles where name = 'student'");
      let roleId = role.rows.length ? role.rows[0].id : null;

      const hashPass = await argon.hash(password);
      const student = await pool.query(
        "insert into users(fullname, phone, password, role_id) values ($1, $2, $3, $4) returning id, fullname, phone, role_id, created_at",
        [fullname, phone, hashPass, roleId]
      );

      if (course_id) {
        await pool.query(
          "insert into payments(student_id, course_id) values ($1, $2)",
          [student.rows[0].id, course_id]
        );
      }

      return {
        status: 201,
        message: "student created successfully",
        data: student.rows[0]
      };
    } catch (error) {
      next(new InternalServerError(500, error.message));
    }
  }

  async deleteStudent(req, next) {
    try {
      const { studentId } = req.params;

      const existStudent = await pool.query("select * from users where id = $1", [studentId]);
      if (!existStudent.rows.length) {
        return next(new NotFoundError(404, "Student not found with this id"));
      }

      await pool.query("delete from payments where student_id = $1", [studentId]);
      await pool.query("delete from users where id = $1", [studentId]);

      return {
        status: 200,
        message: "Student deleted successfully"
      };
    } catch (error) {
      next(new InternalServerError(500, error.message));
    }
  }

  async updateStudent(req, next) {
    try {
      const { studentId } = req.params;
      const { fullname, phone, password, status } = req.body;

      const existStudent = await pool.query("select * from users where id = $1", [studentId]);
      if (!existStudent.rows.length) {
        return next(new NotFoundError(404, "Student not found with this id"));
      }

      if (phone && phone !== existStudent.rows[0].phone) {
        const existPhone = await pool.query("select * from users where phone = $1 and id != $2", [phone, studentId]);
        if (existPhone.rows.length) {
          return next(new ConflictError(409, "User already exists with this phone"));
        }
      }

      let photoName = existStudent.rows[0].photo;
      if (req.files && req.files.photo) {
        const { photo } = req.files;
        photoName = Date.now() + extname(photo.name);
        photo.mv(join(process.cwd(), "src", "uploads", photoName), (err) => {
          if (err) console.log(err);
        });
      } else if (req.body && req.body.photo !== undefined) {
        photoName = req.body.photo;
      }

      let hashPassword = existStudent.rows[0].password;
      if (password) {
        hashPassword = await argon.hash(password);
      }

      const updatedStudent = await pool.query(
        `update users set 
            fullname = coalesce($1, fullname),
            phone = coalesce($2, phone),
            password = coalesce($3, password),
            photo = coalesce($4, photo),
            status = coalesce($5, status)
        where id = $6 returning id, fullname, phone, photo, status, role_id, created_at`,
        [fullname || null, phone || null, password ? hashPassword : null, photoName || null, status || null, studentId]
      );

      return {
        status: 200,
        message: "Student updated successfully",
        data: updatedStudent.rows[0]
      };
    } catch (error) {
      next(new InternalServerError(500, error.message));
    }
  }
}

const studentService = new StudentService();
export default studentService;
