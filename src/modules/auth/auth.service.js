import { UserModel , createOne, findOne } from "../../DB/index.js"
import { ConfilctException ,NotFoundException } from "../../common/utils/index.js"
import { generateHash,compareHash } from "../../common/utils/security/hash.security.js"
import NodemailerHelper from 'nodemailer-otp'
import { EMAIL_PASS,EMAIL_USER } from "../../../config/config.service.js"
const helper = new NodemailerHelper(EMAIL_USER, EMAIL_PASS);


export const signup = async (inputs) => {
  const { username, email, password, phone } = inputs;

  const checkuserExist = await findOne({
    model: UserModel,
    filter: { email }
  });

  if (checkuserExist) throw ConfilctException({ message: "email exist" });


  const otp = helper.generateOtp(6);
const expiry = new Date(Date.now() + 10 * 60 * 1000);

  

  const [firstName, lastName] = (username || "").split(" ");

  const payload = {
    firstName,
    lastName,
    username,
    email,
    password: await generateHash({ plaintext: password }),
    phone,  
    otp,
  otpExpiry: expiry
  };

  const user = await UserModel.create(payload);

try {
    await helper.sendEmail(email, 'subject', "Your OTP Code", otp);
    console.log("Email sent successfully");
  } catch (err) {
    console.error("Failed to send email:", err);
    throw new Error("Failed to send OTP email");
  }

  return user;
};


export const login = async (inputs) => {
 
   const {email,password} =inputs
const Existcheckuser = await findOne({ model:UserModel,
    filter:{email},
},
)
if(!Existcheckuser){
     
 throw  NotFoundException({message:" Invalid login credentials"})
}
const match = await compareHash({ plaintext:password ,cipherText : Existcheckuser.password})
if(!match){
    throw  NotFoundException({message:" Invalid login credentials"})

}
   return {Existcheckuser, match}
}
export const verify = async(inputs)=>{
const { email,otp} = inputs;
 const user = await UserModel.findOne({ email });
 
  if (!user) {
   throw new Error ( 
  "User not found",404) }


  if (user.otp !== otp) {
   throw new Error ( "Invalid OTP",
     404) }
  if (user.otpExpiry < new Date()) {
      throw new Error(
    "OTP expired",404) }


  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  return user
}