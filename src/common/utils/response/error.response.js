import { NODE_ENV } from "../../../../config/config.service.js"
export const globalErrorHandling = (error, req, res, next) => {
        const status = error.cause?.status ?? 500
        return res.status(status).json({
            error_message:
                status == 500 ? 'something went wrong' : error.message ?? 'something went wrong',
            stack: NODE_ENV == "development" ? error.stack : undefined
        })
    }
export const ErrorException= ({message="Fail",status=400,extra=undefined})=>{
throw Error(message,{cause:{status , extra}})
}
export const ConfilctException = ({message="conflict",extra=undefined}={})=>{
    return ErrorException({message,status:409})

}
export const NotFoundException = ({message="NotFound",extra=undefined})=>{
    return ErrorException({message,status:404 ,extra})

}