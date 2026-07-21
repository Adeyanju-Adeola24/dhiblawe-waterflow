import { google } from 'googleapis';
import { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, SPREADSHEET_ID } from './env.js';

let sheetsClient = null;

async function getClient() {
  if (sheetsClient) return sheetsClient;
  const auth = new google.auth.JWT(
    GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    (GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

export async function getHeaders(sheetName) {
  const sheets = await getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!1:1`,
  });
  return res.data.values?.[0] || [];
}

export async function getAllRows(sheetName) {
  const sheets = await getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:ZZ`,
  });
  const rows = res.data.values || [];
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map((row, idx) => {
    const obj = { __rowIndex: idx + 2 };
    headers.forEach((h, i) => {
      obj[h] = row[i] !== undefined && row[i] !== '' ? row[i] : null;
    });
    return obj;
  });
}

export async function appendRow(sheetName, data, headers) {
  const sheets = await getClient();
  const h = headers || await getHeaders(sheetName);
  const row = h.map(col => data[col] !== undefined && data[col] !== null ? String(data[col]) : '');
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:A`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: { values: [row] },
  });
}

export async function updateRow(sheetName, rowIndex, data, headers) {
  const sheets = await getClient();
  const h = headers || await getHeaders(sheetName);
  const row = h.map(col => data[col] !== undefined && data[col] !== null ? String(data[col]) : '');
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [row] },
  });
}

export async function deleteRow(sheetName, rowIndex) {
  const sheets = await getClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    resource: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: null,
            dimension: 'ROWS',
            startIndex: rowIndex - 1,
            endIndex: rowIndex,
          },
        },
      }],
    },
  });
}

export async function getSheetId(sheetName) {
  const sheets = await getClient();
  const res = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const sheet = res.data.sheets.find(s => s.properties.title === sheetName);
  return sheet?.properties.sheetId;
}

export async function ensureSheet(name, headers) {
  const sheets = await getClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    resource: {
      requests: [{
        addSheet: { properties: { title: name } },
      }],
    },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${name}!A1`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [headers] },
  });
}

export async function initSheets() {
  const tabs = {
    users: ['id', 'username', 'email', 'password_hash', 'role', 'pin_hash', 'is_active', 'created_at'],
    clients: ['id', 'name', 'address', 'balance', 'is_active', 'created_at', 'updated_at'],
    plate_numbers: ['id', 'plate', 'default_rate', 'is_active', 'created_at', 'updated_at'],
    trips: ['id', 'client_id', 'plate_id', 'trip_number', 'invoice_number', 'trip_date', 'trip_time', 'item', 'amount', 'payment_status', 'note', 'deposit_used', 'created_at'],
    payments: ['id', 'client_id', 'amount', 'payment_date', 'note', 'created_at'],
    deposits: ['id', 'client_id', 'amount', 'remaining', 'deposit_date', 'note', 'created_at'],
    settings: ['id', 'key', 'value', 'updated_at'],
    audit_log: ['id', 'user_id', 'action', 'details', 'created_at'],
  };
  const sheets = await getClient();
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existing = new Set(spreadsheet.data.sheets.map(s => s.properties.title));
  for (const [name, headers] of Object.entries(tabs)) {
    if (existing.has(name)) continue;
    await ensureSheet(name, headers);
  }
}
