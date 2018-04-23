
const daoLayer = require('../dao/orderRepository')
const syncDao = require('../dao/syncOrderRepository')
const logger = require('log4js').getLogger("OrderService");
const utils = require('../utils/utils')
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
    return new Promise(function (resolve, reject) {
        daoLayer.getOrderHistoryDetailsPromise(recordId).then(function (record) {
            daoLayer.get
            resolve(record)
        }).catch(function (err) {
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
            return callback(newData)
            //return callback(result);
        })

    });
}
function getAllOrderPromise(id, status, senderId, beneficiaryId) {
    var fixedorder = {
        id: id,
        status: status,
        beneficiaryId: beneficiaryId,
        senderId: senderId
    }
    return new Promise(function (resolve, reject) {
        daoLayer.getAllOrderDetailsPromise(fixedorder).then(data => {
            if (data && data.length > 0) {
                // Loop for getting history
                //logger.info("GOT Data ")
                promises = data.map(single => {
                    single = utils.convertResultSetToObject(single);
                    return new Promise(function (resolve2, reject2) {
                      //  logger.info("Inside Order history Call ")
                        daoLayer.getOrderHistoryDetailsPromise(single.id).then(histData => {
                            var histData  = histData;
                            histData = utils.convertToHistoryArr(histData)
                            single.history = histData;
                       //     logger.info(single);
                            resolve2(single)
                        }).catch(err => {
                            reject2(err);
                        })
                    }
                    );
                })
                Promise.all(promises).then(finalData => {
                   // logger.info(finalData)
                    resolve(finalData)
                }).catch(err=>{
                    reject(err)
                })
            }
            else{
                resolve(new Array());
            }
        }).catch(err => {
            reject(err);
        })
    })
}

function getOrderCountPromise(id, status, senderId, beneficiaryId) {
    var order = {
        id: id,
        status: status,
        beneficiaryId: beneficiaryId,
        senderId: senderId
    }
    return new Promise(function (resolve, reject) {
        daoLayer.getAllOrderCountPromise(order).then(data => {
            resolve(data)
        }).catch(err => {
            reject(err);
        })
    })
}
function createOrderPromise(baseCurrency, quoteCurrency, baseAmount, senderId, beneficiaryId, purpose) {
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
    return new Promise(function (resolve, reject) {
        if(!newData.base_amount || !newData.base_currency || !newData.quote_currency)
        {
            reject("Required Fields baseCurrency,quoteCurrency , baseAmount")
        }
        daoLayer.createNewOrderPromise(newData).then(order => {
            order  = utils.convertResultSetToObject(order)
            var orderStatus = {
                status: order.status,
                order_id: order.id,
                created_at: new Date()
            }
            daoLayer.createStatusRecordPromise(orderStatus).then(statusRecord => {
                statusRecord = utils.convertToHistoryObject(statusRecord);
                order.history = new Array();
                order.history.push(statusRecord);
                resolve(order);
            }).catch(err => {
                reject(err)
            })
        }).catch(err => {
            reject(err);
        })
    });
}

function updateOrderPromise(orderId, Status) {

    return new Promise(function (resolve, reject) {
        var order = {
            status: Status,
            id: orderId
        }
        daoLayer.udpateOrderStatusPromise(order).then(order1 => {
            order1 = utils.convertResultSetToObject(order1)
            var orderStatus = {
                status: order1.status,
                order_id: order1.id,
                created_at: new Date()
            }
            daoLayer.createStatusRecordPromise(orderStatus).then(orderStatus1 => {
                daoLayer.getOrderHistoryDetailsPromise(order1.id).then(history1 => {
                    var historys = utils.convertToHistoryArr(history1);
                    order1.history = historys
                    resolve(order1);
                })
            }).catch(err => {
                logger.error("Exception ", err)
                reject(err)
            })
        }).catch(err => {
            logger.error("Exception ", err)
            reject(err)
        })
    }).catch(err => {
        logger.error("Exception ", err)
        reject(err)
    });
}

async function getAllOrderSync(id, status, senderId, beneficiaryId) {
    var order = {
        id: id,
        status: status,
        beneficiaryId: beneficiaryId,
        senderId: senderId
    }
    var result = await syncDao.getAllOrders(order)
    logger.info(result);
    if (result && result.length > 0) {
        var output = new Array()
        for (i = 0; i < result.length; i++) {
            var single = utils.convertResultSetToObject(result[i]);
            var history = await syncDao.getHistoryDetailsForOrder(single.id)
            single.history = utils.convertToHistoryArr(history);
            output.push(single)
        }
        return output;
    }
    else {
        return result;

    }
}

async function createOrderSync(baseCurrency, quoteCurrency, baseAmount, senderId, beneficiaryId, purpose) {
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
    var order = await syncDao.createOrder(newData);
    order = utils.convertResultSetToObject(order);
    var orderStatus = {
        status: order.status,
        order_id: order.id,
        created_at: new Date()
    }
    var history = await syncDao.createStatusRecord(orderStatus)
    history = utils.convertToHistoryObject(history)
    var histArr = new Array();
    histArr.push(history)
    order.history = histArr;
    return order;
}
async function getAllOrderCountSync(id, status, senderId, beneficiaryId) {
    var order = {
        id: id,
        status: status,
        beneficiaryId: beneficiaryId,
        senderId: senderId
    }
    var result = await syncDao.getCountOfOrders(order)
    logger.info(result)
    return result[0].count;
}

async function updateOrderSync(id, status) {
    var order = {
        id: id,
        status: status
    }
    var result = await syncDao.updateOrderStatus(order)
    
    var order1 = utils.convertResultSetToObject(result)
    var orderStatus = {
        status: order1.status,
        order_id: order1.id,
        created_at: new Date()
    }
    var history = await syncDao.createStatusRecord(orderStatus)
    history = await syncDao.getHistoryDetailsForOrder(order1.id)
    order1.history = history;
    //logger.info(result)
    return order1;
}
module.exports = {
    getSingleRecord, createOrder, getSingleRecordPromise,
    getAllOrderPromise, getOrderCountPromise, createOrderPromise, updateOrderPromise,
    getAllOrderSync, createOrderSync , getAllOrderCountSync, updateOrderSync
}