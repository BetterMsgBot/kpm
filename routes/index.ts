import express from "express";
import { UploadedFile } from "express-fileupload";
import fs from 'fs'
const router = express.Router();

interface saveModuleInterface {
    id: number;
    name: string;
    // download: string;
}

router.get('/', (req, res, next) => {
    res.render('index', { title: "arthic.dev" })
})

// receive file from /kpm/uploads and save file to /kpm/uploads
router.post('/kpm/uploads', (req, res, next) => {
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

        savedFile.unshift({ id: ++bfi, name: modulesFile.name.replace(".zip", "") })
        fs.writeFileSync('/home/ubuntu/express-api/modules.json', JSON.stringify(savedFile, null, 4))
        res.status(200).json({
            status: 0,
            id: savedFile[0].id,
            message: 'Success upload module'
        });
    })
});

router.get('/kpm/uploads', (req, res, next) => {
    res.status(405).json({
        status: 405,
        message: 'GET method is not allowed'
    })
})

router.get('/kpm/search', (req, res, next) => {
    let fileRes = JSON.parse(fs.readFileSync('/home/ubuntu/express-api/modules.json', 'utf8'));
    let query = req.query.q;

    let tempJSON
    fileRes.map((e: saveModuleInterface) => {
        if(e.name === query) {
            tempJSON = e;
        }
    })

    if(tempJSON === undefined) {
        res.status(400).json({ status: -310, message: 'no module there' })
        return;
    }

    res.status(200).json(tempJSON)

    // res.status(200).json(JSON.parse(fileRes))
})

router.get('/kpm/download/:id', (req, res, next) => {
    const isId = (!isNaN(parseInt(req.params.id)));

    if(!isId) {
        res.status(400).json({
            status: -484,
            message: 'id is not number'
        })
        return;
    }

    let fileRes = JSON.parse(fs.readFileSync('/home/ubuntu/express-api/modules.json', 'utf8'));

    let isSuccess = false;
    let fileName;
    fileRes.map((e:saveModuleInterface) => {
        if(e.id === parseInt(req.params.id)) {
            isSuccess = true;
            fileName = e.name
        }
    });

    if(!isSuccess) {
        res.status(400).json({
            status: -431,
            message: 'id is not defined'
        })

        return;
    }

    res.download(`/home/ubuntu/express-api/uploads/${parseInt(req.params.id)}.zip`, `package-${fileName}.zip`)
})

export default router;