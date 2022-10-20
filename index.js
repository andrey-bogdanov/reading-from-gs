require("dotenv").config();
const knexTemp = require('knex');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const config = require('./config.json');

// формирование массива ячеек для загрузки
const FIELD_CELLS = Object.values(config.fields).flat();

// получение массива имен полей из config.json
const FIELD_NAMES = Object.keys(config.fields);

// --------------------------------------------------------------------------------------
// функция чтения из вкладки, принимает вкладку
// Считывает данные если в определенной ячейке вкладки установлен флаг
// Возвращает данные одной вкладки
async function readDataFromSheet(sheet) {
  await sheet.loadCells(config.flagCell); // загрузка значения флага из ячейки флага
  const flag = sheet.getCellByA1(config.flagCell).value;
  if (flag === true) {
    await sheet.loadCells(FIELD_CELLS); // загрузка данных из всех ячеек
    const tabFieldsData = FIELD_NAMES.reduce(
      (total, field) => ({
        ...total,
        [field]: readDataFromCells(sheet, field)
      }),
      {}
    );
    return tabFieldsData
  } else {
    return null;
  }
};

// --------------------------------------------------------------------------------------
// функция формирования пары field: value и добавления этой пары в объект данных вкладки
// использовуется для reduce в readDataFromSheet
function readDataFromCells(sheet, fieldName) {
  const fieldCell = config.fields[fieldName];
  const fildType = typeof fieldCell
  if (fildType === "string") {
    return sheet.getCellByA1(fieldCell).value;
  } else if (fildType === "array") {
    return fieldCell.map((singleFieldCell) => (
      sheet.getCellByA1(singleFieldCell).value
    ))
  } else {
    // TODO: Кинуть exception
  }
}

function sleep() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 1000)
  })
}

// --------------------------------------------------------------------------------------
// функция формирования данных со всего файла GS. бежит по документу и формирует 
// данные со всего файла, возвращает массив из объектов данных вкладок таблицы 
async function readDataFromSpreadsheet() {

  // установка связи с таблицей
  const doc = new GoogleSpreadsheet(config.spreadsheetId);

  // аутентикация 
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  // загрузка документа
  await doc.loadInfo();

  const dataFromSheets = [];
  for (const sheet of doc.sheetsByIndex) {
    const dataFromSheet = await readDataFromSheet(sheet);
    if (dataFromSheet !== null) {
      const data = {
        fields: dataFromSheet,
        page: sheet.title,
        time: new Date(),
        spreadsheetId: config.spreadsheetId
      }
      dataFromSheets.push(data);
    };
    await sleep()
  }

  return dataFromSheets;
};

// функция записи данных в таблицу БД
// Принимает dataFromSheet: массив из объектов данных вкладок таблицы и пишет его в базу
// ничего не возвращает
async function saveDataToDataBase(dataFromSheetTabsArray) {
};

async function main() {
  const dataFromSheetTabsArray = await readDataFromSpreadsheet();
  console.log(dataFromSheetTabsArray);
};

// const knexConfig = {
//   client: 'pg',
//   connection: process.env.PG_CONNECTION_STRING,
//   searchPath: ['knex', 'public'],
// }

// const knex = knexTemp(knexConfig);

main();