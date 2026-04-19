import {UserModel, MessageModel} from '../../DB/index.js'
import { findOne } from '../../DB/index.js'
import { NotFoundException } from '../../common/utils/index.js'
import { cloud,uploadFile,uploadFiles,destroy } from "../../common/utils/multer/cloudinary.js";

export const sendmessage =
async(receiverid , {content=undefined}={},files, user)=>
{
    const account = await findOne(
        {
            model:UserModel,
            filter:{_id :receiverid , confirmEmail:{$exists:true}}
        }
    )
    if(!account){
        throw NotFoundException("Fail to find matching receiver account")
    }
    const attachments = await uploadFiles({
        files,
        path:`message/${user.id}/attachment`
    })

  

  const message = await MessageModel.create({
    content,
    receiverId: receiverid,
    attachments,
    senderId: user?._id ?? null
})
    return  message
}

export const getMessage =async(messageId , user)=>{
const message = await findOne(
        {
            model:MessageModel,
            filter:{_id :messageId , 
                $or:[
                    {senderId:user._id},
                    {receiverId:user._id}
                ]
            },
            select:"-senderId"
        }
    )
    if(!message){
        throw NotFoundException({message:"Invalid message or not authorized action"})
    }
    return message
}
export const getMessages =async(user)=>{
const message = await 
        
            MessageModel.find(
        {
  $or: [
    { receiverId: user._id },
    { senderId: user._id }
  ]
},
            {senderId:0}
            )
    
    if(!message){
        throw NotFoundException({message:"Invalid message or not authorized action"})
    }
    return message
}
export const deleteMessage =async(messageId, user)=>{
const message = await 
        
        MessageModel.findOneAndDelete(
        {
  _id :messageId,
   receiverId:user._id
  
}
            )
    
    if(!message){
        throw NotFoundException({message:"Invalid message or not authorized action"})
    }

    return message
}