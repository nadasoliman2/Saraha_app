
import { NODE_ENV, port,ORIGINS } from '../config/config.service.js'
import { authRouter, userRouter, messageRouter} from './modules/index.js'
import express from 'express'
import { authenticationDB ,  connectRedis,redisClient } from './DB/index.js'
import { globalErrorHandling } from './common/utils/index.js'
import cors from 'cors'
import { resolve } from 'node:path'
import helmet from "helmet"
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import axios from 'axios'
import geoip from 'geoip-lite'
import { sendEmail } from './common/utils/index.js'
async  function  bootstrap() {
    const app = express()
//     var corsOptions={
//         origin: function(origin,callback){
//             if(!ORIGINS.includes(origin)){
// callback(new Error("Not authorized origin",{cause:{status:403}}))
//             }else{
//                 callback(null,ORIGINS)
//             }
//         }
//     }
    //convert buffer data
  
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
    // skipSuccessfulRequests:true,
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
	// ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// // store: ... , // Redis, Memcached, etc. See belo
app.set("trust proxy",true)
app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(limiter)
app.use("/uploads",express.static(resolve('../uploads')))

  await authenticationDB()
 await connectRedis()

    //application routing
    app.get('/', async(req, res) =>{
        console.log(await fromwhere(req.ip))
         res.send('Hello World!')})
    app.use('/auth', authRouter)
    app.use('/user', userRouter)
    app.use('/message',messageRouter)



    //invalid routing
    app.use('{/*dummy}', (req, res) => {
        return res.status(404).json({ message: "Invalid application routing" })
    })

    //error-handling
    app.use(globalErrorHandling)
    
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}
export default bootstrap