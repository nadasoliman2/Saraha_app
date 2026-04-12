import multer from 'multer';
import {resolve} from 'node:path'
import { randomUUID } from 'node:crypto';
import {existsSync, mkdirSync} from 'node:fs'
import { fileFilter } from './validation.multer.js';
export const cloudFileUpload =({
    customPath = "general",
    validation =[],
    maxSize=5
}={})=>{
    const storage = multer.memoryStorage({
     
    })


    
    return multer({ fileFilter:fileFilter(validation),storage,limits:{fileSize:maxSize * 1024 * 1024}})
}