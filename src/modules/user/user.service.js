import { UserModel } from "../../DB/model/user.model.js"
import { createloginCredentials } from "../../common/utils/security/token.security.js";
import jwt from 'jsonwebtoken'
import { user_access_token_secret,refresh_user_token_secret ,} from "../../../config/config.service.js"
import { NotFoundException, decodeToken } from "../../common/utils/index.js"
import { TokenTypeEnum } from "../../common/enums/security.enum.js";

export const profile   =async (user )=>{

    return user
}
export const rotateToken =async (user ,issuer )=>{
  return createloginCredentials(user,issuer)
}
export const updateprofile = async(id,inputs)=>{
const {gender}=inputs;
const user = await UserModel.findOneAndReplace(
    {_id:id},
    {
       
    },{
        upsert: true
    }

)
return user
}