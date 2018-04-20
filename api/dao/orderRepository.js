const {
    Pool,
    Client
} = require('pg');
const path = require('path');
var logger = require('log4js').getLogger("orderRepository")

var dbSettings = {
    "user": "postgres",
    "host": "localhost",
    "database": "TechPOC",
    "password": "root",
    "port": 5432
}

const pool = new Pool(dbSettings);

function getOrderHistoryDetails(orderId, callback) {
    var query = "Select * from order_status where order_id = $1"
    const queryResult = pool.query(query, [orderId], function (err, result) {
        if (err) {
            logger.error("Error Found  While query :", err)
        }
        return callback(result.rows);
    });
}


function getOrderDetails(orderId, callback) {
    //logger.info(callback)
    logger.debug("OrderID " + orderId)
    var query = "Select * from fixed_order where id = " + orderId
    const queryResult = pool.query(query, function (err, result) {
        if (err) {
            logger.error("Error Found  While query :", err)
        }
        logger.debug(result.rowCount);
        return callback(result.rows);
    });
}

function getAllOrderDetails(order, callback) {
    var query = "Select * from fixed_order "
    var valuesArr = new Array();
    var queryArr = new Array();
    if (order.id) {
        queryArr.push({ field: "id", value: order.id })
    }

    if (order.status) {
        queryArr.push({ field: "status", value: order.status })
    }

    if (order.beneficiaryId) {
        queryArr.push({ field: "beneficary_id", value: order.beneficiaryId })
    }

    if (order.senderId) {
        queryArr.push({ field: "sender_id", value: order.senderId })
    }
    if (queryArr.length > 0) {
        var addQuery = " where " + queryArr[0].field + " = $1"
        valuesArr.push(queryArr[0].value)
        for (var i = 1; i < queryArr.length; i++) {
            addQuery.concat(" and " + queryArr[i].field + " = $" + (i + 1))
            valuesArr.push(queryArr[i].value)
        }
        query.concat(addQuery);
    }

    const queryResult = pool.query(query, valuesArr, function (err, result) {
        if (err) {
            logger.error("Error Found  While query :", err)
        }
        logger.debug(result.rowCount);
        return callback(result.rows);
    });
}

function getAllOrderCount(orderId, callback) {

}

function createNewOrder(data, callback) {
    var queryToExecute = "INSERT INTO fixed_order (base_currency,base_amount,quote_currency,quote_amount,rate,sender_id, beneficiary_id,status,purpose,created_at)" +
        " VALUES ($1, $2, $3, $4, $5, $6 , $7 ,$8 , $9 , $10 ) RETURNING *"
    var values = [data.base_currency, data.base_amount, data.quote_currency, data.quote_amount, data.rate, data.sender_id, data.beneficiary_id, data.status, data.purpose, data.created_at]
    const queryResult = pool.query(queryToExecute, values, function (err, data) {
        if (err) {
            logger.error("Error While Inserting ", err)
        }
        return callback(data.rows[0]);
    }
    );
}

function updateOrder(data, callback) {
    var queryToExecute = "UPDATE fixed_order set  status = $1 , updated_at = $2 where id = $3 RETURNING *"
    var values = [data.status, new Date(), data.id]
    const queryResult = pool.query(queryToExecute, values, function (err, data) {
        if (err) {
            logger.error("Error While Inserting ", err)
        }
        return callback(data.rows[0]);
    }
    );
}


function createStatusRecord(data, callback) {
    var queryToExecute = "INSERT INTO order_status (status,order_id,created_at)" +
        " VALUES ($1, $2, $3 ) RETURNING *"
    var values = [data.status, data.order_id, data.created_at]
    const queryResult = pool.query(queryToExecute, values, function (err, data) {
        if (err) {
            logger.error("Error While Inserting ", err)
        }
        return callback(data.rows[0]);
    }
    );
}

function recordReturn(err, result, callback) {
    if (err) {
        logger.error("Error Found  While query :", err)
    }
    return callback(result.rows);
}

function getOrderHistoryDetailsPromise(orderId) {
    var query = "Select * from order_status where order_id = $1"
    return new Promise(function (resolve, reject) {
        pool.query(query, [orderId], function (err, data) {
            if (err) {
                reject(err);
            }
            resolve(data.rows);
        })
    })
}

function createNewOrderPromise(data) {
    var queryToExecute = "INSERT INTO fixed_order (base_currency,base_amount,quote_currency,quote_amount,rate,sender_id, beneficiary_id,status,purpose,created_at)" +
        " VALUES ($1, $2, $3, $4, $5, $6 , $7 ,$8 , $9 , $10 ) RETURNING *"

    var values = [data.base_currency, data.base_amount, data.quote_currency, data.quote_amount, data.rate, data.sender_id, data.beneficiary_id, data.status, data.purpose, data.created_at]
    return new Promise(function (resolve, reject) {
        pool.query(queryToExecute, values, function (err, data) {
            if (err) {
                logger.error("Error While Inserting ", err)
                reject(err)
            }
            resolve(data.rows[0]);
        });
    })
}

function createStatusRecordPromise(data) {
    var queryToExecute = "INSERT INTO order_status (status,order_id,created_at)" +
        " VALUES ($1, $2, $3 ) RETURNING *"
    var values = [data.status, data.order_id, data.created_at]
    return new Promise(function(resolve,reject){
        pool.query(queryToExecute, values, function (err, data) {
            if (err) {
                logger.error("Error While Inserting Order Status", err)
                reject(err)
            }
            resolve(data.rows[0]);
        }
        );
    });
 
}
module.exports = {
    getOrderHistoryDetails,
    getOrderDetails,
    getAllOrderDetails,
    getAllOrderCount,
    createStatusRecord,
    createHistoryRecord,
    createNewOrder, getOrderHistoryDetailsPromise
}