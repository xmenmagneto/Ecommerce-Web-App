var Cart = require('../models/cart');

//exports the entire function
module.exports = function (req, res, next) {
    if (req.user){
        var sum = 0;  //总商品个数
        Cart.findOne({owner: req.user._id}, function (err, foundCart) {
            if(foundCart) {  //if cart exists
                //loop items inside cart
                for(var i=0; i<foundCart.items.length; i++){ //不同种类数. LOOP array
                    sum += foundCart.items[i].quantity; //商品总数
                }
                res.locals.sum = sum;  //总商品个数, save to local variable, use on navbar
            }else { //cart not found
                res.locals.sum = 0;
            }
            next();
        })
    }else {  //no user logged in
        next();
    }
};