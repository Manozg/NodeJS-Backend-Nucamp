const express = require('express');
const bodyParser = require('body-parser');
const Favorite = require('../models/favorite');
const authenticate = require('../ authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    //.populate('campsites')
    .then((favorite)=>{
        if(favorite){
            req.body.forEach((faves) =>{
                if(!favorite.campsites.includes(faves._id)){
                    favorite.campsites.push(faves._id)
                }
            });
            favorite.save()
            .then((favorite) =>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch((err) => next(err));
        } else {
            Favorite.create({ user: req.user._id, campsites: req.body})
            .then((favorites) =>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch((err) => next(err));
        }
    })
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});  

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites');
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
        //.populate('campsites')
        .then((favorite)=>{
            if(favorite){
                if(!favorite.campsites.includes(req.params.campsiteId)) {
                    favorite.campsites.push(req.params.campsiteId);
                    favorite.save()
                    .then((favorite) =>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                    .catch((err) => next(err));
                } else {
                    res.statusCode = 200;
                    res.end(`That campsite is ${ree.params.campsiteId} already in the list of favorites`)
                }
            } else {
                Favorite.create({ user: req.user._id, campsites:[req.params.campsiteId]})
                .then((favorites) =>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch((err) => next(err));
            }
    })
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    console.log(`User ID checking: ${req.user._id}`)
    Favorite.findByOne({user: req.user._id})
    .then(favorite => {
        if(favorite){
            const index = favorite.campsites.indexOf(req.params.campsiteId);
            console.log(`Campsite ID checking: ${req.params.campsiteId}`)
            if (index >= 0){
                favorite.campsites.splice(index, 1);
                favorite.save()
                .then((favorite) =>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(response);
                })
                .catch(err => next(err));
            } else{
                res.statusCode = 200;
                res.end(`That campsite: ${req.params.campsiteId} is not in the list of favorites!`)
            }
        } else {
            res.statusCode = 200;
                res.end(`That campsite: ${req.params.campsiteId} has no favorites to delete!`)
        }
    })
    .catch(err => next(err));
});


module.exports = favoriteRouter;