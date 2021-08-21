/**
 * Created by archethic on 2021/08/21
 * Copyright (c) archethic.
 * This code is licensed under the MIT Licensing Principles.
 */

import app from "../app";
import debug from "debug";
import http from "http";

const db = debug('kpm:server')
const port = normalizePort('80');
app.set('port', port);

const server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val:string) {
    let port = parseInt(val, 10);

    if(isNaN(port)) {
        return val;
    }

    if(port >= 0) {
        return port;
    }

    return false;
}

function onError(error) {
    if(error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    switch (error.code) {
        case 'EACCES': {
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        }
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`
    db('Listening on ' + bind);
}