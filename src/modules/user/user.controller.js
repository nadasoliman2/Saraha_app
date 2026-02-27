import { Router } from "express";
import { profile,updateprofile ,rotateToken} from "./user.service.js";
import { successResponse  } from "../../common/utils/index.js";
import { authentication ,authorization} from "../../middleware/authentication.middleware.js";
import {TokenTypeEnum} from '../../common/enums/index.js'
import { RoleEnum } from "../../common/enums/index.js";
const router=Router()

router.get("/" ,
    authentication(),
    authorization([RoleEnum.Admin,RoleEnum.User]),

    async (req,res,next)=>{
    const account = await profile(req.user)
    return successResponse({res,data:{account}})
})
router.patch('/:userId',async(req,res)=>{
    const result = await updateprofile(req.params.userId , req.body)
    return res.status(200).json({message:"updated done",result})
})
router.get("/rotate-token" ,
    authentication(TokenTypeEnum.Refresh),
    async (req,res,next)=>{
    const credentials = await rotateToken(req.user ,`${req.protocol}://${req.host}`)
    return successResponse({res,data:{credentials}})
})
export default router 
