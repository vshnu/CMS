const express = require('express');
const router = express.Router();
const faker = require('faker');
const Post = require('../../models/Post');


router.all('/*', (req, res, next)=>{

    req.app.locals.layout = 'test';
    next();

});

