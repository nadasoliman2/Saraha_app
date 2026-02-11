import { UserModel } from "../../DB/model/user.model.js"
export const profile   =async (id)=>{
    const user = await UserModel.findById(id,{gender:0,email:0})
    return user
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