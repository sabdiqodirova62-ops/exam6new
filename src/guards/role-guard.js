import { AnauthorizedError, ForbiddenError, InternalServerError } from "../utils/error.js";

export const roleGuard = (...roles) => {
    return (req, res, next) => {
        try {
              console.log("USER:", req.user)
            console.log("ALLOWED ROLES:", roles)

            if (!roles.includes(req.user.role)) {
                return next(new ForbiddenError(403, "Forbidden"))
            }
            return next()
        } catch (error) {
            return next(new InternalServerError(500, error))
        }
    }
}
