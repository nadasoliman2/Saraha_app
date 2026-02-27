import {TokenTypeEnum} from '../common/enums/security.enum.js'
import {decodeToken} from '../common/utils/index.js'
import {login} from '../modules/auth/auth.service.js'
import {ErrorException,unauthorizedException} from '../common/utils/index.js'

export const authentication =(tokenType=TokenTypeEnum.Access)=>{
return async (req,res,next)=>{

    const [schema , credentials] = req.headers?.authorization?.split(" ") || []
    console.log({authorization:req.headers?.authorization, schema,credentials})
   if(!schema || !credentials){
throw unauthorizedException({message:"Missing authentication credentials"})
   }
    switch(schema){
        case "Basic":
         const [email , password] = Buffer.from(credentials,'base64')?.toString()?.split(":") ||[]
            await login({email,password},`${req.protocol}://${req.host}`)
            break;
          case "Bearer":
          req.user = await  decodeToken({token:credentials,tokenType})
           break
        default:
        throw ErrorException({message:"Invalid authentication schema"})
            break;
    }
    next()
}
}
export const authorization =(accessRoles=[])=>{
return async (req,res,next)=>{
  if(!accessRoles.includes(req.user.role)){
   throw ErrorException({message:"Not authorized account"})
}
 next()
}
}