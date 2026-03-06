import { Router } from "express";
import { profile,updateprofile ,  deleteprofileImage ,rotateToken,shareProfile,profileImage,profilecoverImage , logout ,deleteprofilecoverImage } from "./user.service.js";
import { successResponse , localFileUpload} from "../../common/utils/index.js";
import { authentication ,authorization} from "../../middleware/authentication.middleware.js";
import {TokenTypeEnum} from '../../common/enums/index.js'
import { RoleEnum } from "../../common/enums/index.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./user.validation.js";
import { fileFieldValidation } from "../../common/utils/multer/index.js";
const router=Router()

router.get("/" ,
    authentication(),
    authorization([RoleEnum.Admin,RoleEnum.User]),

    async (req,res,next)=>{
    const account = await profile(req.user)
    return successResponse({res,data:{account}})
})
router.post('/logout',authentication(),async(req,res,next)=>{
    const status = await logout(req.body, req.user, req.decoded)
    return successResponse({res,data:status})

})
router.post("/rotate-token" ,
    authentication(TokenTypeEnum.Refresh),
    async (req,res,next)=>{
    const credentials = await rotateToken(req.user ,req.decoded,`${req.protocol}://${req.host}`)
    return successResponse({res,status:201, data:{...credentials}})
})
router.patch(
  '/profile-image',
  authentication(),
  localFileUpload({
    customPath: "users/profile",
    validation: fileFieldValidation.Image
  }).single("attachment"),
  validation(validators.profileImage),

  async (req, res, next) => {
    const data = await profileImage(req.file, req.user)
    return successResponse({ res, data })
  }
)
router.delete(
  '/profile-image',
  authentication(),
 

  async (req, res, next) => {
    const data = await deleteprofileImage(req.user)
    return successResponse({ res, data:{message:"photo image deleted sucessfully" }})
  }
)
router.patch(
  '/profile-cover-image',
  authentication(),
  localFileUpload({
    customPath: "users/profile/cover",
    validation: fileFieldValidation.Image
  }).array("attachments"),
 validation(validators.profilecoverImage),
  async (req, res, next) => {

    const data = await profilecoverImage(req.files, req.user)
    return successResponse({ res, data :{data:data} })
  }
)
router.delete( '/profile-cover-image/:photoId',
  authentication(),
  async (req, res, next) => {
    const {photoId} = req.params
    const data = await deleteprofilecoverImage( req.user , photoId )
    return successResponse({ res, data :{message:"deleted profile-cover-image successfully"} })
  }
)
router.patch('/:userId',

    async(req,res)=>{
    const result = await updateprofile(req.params.userId , req.body)
    return res.status(200).json({message:"updated done",result})
})
router.get("/:userId/share-profile" ,
    validation(validators.shareprofile),
  authentication()  ,
    async (req,res,next)=>{
        const {userId} = req.params;
    const account = await shareProfile(userId ,req.user)
    return successResponse({res,data:{account}})
})
export default router 
