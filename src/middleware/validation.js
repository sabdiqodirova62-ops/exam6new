import schema from "../utils/validation.js";
import { BadRequestError,InternalServerError } from "../utils/error.js";


export default {
    createUsers:(req,res,next)=>{
        try {
            let {error}=schema.userSchema.validate(req.body)
            if(error){
                return next (new BadRequestError(400,error.message))
            }
            return next()
        } catch (error) {
            next(new InternalServerError(500,error))
        }
        
    },
     createCourse:(req,res,next)=>{
        try {
            let {error}=schema.courseSchema.validate(req.body)
            if(error){
                return next (new BadRequestError(400,error.message))
            }
            return next()
        } catch (error) {
            next(new InternalServerError(500,error))
        }
        
    }
}
