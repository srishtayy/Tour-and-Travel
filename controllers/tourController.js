const fs = require('fs')
const express = require('express')
const Tour = require('./../models/tourModel')

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

exports.checkID = (req, res, next, val) => {
    console.log(`Tour id is: ${val}`);
    const id = req.params.id * 1;
    if (id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid Id'
        });
    }
    next();
};

exports.checkBody = (req, res, next) => {
    if (!req.body.name || !req.body.price) {
        return res.status(400).json({
            status: 'fail',
            message: 'Missing name or price'
        })
    }
    next();
}
//here tourRouter is a middleware
exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        requestedAt: req.requestTime,
        data: {
            tours: tours
        }
    });
}

exports.getTour = (req, res) => {
    console.log(req.params)
    //here the value of key id would be in the form of string so we would hv to convert it
    //below code will convert it to a number
    const id = req.params.id * 1;
    if (id > tours.length) {
        res.status(404).json({
            status: 'fail',
            message: 'Invalid Id'
        });
    }
    const tour = tours.find(el => el.id === id)
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tour: tour
        }
    });
}

exports.createTour = (req, res) => {

    const newId = tours[tours.length - 1].id + 1;
    const newTour = { ...req.body, id: newId }
    tours.push(newTour);
    fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    });

}
exports.updateTour = (req, res) => {

    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated tour here>'
        }
    })
}
exports.deleteTour = (req, res) => {

    res.status(204).json({
        status: 'success',
        data: null
    })
}
