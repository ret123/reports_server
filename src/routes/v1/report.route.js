const express = require('express');
const auth = require('../../middlewares/verifyToken');
const { reportController } = require('../../controllers');



const router = express.Router();

router.get('/getTables',reportController.getTables)
router.get('/config',reportController.getConfig)
router.get('/generate-pdf',auth,reportController.generatePdf)
router.get('/generate-excel',auth,reportController.generateExcel)
router.get('/generate-csv',auth,reportController.generateCSV)

router.get('/tables/:tableName',reportController.getTableDetails)
  


module.exports = router;


