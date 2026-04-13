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
export const destroy = async ({public_id = ""}={})=>{
    return await cloud().uploader.destroy(public_id)
}
export const uploadFiles = async ({ files = [], path = "general" } = {}) => {
  return await Promise.all(
    files.map(file =>
      uploadFile({
        file: file.buffer,
        path
      }).then(({ secure_url, public_id }) => ({
        secure_url,
        public_id
      }))
    )
  );
};