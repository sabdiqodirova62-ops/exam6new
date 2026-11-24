import studentService from "../services/students.js";

class StudentsController {
  async getMyCourses(req, res, next) {
    let resData = await studentService.getMyCourses(req, next);
    if (resData) {
      return res.status(resData.status).json(resData);
    }
  }
  async getAllStudents(req, res, next) {
    let resData = await studentService.getAllStudents(req, next);
    if (resData) {
      return res.status(resData.status).json(resData);
    }
  }

  async createStudent(req, res, next) {
    let resData = await studentService.createStudent(req, next);
    if (resData) {
      return res.status(resData.status).json(resData);
    }
  }

  async deleteStudent(req, res, next) {
    let resData = await studentService.deleteStudent(req, next);
    if (resData) {
      return res.status(resData.status).json(resData);
    }
  }

  async updateStudent(req, res, next) {
    let resData = await studentService.updateStudent(req, next);
    if (resData) {
      return res.status(resData.status).json(resData);
    }
  }
  async buyCourses(req, res, next) {
    let resData = await studentService.buyCourses(req, next)
    if (resData) {
      return res.status(resData.status).json(resData);
    }
  }
}

const studentsController = new StudentsController();
export default studentsController;
