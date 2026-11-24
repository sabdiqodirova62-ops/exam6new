import pool from "../config/db.js"
import { ForbiddenError, NotFoundError } from "../utils/error.js"

class SectionService {
    async getSectionsById(req, next) {
        const { course_id } = req.params
        const userId = req.user.id
        const existCourse = await pool.query("select * from courses where id=$1", [course_id])
        if (req.user.id == "teacher" && userId != existCourse.rows.length) {
            next(new NotFoundError(404, "course not found"))
        }
        if (req.user.role == "student") {
            const payments = await pool.query(`select * from payments  where student_id=$1 and course_id=$2`, [userId, course_id])
            if (!payments.rows.length) {
                return next(new ForbiddenError(403, "you can't access to thius course"))
            }

        }
        const sections = await pool.query("select * from sections where course_id=$2", [course_id])
        return {
            status: 200,
            data: sections.rows
        }
    }
    async createSection(req, next) {
        const { name, course_id } = req.body
        const teacherId = req.user.id

        const existCourse = await pool.query("select * from courses where id=$1", [course_id])
        if (!existCourse.rows.length) {
            next(new NotFoundError(404, "course not found"))
        }

        if (teacherId != existCourse.rows[0].user_id) {
            next(new ForbiddenError(403, "you can't add section to this course"))
        }
        const existSection = await pool.query("select * from sections where name=$1 and course_id=$2", [name, course_id])
        if (!existSection.rows.length) {
            next(new NotFoundError(404, "section  already existed "))
        }



        await pool.query("insert into sections (name,course_id) values ($1,$2)", [name, course_id])
        return {
            status: 201,
            message: "create section"
        }


    }
    async updateSection(req, next) {
        try {
            const { sectionId } = req.params
            const { name } = req.body
            const userId = req.user.id

            const existSection = await pool.query(
                "select s.*, c.user_id from sections s inner join courses c on s.course_id = c.id where s.id=$1",
                [sectionId]
            )
            if (!existSection.rows.length) {
                return next(new NotFoundError(404, "section not found with this id"))
            }

            let oldSection = existSection.rows[0]

            if (req.user.role == "teacher" && userId != oldSection.user_id) {
                return next(new ForbiddenError(403, "you can't update section of this course"))
            }

            const newName = name || oldSection.name

            const sameName = await pool.query(
                "select * from sections where name=$1 and course_id=$2 and id != $3",
                [newName, oldSection.course_id, sectionId]
            )
            if (sameName.rows.length) {
                return next(new ConflictError(409, "section already exists with this name"))
            }

            await pool.query("update sections set name=$1 where id=$2", [newName, sectionId])
            return {
                status: 200,
                message: "Section updated successfully"
            }
        } catch (error) {
            next(new InternalServerError(500, error.message))
        }
    }

    async deleteSection(req, next) {
        try {
            const { sectionId } = req.params
            const userId = req.user.id

            const existSection = await pool.query(
                "select s.*, c.user_id from sections s inner join courses c on s.course_id = c.id where s.id=$1",
                [sectionId]
            )
            if (!existSection.rows.length) {
                return next(new NotFoundError(404, "section not found with this id"))
            }

            if (req.user.role == "teacher" && userId != existSection.rows[0].user_id) {
                return next(new ForbiddenError(403, "you can't delete section of this course"))
            }

            const existLessons = await pool.query("select id from lessons where section_id=$1 limit 1", [sectionId])
            if (existLessons.rows.length) {
                return next(new ConflictError(409, "section has lessons, can't delete"))
            }

            await pool.query("delete from sections where id=$1", [sectionId])
            return {
                status: 200,
                message: "Section deleted successfully"
            }
        } catch (error) {
            next(new InternalServerError(500, error.message))
        }
    }
}

const sectionService = new SectionService()
export default sectionService