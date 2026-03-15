import { UserModel , createOne, findOne } from "../../DB/index.js"
import { ConfilctException , BadRequestException, ErrorException ,NotFoundException ,generateHash,compareHash,encrypt,decrypt ,createNumberOtp, emailEvent} from "../../common/utils/index.js"
import NodemailerHelper from 'nodemailer-otp'
import { EMAIL_PASS,EMAIL_USER } from "../../../config/config.service.js"
import { createloginCredentials } from "../../common/utils/security/token.security.js";
import {OAuth2Client} from 'google-auth-library'

import { EmailEnum, providerEnum } from "../../common/enums/index.js";
import { sendEmail ,emailTemplete} from "../../common/utils/index.js"
import {baseRevokeTokenKey, set ,otpkey ,get ,ttl, incr, blockOtpkey, maxAttempOtpkey,Keys, deleteKey} from "../../common/services/redis.service.js";
const helper = new NodemailerHelper(EMAIL_USER, EMAIL_PASS);
const SendEmailOtp = async ({email, subject, title} = {}) => {

const otpKey = otpkey({email, subject})
const trialKey = maxAttempOtpkey({email, subject})
const blockKey = blockOtpkey({email, subject})

const isBlocked = await ttl(blockKey)

if (isBlocked > 0) {
  throw BadRequestException({
    message:`You are blocked. Try again after ${isBlocked}s`
  })
}

const reminingOtpTTl = await ttl(otpKey)

if (reminingOtpTTl > 0) {
  throw BadRequestException({
    message:`Sorry current otp still active try again after ${reminingOtpTTl}s`
  })
}

const maxTrial = Number(await get(trialKey)) || 0

if (maxTrial >= 3) {

  await set({
    key: blockKey,
    value: 1,
    ttl: 7 * 60
  })

  throw BadRequestException({
    message:`You are blocked for 7 minutes`
  })
}

const code = await createNumberOtp()

await set({
  key: otpKey,
  value: await generateHash({plaintext:`${code}`}),
  ttl:120
})
emailEvent.emit("sendEmail", async ()=>{
await sendEmail({
  to:email,
  subject,
  html:emailTemplete({otp:code,title})
})

await incr(trialKey)
} )


}
export const signup = async (inputs) => {
  const { username, email, password, phone , gender,age} = inputs;

  const checkuserExist = await findOne({
    model: UserModel,
    filter: { email }
  });

  if (checkuserExist) throw ConfilctException({ message: "email exist" });


//   const otp = helper.generateOtp(6);
// const expiry = new Date(Date.now() + 10 * 60 * 1000);

  

  const [firstName, lastName] = (username || "").split(" ");

  const payload = {
    firstName,
     gender : gender==="male"? 1 : 2
     ,
    lastName,
    username,
    email,
    age,
    password: await generateHash({ plaintext: password }),
    phone: await encrypt(phone)
  };

  const user = await UserModel.create(payload);


const code = await createNumberOtp()
await set({key:otpkey({email})
   , value:await generateHash({plaintext:`${code}`}),
  ttl:120})
await  sendEmail({to:email,subject:"Confirm-Email",
  html:emailTemplete({otp:code,title:"Confirm-Email"}),

})
await set({ key:maxAttempOtpkey({email}),
value:1,
ttl:360
})
  return user;
};
export const confirmEmail = async (inputs) => {
  const {  email,otp } = inputs;

  const account = await findOne({
    model: UserModel,
    filter: { email ,confirmEmail:{$exists:false},provider:providerEnum.system }
  });

  if (!account) throw NotFoundException({ message: "fail to find matching account" });
const hashOtp = await get(otpkey({email}),)
if(!hashOtp){
  throw NotFoundException({message:"Expired otp"})
}
if(!await compareHash({plaintext:otp, cipherText: hashOtp})){
throw ConfilctException({message: "Invalid otp"})
}
account.confirmEmail = new Date();
await account.save();
await deleteKey(otpkey({email}))
  return ;
};

export const resendConfirmEmail = async (inputs) => {
  const {  email } = inputs;

  const account = await findOne({
    model: UserModel,
    filter: { email ,confirmEmail:{$exists:false},provider:providerEnum.system }
  });

  if (!account) throw NotFoundException({ message: "fail to find matching account" });
  await SendEmailOtp({email, subject:EmailEnum.ConfirmEmail , title: "Verify Email"})
  return ;
};
export const requestForgotPasswordOtp = async (inputs) => {
  const {  email } = inputs;

  const account = await findOne({
    model: UserModel,
    filter: { email ,confirmEmail:{$exists:true},provider:providerEnum.system }
  });

  if (!account) throw NotFoundException({ message: "fail to find matching account" });
  await SendEmailOtp({email, subject:EmailEnum.ForgotPassword , title: "Reset Code"})
  return ;
};
export const resetforgotPassword = async (inputs) => {
  const { email, otp, password } = inputs;

  await verifyForgotPassword({ email, otp });

  const user = await UserModel.findOne({
    email,
    confirmEmail: { $exists: true },
    provider: providerEnum.system
  });

  if (!user) {
    throw NotFoundException({ message: "account not exist" });
  }

  user.password = await generateHash({ plaintext: password });
  user.changeCredentialsTime = new Date();

  await user.save();

  await deleteKey(await Keys(baseRevokeTokenKey(user._id)));

  await deleteKey(
    otpkey({ email, subject: EmailEnum.ForgotPassword })
  );
};
export const verifyForgotPassword = async (inputs) => {
  const {  email,otp } = inputs;


const hashOtp = await get(otpkey({email , subject:EmailEnum.ForgotPassword}))
if(!hashOtp){
  throw NotFoundException({message:"Expired otp"})
}
if(!await compareHash({plaintext:otp, cipherText: hashOtp})){
throw ConfilctException({message: "Invalid otp"})
}

await deleteKey(otpkey({email ,subject:EmailEnum.ForgotPassword}))
  return ;
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
    filter:{email , provider:providerEnum.system , confirmEmail:{$exists:true}},},)
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
