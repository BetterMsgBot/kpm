/**
 * Created by archethic on 2021/08/21
 * Copyright (c) archethic.
 * This code is licensed under the MIT Licensing Principles.
 */

import express from "express";
import path from "path";
import logger from "morgan";
import cookieParser from "cookie-parser";
import subdomain from "express-subdomain";
import fileupload from 'express-fileupload'

import indexRouter from "./routes/index";
import usersRouter from "./routes/users";
import createError from "http-errors";

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(subdomain('kpm', indexRouter))
app.use(fileupload({
    
}))

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

export default app;