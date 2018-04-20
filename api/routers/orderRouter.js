const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
router.get('/',orderController.getSingleRecord);
router.post('/',orderController.createOrder);
router.post('/all',orderController.filterAllRecords);
router.post('/count',orderController.countAllRecords);
module.exports = router;