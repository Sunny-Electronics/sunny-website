import { createHmac, timingSafeEqual } from "node:crypto";
import { execFile } from "node:child_process";
import { Router, type Request, type Response } from "express";

const router = Router();
const cookieName = "sunny_admin_session";
const defaultWorkbookFolder = String.raw`C:\Users\admin\Documents\Work_files\Sunny영업 _File\OrderList-오더대장`;
const pythonPath =
  process.env.SUNNYKR_PYTHON_PATH ??
  String.raw`C:\Users\admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`;

type AdminRole = "owner" | "admin" | "member";

type AdminSessionPayload = {
  exp: number;
  name?: string;
  role: AdminRole;
  sub: string;
};

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function verifySession(token: string | undefined) {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";

  if (!token || !secret) {
    return null;
  }

  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expected = sign(body, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as AdminSessionPayload;

    if (payload.exp <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function requireAdmin(req: Request, res: Response) {
  const payload = verifySession(req.cookies?.[cookieName]);

  if (!payload) {
    res.status(401).json({ error: "Admin login required" });
    return null;
  }

  return payload;
}

function runWorkbookBridge(action: string, payload: Record<string, unknown>) {
  const bridgeCode = String.raw`
import json
import os
import re
import subprocess
import sys
import zipfile
from datetime import datetime, timedelta
from pathlib import Path
from xml.etree.ElementTree import iterparse

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
RELS_NS = "{http://schemas.openxmlformats.org/package/2006/relationships}"
DOC_RELS_NS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"

def col_to_index(cell_ref):
    letters = re.sub(r"[^A-Z]", "", cell_ref.upper())
    index = 0
    for char in letters:
        index = index * 26 + ord(char) - 64
    return index

def excel_serial_to_date(value):
    try:
        number = float(value)
    except Exception:
        return value
    if number < 20000 or number > 60000:
        return value
    return (datetime(1899, 12, 30) + timedelta(days=number)).strftime("%Y-%m-%d")

def find_workbook(folder):
    configured = os.environ.get("SUNNYKR_ORDERLIST_WORKBOOK_PATH", "").strip()
    if configured:
        path = Path(configured)
        if path.exists() and path.suffix.lower() == ".xlsx" and not path.name.startswith("~$"):
            return path
    root = Path(folder)
    files = [p for p in root.glob("*.xlsx") if not p.name.startswith("~$")]
    if not files:
        raise FileNotFoundError(f"No .xlsx workbook found in {root}")
    return max(files, key=lambda p: p.stat().st_mtime)

def is_locked(path):
    return (path.parent / ("~$" + path.name)).exists()

def read_shared_strings(zf):
    if "xl/sharedStrings.xml" not in zf.namelist():
        return []
    strings = []
    text_parts = []
    for event, elem in iterparse(zf.open("xl/sharedStrings.xml"), events=("start", "end")):
        if event == "start" and elem.tag == NS + "si":
            text_parts = []
        elif event == "end" and elem.tag == NS + "t":
            text_parts.append(elem.text or "")
        elif event == "end" and elem.tag == NS + "si":
            strings.append("".join(text_parts))
            elem.clear()
    return strings

def get_sheet_paths(zf):
    workbook_rels = {}
    if "xl/_rels/workbook.xml.rels" in zf.namelist():
        for _, elem in iterparse(zf.open("xl/_rels/workbook.xml.rels"), events=("end",)):
            if elem.tag == RELS_NS + "Relationship":
                target = elem.attrib.get("Target", "")
                workbook_rels[elem.attrib.get("Id", "")] = "xl/" + target.lstrip("/")
            elem.clear()

    sheets = []
    for _, elem in iterparse(zf.open("xl/workbook.xml"), events=("end",)):
        if elem.tag == NS + "sheet":
            rel_id = elem.attrib.get(DOC_RELS_NS + "id", "")
            sheets.append({
                "name": elem.attrib.get("name", "Sheet"),
                "path": workbook_rels.get(rel_id, ""),
            })
        elem.clear()
    return [sheet for sheet in sheets if sheet["path"] in zf.namelist()]

def parse_sheet(zf, sheet_path, shared_strings, max_col):
    rows = {}
    for _, elem in iterparse(zf.open(sheet_path), events=("end",)):
        if elem.tag == NS + "c":
            cell_ref = elem.attrib.get("r", "")
            row_match = re.search(r"\d+", cell_ref)
            if not row_match:
                elem.clear()
                continue
            row_number = int(row_match.group(0))
            col_index = col_to_index(cell_ref)
            if col_index > max_col:
                elem.clear()
                continue
            cell_type = elem.attrib.get("t", "")
            value = ""
            inline_text = elem.find(NS + "is/" + NS + "t")
            raw_value = elem.find(NS + "v")
            if cell_type == "inlineStr" and inline_text is not None:
                value = inline_text.text or ""
            elif raw_value is not None:
                raw = raw_value.text or ""
                if cell_type == "s":
                    try:
                        value = shared_strings[int(raw)]
                    except Exception:
                        value = raw
                else:
                    value = raw
            rows.setdefault(row_number, [""] * max_col)[col_index - 1] = value
            elem.clear()
    return rows

def find_order_sheet(zf, sheets, shared_strings, max_col):
    for sheet in sheets:
        rows = parse_sheet(zf, sheet["path"], shared_strings, max_col)
        header_values = [str(value).strip().lower() for value in rows.get(2, [])]
        joined = " ".join(header_values)
        if "date" in joined and "p/o" in joined and "customer" in joined:
            return sheet, rows
    first_sheet = sheets[0]
    return first_sheet, parse_sheet(zf, first_sheet["path"], shared_strings, max_col)

def normalize_rows(rows, headers):
    date_columns = {
        index
        for index, header in enumerate(headers)
        if "date" in str(header).lower() or str(header).lower() == "etd"
    }
    normalized = []
    for row_number in sorted(rows):
        if row_number <= 2:
            continue
        values = rows[row_number]
        if not any(str(value).strip() for value in values):
            continue
        normalized_values = [
            excel_serial_to_date(value) if index in date_columns else value
            for index, value in enumerate(values)
        ]
        normalized.append({"rowNumber": row_number, "values": normalized_values})
    return normalized

def update_with_excel_com(path, sheet_name, row_number, column_index, value):
    script = r'''
$payload = $input | ConvertFrom-Json
$excel = $null
$workbook = $null
try {
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false
  $workbook = $excel.Workbooks.Open($payload.path)
  $worksheet = $workbook.Worksheets.Item($payload.sheet)
  $worksheet.Cells.Item([int]$payload.rowNumber, [int]$payload.columnIndex).Value2 = [string]$payload.value
  $workbook.Save()
  $workbook.Close($false)
  $excel.Quit()
  [pscustomobject]@{ ok = $true } | ConvertTo-Json -Compress
} catch {
  if ($workbook) { $workbook.Close($false) | Out-Null }
  if ($excel) { $excel.Quit() | Out-Null }
  throw
} finally {
  if ($worksheet) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($worksheet) | Out-Null }
  if ($workbook) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($workbook) | Out-Null }
  if ($excel) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
'''
    payload = json.dumps({
        "path": str(path),
        "sheet": sheet_name,
        "rowNumber": row_number,
        "columnIndex": column_index,
        "value": value,
    }, ensure_ascii=False)
    completed = subprocess.run(
        ["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
        input=payload,
        text=True,
        capture_output=True,
        encoding="utf-8",
        timeout=60,
    )
    if completed.returncode != 0:
        raise RuntimeError(completed.stderr or completed.stdout or "Excel COM save failed")

payload = json.loads(sys.stdin.read() or "{}")
folder = payload.get("folder") or r"${defaultWorkbookFolder}"
path = find_workbook(folder)
action = payload.get("action")

if action == "read":
    header_row = int(payload.get("headerRow") or 2)
    max_col = int(payload.get("maxCol") or 21)
    limit = int(payload.get("limit") or 250)
    with zipfile.ZipFile(path) as zf:
        shared_strings = read_shared_strings(zf)
        sheets = get_sheet_paths(zf)
        if not sheets:
            raise FileNotFoundError("No worksheet files found in workbook")
        sheet, parsed_rows = find_order_sheet(zf, sheets, shared_strings, max_col)
    headers = parsed_rows.get(header_row, [""] * max_col)
    headers = [value or f"Column {index + 1}" for index, value in enumerate(headers)]
    normalized_rows = normalize_rows(parsed_rows, headers)
    rows = normalized_rows[-limit:]
    print(json.dumps({
        "ok": True,
        "workbookPath": str(path),
        "workbookName": path.name,
        "sheetName": sheet["name"],
        "locked": is_locked(path),
        "headerRow": header_row,
        "headers": headers,
        "rows": rows,
        "totalRows": len(normalized_rows),
        "maxRow": max(parsed_rows) if parsed_rows else 0,
        "maxColumn": max_col,
    }, ensure_ascii=False))
elif action == "update":
    if is_locked(path):
        raise PermissionError("Workbook appears to be open in Excel. Close Excel before saving admin edits.")
    row_number = int(payload["rowNumber"])
    column_index = int(payload["columnIndex"])
    value = payload.get("value", "")
    if row_number <= 2 or column_index <= 0:
        raise ValueError("Invalid target cell")
    sheet_name = payload.get("sheet") or "Sheet1"
    update_with_excel_com(path, sheet_name, row_number, column_index, value)
    print(json.dumps({
        "ok": True,
        "workbookPath": str(path),
        "workbookName": path.name,
        "sheetName": sheet_name,
        "rowNumber": row_number,
        "columnIndex": column_index,
        "value": value,
    }, ensure_ascii=False))
else:
    raise ValueError("Unsupported action")
`;

  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const child = execFile(
      pythonPath,
      ["-c", bridgeCode],
      {
        env: {
          ...process.env,
          PYTHONIOENCODING: "utf-8",
        },
        maxBuffer: 20 * 1024 * 1024,
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
          return;
        }

        try {
          resolve(JSON.parse(stdout));
        } catch {
          reject(new Error(stdout || "Workbook bridge returned invalid JSON"));
        }
      },
    );

    child.stdin?.end(JSON.stringify({ action, ...payload }));
  });
}

router.get("/admin/order-list", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const data = await runWorkbookBridge("read", {
      folder: process.env.SUNNYKR_ORDERLIST_FOLDER ?? defaultWorkbookFolder,
      limit: Number(req.query.limit ?? 250),
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to read order list workbook",
    });
  }
});

router.patch("/admin/order-list/cell", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const data = await runWorkbookBridge("update", {
      columnIndex: req.body?.columnIndex,
      folder: process.env.SUNNYKR_ORDERLIST_FOLDER ?? defaultWorkbookFolder,
      rowNumber: req.body?.rowNumber,
      sheet: req.body?.sheet,
      value: req.body?.value ?? "",
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to update order list workbook",
    });
  }
});

export default router;
