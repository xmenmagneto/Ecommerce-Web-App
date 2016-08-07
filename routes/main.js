var router = require('express').Router(); //using router method coming from express
var Product = require('../models/product');
var User = require('../models/user');
var Cart = require('../models/cart');
var stripe = require('stripe')('sk_test_dgGH3pEs01Dc1CQOYcNdedlm');
var async = require('async');


//============================================
//pagination
//============================================
function paginate(req, res, next) {
    var perPage = 9;
    var page = req.params.page;

    Product
        .find()
        .skip(perPage*(Number(page)-1))
        .limit(perPage)
        .populate('category')
        .exec(function (err, products) {
            if(err) return next(err);
            Product.count().exec(function (err, count) {
                if(err) return next(err);
                pages = Math.ceil(count/perPage); //向上取整
                res.render('main/product-main',
                    {
                        products: products,
                        pages: pages
                    });
            });
        });    
};




//============================================
//createMapping
//============================================
Product.createMapping(function (err, mapping) {
    if(err) {
        console.log('error creating mapping');
        console.log(err);
    }else {
        console.log('Mapping created');
        console.log(mapping);
    }
});


var cursor = Product.find({}).cursor();
var count = 0;

cursor.on('data', function () {
    count++;
});

cursor.on('close', function () {
    count=count+1;
    console.log('Indexed ' + count + ' documents!');
});

cursor.on('error', function (err) {
    console.log(err);
});



//============================================
//show cart
//============================================
router.get('/cart', function (req, res, next) {
    if(!req.user) {
        req.flash('loginMessage', 'Please login to check your cart');
        return res.redirect('/login');
    }else {
        Cart
            .findOne({owner: req.user._id})
            .populate('items.item')
            .exec(function (err, foundCart) {
                if(err) return next(err);
                res.render('main/cart', {
                    foundCart: foundCart,
                    message: req.flash('remove')
                });
            });
    }
    
    
});




//============================================
//add product to a cart
//============================================
router.post('/product/:product_id', function (req, res, next) {
    Cart.findOne({owner: req.user._id}, function (err, foundCart) {
        foundCart.items.push({   //push the items to the array
            item: req.body.product_id,
            price: parseFloat(req.body.priceValue),  //一种商品的总计价格, 从form中获得
            quantity: parseInt(req.body.quantity)  //一种商品的数量, 从form中获得
        });
        foundCart.total = (foundCart.total + parseFloat(req.body.priceValue)).toFixed(2); //原来的总价+新增加的总价

        foundCart.save(function (err) {
            if(err) return next(err);
            return res.redirect('/cart');
        });
    });
});



//============================================
//remove product from cart
//============================================
router.post('/remove', function (req, res, next) {
    Cart.findOne({owner: req.user._id}, function (err, foundCart) {
        foundCart.items.pull(String(req.body.item));
        //新总价=原总价-不要的商品价格
        foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
        foundCart.save(function (err, found) {
            if(err) return next(err);
            req.flash('remove', 'Successfully removed!');
            res.redirect('/cart');
        });
    });
});



//============================================
//search route
//============================================
router.post('/search', function (req, res, next) {
    res.redirect('/search?q=' + req.body.q);
});


router.get('/search', function (req, res, next) {
    if(req.query.q) {
        Product.search({
            query_string: {query: req.query.q}
        }, function (err, foundProducts) {
            if(err) return next(err);
            var data = foundProducts.hits.hits.map(function (hit) {  //map: store hit.hits中的数组到new array
                return hit;
            });
            console.log(typeof data);
            console.log(foundProducts);
            console.log(data);
            res.render('main/search-result',
                {
                    query: req.query.q,
                    data: data
                })
        })
    }
});



//============================================
//home route
//============================================
//pagination
router.get('/', function (req, res, next) {
    if(req.user){   // if user is logged in
                paginate(req, res, next);
    }else{
        res.render('./main/home');
    }
});
//page after the 1st
router.get('/page/:page', function (req, res, next) {
    paginate(req, res, next);
});


router.get('/products/:id', function (req, res, next) {
    Product
        .find({category: req.params.id})  //get category id
        .populate('category')
        .exec(function (err, products) {
            if(err) return next(err);
            res.render('main/category', {products: products});
        });
});


router.get('/product/:id', function (req, res, next) {
    Product.findById({_id: req.params.id}, function (err,foundProduct) {
        if(err) return next(err);
        res.render('main/product', {product: foundProduct});
    });
});



//============================================
//payment route
//============================================
router.post('/payment', function (req, res, next) {
    var stripeToken = req.body.stripeToken;
    var currentCharges = Math.round(req.body.stripeMoney * 100);  //in cent
    stripe.customers.create({
        source: stripeToken
    }).then(function (customer) {
        return stripe.charges.create({
            amount: currentCharges,
            currency: 'usd',
            customer: customer.id
        });
    }).then(function (charge) {
        async.waterfall([
            function (callback) {
                Cart.findOne({owner: req.user._id}, function (err, cart) {
                    callback(err, cart);
                });
            },
            function (cart, callback) {
                User.findOne({_id: req.user._id}, function (err, user) {
                    if(user) {
                        for(var i=0; i<cart.items.length; i++) {
                            user.history.push({
                                item: cart.items[i].item,
                                paid: cart.items[i].price
                            });
                        }
                        user.save(function (err, user) {
                            if(err) return next(err);
                            callback(err, user);
                        });
                    }
                });
            },
            function (user) {
                //reset cart
                Cart.update({owner: user._id}, {$set: {items: [], total: 0}}, function (err, updated) {
                    if(updated){
                        res.redirect('/profile');
                    }
                });
            }
        ]);
    });

    
});




module.exports = router;