import teacherService from "../services/teachers.js";

class TeacherController {
  async getAllTeachers(req, res, next) {
    let resData = await teacherService.getAllTeachers(); 
    if (resData) {
      return res.status(resData.status).json(resData);
    }
  }
} 

const teacherController = new TeacherController();
export default teacherController;
