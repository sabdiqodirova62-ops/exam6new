import pool from "../config/db.js";
import { NotFoundError, InternalServerError, ConflictError, ForbiddenError } from "../utils/error.js";
import argon from "argon2";
import jwt from "jsonwebtoken";
class AuthService {
    async login(req, next) {
        try {
            const { phone, password } = req.body;
            let existUser = await pool.query(`select * from users where phone=$1`, [phone]);
            existUser = existUser.rows[0]

            if (!existUser) {
                return next(new NotFoundError(404, "user not found with this phone or password maybe wrong "));
            }

            if (!await argon.verify(existUser.password, password)) {
                return next(new NotFoundError(404, "user not found with this phone or password maybe wrong "));
            }

            const role = await pool.query(`select r.name from users u inner join roles r on u.role_id = r.id where u.role_id = ${existUser.role_id}`);

            return {
                status: 200,
                message: "User login",
                role: role.rows[0].name,
                accessToken: jwt.sign({ id: existUser.id, phone: existUser.phone, role: role.rows[0].name }, "Shaptoli", { expiresIn: "30min" }),
                refreshToken: jwt.sign({ id: existUser.id, phone: existUser.phone, role: role.rows[0].name }, "Shaptoli", { expiresIn: "24hour" })
            };
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async register(req, next) {
        const { fullname, phone, password, role_id, course_Id } = req.body

        let existStudent = await pool.query(`select * from users where phone =$1`, [phone])

        if (existStudent.rows.length) {
            return next(new ConflictError(409, "student already registered this phone"))
        }
        const existCourse = await pool.query("select * from courses where id = $1", [course_Id])
        if (!existCourse.rows.length) {
            return next(new NotFoundError(404, "course not found"));
        }
        if (!existCourse.rows[0].aprove) {
            return next(new ForbiddenError(403, "you can't buy this course"))
        }
        const hashPass = await argon.hash(password);
        let student = await pool.query(
            "insert into users(fullname,phone,password,role_id) values($1,$2,$3,$4) returning id",
            [fullname, phone, hashPass, role_id]
        );
        if (student.rows.length && course_Id) {
            await pool.query(
                "insert into payments(student_id,course_id) values($1,$2)",
                [student.rows[0].id, course_Id]
            );
        }

        return {
            status: 201,
            message: "student succesfully register and buy course",
            role: "student",
            accessToken: jwt.sign({ id: student.rows[0].id, phone: phone, role: "student" }, "Shaptoli", { expiresIn: "30min" }),
            refreshToken: jwt.sign({ id: student.rows[0].id, phone: phone, role: "student" }, "Shaptoli", { expiresIn: "24h" })
        };
    }
}

const authService = new AuthService();
export default authService;
