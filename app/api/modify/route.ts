import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_ID = '1mBBLrQTFvstLCCBV7aFs9xo6MbE_HEoikQwZrdttyDc'; // din URL
const SHEET_NAME = 'MENIU 19-27 SEPTEMBRIE 2025';

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(readFileSync(path.join(process.cwd(), 'credentials/service-account.json'), 'utf-8')),
  scopes: SCOPES,
});

export async function POST(req: NextRequest) {
  const { name, date, meal, status } = await req.json();

  const dateObj = new Date(date);
  const today = new Date();
  dateObj.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (dateObj <= today) {
    return NextResponse.json({ error: '⚠️ Nu poți modifica trecutul sau ziua curentă.' }, { status: 400 });
  }

  const sheets = google.sheets({ version: 'v4', auth });
  const sheet = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}`,
  });

  const values = sheet.data.values || [];
  const names = values.slice(6).map(r => r[0]); // rânduri de la 7 încolo
  const dateRow = values[2].slice(1); // rând 3
  const mealRow = values[3].slice(1); // rând 4

  const rowIndex = names.findIndex(n => (n || '').toLowerCase().trim() === name.toLowerCase().trim());
  if (rowIndex === -1) {
    return NextResponse.json({ error: '⚠️ Numele nu a fost găsit.' }, { status: 404 });
  }

  // let colIndex = -1;
  // for (let i = 0; i < dateRow.length; i++) {
  //   const d = new Date(dateRow[i]);
  //   d.setHours(0, 0, 0, 0);
  //   if (d.getTime() === dateObj.getTime() && (mealRow[i] || '').toLowerCase().trim() === meal.toLowerCase().trim()) {
  //     colIndex = i;
  //     break;
  //   }
  // }

  let colIndex = -1;
for (let i = 0; i < dateRow.length; i++) {
  const [day, month, year] = (dateRow[i] || '').split('-');
  if (!day || !month || !year) continue;
  const d = new Date(`${year}-${month}-${day}`);
  d.setHours(0, 0, 0, 0);
  if (
    d.getTime() === dateObj.getTime() &&
    (mealRow[i] || '').toLowerCase().trim() === meal.toLowerCase().trim()
  ) {
    colIndex = i;
    break;
  }
}


  if (colIndex === -1) {
    return NextResponse.json({ error: '⚠️ Masa nu a fost găsită pentru acea zi.' }, { status: 404 });
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!${String.fromCharCode(66 + colIndex)}${7 + rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[status.toLowerCase()]],
    },
  });

  return NextResponse.json({ message: '✅ Modificare aplicată cu succes.' });
}
