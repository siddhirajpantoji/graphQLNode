
const service = require('../services/orderService');
const utils = require('../utils/utils')
const logger = require('log4js').getLogger("OrderController");
function getSingleRecord(req, res, next) {
    logger.debug("Inside Controller ");
    var id = req.query.id;
    if(!id)
    {
        utils.Error400(req,res,"ID is compulsary")
    }
    service.getSingleRecordPromise(id).then(abc => {
        utils.SuccessfulPostData(req,res,abc);    
    }).catch(err=> {
        utils.Error500(req,res,err);
    });
  
    // service.getSingleRecord(id, function(resullt){
    //     utils.SuccessfulPostData(req,res,resullt);
    // })
}

function createOrder(req, res, next) {
    logger.debug("Inside Create Order Controller");
    var data = {
        baseCurrency:req.body.baseCurrency,
        quoteCurrency:req.body.quoteCurrency,
        baseAmount:req.body.baseAmount,
        senderId:req.body.senderId,
        beneficiaryId:req.body.beneficiaryId,
        purpose:req.body.purpose
    }
    service.createOrder(data.baseCurrency,data.quoteCurrency,data.baseAmount, data.senderId, data.beneficiaryId, data.purpose, function(resullt){
        utils.SuccessfulPostData(req,res,resullt);
    })
    // service.getSingleRecord(id, function(resullt){
    //     utils.SuccessfulPostData(req,res,resullt);
    // })
}
function filterAllRecords(req,res,next){
    logger.debug("Inisde filterAllRecords")
    var data = {
        id:req.body.id,
        status:req.body.status,
        senderId:req.body.senderId,
        beneficiaryId:req.body.beneficiaryId
    }
    service.getAllOrderPromise(data.id,data.status, data.senderId, data.beneficiaryId).then(records =>{
        utils.SuccessfulPostData(req,res,records);
    }).catch(err=>{
        utils.Error500(req,res,err)
    })
}

function countAllRecords(req,res,next){
    logger.debug("Inisde filterAllRecords")
    var data = {
        id:req.body.id,
        status:req.body.status,
        senderId:req.body.senderId,
        beneficiaryId:req.body.beneficiaryId
    }
    service.getOrderCountPromise(data.id,data.status, data.senderId, data.beneficiaryId).then(records =>{
        utils.SuccessfulPostData(req,res,records);
    }).catch(err=>{
        logger.error("countAllRecords", err)
        utils.Error500(req,res,err)
    })
}
module.exports = { getSingleRecord , createOrder, filterAllRecords, countAllRecords }