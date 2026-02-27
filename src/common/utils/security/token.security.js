  import {user_access_token_secret,refresh_user_token_secret,access_token_expires_in,refresh_token_expires_in, system_access_token_secret,refresh_system_token_secret} from "../../../../config/config.service.js"
  import jwt from 'jsonwebtoken'
import { UserModel } from "../../../DB/index.js"
import { TokenTypeEnum } from "../../enums/security.enum.js"
import { NotFoundException , ErrorException} from "../../utils/index.js"
import { RoleEnum } from "../../enums/user.enum.js"
  export const generateToken = async({ payload={},secret=user_access_token_secret,options={}}={}) => {
    return await jwt.sign(payload,secret,options)
  }

  export const verifyToken = async({token,secret=user_access_token_secret,options={}}={}) => {
    return await jwt.verify(token,secret,options)
  }
    export const detectSigntureLevel = async(level)=>{
let signature = {accessSignature:undefined,refreshSignature:undefined};
switch(level){
    case RoleEnum.Admin:
         signature = {accessSignature:system_access_token_secret,refreshSignature:refresh_system_token_secret};
        break;
    default:
        signature = signature = {accessSignature:user_access_token_secret,refreshSignature:refresh_user_token_secret};
        break;
}
console.log({signature})
return signature
  }
  export const getTokenSignture = async({tokenType= TokenTypeEnum.Access,level} = {})=>{
const {accessSignature,refreshSignature} = await detectSigntureLevel(level)
    let signature = undefined;
switch(tokenType){
    case TokenTypeEnum.Refresh:
        signature = refreshSignature;
        break;
    default:
        signature = accessSignature;
        break;
}
return signature
  }
export const decodeToken = async({token , tokenType= TokenTypeEnum.Access}) => {
const decoded = jwt.decode(token)
const {sub}= decoded
console.log({decoded})
if(!decoded?.aud?.length){
  throw ErrorException({message:"Missing token audience"})
}
const [tokenApproach , level] = decoded.aud || []
if(tokenType !== tokenApproach){
throw ErrorException({message:"unexpected token mechanism we expected"})
}
const secret = await getTokenSignture({tokenType:tokenApproach,level})

const verifyData = jwt.verify(token,secret)
console.log({ verifyData})
  const user = await UserModel.findById(sub,{gender:0,email:0,password:0})
if(!user){
    throw NotFoundException({message:"user not found"})
}
return user
}


  export const createloginCredentials =async (user , issuer) => {
    const {accessSignature,refreshSignature }= await detectSigntureLevel(user.role)
  const access_token = await generateToken({
    payload:{
           sub:user.id,
      extra:250
    },
    secret:accessSignature,
    options:{
   
    issuer,
      audience:[TokenTypeEnum.Access, user.role],
    
      expiresIn:access_token_expires_in
    }}
)
    const refresh_token = await  generateToken({
      payload:{extra:250, 
        sub:user.id
      },
      secret:refreshSignature,
      options:{
      
        issuer,
        audience:[TokenTypeEnum.Refresh ,user.role],
        
      expiresIn:refresh_token_expires_in
    }})
       return {access_token , refresh_token}
}