import mongoose from "mongoose"
import { DB_URL } from "../../config/config.service.js"
import { UserModel } from "./model/user.model.js"
export const authenticationDB = async()=>{
    try{
        const databaseConnectionResult = await mongoose.connect(DB_URL,{serverSelectionTimeoutMS:30000})
        await UserModel.syncIndexes()
        console.log(`DB connected success`)

    }catch(error){
console.log(`fail to connect ${error}`)
    }
}
