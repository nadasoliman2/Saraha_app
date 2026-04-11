import { Router } from 'express'
import {  signup , login, verify,verifyForgotPassword, resetforgotPassword, requestForgotPasswordOtp , confirmEmail,resendConfirmEmail} from './auth.service.js';
import { successResponse , ErrorException} from '../../common/utils/index.js';
import { validation } from '../../middleware/index.js';
import * as  validators from './auth.validation.js';
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import axios from 'axios'
import geoip from 'geoip-lite'
import {redisClient} from '../../DB/index.js'
import { deleteKey } from '../../common/services/redis.service.js';
const router = Router(); 
const fromwhere = async (ip)=>{
    try{
        const {data} = await axios.get(`https://ipapi.co/${ip}/json`)
        return data
    }catch(error){

        if(error.response?.status === 429){
            console.log("ipapi rate limit exceeded")
            return {country_code:null}
        }
        console.log(error.message)
        return {country_code:null}
    }
}
    const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: async function(req){
    const  {country} = geoip.lookup(req.ip)
    console.log(geoip.lookup(req.ip))
return country =="EG" ? 5 : 0

//    return country_code === "EG" ? 5 : 3
    } // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    ,requestPropertyName:"ratelimit",
    skipSuccessfulRequests:true,
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false // Disable the `X-RateLimit-*` headers.
, handler:(req,res,next)=>{
    return res.status(429).json({message:"Too many requests"})
},keyGenerator:(req,res,next)=>{
    const ip = ipKeyGenerator(req.ip,56)
    console.log(`${ip}-${req.path}`)
    return `${ip}-${req.path}`
},
store:{
  async incr(key, cb){
    try{
      const count = await redisClient.incr(key)

      if (count === 1) {
        await redisClient.expire(key, 60)
      }

      cb(null, count)

    }catch(err){
      cb(err)
    }
  },

  async decrement(key){
    if(await redisClient.exists(key)){
      await redisClient.decr(key)
    }
  }
}

})
router.post("/signup",validation(validators.signup),
async (req, res, next) => {

     const result = await signup(req.body)

    return successResponse({res,status: 201})


})
router.patch("/confrim-email",validation(validators.confirmEmail),
async (req, res, next) => {

     const account = await  confirmEmail(req.body)

    return successResponse({res})


})
router.patch("/resend-confrim-email",
    validation(validators.resendconfirmEmail),
async (req, res, next) => {

     const account = await  resendConfirmEmail(req.body)

    return successResponse({res})


})


router.post("/login" ,validation(validators.login), async (req, res, next) => {
    console.log(`${req.protocol}://${req.host}`)
    const result = await login(req.body,`${req.protocol}://${req.host}`)
    await deleteKey(`${req.ip}-${req.path}`)
    return successResponse({res,status: 200,data:{token:result}})
})
router.post("/signup/gmail", async (req, res, next) => {
    const {status, Credential} = await signupwithgmail(req.body.idToken,`${req.protocol}://${req.host}`)
    
    return successResponse({res,status: status,data:{...Credential}})
})

router.post("/request-forgot-password",
    validation(validators.resendconfirmEmail),
async (req, res, next) => {

     const account = await  requestForgotPasswordOtp(req.body)

    return successResponse({res})


})
router.patch("/verify-forgot-password",validation(validators.confirmEmail),
async (req, res, next) => {

     const account = await  verifyForgotPassword(req.body)

    return successResponse({res})


})
router.patch("/reset-forgot-Password",validation(validators.resetforgotpassord),
async (req, res, next) => {

     const account = await  resetforgotPassword(req.body)

    return successResponse({res})


})
router.post("/otp-verify", async (req, res, next) => {
    const result = await verify(req.body)

    return successResponse({res,status: 200})
})

export default router