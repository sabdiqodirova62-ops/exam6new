// import { date } from "joi";
import pool from "../config/db.js";
import { extname, join } from "path"
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../utils/error.js";
class LessonsService {
    async getAllLessons(req, next) {
        const { sectionId } = req.params
        const userId = req.user.id
        const existSection = await pool.query("select c.user_id,c.id as course_id from sections s inner join courses c on s.course_id =c.id where s.id=$1", [sectionId])
        if (!existSection.rows.length) {
            next(new NotFoundError(404, "section not found "))
        }

        let sectionTeacherId = existSection.rows[0].user_id

        if (req.user.role == "teacher" && userId != sectionTeacherId) {
            return next(new ForbiddenError(403, "you can't get lessons of this section"))
        }
        if (req.user.role == "student") {
            const payments = await pool.query(`select * from payments  where student_id=$1 and course_id=$2`, [userId, existSection.rows[0].course_id])
            if (!payments.rows.length) {
                return next(new ForbiddenError(403, "you can't access to thius course"))
            }

        }
        const lessons = await pool.query("select * from lessons where section_id=$1", [sectionId])

        return {
            status: 200,
            data: lessons.rows
        }
    }
    async createLessons(req, next) {
        const { name, description, section_id } = req.body
        const { file } = req.files
        const filename = Date.now() + extname(file.name)
        const existSection = await pool.query(`select c.user_id from sections inner join  courses c on s.course_id where s.id=$1`, [section_id])
        if (!existSection.rows.length) {
            next(new NotFoundError(404, "section not found "))
        }


        let teacher_id = existSection.rows[0].user_id


        if (req.user.role == "teacher" && teacher_id != req.user_id) {
            return next(new ForbiddenError(403, "you can't add lesson to this section"))
        }

        const existsLesson = await pool.query(`select * from lessons where name=$1 and section_id=$2`, [name, section_id])

        if (existsLesson.rows.length) {
            next(new ConflictError(409, "lesson name already exist with this section "))
        }

        const allowedFileTypes = [".mp4", ".mov", ".avi", ".wmv", ".flv", ".mkv"]
        if (!allowedFileTypes.includes(extname(file.name))) {
            return next(new BadRequestError(400, "invalid file type"))
        }

        await pool.query(`insert into lessons(name,description,section_id,file) values ($1,$2,$3,$4)`, [name, description, section_id, filename])

        file.mv(join(process.cwd(), "src", "uploads", filename), err => {
            if (err) {
                console.log(err)
            }
        })
        return {
            status: 201,
            message: "Lesson created!"
        }
    }

}
const lessonsService = new LessonsService()
export default lessonsService