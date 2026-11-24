import pool from "../config/db.js";

class TeacherService {
  async getAllTeachers() {
    let role = await pool.query("SELECT * FROM roles WHERE name = 'teacher'");
    if (!role.rows.length) {
      return { status: 200, data: [] };
    }
    let roleId = role.rows[0].id;
    let teachers = await pool.query("SELECT * FROM users WHERE role_id = $1", [roleId]); 
    return {
      status: 200,
      data: teachers.rows
    };
  }
}

const teacherService = new TeacherService();
export default teacherService;
