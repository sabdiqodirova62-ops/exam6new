import ExamsService from "../services/exams.js"


class ExamController{
    async getAllExams (req,res,next){
        let resData=await ExamsService.getAllExams(req,next)

        if(resData){
            return res.status(resData.status).json(resData)
        }
    }
    async createExam (req,res,next){
        let resData=await ExamsService.createExam(req,next)

        if(resData){
            return res.status(resData.status).json(resData)
        }
    }
}

const examController=new ExamController()
export default examController 