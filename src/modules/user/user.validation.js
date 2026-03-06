import Joi from "joi";
import {Types} from "mongoose"
import { fileFieldValidation } from "../../common/utils/index.js";
import { generalValidationFields } from "../../common/utils/validation.js";
export const shareprofile = {
    params:Joi.object({
   userId :generalValidationFields.id.required()     
    })
}

export const profileImage ={
    File:generalValidationFields.file(fileFieldValidation.Image)
}
export const profilecoverImage ={
    files:Joi.array().items(
      generalValidationFields.file(fileFieldValidation.Image).required()
    ).min(1).max(2)
}
export const profileAttachments ={
    files:Joi.object().keys(
        {
            profileImage:
            Joi.array().items(
                generalValidationFields.file(fileFieldValidation.Image).required()
            ).length(1).required()
         ,
         profilecoverImage:Joi.array().items(
            generalValidationFields.file(fileFieldValidation.Image).required()
        ).min(1).max(5).required()
        }).required()
}