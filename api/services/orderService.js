
const daoLayer = require('../dao/orderRepository')
const logger = require('log4js').getLogger("OrderService");
const rate = 2.3;
function getSingleRecord(recordId, callback) {
    logger.debug("Inside service With RecordID " + recordId)
    daoLayer.getOrderDetails(recordId, function (result) {
        logger.info(result);
        return callback(result);
    })
}

function getSingleRecordPromise(recordId) {
    logger.debug("Inside service With RecordID " + recordId)
    return new Promise(function(resolve,reject){
        daoLayer.getOrderHistoryDetailsPromise(recordId).then(function(record){
            resolve(record)
        }).catch(function(err){
            reject(err)
            logger.error("Error in Single Record Promise")
        });
    })
        
    // })
    // var recordPromise = daoLayer.getOrderHistoryDetailsPromise(recordId);
    // recordPromise.then(function (result) {
    //     logger.info("Success Retrieval in Promise ")
    //     return result;
    // }).catch(function (err) {
    //     logger.error("Error Occured while Promise ", err)
    //     throw err;
    // })
}
function createOrder(baseCurrency, quoteCurrency, baseAmount, senderId, beneficiaryId, purpose, callback) {
    var newData = {
        base_currency: baseCurrency,
        base_amount: baseAmount,
        quote_currency: quoteCurrency,
        quote_amount: (baseAmount * rate),
        rate: rate,
        sender_id: senderId,
        beneficiary_id: beneficiaryId,
        status: "CREATED",
        purpose: purpose,
        created_at: new Date()
    }
    daoLayer.createNewOrder(newData, function (result) {
        logger.info(result);
        newData.id = result.id;
        var orderStatus = {
            status: newData.status,
            order_id: newData.id,
            created_at: new Date()
        }
        daoLayer.createStatusRecord(orderStatus, function (result1) {
            newData.history = new Array();
            newData.history.push(result1);
            var historyData = {
                fixed_order_id: newData.id,
                history_id: result1.id
            }
            daoLayer.createHistoryRecord(historyData, function (innerData) {
                return callback(newData);
            })
            //return callback(result);
        })

    });
}
module.exports = { getSingleRecord, createOrder , getSingleRecordPromise }