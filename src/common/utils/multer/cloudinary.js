import { v2 as cloudinary } from 'cloudinary'

export const cloud =()=>{
    cloudinary.config(
        {
 cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET,
  secure: true
        }
    )
    return cloudinary
}
export const uploadFile =async({file ={},path="general"}={})=>{
    return   await cloud().uploader.upload(file,
          {
            folder: `${process.env.APPLICATION_NAME}/${path}`
          }
        )
}
export const destroy = async ({public_id = ""}={})=>{
    return await cloud().uploader.destroy(public_id)
}
export const uploadFiles = async ({ files = [], path = "general" } = {}) => {
  const attachments = [];

  for (const file of files) {
    const { secure_url, public_id } = await uploadFile({
      file: file.buffer,   // 👈 أهم تعديل
      path
    });

    attachments.push({ secure_url, public_id });
  }

  return attachments;
};