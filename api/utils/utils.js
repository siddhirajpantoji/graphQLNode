const messages = require('../constants/constants')
exports.SuccessfulPostData = function (request, response, data) {
    response.writeHead(200, { 'Content-type': 'application/json' });
    if (data) {
        //response.end(JSON.stringify(Object.values(msg.rows[0])[0]));
        //console.log(data)
        var output = {
            "code": 200,
            "message": messages.REST_MESSAGES.EVERYTHING_LOOKS_GOOD,
            "data": data
        }
        response.end(JSON.stringify(output));
    }
    else {
        response.end();
    }
}
exports.Error500 = function (request, response, err) {
    response.writeHead(500, 'Internal server error!', { 'Content-type': 'application/json' });
    response.write(JSON.stringify({ error: `Internal server error: ${err}` }));
    response.end();
}

exports.Error400 = function (request, response, err) {
    response.writeHead(400, 'Bad request!', { 'Content-type': 'application/json' });
    response.write(JSON.stringify({ error: `Bad request: ${err}` }));
    response.end();
}

function convertResultSetToObject(rs) {
    var obj = {
        id: rs.id,
        baseCurrency: rs.base_currency,
        quoteCurrency: rs.quote_currency,
        quoteAmount: rs.quote_amount,
        senderId: rs.sender_id,
        beneficiaryId: rs.beneficiary_id,
        purpose: rs.purpose,
        createdAt: rs.craeted_at,
        updatedAt: rs.updatedAt,
        rate: rs.rate,
        status: rs.status
    }
    return obj;
}


function convertToHistoryObject(rs) {
    var obj = {
        id: rs.id,
        status: rs.status,
        createdAt: rs.created_at
    }
    return obj;
}

module.exports = {
    convertResultSetToObject, convertToHistoryObject
}