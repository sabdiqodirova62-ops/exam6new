import express from "express"

import mentorController from "../controllers/mentor-profile.js"

const router = express.Router()

router
  .get("/admins", userController.getAdmins)
  .post("/teachers", mentorController.createUser)


export default router