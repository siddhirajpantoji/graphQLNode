const {
    Pool,
    Client
} = require('pg');
var logger = require('log4js').getLogger("syncOrderRepository")

var dbSettings = {
    "user": "postgres",
    "host": "localhost",
    "database": "GraphQL",
    "password": "root",
    "port": 5432
}

const pool = new Pool(dbSettings);


async function getAllOrders(order) {
    let rows;
    try {
        queryToExecute = "Select * from fixed_order "
        var valuesArr = new Array();
        var condition = getQueryCondition(order);
        if (condition.valueArr.length > 0) {
            valuesArr = condition.valueArr;
            queryToExecute = queryToExecute.concat(condition.addQuery);
            
        }
        queryToExecute = queryToExecute.concat(" order by id asc ")
        rows = await pool.query(queryToExecute, valuesArr);
        //console.log(JSON.stringify(rows))
    } catch (err) {
        throw err;
    }
    return rows.rows;
}
function getQueryCondition(order) {
    var queryArr = new Array();
    var valuesArr = new Array();
    var addQuery;
    if (order.id) {
        queryArr.push({ field: "id", value: order.id })
    }

    if (order.status) {
        queryArr.push({ field: "status", value: order.status })
    }

    if (order.beneficiaryId) {
        queryArr.push({ field: "beneficiary_id", value: order.beneficiaryId })
    }

    if (order.senderId) {
        queryArr.push({ field: "sender_id", value: order.senderId })
    }
    if (queryArr.length > 0) {
        addQuery = " where " + queryArr[0].field + " = $1"
        valuesArr.push(queryArr[0].value)
        for (var i = 1; i < queryArr.length; i++) {
            addQuery = addQuery.concat(" and " + queryArr[i].field + " = $" + (i + 1))
            valuesArr.push(queryArr[i].value)
        }

    }
    return {
        "addQuery": addQuery,
        "valueArr": valuesArr
    }
}
async function getCountOfOrders(order) {
    let rows;
    try {
        queryToExecute = "Select count(*) from fixed_order"
        var valuesArr = new Array();
        var condition = getQueryCondition(order);
        if (condition.valueArr.length > 0) {
            valuesArr = condition.valueArr;
            queryToExecute = queryToExecute.concat(condition.addQuery);
        }
        rows = await pool.query(queryToExecute, valuesArr);
        //console.log(JSON.stringify(rows))
    } catch (err) {
        throw err;
    }
    return rows.rows;
}
async function createOrder(data) {
    let rows;
    var queryToExecute = "INSERT INTO fixed_order (base_currency,base_amount,quote_currency,quote_amount,rate,sender_id, beneficiary_id,status,purpose,created_at)" +
        " VALUES ($1, $2, $3, $4, $5, $6 , $7 ,$8 , $9 , $10 ) RETURNING *"
    var values = [data.base_currency, data.base_amount, data.quote_currency, data.quote_amount, data.rate, data.sender_id, data.beneficiary_id, data.status, data.purpose, data.created_at]
    try {
        rows = await pool.query(queryToExecute, values);
    }
    catch (err) {
        throw err;
    }
    return rows.rows[0];
}

async function createStatusRecord(data) {
    let rows
    var queryToExecute = "INSERT INTO order_status (status,order_id,created_at)" +
        " VALUES ($1, $2, $3 ) RETURNING *"
    var values = [data.status, data.order_id, data.created_at]
    try {
        rows = await pool.query(queryToExecute, values);
    }
    catch (err) {
        throw err
    }
    return rows.rows[0]
}

async function getHistoryDetailsForOrder(orderId) {
    let rows
    var queryToExecute = "Select * from order_status where order_id="+orderId 
    var values = [orderId]
    try {
        rows = await pool.query(queryToExecute);
    }
    catch (err) {
        throw err
    }
    return rows.rows
}

async function updateOrderStatus(order){
    var queryToExecute = "UPDATE fixed_order set  status = $1 , updated_at = $2 where id = $3 RETURNING *"
    var values = [order.status, new Date(), order.id]
    try {
        rows = await pool.query(queryToExecute, values);
    }
    catch (err) {
        throw err
    }
    return rows.rows[0]
}
module.exports = {
    getAllOrders, getCountOfOrders, createOrder, createStatusRecord, getHistoryDetailsForOrder ,updateOrderStatus
}