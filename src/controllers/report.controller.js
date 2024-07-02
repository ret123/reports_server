const httpStatus = require('http-status');
const axios = require('axios');
const catchAsync = require('../utils/catchAsync');
const fs = require('fs');
const yaml = require('js-yaml');
const getDynamicModel = require('../utils/connectionManager');
const PDFDocument = require('pdfkit');
const sequelize = require('../utils/connection');

const getConfig = catchAsync(async (req, res) => {
  const config = yaml.load(fs.readFileSync('src/reportConfig.yaml', 'utf8'));

  res.json(config);
});

const generatePdf = catchAsync(async (req, res) => {
  const { table, filters, columns } = req.query;
  const query = JSON.parse(filters || '{}');
  const selectedColumns = columns ? columns.split(',') : null;

  const ReportModel = await getDynamicModel(table);

  const reports = await ReportModel.findAll({
    where: query,
    attributes: selectedColumns,
  });

  const doc = new PDFDocument();
  doc.pipe(res);

  selectedColumns.forEach((col) => {
    doc.text(col, { continued: true });
  });
  doc.moveDown();

  reports.forEach((report) => {
    selectedColumns.forEach((col) => {
      doc.text(report[col], { continued: true });
    });
    doc.moveDown();
  });

  doc.end();
});

const generateExcel = catchAsync(async (req, res) => {
  const { table, filters, columns } = req.query;
  const query = JSON.parse(filters || '{}');
  const selectedColumns = columns ? columns.split(',') : null;

  const ReportModel = await getDynamicModel(table);

  const reports = await ReportModel.findAll({
    where: query,
    attributes: selectedColumns,
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  worksheet.columns = selectedColumns.map((col) => ({ header: col, key: col }));

  reports.forEach((report) => {
    worksheet.addRow(report.toJSON());
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');

  await workbook.xlsx.write(res);
  res.end();
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
