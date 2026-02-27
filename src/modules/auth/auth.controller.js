import { Router } from 'express'
import {  signup , login, verify, signupwithgmail } from './auth.service.js';
import { successResponse } from '../../common/utils/index.js';
const router = Router(); 
router.post("/signup", async (req, res, next) => {
    const result = await signup(req.body)

    return successResponse({res,status: 201,data:{result}})
})
router.post("/login", async (req, res, next) => {
    console.log(`${req.protocol}://${req.host}`)
    const result = await login(req.body,`${req.protocol}://${req.host}`)
    return successResponse({res,status: 200,data:{token:result}})
})
router.post("/signup/gmail", async (req, res, next) => {
    const {status, Credential} = await signupwithgmail(req.body.idToken,`${req.protocol}://${req.host}`)
    
    return successResponse({res,status: status,data:{...Credential}})
})



router.post("/otp-verify", async (req, res, next) => {
    const result = await verify(req.body)

    return successResponse({res,status: 200})
})

export default router