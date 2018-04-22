const messages = require('../constants/constants')
function SuccessfulPostData (request, response, data) {
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
function Error500 (request, response, err) {
    response.writeHead(500, 'Internal server error!', { 'Content-type': 'application/json' });
    response.write(JSON.stringify({ error: `Internal server error: ${err}` }));
    response.end();
}

function Error400 (request, response, err) {
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
        baseAmount:rs.base_amount,
        senderId: rs.sender_id,
        beneficiaryId: rs.beneficiary_id,
        purpose: rs.purpose,
        createdAt: rs.created_at,
        updatedAt: rs.updated_at,
        rate: rs.rate,
        status: rs.status
    }
    return obj;
}


function convertToHistoryArr(rs) {
    if(rs && rs.length>0)
    {
        var histArr = new Array();
        
        for(j=0;j<rs.length;j++)
        {
            histArr.push(convertToHistoryObject(rs[j]))
        }
        return histArr;
    }
    else
    {
        return rs;
    }
}
function convertToHistoryObject(rs)
{
    if(rs)
    {
        var obj = {
            id: rs.id,
            status: rs.status,
            createdAt: rs.created_at
        }
        return obj;
    }
    else{
        return rs;
    }
}

module.exports = {
    convertResultSetToObject, convertToHistoryObject , convertToHistoryArr ,SuccessfulPostData
    ,Error500 ,Error400
}