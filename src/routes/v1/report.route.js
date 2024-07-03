const express = require('express');
const auth = require('../../middlewares/verifyToken');
const { reportController } = require('../../controllers');



const router = express.Router();

router.get('/getTables',auth(),reportController.getTables)
router.get('/config',auth(),reportController.getConfig)
router.get('/generate-pdf',reportController.generatePdf)
router.get('/generate-excel',auth(),reportController.generateExcel)
router.get('/generate-csv',auth(),reportController.generateCSV)

router.get('/tables/:tableName',auth(),reportController.getTableDetails)
  


module.exports = router;


