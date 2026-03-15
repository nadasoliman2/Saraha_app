import Joi from "joi";
import { generalValidationFields } from "../../common/utils/validation.js";
export const login ={
 body: Joi.object().keys({
 email: generalValidationFields.email.required(),
  
    password:generalValidationFields.password.required()
})


}
 export  const signup = 
 {
     body:    Joi.object().keys({
    username: Joi.string().required().messages({
        "any.required":"username is required",
        "string.empty" : "username cannot be empty"
    }),
    email: generalValidationFields.email.required(),
    gender: generalValidationFields.gender.required(),
    age:   generalValidationFields.age.required(),
    password:generalValidationFields.password.required(),
    role: generalValidationFields.role
, confirm_password:generalValidationFields.confirm_password.required(),
phone:generalValidationFields.phone.required().messages({
    "any.required":"phone number is required",
    "string.empty" : "phone number cannot be empty",
})

}).required(),
query: Joi.object().keys({ lang:Joi.string().valid("en","ar").default("en")}).required()
 }
 export const confirmEmail={
 body: Joi.object().keys({
 email: generalValidationFields.email.required(),
  
   otp:generalValidationFields.otp.required()
})
 }
  export const resendconfirmEmail={
 body: Joi.object().keys({
 email: generalValidationFields.email.required()})
 }
  export const resetforgotpassord={
 body: Joi.object().keys({
     password:generalValidationFields.password.required(),
     confirm_password:generalValidationFields.confirm_password.required(),
     email: generalValidationFields.email.required(),
  
   otp:generalValidationFields.otp.required()
})
 }