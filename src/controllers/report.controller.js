const httpStatus = require('http-status');
const axios = require('axios');
const catchAsync = require('../utils/catchAsync');
const fs = require('fs');
const yaml = require('yaml');
const getDynamicModel = require('../utils/connectionManager');
const ExcelJS = require('exceljs')
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable');
const sequelize = require('../utils/connection');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const { format } = require('date-fns');


const getConfig = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('src/reportConfig.yaml', 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const config = yaml.parse(data);
          resolve(config);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
};

// const generatePdf = catchAsync(async (req, res) => {
//   const { table, filters, columns } = req.query;
//   const query = JSON.parse(filters || '{}');
//   const selectedColumns = columns ? columns.split(',') : null;
//   try {
//     const ReportModel = await getDynamicModel(table);

//     const reports = await ReportModel.findAll({
//       where: JSON.parse(filters || '{}'),
//       attributes: columns ? columns.split(',') : undefined,
//     });

//     // Create a new PDF document
//     const doc = new jsPDF();

//     // Set document properties
//     doc.setProperties({
//       title: 'Report PDF',
//       subject: 'Generating a report',
//       author: 'Your Name',
//       keywords: 'generated, report, pdf',
//     });


//     const headers = columns ? columns.split(',') : Object.keys(ReportModel.rawAttributes);


//     const rows = reports.map(report => {
//       const dataValues = report.dataValues;
//       return headers.map(header => dataValues[header]);
//     });

//     const columnStyles = {
//       0: { columnWidth: 30 }, 
//       1: { columnWidth: 40 }, 
//       2: { columnWidth: 40 }, 
//       3: { columnWidth: 60 }, 
//       4: { columnWidth: 60 }, 
//     };

//     // Set up table using autoTable
//     doc.autoTable({ head: [headers], body: rows,columnStyles });


//     const pdfData = doc.output('blob');

 
//     const pdfBuffer = Buffer.from(await pdfData.arrayBuffer());

   
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
//     res.setHeader('Content-Length', pdfBuffer.length);
//     res.status(200).end(pdfBuffer);

//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     res.status(500).json({ message: 'Error generating PDF' });
//   }
// });

const generatePdf = catchAsync(async (req, res) => {
  // const { table, filters, columns, rows } = req.query;
  const { table, filters, columns, rows } = req.body;
  console.log(rows)
  console.log(columns)
  const selectedColumns =columns
  try {
    const ReportModel = await getDynamicModel(table);

    const reports = rows ? JSON.parse(rows) : await ReportModel.findAll({
      where: JSON.parse(filters || '{}'),
      attributes: selectedColumns,
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

    const headers = selectedColumns || Object.keys(ReportModel.rawAttributes);

    const reportRows = reports.map(report => {
      const dataValues = report.dataValues || report; // Handle both database and pre-filtered rows
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
    doc.autoTable({ head: [headers], body: reportRows, columnStyles });

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



// const generateExcel = catchAsync(async (req, res) => {
//   const { table, filters, columns } = req.query;

//   try {
//   const query = JSON.parse(filters || '{}');
//   const selectedColumns = columns ? columns.split(',') : null;

//   // Fetch the dynamic model based on the table name
//   const ReportModel = await getDynamicModel(table);

//   // Fetch the reports data based on the filters and selected columns
//   const reports = await ReportModel.findAll({
//     where: query,
//     attributes: selectedColumns,
//   });

//   // Debugging: Log the retrieved reports
//   // console.log('Reports Data:', reports.map(report => report.get()));


//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet('Report');

 
//   // worksheet.columns = selectedColumns.map((col) => ({ header: col, key: col }));
  
//   worksheet.columns = selectedColumns.map(col => ({
//     header: col.toUpperCase(), 
//     width: 20, 
//   }));


 
//   reports.forEach((report) => {
//     const rowData = {};
//     selectedColumns.forEach((col) => {
//       rowData[col] = report.getDataValue(col);
//     });
//     console.log(rowData)
//     worksheet.addRow(Object.values(rowData));
//   });
//   // const rowData = 
//   //   {
//   //     id: 1,
//   //     email: 'rathish83+1@gmail.com',
//   //     password: '$2a$08$1sNB6/FXWCV0ndDykWWA5uyg2LobsPc6rLO7M/2/MGHW7EdS6LvFS',
//   //     createdAt: '2024-07-01T10:03:22.000Z',
//   //     updatedAt: '2024-07-01T10:03:22.000Z'
//   //   }
//   //   worksheet.addRow([
//   //     1,
//   //    'rathish83+1@gmail.com',
//   //    '$2a$08$1sNB6/FXWCV0ndDykWWA5uyg2LobsPc6rLO7M/2/MGHW7EdS6LvFS',
//   //     '2024-07-01T10:03:22.000Z',
//   //    '2024-07-01T10:03:22.000Z'
//   //   ]);
  

//   // res.set("Content-Disposition", "attachment; filename=data.xls");
//   // res.type("application/vnd.ms-excel");
//   // // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//   // // res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');


//   //  await workbook.xlsx.write(res);
//   // res.end();
//   const fileName = `report_${Date.now()}.xlsx`;
//   const filePath = path.join(__dirname, '..', 'temp', fileName); // Adjust the path as per your project structure

//   // Save the workbook to the file system
//   await workbook.xlsx.writeFile(filePath);
//   res.setHeader('Access-Control-Expose-Headers', "Content-Disposition");
//   res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//   res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');
  
//   const buffer = (await workbook.xlsx.writeBuffer());
//   res.write(buffer);
//   res.end();
  
//   // await workbook.xlsx.write(res);
//   // res.end();
//   // res.download(filePath, fileName, (err) => {
//   //   if (err) {
//   //     console.error('Error downloading the Excel file:', err);
//   //     res.status(500).json({ error: 'Failed to download the Excel file' });
//   //   }

    
//   // });
// } catch (error) {
//   console.log(error)
// }
// });

// const generateExcel = catchAsync(async (req, res) => {
//   const { table, filters, columns, rows } = req.query;

  
//   const selectedColumns = columns ? columns.split(',') : null;

//   try {
//     // If rows are provided, use them directly
//     const reports = rows ? JSON.parse(rows) : await ReportModel.findAll({
//       where: JSON.parse(filters || '{}'),
//       attributes: selectedColumns,
//     });

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Report');

//     worksheet.columns = selectedColumns.map(col => ({
//       header: col.toUpperCase(),
//       width: 20,
//     }));

//     reports.forEach(report => {
//       const rowData = {};
//       selectedColumns.forEach(col => {
//         rowData[col] = report[col] || report.getDataValue(col); // Handle both database and pre-filtered rows
//       });
//       worksheet.addRow(Object.values(rowData));
//     });

//     const fileName = `report_${Date.now()}.xlsx`;
//     const filePath = path.join(__dirname, '..', 'temp', fileName); // Adjust the path as per your project structure

//     // Save the workbook to the file system
//     await workbook.xlsx.writeFile(filePath);

//     res.setHeader('Access-Control-Expose-Headers', "Content-Disposition");
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

//     const buffer = await workbook.xlsx.writeBuffer();
//     res.write(buffer);
//     res.end();

//   } catch (error) {
//     console.error('Error generating Excel:', error);
//     res.status(500).json({ message: 'Error generating Excel' });
//   }
// });
const generateExcel = async (req, res) => {
  const { table, filters, columns, rows } = req.body; // Use req.body to receive data

  const selectedColumns =  columns ? columns.split(',') : null;

  try {
    
    const ReportModel = await getDynamicModel(table);
    const reports = rows ? JSON.parse(rows) : await ReportModel.findAll({
      where: JSON.parse(filters || '{}'),
      attributes: selectedColumns,
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    worksheet.columns = selectedColumns.map(col => ({
      header: col.toUpperCase(),
      key: col, // Use 'key' to match your column data
      width: 20,
    }));

    // reports.forEach(report => {
    //   const rowData = {};
    //   selectedColumns.forEach(col => {
    //     rowData[col] = report[col] || report.getDataValue(col); // Handle both database and pre-filtered rows
    //   });
    //   worksheet.addRow(rowData);
    // });
    reports.forEach(report => {
      const rowData = {};
      selectedColumns.forEach(col => {
        rowData[col] = report[col]; 
      });
      worksheet.addRow(rowData);
    });
    

    const fileName = `report_${Date.now()}.xlsx`;
    const filePath = path.join(__dirname, '..', 'temp', fileName); 
  
    await workbook.xlsx.writeFile(filePath);


    res.setHeader('Access-Control-Expose-Headers', "Content-Disposition");
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    
    const stream = await workbook.xlsx.writeBuffer();
    res.write(stream);
    res.end();

  } catch (error) {
    console.error('Error generating Excel:', error);
    res.status(500).json({ message: 'Error generating Excel' });
  }
};

const generateCSV = catchAsync(async (req, res) => {
  const { table, filters, columns, rows } = req.body;
  const query = JSON.parse(filters || '{}');
  const selectedColumns = columns ? columns.split(',') : null;

  try {
    const ReportModel = await getDynamicModel(table);
    const reports = rows ? JSON.parse(rows) : await ReportModel.findAll({
      where: query,
      attributes: selectedColumns,
    });

    // Define CSV writer
    const csvWriter = createCsvWriter({
      path: 'report.csv',
      header: selectedColumns.map(col => ({ id: col, title: col })),
    });

    // Write records to CSV file
    await csvWriter.writeRecords(reports.map(report => {
      if (typeof report === 'object' && report !== null) {
        return report;
      }
      return report.toJSON();
    }));

   
    res.download('report.csv', 'report.csv', (err) => {
      if (err) {
        console.error('Error downloading the CSV file:', err);
      }
     
      fs.unlinkSync('report.csv');
    });
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ message: 'Error generating CSV' });
  }
});



const getTables = catchAsync(async (req, res) => {

  try {
    const config = await getConfig();
    // console.log(config)
    // const [results, metadata] = await sequelize.query("SHOW TABLES");
    // const tables = results.map(row => Object.values(row)[0]);
   
    // res.json(tables);
    
    const tableNames = config.reports?.map((table) => table.name);
    res.json(tableNames);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// const getTableDetails =  catchAsync(async (req, res) => {
//   const { tableName } = req.params;

//   try {
//     // const [columnsResult] = await sequelize.query(
//     //   `SHOW COLUMNS FROM ${tableName}`
//     // );

//     const file = fs.readFileSync(`src/reports/${tableName}.yaml`, 'utf8');
//     const config = yaml.parse(file);
    
//     const columns = config.columns.map(col => col.name);

//     const columnNames = columns.join(", ");

//     const [rowsResult] = await sequelize.query(
//       `SELECT ${columnNames} FROM ${tableName}`
//     );
//     const rows = rowsResult;

 

//     res.json({ columns, rows });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// })
// const getTableDetails = catchAsync(async (req, res) => {
//   const { tableName } = req.params;
//   console.log('Table Name:', tableName);

//   try {
//     const configPath = path.resolve(__dirname, '../reportConfig.yaml');
//     console.log('Config Path:', configPath);
//     const rootConfig = yaml.parse(fs.readFileSync(configPath, 'utf8'));

//     const tableConfig = rootConfig.reports.find(report => report.name === tableName);
//     if (!tableConfig) {
//       throw new Error(`Table configuration for ${tableName} not found in reportConfig.yaml`);
//     }

//     console.log('Table Config:', tableConfig);

//     const columnsConfigPath = path.resolve(__dirname, `../${tableConfig.columns_config}`);
//     console.log('Columns Config Path:', columnsConfigPath);

//     const columnsConfig = yaml.parse(fs.readFileSync(columnsConfigPath, 'utf8'));

//     const columns = columnsConfig.columns.map(col => `${tableName}.${col.name}`).join(", ");
//     const relationColumn = columnsConfig.columns.find(col => col.type === 'relation');
    
//     let selectColumns = columns;
//     if (relationColumn) {
//       selectColumns += `, ${relationColumn.relationTable}.name AS ${relationColumn.name}_${relationColumn.relationSelect}`;
//     }
    
//     let rowsResult;
//     if (relationColumn) {
//       console.log('Relation Column:', relationColumn);
//       [rowsResult] = await sequelize.query(`
//         SELECT ${selectColumns}
//         FROM ${tableName}
//         LEFT JOIN ${relationColumn.relationTable} ON ${tableName}.${relationColumn.name} = ${relationColumn.relationTable}.id
//       `);
//     } else {
//       [rowsResult] = await sequelize.query(
//         `SELECT ${columns} FROM ${tableName}`
//       );
//     }

//     // Format date columns
//     const dateFormat = tableConfig.settings.dateFormat;
//     const dateColumns = columnsConfig.columns
//       .filter(col => col.type === 'date')
//       .map(col => ({ name: col.name, format: col.format || dateFormat }));

//     const rows = rowsResult.map(row => {
//       const formattedRow = { ...row };
//       dateColumns.forEach(col => {
//         if (row[col.name]) {
//           formattedRow[col.name] = format(new Date(row[col.name]), col.format);
//         }
//       });

    
//       if (relationColumn) {
//         if (formattedRow[relationColumn.name] !== undefined && row.category_name !== undefined) {
//           formattedRow[relationColumn.name] = row.category_name;
//           delete formattedRow.category_name;
//         } else {
//           console.log('relationColumn or category_name is undefined:', {
//             relationColumnName: relationColumn.name,
//             category_name: row.category_name
//           });
//         }
//       }

//       return formattedRow;
//     });

//     console.log('Table Settings:', tableConfig.settings);

//     res.json({ columns: columnsConfig.columns.map(col => col.name), rows, settings: tableConfig.settings });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

const getTableDetails = catchAsync(async (req, res) => {
  const { tableName } = req.params;
  console.log('Table Name:', tableName);

  try {
    const configPath = path.resolve(__dirname, '../reportConfig.yaml');
    console.log('Config Path:', configPath);
    const rootConfig = yaml.parse(fs.readFileSync(configPath, 'utf8'));

    const tableConfig = rootConfig.reports.find(report => report.name === tableName);
    if (!tableConfig) {
      throw new Error(`Table configuration for ${tableName} not found in reportConfig.yaml`);
    }

    console.log('Table Config:', tableConfig);

    const columnsConfigPath = path.resolve(__dirname, `../${tableConfig.columns_config}`);
    console.log('Columns Config Path:', columnsConfigPath);

    const columnsConfig = yaml.parse(fs.readFileSync(columnsConfigPath, 'utf8'));

    let selectColumns = columnsConfig.columns.map(col => `${tableName}.${col.name}`).join(", ");
    const relationColumns = columnsConfig.columns.filter(col => col.type === 'relation');

    relationColumns.forEach(relation => {
      selectColumns += `, ${relation.relationTable}.${relation.relationSelect} AS ${relation.name}_${relation.relationSelect}`;
    });

    let query = `SELECT ${selectColumns} FROM ${tableName}`;
    relationColumns.forEach(relation => {
      query += ` LEFT JOIN ${relation.relationTable} ON ${tableName}.${relation.name} = ${relation.relationTable}.id`;
    });

    const [rowsResult] = await sequelize.query(query);

    // Format date columns
    const dateFormat = tableConfig.settings.dateFormat;
    const dateColumns = columnsConfig.columns
      .filter(col => col.type === 'date')
      .map(col => ({ name: col.name, format: col.format || dateFormat }));

    // Apply column limits and formatting
    const rows = rowsResult.map(row => {
      const formattedRow = { ...row };
      
      dateColumns.forEach(col => {
        if (row[col.name]) {
          formattedRow[col.name] = format(new Date(row[col.name]), col.format);
        }
      });

      columnsConfig.columns.forEach(col => {
        if (col.limit && row[col.name]) {
          formattedRow[col.name] = row[col.name].substring(0, col.limit);
        }
        if (col.format === 'uppercase' && row[col.name]) {
          formattedRow[col.name] = row[col.name].toUpperCase();
        }
        if (col.format === 'lowercase' && row[col.name]) {
          formattedRow[col.name] = row[col.name].toLowerCase();
        }
        if (col.type === 'relation' && row[`${col.name}_${col.relationSelect}`] !== undefined) {
          formattedRow[col.name] = row[`${col.name}_${col.relationSelect}`];
          delete formattedRow[`${col.name}_${col.relationSelect}`];
        }
      });

      return formattedRow;
    });

    res.json({ columns: columnsConfig.columns.map(col => col.name), rows, settings: tableConfig.settings });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});
const getGroupbyData = catchAsync(async (req, res) => {
  const { tableName } = req.params;
  const { groupby } = req.query;
  console.log('Table Name:', tableName);
  console.log('Groupby:', groupby);

  try {
    const configPath = path.resolve(__dirname, '../reportConfig.yaml');
    const rootConfig = yaml.parse(fs.readFileSync(configPath, 'utf8'));

    const tableConfig = rootConfig.reports.find(report => report.name === tableName);
    if (!tableConfig) {
      throw new Error(`Table configuration for ${tableName} not found in reportConfig.yaml`);
    }

    const columnsConfigPath = path.resolve(__dirname, `../${tableConfig.columns_config}`);
    const columnsConfig = yaml.parse(fs.readFileSync(columnsConfigPath, 'utf8'));

    let selectColumns = columnsConfig.columns.map(col => `${tableName}.${col.name}`).join(", ");
    const relationColumns = columnsConfig.columns.filter(col => col.type === 'relation');

    relationColumns.forEach(relation => {
      selectColumns += `, ${relation.relationTable}.${relation.relationSelect} AS ${relation.name}_${relation.relationSelect}`;
    });

    const groupbyClause = groupby ? `${tableName}.${groupby}` : tableConfig.groupby?.map(group => `${tableName}.${group.column}`).join(", ");

    let query = `
      SELECT ${selectColumns}
      FROM ${tableName}
    `;

    relationColumns.forEach(relation => {
      query += `
        LEFT JOIN ${relation.relationTable} ON ${tableName}.${relation.name} = ${relation.relationTable}.id
      `;
    });

    if (groupbyClause) {
      query += ` GROUP BY ${groupbyClause}`;
    }

    console.log('Generated Query:', query);

    const [rowsResult] = await sequelize.query(query);

    // Format date columns
    const dateFormat = tableConfig.settings.dateFormat;
    const dateColumns = columnsConfig.columns
      .filter(col => col.type === 'date')
      .map(col => ({ name: col.name, format: col.format || dateFormat }));

    const rows = rowsResult.map(row => {
      const formattedRow = { ...row };
      dateColumns.forEach(col => {
        if (row[col.name]) {
          formattedRow[col.name] = format(new Date(row[col.name]), col.format);
        }
      });

      relationColumns.forEach(relation => {
        const key = `${relation.name}_${relation.relationSelect}`;
        if (formattedRow[key] !== undefined) {
          formattedRow[relation.name] = formattedRow[key];
          delete formattedRow[key];
        }
      });

      return formattedRow;
    });

    res.json({ columns: columnsConfig.columns.map(col => col.name), rows, settings: tableConfig.settings });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const getAggregateData = catchAsync(async (req, res) => {
  const { tableName } = req.params;
  const { aggregate } = req.query;
  console.log('Table Name:', tableName);
  console.log('Aggregate:', aggregate);

  try {
    const configPath = path.resolve(__dirname, '../reportConfig.yaml');
    const rootConfig = yaml.parse(fs.readFileSync(configPath, 'utf8'));

    const tableConfig = rootConfig.reports.find(report => report.name === tableName);
    if (!tableConfig) {
      throw new Error(`Table configuration for ${tableName} not found in reportConfig.yaml`);
    }

    const columnsConfigPath = path.resolve(__dirname, `../${tableConfig.columns_config}`);
    const columnsConfig = yaml.parse(fs.readFileSync(columnsConfigPath, 'utf8'));

    let selectColumns = columnsConfig.columns.map(col => `${tableName}.${col.name}`).join(", ");
    const relationColumns = columnsConfig.columns.filter(col => col.type === 'relation');

    relationColumns.forEach(relation => {
      selectColumns += `, ${relation.relationTable}.${relation.relationSelect} AS ${relation.name}_${relation.relationSelect}`;
    });

    const aggregatesClause = aggregate ? `${aggregate.split(",").map(agg => `${agg}(${tableName}.${tableConfig.aggregate.find(a => a.type === agg).column}) AS ${agg.toLowerCase()}_${tableConfig.aggregate.find(a => a.type === agg).column}`).join(", ")}` : tableConfig.aggregate?.map(agg => `${agg.type}(${tableName}.${agg.column}) AS ${agg.type.toLowerCase()}_${agg.column}`).join(", ");

    let query = `
      SELECT ${selectColumns}
      ${aggregatesClause ? `, ${aggregatesClause}` : ''}
      FROM ${tableName}
    `;

    relationColumns.forEach(relation => {
      query += `
        LEFT JOIN ${relation.relationTable} ON ${tableName}.${relation.name} = ${relation.relationTable}.id
      `;
    });

    console.log('Generated Query:', query);

    const [rowsResult] = await sequelize.query(query);

    // Format date columns
    const dateFormat = tableConfig.settings.dateFormat;
    const dateColumns = columnsConfig.columns
      .filter(col => col.type === 'date')
      .map(col => ({ name: col.name, format: col.format || dateFormat }));

    const rows = rowsResult.map(row => {
      const formattedRow = { ...row };
      dateColumns.forEach(col => {
        if (row[col.name]) {
          formattedRow[col.name] = format(new Date(row[col.name]), col.format);
        }
      });

      relationColumns.forEach(relation => {
        const key = `${relation.name}_${relation.relationSelect}`;
        if (formattedRow[key] !== undefined) {
          formattedRow[relation.name] = formattedRow[key];
          delete formattedRow[key];
        }
      });

      return formattedRow;
    });

    res.json({ columns: columnsConfig.columns.map(col => col.name), rows, settings: tableConfig.settings });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = {
  getConfig,
  generatePdf,
  generateExcel,
  generateCSV,
  getTables,
  getTableDetails,
  getAggregateData,
  getGroupbyData
};






