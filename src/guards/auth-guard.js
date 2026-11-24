import { BadRequestError, InternalServerError, AnauthorizedError } from "../utils/error.js";
import jwt from "jsonwebtoken";

export default (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return next(new AnauthorizedError(401, "Unauthorized user"));
        }

        const user = jwt.verify(token, process.env.JWT_SECRET)

        req.user = user;
        next();

    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return next(new BadRequestError(400, error.message));
        }
        if(error.name === "TokenExpiredError") {
            return next(new BadRequestError(400, "Token expired"));
        }
        next(new InternalServerError(500, error.message));
    }
};
