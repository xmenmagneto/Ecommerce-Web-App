var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CartSchema = new Schema({
    owner: {type: Schema.Types.ObjectId, ref: 'User'},
    total: {type: Number, default:0}, //total price
    items: [{
        //arrary of items
        item: {type: Schema.Types.ObjectId, ref: 'Product'}, //ID of product
        quantity: {type: Number, default:1},
        price: {type: Number, default:0}  //total price of certain item
    }]
});

module.exports =  mongoose.model('Cart', CartSchema);