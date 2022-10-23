require("dotenv").config();
const knexTemp = require('knex');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const config = require('./config.json');
const configKnex = require("./knexfile");

// формирование массива ячеек для загрузки
const FIELD_CELLS = Object.values(config.fields).flat();

// получение массива имен полей из config.json
const FIELD_NAMES = Object.keys(config.fields);

// --------------------------------------------------------------------------------------
// функция чтения из вкладки, принимает вкладку
// Считывает данные если в определенной ячейке вкладки установлен флаг
// Возвращает данные одной вкладки
async function readDataFromSheet(sheet) {
  console.log("загрузка данных из вкладки", sheet.title);
  await sheet.loadCells(config.flagCell); // загрузка значения флага из ячейки флага
  const flag = sheet.getCellByA1(config.flagCell).value;
  if (flag === true) {
    try {
      await sheet.loadCells(FIELD_CELLS);
    } catch (e) {
      throw new Error(`не загружены данные из вкладки ${sheet.title}, ошибка - ${e.message}`)
    }
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

  if (typeof fieldCell === "string") {
    return sheet.getCellByA1(fieldCell).value;
  } else if (Array.isArray(fieldCell)) {
    return fieldCell.map((singleFieldCell) => (
      sheet.getCellByA1(singleFieldCell).value
    ));
  } else {
    console.log("Некорректный тип поля", config.fields[fieldName])
  }
}

function sleep() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), config.timeout);
  })
}

// --------------------------------------------------------------------------------------
// функция формирования данных со всего файла GS. бежит по документу и формирует 
// данные со всего файла, возвращает массив из объектов данных вкладок таблицы 
async function readDataFromSpreadsheet() {
  console.log("установка соединения")
  // установка связи с таблицей
  const doc = new GoogleSpreadsheet(config.spreadsheetId);
  // аутентикация 
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  // загрузка документа
  await doc.loadInfo();

  console.log("загрузка данных из spredsheet")

  const dataFromSheets = [];
  for (const sheet of doc.sheetsByIndex) {
    const dataFromSheet = await readDataFromSheet(sheet);
    if (dataFromSheet !== null) {
      const data = {
        fields: dataFromSheet,
        page: sheet.title,
        time: new Date(),
        spreadsheetId: config.spreadsheetId,
        spreadsheetKey: config.spreadsheetKey
      }
      dataFromSheets.push(data);
    };
    await sleep()
  }
  console.log("объект данных сформирован");
  console.log(dataFromSheets);
  return dataFromSheets;
};

// функция записи данных в таблицу БД
// // Принимает dataFromSheet: массив из объектов данных вкладок таблицы и пишет его в базу
// // ничего не возвращает
async function saveDataToDataBase(dataFromSheetTabsArray) {

  const knex = knexTemp(configKnex);

  const recordsToWrite = dataFromSheetTabsArray.map((record) => ({
    page: record.page,
    time: record.time,
    spreadsheet_id: record.spreadsheetId,
    fields: record.fields,
    spreadsheet_key: record.spreadsheetKey
  }));

  console.log("Запись в базу");
  await knex('data_from_gs').insert(recordsToWrite);
  console.log("Запись закончена");

  knex.destroy();
};

async function main() {
  const dataFromSheetTabsArray = await readDataFromSpreadsheet();
  saveDataToDataBase(dataFromSheetTabsArray);
};

main();




