import { ORIGINS } from '../config/config.service.js'
import { authRouter, userRouter, messageRouter } from './modules/index.js'
import express from 'express'
import { authenticationDB, connectRedis } from './DB/index.js'
import { globalErrorHandling } from './common/utils/index.js'
import cors from 'cors'
import { resolve } from 'node:path'
import helmet from "helmet"
import rateLimit, { ipKeyGenerator } from "express-rate-limit"
import axios from 'axios'

const app = express()

/* -------------------- Cached Connections -------------------- */

let dbConnected = false
let redisConnected = false

const initConnections = async () => {
  if (!dbConnected) {
    await authenticationDB()
    dbConnected = true
  }

  if (!redisConnected) {
    await connectRedis()
    redisConnected = true
  }
}

/* -------------------- Utils -------------------- */

const fromwhere = async (ip) => {
  try {
    const { data } = await axios.get(`https://ipapi.co/${ip}/json`)
    return data
  } catch (error) {
    if (error.response?.status === 429) {
      console.log("ipapi rate limit exceeded")
      return { country_code: null }
    }
    console.log(error.message)
    return { country_code: null }
  }
}

/* -------------------- Rate Limiter (Memory Only) -------------------- */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  requestPropertyName: "ratelimit",
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({ message: "Too many requests" })
  },
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req.ip, 56)
    return `${ip}-${req.path}`
  }
})

/* -------------------- Middlewares -------------------- */

app.set("trust proxy", true)
app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(limiter)
app.use("/uploads", express.static(resolve('uploads')))

/* -------------------- Init connections per cold start -------------------- */

app.use(async (req, res, next) => {
  await initConnections()
  next()
})

/* -------------------- Routes -------------------- */

app.get('/', async (req, res) => {
  console.log(await fromwhere(req.ip))
  res.send('Hello World!')
})

app.use('/auth', authRouter)
app.use('/user', userRouter)
app.use('/message', messageRouter)

/* -------------------- 404 -------------------- */

app.use('*', (req, res) => {
  return res.status(404).json({ message: "Invalid application routing" })
})

/* -------------------- Error Handling -------------------- */

app.use(globalErrorHandling)

export default app