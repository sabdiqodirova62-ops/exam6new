import pool from "../config/db.js"
import argon from "argon2"
import { InternalServerError, NotFoundError } from "../utils/error.js"

class UserServices {
  async getAdmins(next) {
    try {
      const role = await pool.query(
        `select users.id, fullname, phone, photo, users.created_at, users.status, roles.name as role from users inner join roles on roles.id = users.role_id where roles.name = 'admin'`
      )
      return {
        status: 200,
        data: role.rows
      }
    } catch (error) {
      next(new InternalServerError(500, error))
    }
  }
  async createAdmin(req, next) {
    try {
      const { fullname, phone, password, role_id } = req.body

      const existUser = await pool.query(`select * from users where phone=$1`, [phone])
      if (existUser.rows.length) {
        return {
          status: 409,
          message: "User already exists"
        }
      }


      const existRole = await pool.query(`select * from roles where id=$1`, [role_id])
      if (!existRole.rows.length) {
        return {
          status: 404,
          message: "Role not found"
        }
      }

      const hashpassword = await argon.hash(password)


      await pool.query(`insert into users(fullname,phone,password,role_id) values($1,$2,$3,$4)`, [fullname, phone, hashpassword, role_id])
      return {
        status: 201,
        message: "User created successfully"
      }
    } catch (error) {
      next(new InternalServerError(500, error.message));

    }
  }
  async createUser(req, next) {
    try {
      const { fullname, phone, password, role_id } = req.body

      const existUser = await pool.query(`select * from users where phone=$1`, [phone])
      if (existUser.rows.length) {
        return {
          status: 409,
          message: "User already exists"
        }
      }


      const existRole = await pool.query(`select * from roles where id=$1`, [role_id])
      if (!existRole.rows.length) {
        return {
          status: 404,
          message: "Role not found"
        }
      }

      const hashpassword = await argon.hash(password)


      await pool.query(`insert into users(fullname,phone,password,role_id) values($1,$2,$3,$4)`, [fullname, phone, hashpassword, role_id])
      return {
        status: 201,
        message: "User created successfully"
      }
    } catch (error) {
      next(new InternalServerError(500, error.message));

    }
  }

  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params
      const existUser = await pool.query("select * from users where id=$1", [userId])

      if (!existUser.rows.length) {
        return next(new NotFoundError(404, "User not found with this id"));
      }

      await pool.query("delete from users where id=$1", [userId])
      return {
        status: 200,
        message: " User deleted  "
      }

    } catch (error) {
      next(new InternalServerError(500, error))
    }
  }

  async createTeachers(req, next) {
    try {
      const { fullname, phone, password, role_id, experience, job, portfolio, description, github, instagram, telegram, linkedin, facebook } = req.body

      const existUser = await pool.query(`select * from users where phone = $1`, [phone])
      if (existUser.rows.length) {
        return {
          status: 409,
          message: "User already exists with this phone"
        }
      }

      const hashPassword = await argon.hash(password)
      const teacher = await pool.query(
        "insert into users(fullname, phone, password, role_id) values ($1, $2, $3, $4) RETURNING *",
        [fullname, phone, hashPassword, role_id]
      )

      await pool.query(
        `insert into metors(
          user_id,
          experience,
          job,
          portfolio,
          description,
          telegram,
          instagram,
          github,
          linkedin,
          facebook
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          teacher.rows[0].id,
          experience ? parseInt(experience) : null,
          job || null,
          portfolio || null,
          description || null,
          telegram || null,
          instagram || null,
          github || null,
          linkedin || null,
          facebook || null
        ]
      )

      return {
        status: 201,
        message: "teacher created"
      }
    } catch (error) {
      next(new InternalServerError(500, error.message))
    }
  }
}

const userService = new UserServices()
export default userService 