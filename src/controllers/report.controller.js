const httpStatus = require('http-status');
const axios = require('axios');
const catchAsync = require('../utils/catchAsync');
const fs = require('fs');
const yaml = require('js-yaml');
const getDynamicModel = require('../utils/connectionManager');
const ExcelJS = require('exceljs')
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable');
const sequelize = require('../utils/connection');
const excel = require('excel4node');

const getConfig = catchAsync(async (req, res) => {
  const config = yaml.load(fs.readFileSync('src/reportConfig.yaml', 'utf8'));

  res.json(config);
});

const generatePdf = catchAsync(async (req, res) => {
  const { table, filters, columns } = req.query;
  const query = JSON.parse(filters || '{}');
  const selectedColumns = columns ? columns.split(',') : null;
  try {
    const ReportModel = await getDynamicModel(table);

    const reports = await ReportModel.findAll({
      where: JSON.parse(filters || '{}'),
      attributes: columns ? columns.split(',') : undefined,
    });

    // Create a new PDF document
    const doc = new jsPDF();

    // Set document properties
    doc.setProperties({
      title: 'Report PDF',
      subject: 'Generating a report',
      author: 'Your Name',
      keywords: 'generated, report, pdf',
    });

    // Retrieve model columns dynamically
    const headers = columns ? columns.split(',') : Object.keys(ReportModel.rawAttributes);

    // Map report data to rows
    const rows = reports.map(report => {
      const dataValues = report.dataValues;
      return headers.map(header => dataValues[header]);
    });

    const columnStyles = {
      0: { columnWidth: 30 }, 
      1: { columnWidth: 40 }, 
      2: { columnWidth: 40 }, 
      3: { columnWidth: 60 }, 
      4: { columnWidth: 60 }, 
    };

    // Set up table using autoTable
    doc.autoTable({ head: [headers], body: rows,columnStyles });


    const pdfData = doc.output('blob');

 
    const pdfBuffer = Buffer.from(await pdfData.arrayBuffer());

   
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.status(200).end(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});

const generateExcel = catchAsync(async (req, res) => {
  const { table, filters, columns } = req.query;
  const query = JSON.parse(filters || '{}');
  const selectedColumns = columns ? columns.split(',') : null;

  const ReportModel = await getDynamicModel(table); // Assuming ReportModel represents your Sequelize model (e.g., User)

  const reports = await ReportModel.findAll({
    where: query,
    attributes: selectedColumns,
  });

  // Create a new ExcelJS Workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  

  worksheet.columns = selectedColumns.map((col) => ({ header: col, key: col }));


  reports.forEach((report) => {
    const rowData = {};
    selectedColumns.forEach(col => {
      
     
      rowData[col] = report.getDataValue(col); 
    });

    worksheet.addRow(rowData);
  });



 
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');

  
  await workbook.xlsx.write(res);
  res.end();

  // const workbook = new excel.Workbook();
  // const worksheet = workbook.addWorksheet('Sheet 1');

  // // Populate data in cells
  // worksheet.cell(1, 1).string('Hello');
  // worksheet.cell(1, 2).string('World');

  // // Set headers for download
  // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  // res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');

  // // Send the workbook as response
  // workbook.write(res);
  // res.end();
});



const generateCSV = catchAsync(async (req, res) => {

  const { table, filters, columns } = req.query;
  const query = JSON.parse(filters || '{}');
  const selectedColumns = columns ? columns.split(',') : null;

  const ReportModel = await getDynamicModel(table);

  const reports = await ReportModel.findAll({
    where: query,
    attributes: selectedColumns,
  });

  const csvWriter = createCsvWriter({
    path: 'report.csv',
    header: selectedColumns.map(col => ({ id: col, title: col })),
  });

  await csvWriter.writeRecords(reports.map(report => report.toJSON()));

  res.download('report.csv', 'report.csv', (err) => {
    if (err) {
      console.error('Error downloading the CSV file:', err);
    }
    fs.unlinkSync('report.csv');
  });
})


const getTables = catchAsync(async (req, res) => {

  try {
    const [results, metadata] = await sequelize.query("SHOW TABLES");
    const tables = results.map(row => Object.values(row)[0]);
    console.log('tables',tables);
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

const getTableDetails =  catchAsync(async (req, res) => {
  const { tableName } = req.params;

  try {
    const [columnsResult] = await sequelize.query(
      `SHOW COLUMNS FROM ${tableName}`
    );
    const columns = columnsResult.map(col => col.Field);

    const [rowsResult] = await sequelize.query(
      `SELECT * FROM ${tableName}`
    );
    const rows = rowsResult;

    res.json({ columns, rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

module.exports = {
  getConfig,
  generatePdf,
  generateExcel,
  generateCSV,
  getTables,
  getTableDetails
};
