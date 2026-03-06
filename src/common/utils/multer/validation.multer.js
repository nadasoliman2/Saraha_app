export const fileFieldValidation ={
Image:["image/jpeg","image/png","image/jpg"],
video:["video/mp4"],
}


export const fileFilter = (validation = []) => {
  return (req, file, cb) => {

    if (!validation.includes(file.mimetype)) {
      const error = new Error("invalid file type")
      error.cause = { status: 400 }
      return cb(error, false)
    }

    return cb(null, true)   // 👈 دي كانت ناقصة
  }
}