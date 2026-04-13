import { UserModel , tokenModel } from "../../DB/model/index.js"
import { createloginCredentials } from "../../common/utils/security/token.security.js";
import { ConfilctException, ErrorException, NotFoundException , compareHash, decrypt, generateHash} from "../../common/utils/index.js"
import { LogoutEnum } from "../../common/enums/security.enum.js";
import { createOne } from "../../DB/database.repository.js";
import {RoleEnum } from "../../common/enums/user.enum.js"
import { access_token_expires_in, refresh_token_expires_in } from "../../../config/config.service.js";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import {set,revokeTokenKey,deleteKey,Keys,baseRevokeTokenKey} from '../../common/services/index.js'
import { cloud,uploadFile,uploadFiles,destroy } from "../../common/utils/multer/cloudinary.js";
export const updatePassword = async ({ oldPassword, password }, user, issuer) => {

  if (!await compareHash({
    plaintext: oldPassword,
    cipherText: user.password
  })) {
    throw ConfilctException({ message: "invalid old password" })
  }

  // check if password used before
  for (const hash of user.oldPassword || []) {
    if (await compareHash({
      plaintext: password,
      cipherText: hash
    })) {
      throw ConfilctException({ message: "this password is already used before" })
    }
  }

  user.oldPassword.push( await generateHash({ plaintext: oldPassword }))

 
  user.password = await generateHash({ plaintext: password })

  user.changeCredentialsTime = new Date()

  await user.save()

  await deleteKey(await Keys(baseRevokeTokenKey(user.id)))

  return await createloginCredentials(user, issuer)
}
export const logout = async({flag},user,{jti,iat , sub})=>{
    let status = 200
    switch(flag){
        case LogoutEnum.All:
              user.changeCreadentialsTime =  Date.now();
    await user.save();
    await  deleteKey(await Keys(baseRevokeTokenKey(sub)))
            break;
            default:
                // await 
                //   tokenModel.create({
                    
                //         userId: user._id,
                //         jti,
                //           expiresIn: new Date((iat + refresh_token_expires_in) *1000)
                    
                // })
                // status=201
await set({
  key: revokeTokenKey({ userId: sub, jti }),
  value: jti,
  ttl: iat + refresh_token_expires_in
})
                status=201
                break;
    }
  
    return status
}

export const profileImage = async (file, user) => {
  const { secure_url, public_id } = await uploadFile({
    file: file.buffer,   // 👈 هنا الرفع الحقيقي
    path: `user/${user.id}`
  });

  user.profilePicture = { secure_url, public_id };
  await user.save();

  return user;
};
export const deleteprofileImage = async(user)=>{
   if (!user.profilePicture) {
    throw NotFoundException({ message: "Not found profile image found" });
  }
 await destroy({ public_id: user.profilePicture.public_id });

  user.profilePicture = null;
  await user.save();


  return user;

}
export const profilecoverImage = async (files, user) => {

    if(user.coverProfilePicture.length === 2){
        throw ConfilctException({ message:"you must remove atleast photo" })
    }

    const attachments = await uploadFiles({
        files,
        path:`user/${user.id}/cover`
    })

    user.coverProfilePicture.push(...attachments)

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


  await destroy({ public_id: removedPhoto.public_id });

  await user.save();

  return user;
};
export const profile   =async (user )=>{
const payload = {
  id:user._id,
  phone: await decrypt(user.phone),
  role: user.role == 0 ?"user":"admin",
        coverProfilePicture:user.coverProfilePicture,
Gallery: user.Gallery,
username:user.username,
profilePicture:user?.profilePicture

}
    return payload
}
export const rotateToken =async (user, {sub,jti,iat} ,issuer )=>{
    if((iat + access_token_expires_in ) * 1000 >= Date.now() + (30000) ){
 throw ConfilctException({message:"Current access token still valid"})

    }
await set({
  key: revokeTokenKey({ userId: sub, jti }),
  value: jti,
  ttl: iat + refresh_token_expires_in
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