import { Router } from 'express'
import {  signup , login, verify } from './auth.service.js';
import { successResponse } from '../../common/utils/index.js';
const router = Router(); 
router.post("/signup", async (req, res, next) => {
    const result = await signup(req.body)

    return successResponse({res,status: 201,data:{result}})
})
router.post("/login", async (req, res, next) => {
    const result = await login(req.body)
    return successResponse({res,status: 200,data:{result}})
})


router.post("/otp-verify", async (req, res, next) => {
    const result = await verify(req.body)

    return successResponse({res,status: 200})
})

export default router