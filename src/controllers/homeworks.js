import homeworksService from "../services/homeworks.js"


class HomeworkController{
    async getAllHomeworks (req,res,next){
        let resData=await homeworksService.getAllHomeworks(req,next)

        if(resData){
            return res.status(resData.status).json(resData)
        }
    }
    async createHomeworks (req,res,next){
        let resData=await homeworksService.createHomework(req,next)

        if(resData){
            return res.status(resData.status).json(resData)
        }
    }
}

const homeworkController=new HomeworkController()
export default homeworkController 