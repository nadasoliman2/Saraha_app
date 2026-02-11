import { Router } from "express";
import { profile,updateprofile } from "./user.service.js";

const router=Router()

router.get("/:userId" ,async (req,res,next)=>{
    const result  = await profile(req.params.userId)
    return res.status(200).json({message:"Profile" , result})
})
router.patch('/:userId',async(req,res)=>{
    const result = await updateprofile(req.params.userId , req.body)
    return res.status(200).json({message:"updated done",result})

})
export default router