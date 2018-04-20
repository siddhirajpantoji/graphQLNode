
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
    // service.getSingleRecordPromise(id).then(function(resullt){
    //     logger.info("Inside then of Order "+JSON.stringify(result));
    //     utils.SuccessfulPostData(req,res,result);
    // }).catch(function(err){
    //     logger.error("Iniside ", err);
    //     utils.Error500(req,res,err);
    // });
    var singleORder = service.getSingleRecordPromise(id).then(abc => {
        utils.SuccessfulPostData(req,res,abc);    
    }).catch(err=> {
        utils.Error500(req,res,err);
    });
  //  logger.error("Single Order"+JSON.stringify(singleORder))
   // logger.info(result);
   // utils.SuccessfulPostData(req,res,result);
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
    logg
}
module.exports = { getSingleRecord , createOrder}