import express from "express";
import { UploadedFile } from "express-fileupload";
const router = express.Router();

router.get('/', (req, res, next) => {
    res.render('index', { title: 'Express' });
})

router.post('/upload', (req, res, next) => {
    if(!req.files || Object.keys(req.files).length === 0) {
        res.status(400).json({
            status: 400,
            message: 'No files were uploaded.',
        })
        return;
    }

    let modulesFile:any = req.files.module;
    let uploadPath = __dirname + '/uploads/' + modulesFile.name;

    modulesFile.mv(uploadPath, (err) => {
        if(err) {
            return res.status(500).json({
                status: 500,
                message: err
            });
        }

        res.status(200).json({
            status: 0,
            id: 1,
            message: 'Success upload module'
        })
    })
})

export default router;