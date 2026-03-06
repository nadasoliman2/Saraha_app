import { UserModel , tokenModel } from "../../DB/model/index.js"
import { createloginCredentials } from "../../common/utils/security/token.security.js";
import { ConfilctException, ErrorException, NotFoundException , decrypt} from "../../common/utils/index.js"
import { LogoutEnum } from "../../common/enums/security.enum.js";
import { createOne } from "../../DB/database.repository.js";
import {RoleEnum } from "../../common/enums/user.enum.js"
import { access_token_expires_in, refresh_token_expires_in } from "../../../config/config.service.js";
import fs from "fs";
import path from "path";
export const logout = async({flag},user,{jti,iat})=>{
    let status = 200
    switch(flag){
        case LogoutEnum.All:
              user.changeCreadentialsTime =  Date.now();
    await user.save();
    await tokenModel.deleteMany({userId :user._id})

            break;
            default:
                await 
                  tokenModel.create({
                    
                        userId: user._id,
                        jti,
                          expiresIn: new Date((iat + refresh_token_expires_in) *1000)
                    
                })
                status=201
                break;
    }
  
    return status
}

export const profileImage   =async (file,user )=>{
user.Gallery.push({ url: user.profilePicture });
user.profilePicture= file.finalPath
await user.save()
    return user
}
export const deleteprofileImage = async(user)=>{
   if (!user.profilePicture) {
    throw NotFoundException({ message: "Not found profile image found" });
  }

  const filePath = path.join("D:", "back", "mongose", user.profilePicture);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); 
      console.log("Profile image deleted from disk");
    } else {
      console.warn("File not found on disk, skipping deletion");
    }
  } catch (err) {
    console.error("Failed to delete profile image:", err);
  }

  user.profilePicture = null;
  await user.save();


  return user;

}
export const profilecoverImage   =async (files,user )=>{
    if(user.coverProfilePicture.length ===2){
   throw ConfilctException({message:"you must remove atleast photo" })
    }
 user.coverProfilePicture = files.map(file => ({
  url: file.finalPath
}))

    await user.save()
        return user
}
export const deleteprofilecoverImage = async (user, photoId) => {
  const photoIndex = user.coverProfilePicture.findIndex(
    photo => photo._id.equals(photoId)
  );

  if (photoIndex === -1) {
    throw NotFoundException({ message: "Photo not found in coverProfilePicture" });
  }
  const [removedPhoto] = user.coverProfilePicture.splice(photoIndex, 1);



  await user.save();

  return user;
};
export const profile   =async (user )=>{

    return user
}
export const rotateToken =async (user, {jti,iat} ,issuer )=>{
    if((iat + access_token_expires_in ) * 1000 >= Date.now() + (30000) ){
 throw ConfilctException({message:"Current access token still valid"})

    }
  await  tokenModel.create({
                    
                        userId: user._id,
                        jti,
                          expiresIn: new Date((iat + refresh_token_expires_in) *1000)
                    
                })
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
export const shareProfile = async(userId,account)=>{

    
    const user = await UserModel.findById(userId ,{password:0})
    if(!user) throw NotFoundException({message:"user not found"})
 
          user.visitCount = (user.visitCount || 0) + 1;
              await user.save();
              const userData = user.toObject();
                if (userData.phone) {
    userData.phone = await decrypt(userData.phone);
  }
if (account.role !== RoleEnum.Admin) {
  delete userData.visitCount; 
}

return userData;
}