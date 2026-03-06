import { NODE_ENV } from "../../../../config/config.service.js"
import multer from 'multer'
export const globalErrorHandling = (error, req, res, next) => {

  let status = error?.cause?.status || 500
 if(error instanceof multer.MulterError){
  status=400
 }
  return res.status(status).json({
    error_message:
      status === 500
        ? "something went wrong"
        : error.message,

    extra: error?.cause?.extra,

    stack: NODE_ENV === "development" ? error.stack : undefined
  })
}
export const ErrorException = ({
  message = "Fail",
  status = 400,
  extra = undefined}) => {
  return new Error(message, {
    cause: { status, extra }
  })
}
export const ConfilctException = ({message="conflict",extra=undefined}={})=>{
    return ErrorException({message,status:409})

}
export const NotFoundException = ({message="NotFound",extra=undefined})=>{
    return ErrorException({message,status:404 ,extra})


}
export const BadRequestException = ({message="Bad Request",extra=undefined})=>{
    return ErrorException({message,status:400 ,extra})


}
export const unauthorizedException = ({message="Unauthorized",extra=undefined})=>{
    return ErrorException({message,status:401 ,extra})

    
}