export class NotFoundError extends Error {
    constructor(status, message) {
        super()
        this.status = status
        this.message = message
    }
}
export class ConflictError extends Error {
    constructor(status, message) {
        super()
        this.status = status
        this.message = message
    }
}
export class InternalServerError extends Error {
    constructor(status, message) {
        super()
        this.status = status
        this.message = message
    }
}

export class BadRequestError extends Error {
    constructor(status, message) {
        super()
        this.status = status
        this.message = message
    }
}
export class AnauthorizedError extends Error {
    constructor(status, message) {
        super()
        this.status = status
        this.message = message
    }
}
export class JsonWebTokenError extends Error {
    constructor(status, message) {
        super()
        this.status = status
        this.message = message
    }
}
export class ForbiddenError extends Error {
    constructor(status, message) {
        super()
        this.status = status
        this.message = message
    }
}