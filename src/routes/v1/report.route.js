const express = require('express');
const auth = require('../../middlewares/verifyToken');
const { reportController } = require('../../controllers');



const router = express.Router();

router.get('/getTables',auth(),reportController.getTables)
router.get('/config',auth(),reportController.getConfig)
router.post('/generate-pdf',reportController.generatePdf)
router.post('/generate-excel',reportController.generateExcel)
router.post('/generate-csv',reportController.generateCSV)

router.get('/tables/:tableName',reportController.getTableDetails)
router.get('/tables/:tableName/aggregate',reportController.getAggregateData)
router.get('/tables/:tableName/group-by',reportController.getGroupbyData)



module.exports = router;


