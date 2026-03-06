import multer from 'multer';
import {resolve} from 'node:path'
import { randomUUID } from 'node:crypto';
import {existsSync, mkdirSync} from 'node:fs'
import { fileFilter } from './validation.multer.js';
export const localFileUpload =({
    customPath = "general",
    validation =[],
    maxSize=5
}={})=>{
    const storage = multer.diskStorage({
        destination:(req,file,cb)=>{
            const fullpath = resolve(`../uploads/${customPath}`)
            if(!existsSync(fullpath)){
                mkdirSync(fullpath,{recursive:true})
            }
            cb(null,fullpath)
        },

        filename:function(req,file,cb){
            const uniqueFileName = randomUUID() + '-' + file.originalname
            file.finalPath = `uploads/${customPath}/${uniqueFileName}`
            cb(null, uniqueFileName)
        }
    })
    return multer({ fileFilter:fileFilter(validation),storage,limits:{fileSize:maxSize * 1024 * 1024}})
}