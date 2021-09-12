import express from "express";
import { UploadedFile } from "express-fileupload";
import * as crypto from "crypto";
import sqlite from 'sqlite3'
import fs from 'fs'
import {ModuleType} from "./file/moduleType";
const router = express.Router();
const db = new sqlite.Database("./db/login.db", (err) => err ? console.log(`Error Connecting DB: ${err.message}`) : console.log(`Success Connecting DB`));

interface saveModuleInterface {
    id: number;
    name: string;
    download: string;
    type: ModuleType;
}

router.get('/', (req, res, next) => {
    res.render('index', { title: "arthic.dev" })
})

router.post('/kpm/register', (req, res, next) => {
    if(!req.body.email || !req.body.password) {
        res.status(400).json({
            status: -303,
            message: 'email 또는 password가 없습니다.'
        });
        return;
    }

    db.run("CREATE TABLE user(id integer primary key, name text not null, email text unique)");
})

router.post('/kpm/login', (req, res , next) => {
    if(!req.body.email || !req.body.password) {
        res.status(400).json({
            status: -303,
            message: 'email 또는 password가 없습니다.'
        });
        return;
    }

    res.status(200).json({
        status: 0,
        message: 'Success Login',
        token: crypto.randomBytes(16).toString('hex')
    })
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

    let modulesFile = req.files.file as UploadedFile;
    let version = req.body.version || null;
    let type = req.body.type || null;
    if(!type) {
        res.status(400).json({
            status: -112,
            message: 'type not exists'
        })
    }
    if(version === null) {
        res.status(400).json({
            status: -112,
            message: 'version info not exists'
        })
    }
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

        let packageId = ++bfi;
        savedFile.unshift({ id: packageId, name: modulesFile.name.replace(".zip", ""), download: `https://arthic.dev/kpm/download/${packageId}`, type: type })
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
    let query:string = req.query.q as string;

    let tempJSON: saveModuleInterface[] = [];
    fileRes.map((e: saveModuleInterface) => {
        if(e.name.startsWith(query)) {
            tempJSON.push(e);
        }
    })

    if(tempJSON === []) {
        res.status(400).json({ status: -310, message: 'no module there' });
        return;
    }

    res.status(200).json(tempJSON);
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