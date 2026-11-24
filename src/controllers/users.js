import userService from "../services/users.js"

class UserComtroller {
    async getAdmins(req, res,next) {
        let resData = await userService.getAdmins(next)
        if (resData) {
            return res.status(resData.status).json(resData)
        }
    }
    async createUser(req, res) {
        let resData = await userService.createUser(req)
        return res.status(resData.status).json(resData)
    }

    async createAdmin(req, res) {
        let resData = await userService.createAdmin(req)
        return res.status(resData.status).json(resData)
    }
    async createTeachers(req, res, next) {
        let resData = await userService.createTeachers(req, next)
        if (resData) {
            return res.status(resData.status).json(resData)
        }
    }

    async deleteUser(req, res, next) {
        let resData = await userService.deleteUser(req, next)
        if (resData) {
            return res.status(resData.status).json(resData)
        }
    }
}


const userController = new UserComtroller()
export default userController