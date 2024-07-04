const express = require('express');
const auth = require('../../middlewares/verifyToken');
const { reportController } = require('../../controllers');



const router = express.Router();

router.get('/getTables',auth(),reportController.getTables)
router.get('/config',auth(),reportController.getConfig)
router.get('/generate-pdf',reportController.generatePdf)
router.get('/generate-excel',reportController.generateExcel)
router.get('/generate-csv',reportController.generateCSV)

router.get('/tables/:tableName',auth(),reportController.getTableDetails)
  


module.exports = router;


