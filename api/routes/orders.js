const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

router.get('/',(req,res,next)=>{
    Order
        .find()
        .select('-__v')
        .populate('product', 'name')
        .exec()
        .then(docs => {
            res.status(200).json({
                count : docs.length,
                orders : docs.map(doc => {
                    return {
                        _id : doc._id,
                        product : doc.product,
                        quantity : doc.quantity,
                        request : {
                            type : 'GET',
                            url : 'http://localhost:3000/orders/' + doc._id
                        }
                    }
                }),
                
            });
        })
        .catch(err => {
            res.status(500).json({
                error : err
            });
        });
});

router.post("/", (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.body.productId)){
        return res.status(404).json({
            message : "Invalid ProductID"
        });
    }
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            order
                .save()
                .then(result => {
                    res.status(201).json({
                        message: "Order stored",
                        createdOrder: {
                            _id: result._id,
                            product: result.product,
                            quantity: result.quantity
                        },
                        request: {
                            type: "GET",
                            url: "http://localhost:3000/orders/" + result._id
                        }
                    });
                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
        })  
});

router.get("/:orderId", (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.orderId)){
        return res.status(404).json({
            message : "Invalid OrderID"
        });
    }
    Order.findById(req.params.orderId)
        .select('-__v')
        .populate('product', '-__v')
        .exec()
        .then(order => {
            if (!order) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }
            res.status(200).json({
                order: order,
                request: {
                    type: "GET",
                    url: "http://localhost:3000/orders/"
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:orderId',(req,res,next)=>{
    if(!mongoose.Types.ObjectId.isValid(req.params.orderId)){
        return res.status(404).json({
            message : "Invalid OrderID"
        });
    }
    Order.remove({
        _id : req.params.orderId
    }).exec()
        .then(result => {
            res.status(200).json({
                message : 'Order Deleted',
                request : {
                    type : 'POST',
                    url : 'http://localhost:3000/orders/',
                    body : {
                        productId : 'ID',
                        quantity : 'Number'
                    }
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error : err
            })
        });

});

module.exports = router;