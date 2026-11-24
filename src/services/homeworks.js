
import pool from "../config/db.js";
import {extname, join} from "path"
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../utils/error.js";
class HomeworksService{ 
    async getAllHomeworks(req,next){
        const {lessonId}=req.params
        const teacherId=req.user.id
        const existLesson=await pool.query("select c.user_id from lessons l inner join sections s on l.section_id =s.id inner join courses c on s.course_id=c.id where l.id=$1",[lessonId])
        if(!existLesson.rows.length){
            next(new NotFoundError(404,"lesson not found "))
        }

        let lessonTeacherId=existLesson.rows[0].user_id

        if(req.user.role=="teacher" && teacherId !=lessonTeacherId){
            return next (new ForbiddenError(403,"you can't get homework of this lesson"))
        }

        const homeworks=await pool.query("select * from homeworks  where lesson_id=$1",[lessonId])

        return {
            status:200,
            data:homeworks.rows
        }
    }
    async createHomework(req,next){
        const {description,lesson_id}=req.body
        const {file}=req.files
        const filename=Date.now()+extname(file.name)
        const existLesson=await pool.query(`select c.user_id from lessons l inner join  sectionss s on l.section_id=s.id inner join courses c on s.course_id=c.id  where l.id=$1`,[lesson_id])
        if(!existLesson.rows.length){
            next (new NotFoundError(404,"lesson not found "))
        }  


        let teacher_id=existLesson.rows[0].user_id


        if(req.user.role=="teacher"&& teacher_id!=req.user_id){
            return next(new ForbiddenError(403,"you can't add homework to this lesson"))
        }

        const existsHomework= await pool.query(`select * from homeworks where lesson_id=$1`,[lesson_id])

        if(existsHomework.rows.length){
            next (new ConflictError(409,"homework  already exist with this lesson"))
        }

        const allowedFileTypes=[".pdf", ".doc", ".docx", ".ppt", ".pptx",".jpg",".jpeg",".png",".mp4",".mov"]

        if(!allowedFileTypes.includes(extname(file.name))){
            return next(new BadRequestError(400,"invalid file type"))
        }

        await pool.query(`insert into homewroks(description,lesson_id,file) values ($1,$2,$3)`,[description,lesson_id,filename])

        file.mv(join(process.cwd(),"src","uploads",filename),err=>{
            if(err){
              console.log(err)
            }
        })
        return {
            status:201,
            message:"homework created!"
        }
    }
    
}
  const homeworkService= new HomeworksService()
   export default homeworkService