
import express from "express"
import { configDotenv } from "dotenv"
import appRouter from "./routers/index.js"
import fileupload from "express-fileupload"
import fs from "fs"
import path from "path"

configDotenv()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileupload())

app.use(express.static(path.join(process.cwd(), "src", "uploads")))

app.use(appRouter)

app.use((error, req, res, next) => {
   const status = error.status || 500

   if (status < 500) {
      return res.status(status).json({
         status: status,
         message: error.message
      })
   } else {
      fs.appendFileSync(
         path.join(process.cwd(), "src", "log", "logger.txt"),
         `[${new Date().toLocaleString()}]_${req.method}_${req.url}_${error.message}\n`
      )

      return res.status(status).json({
         status: status,
         message: "Internal server error"
      })
   }
})

app.listen(process.env.PORT, () => console.log("Server is running"))
