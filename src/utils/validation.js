import joi from "joi"



export default { userSchema :joi.object({
    fullname: joi.string().min(3).max(30).required(),
    phone: joi.string().pattern(/^\+998(9[0-9]|33|71|88)[0-9]{7}$/).required(),
    password: joi.string().min(6).max(30).required(),
    role_id: joi.number().integer().required()
}),
courseSchema :joi.object({
    name: joi.string().min(5).max(30).required(),
    description: joi.string(),
    level: joi.string().required(),
    price:joi.number().positive().required(),
    category_id:joi.number().required()
}) 
}