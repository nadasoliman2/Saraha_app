import { resolve } from 'node:path'
import { config } from 'dotenv'

export const NODE_ENV = process.env.NODE_ENV

const envPath = {
    development: `.env.development`,
    production: `.env.production`,
}
console.log({ en: envPath[NODE_ENV] });


config({ path: resolve(`./config/${envPath[NODE_ENV]}`) })


export const port = process.env.PORT ?? 7000

export const DB_URL =process.env.DB_URL
export const EMAIL_USER = process.env.EMAIL_USER
export const EMAIL_PASS = process.env.EMAIL_PASS
export const  IV_LENGTH = process.env.IV_LENGTH
export const  ENCRYPTION_byte = process.env.ENCRYPTION_byte
export const user_access_token_secret = process.env.user_access_token_secret
export const refresh_user_token_secret = process.env.refresh_user_token_secret
export const system_access_token_secret = process.env.system_access_token_secret
export const refresh_system_token_secret = process.env.refresh_system_token_secret
export const access_token_expires_in =parseInt(process.env.access_token_expires_in)
export const refresh_token_expires_in =parseInt(process.env.refresh_token_expires_in)

export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10')
console.log({SALT_ROUND});
