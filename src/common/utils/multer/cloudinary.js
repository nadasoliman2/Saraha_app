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
export const uploadFile = async ({ file, path = "general" } = {}) => {
  return await new Promise((resolve, reject) => {
    const stream = cloud().uploader.upload_stream(
      {
        folder: `${process.env.APPLICATION_NAME}/${path}`
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

    stream.end(file); // 👈 buffer هنا
  });
};