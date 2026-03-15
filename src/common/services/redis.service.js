import { redisClient } from "../../DB/index.js";
export const revokeTokenKey =({userId ,jti })=>{
    return `RevokeToken ::${userId}::${jti}`
}
export const otpkey = ({email,subject="ConfirmEmail"})=>{
return `OTP::User::${email}::${subject}`
}
export const blockOtpkey = ({email,subject="bli"})=>{
return `OTP::User::${email}::${subject}::Block`
}
export const maxAttempOtpkey = ({email,subject="ConfirmEmail"})=>{
return `OTP::User::${email}::${subject}::MaxTrial`
}
export const baseRevokeTokenKey =(userId )=>{
    return `RevokeToken ::${userId.toString()}`
}
export const set =async ({key ,value,ttl}={})=>{
    try{
        let data = typeof value === 'string'? value :JSON.stringify(value)
      return ttl ? await redisClient.set(key ,data,{EX :ttl }): await redisClient.set(key ,data)
    }catch(error){
console.log(`fail in redis set operation ${error} `)
    }
}
export const update =async ({key ,value,ttl}={})=>{
    try{
        if(!await redisClient.exists(key)) return 0;
return await set({Key , value ,ttl})
    }catch(error){
console.log(`fail in redis set operation ${error} `)
    }
}

export const get =async (key)=>{
    try{
try{
return JSON.parse(await redisClient.get(key))
}catch(error){
return  await redisClient.get(key)
}
    }catch(error){
console.log(`fail in redis get operation ${error} `)
    }
}
export const ttl =async (key)=>{
    try{

return await redisClient.ttl(key)

    }catch(error){
console.log(`fail in redis ttl operation ${error} `)
    }
}
export const exist =async ({key})=>{
    try{

return await redisClient.exists(key)

    }catch(error){
console.log(`fail in redis exist operation ${error}`)
    }
}
export const expire =async ({key,ttl}={})=>{
    try{

return await redisClient.ttl(key,ttl)

    }catch(error){
console.log(`fail in redis add-expire operation ${error} `)
    }
}
export const mGet =async (Keys=[])=>{
    try{
if(!Keys.length) return 0;
return await redisClient.mGet(Keys)

    }catch(error){
console.log(`fail in redis Mget operation ${error} `)
    }
}
export const Keys = async (prefix) => {
  try {
    return await redisClient.keys(`${prefix}*`)
  } catch (error) {
    console.log(`fail in redis Keys operation ${error}`)
  }
}
export const deleteKey = async (keys) => {
  try {
    if (!keys?.length) return 0

    return await redisClient.del(...keys)
  } catch (error) {
    console.log(`fail in redis del operation ${error}`)
  }
}
export const incr =async (key)=>{
    try{

return await redisClient.incr(key)

    }catch(error){
console.log(`fail in redis incr operation ${error}`)
    }
}