import express from "express";
import { UploadedFile } from "express-fileupload";
import fs from 'fs'
const router = express.Router();

interface saveModuleInterface {
    id: number;
    name: string;
}

router.get('/', (req, res, next) => {
    res.render('index', { title: 'Express' });
})

// receive file from /kpm/upload and save file to /kpm/uploads
router.post('/upload/kpm', (req, res, next) => {
    if(!req.files || Object.keys(req.files).length === 0) {
        res.status(400).json({
            status: 400,
            message: 'No files were uploaded.',
        })
        return;
    }

    let modulesFile = req.files.module as UploadedFile;
    const savedFile = JSON.parse(fs.readFileSync('/home/ubuntu/express-api/modules.json', 'utf8'));

    let isSuccess = true

    savedFile.map((e: saveModuleInterface) => {
        if(e.name === modulesFile.name) {
            isSuccess = false;
            return;
        }
    });

    if(!isSuccess) {
        return res.status(400).json({
            status: -484,
            message: 'already exists file name'
        });
    }

    let bfi = savedFile[0].id
    let uploadPath = `/home/ubuntu/express-api/uploads/${bfi}.zip`

    modulesFile.mv(uploadPath, (err: any) => {
        if(err) {
            return res.status(500).json({
                status: 500,
                message: err
            });
        }

        savedFile.unshift({ id: ++bfi, name: modulesFile.name })
        fs.writeFileSync('/home/ubuntu/express-api/modules.json', JSON.stringify(savedFile, null, 4))
        res.status(200).json({
            status: 0,
            id: savedFile[0].id,
            message: 'Success upload module'
        });
    })
})

export default router;