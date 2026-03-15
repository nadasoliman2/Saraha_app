import {Router} from 'express'
import { successResponse ,BadRequestException, localFileUpload ,fileFieldValidation } from '../../common/utils/index.js';
import {sendmessage,getMessage,getMessages, deleteMessage} from './message.service.js'
import * as validators from './message.validation.js'
import { validation } from '../../middleware/validation.middleware.js';
import {decodeToken} from '../../common/utils/security/token.security.js'
import { TokenTypeEnum } from '../../common/enums/security.enum.js';
import {authentication} from '../../middleware/authentication.middleware.js'
const router = Router({caseSensitive:true,strict:true})



router.get('/list',
authentication(),
    async (req,res,next)=>{
      
    const message = await getMessages(req.user)
return successResponse({res , status:200 , data:{message}})
})
router.delete('/:messageId',
authentication(),
validation(validators.getMessage)
    ,
    async (req,res,next)=>{
      
    const message = await deleteMessage(req.params.messageId ,req.user)
return successResponse({res , status:200 , data:{message:"message deleted successfully"}})
})
router.get('/:messageId',
authentication(),
validation(validators.getMessage)
    ,
    async (req,res,next)=>{
      
    const message = await getMessage(req.params.messageId ,req.user)
return successResponse({res , status:200 , data:{message}})
})
router.post('/:receiverid',
async(req,res,next)=>{
if(req.headers.authorization){
const {user , decoded}= await  decodeToken({token:req.headers.authorization.split(" ")[1],tokenType:TokenTypeEnum.Acces})
          req.user = user;
          req.decoded = decoded
}
next()
},
    localFileUpload({validation:fileFieldValidation.Image , 
        customPath:"Messages",
        maxSize:1
    }).array("attachments",2),
validation(validators.sendMessage)
    ,
    async (req,res,next)=>{
      
    const message = await sendmessage(req.params.receiverid , req.body,req.files ,req.user)
return successResponse({res , status:201 , data:{message}})
})
export default router;