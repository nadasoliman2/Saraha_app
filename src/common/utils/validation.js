import Joi from "joi";
import {Types} from "mongoose"
export const generalValidationFields={
otp: Joi.string().pattern(new RegExp(/^\d{6}$/)),
 
  role:  Joi.string().empty("").valid("user", "admin"),
    username: Joi.string().messages({
        "any.required":"username is required",
        "string.empty" : "username cannot be empty"
    }),
    email: Joi.string().email({minDomainSegments:2, maxDomainSegments:3 , tlds:{allow:['com','net']}}),
    gender: Joi.string().empty("").valid("male", "female"),
    age:    Joi.number().integer().positive(),
    password:Joi.string().min(8).max(20).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/).messages({
        "any.required":"password is required",
        "string.empty" : "password cannot be empty",
})
, confirm_password:Joi.string().valid(Joi.ref("password")),
phone:Joi.string().pattern(new RegExp(/^\+?[1-9]\d{1,14}$/)).messages({
    "any.required":"phone number is required",
    "string.empty" : "phone number cannot be empty",
}),

id: Joi.string().custom((value, helpers) => {

    return Types.ObjectId.isValid(value) ? value : helpers.message("invalid objectId");
   }),

   file:function(validation =[]){
    return  Joi.object().keys({
            "fieldname":Joi.string().required(),
            "originalname":Joi.string().required(),
            "encoding":Joi.string().required(),
            "mimetype":Joi.string().valid(...Object.values(validation)).required(),
            "size":Joi.number().required(),
            "destination":Joi.string().required(),
            "filename":Joi.string().required(),
            "path":Joi.string().required(),
            "finalPath":Joi.string().required()
        })
    }}


