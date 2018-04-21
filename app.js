const express = require('express');
var app = express();
const log4js = require('log4js')
const bodyParser = require('body-parser')
const logger = log4js.getLogger("app")
const router = require('./api/routers/orderRouter')
const utils = require('./api/utils/utils')
const service = require('./api/services/orderService')
var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto' }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        return res.status(200).json({});
    }
    next();
});

app.use('/order', router);
var schema = buildSchema(`
    type Order {
        id: ID!
        baseCurrency:String
        quoteCurrency:String
        baseAmount:Float
        quoteAmount:Float
        senderId:String
        beneficiaryId:String
        purpose:String
        createdAt: String
        updatedAt: String
        rate:Float
        status:String
        history:[OrderStatus]
    }
    
    type OrderStatus {
        id: ID!
        createdAt: String   
        status:String
    }
    
     type Query {
        getOrdersBy(id:Int,status:String, senderId:String, beneficiaryId:String):[Order]
        getOrderCount(id:Int,status:String, senderId:String, beneficiaryId:String):Int!
    }
    
     type Mutation {
        newOrder(baseCurrency:String!,quoteCurrency:String!, baseAmount:Float,senderId:String,beneficiaryId:String,purpose:String) : Order!
        updateOrderStatus(id:Int!,status:String):Order
    }`);



var root = {
    getOrdersBy: function (args) {
        
        return  service.getAllOrderSync(args.id, args.status, args.senderId, args.beneficiaryId);
    },
    getOrderCount: function (args) {
        return service.getAllOrderCountSync(args.id, args.status, args.senderId, args.beneficiaryId);
    },
    newOrder: function (args) {
        
        return service.createOrderSync(args.baseCurrency, args.quoteCurrency, args.baseAmount, args.senderId, args.beneficiaryId, args.purpose);
    },
    updateOrderStatus: function (args) {
        return service.updateOrderSync(args.id,args.status);
    }
}
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));
app.use((req, res, next) => {
    logger.error("Resource Not Found")
    const error = new Error('Resource not found!');
    error.status = 404;
    utils.Error400(req, res, error);
    // next(error);
})


app.use((error, req, res, next) => {

    logger.error("Exception occured in Global ", error)
    // res.status(error.status || 500);
    // res.json({
    //     error: {
    //         message: error.message
    //     }
    // });
    utils.Error500(req, res, error);
})

module.exports = app;