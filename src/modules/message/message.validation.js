import joi from 'joi';
import { fileFieldValidation } from '../../common/utils/index.js';
import { generalValidationFields } from '../../common/utils/validation.js';
export const sendMessage ={
    params: joi.object().keys(
        {
            receiverid: generalValidationFields.id.required()
        }),
 body: joi.object().keys(
        {
            content: joi.string().min(2).max(10000)
        },
    ),
    
    files: joi.array().items(generalValidationFields.file(fileFieldValidation.Image)).min(1).max(2)

}
export const getMessage = {
  params: joi.object().keys(
        {
            messageId: generalValidationFields.id.required()
        })
}