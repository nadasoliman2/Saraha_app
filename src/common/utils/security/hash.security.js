import {hash,genSalt,compare} from "bcrypt"
import { SALT_ROUND } from "../../../../config/config.service.js"
export const generateHash = async({plaintext ,salt=SALT_ROUND,minor='b',approach='bcrypt'}={})=>{
const generatesalt = await genSalt(salt,minor)
return await hash(plaintext,generatesalt)
}
export const compareHash= async({plaintext ,cipherText,approach='bcrypt'}={})=>{
return await compare(plaintext,cipherText)
}