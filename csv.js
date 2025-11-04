// csv.js
// Simple CSV helpers for export/import with proper quoting.
// - toCSV(rows, columns): rows is array of objects; columns is array of
//   { key, header, map? } where map(value, row) can transform values.
// - parseCSV(text): returns { headers: string[], rows: string[][] }

/** Quote a CSV field if needed and escape quotes */
function q(v) {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/** Convert rows to CSV string */
export function toCSV(rows = [], columns = []) {
  const header = columns.map(c => q(c.header ?? c.key)).join(",");
  const lines = rows.map(r =>
    columns.map(c => {
      const raw = c.map ? c.map(r[c.key], r) : r[c.key];
      return q(raw);
    }).join(",")
  );
  return [header, ...lines].join("\r\n");
}

/**
 * Parse CSV text into headers and row arrays.
 * Handles quotes, escaped quotes, commas and newlines inside quotes.
 */
export function parseCSV(text = "") {
  const rows = [];
  let row = [];
  let field = "";
  let i = 0;
  let inQuotes = false;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { // escaped quote
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        field += ch;
        i++;
        continue;
      }
    } else {
      if (ch === ',') {
        row.push(field);
        field = "";
        i++;
        continue;
      }
      if (ch === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        i++;
        continue;
      }
      if (ch === '\r') { // handle CRLF
        i++;
        continue;
      }
      if (ch === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      field += ch;
      i++;
    }
  }
  // last field
  row.push(field);
  rows.push(row);

  const headers = rows.shift() || [];
  return { headers, rows };
}

/** Build array of objects from parsed CSV */
export function rowsToObjects(parsed) {
  const { headers, rows } = parsed || {};
  const keys = headers.map(h => String(h || "").trim());
  return rows.map(r => {
    const o = {};
    keys.forEach((k, idx) => { o[k] = r[idx] ?? ""; });
    return o;
  });
}
