import { UserModel , createOne, findOne } from "../../DB/index.js"
import { ConfilctException ,  ErrorException ,NotFoundException ,generateHash,compareHash,encrypt,decrypt } from "../../common/utils/index.js"
import NodemailerHelper from 'nodemailer-otp'
import { EMAIL_PASS,EMAIL_USER } from "../../../config/config.service.js"
import { createloginCredentials } from "../../common/utils/security/token.security.js";
import {OAuth2Client} from 'google-auth-library'
import { providerEnum } from "../../common/enums/index.js";
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
    phone: await encrypt(phone),  
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
const verifyGoogleAccount = async (idToken)=>{
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
      idToken,
      audience: '256940528972-05n32pk16il5d8t0e1mb0lflun90nl3t.apps.googleusercontent.com',  // Specify the WEB_CLIENT_ID of the app that accesses the backend
  });
  const payload = ticket.getPayload();
  if(!payload.email_verified){
    throw  ErrorException({message:"unverified email"})
  }
return payload
}
export const signupwithgmail = async (idToken,issuer) => {
const payload = await verifyGoogleAccount(idToken);
console.log(payload)
const checkuserExist = await findOne({model:UserModel,filter:{email:payload.email}})
if(checkuserExist){
  if(checkuserExist.provider != providerEnum.Google){
throw ConfilctException({message:"email exist with different provider"})
}
return{ status:200, Credential: await loginwithgmail(idToken,issuer)  };
  }

  const user = await createOne({model:UserModel,filter:{email:payload.email},data:{
    firstName:payload.given_name,
    lastName:payload.family_name,
    email:payload.email,
    provider:providerEnum.Google,
    profilePicture:payload.picture,
    confirmEmail:Date.now(),
    provider:providerEnum.Google
  }})
  return {status:201, Credential: await loginwithgmail(idToken,issuer)}
}

 const loginwithgmail = async (idToken,issuer) => {
const payload = await verifyGoogleAccount(idToken);
console.log(payload)
const user= await findOne({model:UserModel,
  filter:{email:payload.email,
    provider:providerEnum.Google}})
if(!user){
throw NotFoundException({message:"no registered account "})
}
return await createloginCredentials(user,issuer)
  }

export const login = async (inputs,issuer) => {
   const {email,password} =inputs
const Existcheckuser = await findOne({ model:UserModel,
    filter:{email , provider:providerEnum.system},},)
if(!Existcheckuser){ 
 throw  NotFoundException({message:" Invalid login credentials"})
}
const match = await compareHash({ plaintext:password ,cipherText : Existcheckuser.password})
if(!match){
    throw  NotFoundException({message:" Invalid login credentials"})}
return createloginCredentials(Existcheckuser,issuer)
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