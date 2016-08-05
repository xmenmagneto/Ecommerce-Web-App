var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var Schema = mongoose.Schema;
var elasticsearch = require('elasticsearch');

var ProductSchema = new Schema({
    category: {type: Schema.Types.ObjectId, ref: 'Category'},
    name: String,
    price: Number,
    image: String
});





ProductSchema.plugin(mongoosastic, {
    hosts: [
        'http://localhost:9200'  //default number for elasticsearch server
    ]  //注意要写全!
});


//so we can use
//Product.search
//Product.creatMapping  //create mapping between the mongodb database and elasticsearch

module.exports = mongoose.model('Product', ProductSchema);