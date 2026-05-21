import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Boxes,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  LockKeyhole,
  MailCheck,
  PackageCheck,
  PackageSearch,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  Upload,
  Warehouse,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import sunnyLogo from "@assets/image_1775118121182.png";

const defaultFavoriteIds = ["rfq-quotes", "inventory-stocks", "hotlist", "ar-iou"];
const favoriteStorageKey = "sunny-admin-favorite-tools-v2";
const activeToolStorageKey = "sunny-admin-active-tool-v1";
const arStorageKey = "sunny-admin-ar-customers-2026-may-v1";
const inventoryStorageKey = "sunny-admin-inventory-stock-v1";
const salesReportStorageKey = "sunny-admin-sales-report-forecast-v1";
const krwPerUsd = 1350;

const adminTools = [
  { id: "rfq-quotes", label: "RFQ / Quotes", delta: "Quote queue and pricing follow-up", tone: "text-sky-700 bg-sky-50 border-sky-200", icon: <ClipboardList className="h-5 w-5" />, navIcon: <ClipboardList className="h-4 w-4" /> },
  { id: "inventory-stocks", label: "Inventory-Stocks", delta: "Stock checks and part availability", tone: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: <Warehouse className="h-5 w-5" />, navIcon: <Warehouse className="h-4 w-4" /> },
  { id: "hotlist", label: "Reporting, Forecast, Review", delta: "Sales history, forecast, and review", tone: "text-violet-700 bg-violet-50 border-violet-200", icon: <BarChart3 className="h-5 w-5" />, navIcon: <BarChart3 className="h-4 w-4" /> },
  { id: "ar-iou", label: "A/R - IOU", delta: "Receivables, IOUs, and follow-up", tone: "text-rose-700 bg-rose-50 border-rose-200", icon: <CircleDollarSign className="h-5 w-5" />, navIcon: <CircleDollarSign className="h-4 w-4" /> },
  { id: "po-status", label: "PO Status", delta: "Purchase order tracking and status", tone: "text-indigo-700 bg-indigo-50 border-indigo-200", icon: <PackageCheck className="h-5 w-5" />, navIcon: <PackageCheck className="h-4 w-4" /> },
  { id: "documents", label: "Documents", delta: "Files, templates, and shared records", tone: "text-slate-700 bg-slate-50 border-slate-200", icon: <FileText className="h-5 w-5" />, navIcon: <FileText className="h-4 w-4" /> },
  { id: "vendors", label: "Vendors", delta: "Vendor access and follow-up", tone: "text-teal-700 bg-teal-50 border-teal-200", icon: <ShieldCheck className="h-5 w-5" />, navIcon: <ShieldCheck className="h-4 w-4" /> },
  { id: "history", label: "History", delta: "Recent work and audit trail", tone: "text-violet-700 bg-violet-50 border-violet-200", icon: <History className="h-5 w-5" />, navIcon: <History className="h-4 w-4" /> },
];

type ArCustomer = {
  id: string;
  company: string;
  amountDue: number;
  dueDate: string;
  receivedDate: string;
  memo: string;
  focus: boolean;
  contactEmail: string;
};

type InventoryRow = {
  id: string;
  partNumber: string;
  description: string;
  qtyAvailable: number;
  location: string;
  leadTime: string;
  status: string;
  customerVisible: boolean;
};

type SalesReportRow = {
  id: string;
  date: string;
  company: string;
  modelType: string;
  partNumber: string;
  partType: string;
  frequency: string;
  qty: number;
  buyPriceUsd: number;
  soldPriceUsd: number;
  buyPriceKrw: number;
  soldPriceKrw: number;
};

type ReportView = "date" | "company" | "model" | "frequency" | "qty";

const reportViews: Array<{ id: ReportView; label: string }> = [
  { id: "date", label: "Date" },
  { id: "company", label: "Company name" },
  { id: "model", label: "Model type" },
  { id: "frequency", label: "Frequency" },
  { id: "qty", label: "Qty" },
];

type ArEmailDraftType = "first-reminder" | "paid-thank-you" | "payment-document" | "manual-blank";

const arEmailDraftOptions: Array<{ id: ArEmailDraftType; label: string }> = [
  { id: "first-reminder", label: "Auto generated - 1st reminder" },
  { id: "paid-thank-you", label: "Friendly reminder / paid thank you" },
  { id: "payment-document", label: "Please check payment document" },
  { id: "manual-blank", label: "Blank manual email with signature" },
];

const defaultArCustomers: ArCustomer[] = [
  { id: "ar-2026-may-001", company: "SAGA", amountDue: 4486, dueDate: "2026-05-04", receivedDate: "2026-05-04", memo: "입금 완료", focus: false, contactEmail: "" },
  { id: "ar-2026-may-002", company: "UNIPOWER", amountDue: 378, dueDate: "2026-05-04", receivedDate: "2026-05-04", memo: "입금 완료", focus: false, contactEmail: "" },
  { id: "ar-2026-may-003", company: "INELTRO AG", amountDue: 7079.5, dueDate: "2026-05-06", receivedDate: "2026-05-06", memo: "입금 완료", focus: false, contactEmail: "" },
  { id: "ar-2026-may-004", company: "GPV-Lanka", amountDue: 2850, dueDate: "2026-05-31", receivedDate: "2026-05-08", memo: "신규 거래처 선입금", focus: false, contactEmail: "" },
  { id: "ar-2026-may-005", company: "TME", amountDue: 300, dueDate: "2026-05-31", receivedDate: "2026-05-08", memo: "신규 거래처 선입금", focus: false, contactEmail: "" },
  { id: "ar-2026-may-006", company: "Dove Electronic Components, Inc", amountDue: 2465, dueDate: "2026-05-31", receivedDate: "2026-05-11", memo: "입금 완료", focus: false, contactEmail: "" },
  { id: "ar-2026-may-007", company: "The J Fischer Company LLC.", amountDue: 8040, dueDate: "2026-05-31", receivedDate: "2026-05-18", memo: "입금 완료", focus: false, contactEmail: "" },
  { id: "ar-2026-may-008", company: "HITACHI-Malaysia", amountDue: 1560, dueDate: "2026-05-31", receivedDate: "2026-05-18", memo: "입금 완료", focus: false, contactEmail: "" },
  { id: "ar-2026-may-009", company: "TSMT", amountDue: 6090, dueDate: "2026-05-31", receivedDate: "2026-05-18", memo: "입금 완료", focus: false, contactEmail: "" },
  { id: "ar-2026-may-010", company: "GPV SUZHOU", amountDue: 263.4, dueDate: "2026-05-31", receivedDate: "", memo: "업체 동향 파악 및 입금 일정 안내, 일정 준수 요청", focus: true, contactEmail: "" },
  { id: "ar-2026-may-011", company: "INELTEK GMBH", amountDue: 5729, dueDate: "2026-05-31", receivedDate: "", memo: "SX-21 16MHz 견적 회신 및 입금 일정 안내", focus: true, contactEmail: "" },
  { id: "ar-2026-may-012", company: "2B", amountDue: 3878.75, dueDate: "2026-05-31", receivedDate: "", memo: "통신장비 적용 SCO-32 50MHz 외 소요량 확인 및 입금 일정 안내", focus: true, contactEmail: "" },
  { id: "ar-2026-may-013", company: "CHANNEL", amountDue: 390, dueDate: "2026-05-31", receivedDate: "", memo: "SX-8 16MHz 견적 회신 및 입금 일정 안내", focus: true, contactEmail: "" },
];

const rfqs = [
  { id: "RFQ-260506-014", company: "Approved Vendor A", handler: "Verified contact", item: "SX-32 32.768 kHz", qty: "Private", status: "Engineering review", priority: "High", age: "2h" },
  { id: "RFQ-260506-013", company: "Approved Vendor B", handler: "Verified contact", item: "ATS Series 26 MHz", qty: "Private", status: "Pricing", priority: "Normal", age: "4h" },
  { id: "RFQ-260505-028", company: "Pending Vendor", handler: "Email verification", item: "QA document request", qty: "N/A", status: "Access review", priority: "High", age: "1d" },
  { id: "RFQ-260505-021", company: "Approved Vendor C", handler: "Verified contact", item: "SX-1 24 MHz", qty: "Private", status: "Quote ready", priority: "Normal", age: "1d" },
];

const poRows = [
  { po: "orderlist 26.05.06.xlsx", company: "04_Documents_SPA_Private", part: "PO-List 2020~current", etd: "Private workbook", stage: "SPA only", value: "No public URL" },
  { po: "sourcing schedule 26.05.06.xlsx", company: "04_Documents_SPA_Private", part: "Sheet3", etd: "Private workbook", stage: "SPA only", value: "No public URL" },
  { po: "08_OrderList_Stock_Pricing", company: "Internal operations", part: "Order, stock, pricing, lead time", etd: "Confidential", stage: "Internal only", value: "Never publish" },
];

const defaultInventoryRows: InventoryRow[] = [
  { id: "stock-001", partNumber: "SX-32 32.768 kHz", description: "Crystal stock check sample", qtyAvailable: 1200, location: "Sunny stock", leadTime: "Ready", status: "Publishable", customerVisible: true },
  { id: "stock-002", partNumber: "ATS Series 26 MHz", description: "RFQ follow-up item", qtyAvailable: 340, location: "Vendor confirm", leadTime: "Check daily", status: "Review", customerVisible: false },
  { id: "stock-003", partNumber: "SX-1 24 MHz", description: "Customer inquiry stock", qtyAvailable: 0, location: "Need sourcing", leadTime: "TBD", status: "Needs update", customerVisible: false },
  { id: "stock-004", partNumber: "SCO-32 50 MHz", description: "Reporting review related part", qtyAvailable: 85, location: "Private workbook", leadTime: "Internal only", status: "SPA only", customerVisible: false },
];

const defaultSalesRows: SalesReportRow[] = [
  { id: "sale-001", date: "2026-01-08", company: "Approved Customer A", modelType: "SX", partNumber: "SX-32", partType: "Crystal", frequency: "32.768 kHz", qty: 1200, buyPriceUsd: 0.18, soldPriceUsd: 0.32, buyPriceKrw: 243, soldPriceKrw: 432 },
  { id: "sale-002", date: "2026-02-14", company: "Approved Customer B", modelType: "ATS", partNumber: "ATS-26", partType: "Oscillator", frequency: "26 MHz", qty: 540, buyPriceUsd: 0.82, soldPriceUsd: 1.25, buyPriceKrw: 1107, soldPriceKrw: 1688 },
  { id: "sale-003", date: "2026-03-06", company: "Approved Customer A", modelType: "SX", partNumber: "SX-1", partType: "Crystal", frequency: "24 MHz", qty: 780, buyPriceUsd: 0.21, soldPriceUsd: 0.38, buyPriceKrw: 284, soldPriceKrw: 513 },
  { id: "sale-004", date: "2026-03-28", company: "Approved Customer C", modelType: "SCO", partNumber: "SCO-32", partType: "Oscillator", frequency: "50 MHz", qty: 260, buyPriceUsd: 1.1, soldPriceUsd: 1.7, buyPriceKrw: 1485, soldPriceKrw: 2295 },
  { id: "sale-005", date: "2026-04-18", company: "Approved Customer B", modelType: "SX", partNumber: "SX-8", partType: "Crystal", frequency: "16 MHz", qty: 920, buyPriceUsd: 0.2, soldPriceUsd: 0.35, buyPriceKrw: 270, soldPriceKrw: 473 },
];

const activity = [
  { icon: <MailCheck className="h-4 w-4" />, text: "SPA request requires email verification before admin review", time: "Access plan" },
  { icon: <FileCheck2 className="h-4 w-4" />, text: "Public files must be inspected before publishing to SunnyKR.com", time: "Checklist" },
  { icon: <CircleDollarSign className="h-4 w-4" />, text: "Pricing, stock, order, and lead-time files stay internal only", time: "Security" },
  { icon: <LockKeyhole className="h-4 w-4" />, text: "Private SPA downloads require expiring signed URLs and audit logs", time: "Requirement" },
];

const adminTemplates = [
  {
    name: "RFQ Quote Unit Price Log Template",
    file: "SunnyKR_RFQ_Quote_Template_EN.xlsx",
    folder: "04_Documents_SPA_Private",
    path: "C:\\Users\\admin\\Documents\\New project\\SunnyKR_Project_Files\\04_Documents_SPA_Private\\SunnyKR_RFQ_Quote_Template_EN.xlsx",
    summary: "Fresh English admin template for tracking customer RFQ quote price, sourcing cost, quoted unit price, and sales profit margin.",
    status: "Admin only",
  },
];

const chartData = [
  { day: "Thu", rfq: 14, po: 18 },
  { day: "Fri", rfq: 21, po: 17 },
  { day: "Sat", rfq: 9, po: 12 },
  { day: "Sun", rfq: 7, po: 10 },
  { day: "Mon", rfq: 24, po: 23 },
  { day: "Tue", rfq: 31, po: 28 },
  { day: "Wed", rfq: 18, po: 42 },
];

function statusClass(status: string) {
  if (status === "Low" || status === "QA hold" || status === "Internal only") return "border-rose-200 bg-rose-50 text-rose-700";
  if (status === "Needs update" || status === "Short" || status === "Out of stock") return "border-rose-200 bg-rose-50 text-rose-700";
  if (status === "Tight" || status === "Engineering review" || status === "SPA only" || status === "Review") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "Quote ready" || status === "Healthy" || status === "Publishable" || status === "Ready") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && nextCharacter === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      inQuotes = !inQuotes;
    } else if (character === "," && !inQuotes) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += character;
    }
  }

  cells.push(cell.trim());
  return cells;
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function readCsvCell(row: string[], headers: string[], possibleNames: string[], fallbackIndex: number) {
  const normalizedNames = possibleNames.map(normalizeHeader);
  const matchedIndex = headers.findIndex((header) => normalizedNames.includes(header));
  return row[matchedIndex >= 0 ? matchedIndex : fallbackIndex] || "";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatKrw(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    currency: "KRW",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function parseMoney(value: string) {
  return Number(value.replace(/[$,\s₩]/g, "")) || 0;
}

function getUsdLineTotal(row: SalesReportRow) {
  const unitSoldUsd = row.soldPriceUsd || row.soldPriceKrw / krwPerUsd;
  return unitSoldUsd * row.qty;
}

function getUsdProfit(row: SalesReportRow) {
  const unitSoldUsd = row.soldPriceUsd || row.soldPriceKrw / krwPerUsd;
  const unitBuyUsd = row.buyPriceUsd || row.buyPriceKrw / krwPerUsd;
  return (unitSoldUsd - unitBuyUsd) * row.qty;
}

function getKrwLineTotal(row: SalesReportRow) {
  const unitSoldKrw = row.soldPriceKrw || row.soldPriceUsd * krwPerUsd;
  return unitSoldKrw * row.qty;
}

function getReportKey(row: SalesReportRow, reportView: ReportView) {
  if (reportView === "date") return row.date || "No date";
  if (reportView === "company") return row.company || "No company";
  if (reportView === "model") return row.modelType || "No model";
  if (reportView === "frequency") return row.frequency || "No frequency";
  if (reportView === "qty") {
    if (row.qty >= 1000) return "1,000+ pcs";
    if (row.qty >= 500) return "500-999 pcs";
    if (row.qty >= 100) return "100-499 pcs";
    return "Under 100 pcs";
  }
  return "Review";
}

function getArEmailSubject(templateType: ArEmailDraftType) {
  if (templateType === "payment-document") return "Sunny Electronics A/R Payment Document Request";
  if (templateType === "manual-blank") return "Sunny Electronics";
  return "Sunny Electronics A/R Reminder";
}

function getArEmailDraft(customer: ArCustomer, templateType: ArEmailDraftType) {
  const amount = formatMoney(customer.amountDue);
  const dueDate = customer.dueDate || "current due date";

  if (templateType === "paid-thank-you") {
    return `Hello ${customer.company},

This is a friendly Sunny Electronics reminder for the current A/R balance of ${amount}, due ${dueDate}.

If payment has already been made, thank you. Please send the payment detail or remittance copy so we can update our records.

Thank you,
Sunny Electronics Corp.`;
  }

  if (templateType === "payment-document") {
    return `Hello ${customer.company},

Please help us check this open A/R item for ${amount}, due ${dueDate}. We need the payment update or payment document so we can remove it from the current due list and avoid late status.

Thank you,
Sunny Electronics Corp.`;
  }

  if (templateType === "manual-blank") {
    return `Hello ${customer.company},



Thank you,
Sunny Electronics Corp.`;
  }

  return `Hello ${customer.company},

This is a friendly first-of-the-month reminder for Sunny Electronics A/R. Our records show ${amount}, due ${dueDate}.

Please help confirm the planned payment date when available.

Thank you,
Sunny Electronics Corp.`;
}

export default function SpaAdmin() {
  const [authStatus, setAuthStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");
  const [adminUser, setAdminUser] = useState<{ name?: string; role: string; username: string } | null>(null);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("All");
  const [activeToolId, setActiveToolId] = useState(() => {
    if (typeof window === "undefined") return defaultFavoriteIds[0];

    const savedToolId = window.localStorage.getItem(activeToolStorageKey);
    return savedToolId && adminTools.some((tool) => tool.id === savedToolId) ? savedToolId : defaultFavoriteIds[0];
  });
  const [favoriteIds, setFavoriteIds] = useState(() => {
    if (typeof window === "undefined") return defaultFavoriteIds;

    try {
      const savedFavorites = window.localStorage.getItem(favoriteStorageKey);
      if (!savedFavorites) return defaultFavoriteIds;

      const parsed = JSON.parse(savedFavorites);
      if (!Array.isArray(parsed)) return defaultFavoriteIds;

      const validIds = parsed.filter((id): id is string => adminTools.some((tool) => tool.id === id));
      return [...validIds, ...defaultFavoriteIds.filter((id) => !validIds.includes(id))].slice(0, 4);
    } catch {
      return defaultFavoriteIds;
    }
  });
  const [draggedToolId, setDraggedToolId] = useState<string | null>(null);
  const [arCustomers, setArCustomers] = useState<ArCustomer[]>(() => {
    if (typeof window === "undefined") return defaultArCustomers;

    try {
      const savedCustomers = window.localStorage.getItem(arStorageKey);
      if (!savedCustomers) return defaultArCustomers;

      const parsed = JSON.parse(savedCustomers);
      if (!Array.isArray(parsed)) return defaultArCustomers;

      return parsed.map((customer, index) => ({
        id: String(customer.id || `ar-${index + 1}`),
        company: String(customer.company || "Unnamed customer"),
        amountDue: Number(customer.amountDue || 0),
        dueDate: String(customer.dueDate || ""),
        receivedDate: String(customer.receivedDate || ""),
        memo: String(customer.memo || ""),
        focus: Boolean(customer.focus),
        contactEmail: String(customer.contactEmail || ""),
      }));
    } catch {
      return defaultArCustomers;
    }
  });
  const [emailDraftCustomerId, setEmailDraftCustomerId] = useState<string | null>(null);
  const [emailDraftTypes, setEmailDraftTypes] = useState<Record<string, ArEmailDraftType>>({});
  const [inventoryRows, setInventoryRows] = useState<InventoryRow[]>(() => {
    if (typeof window === "undefined") return defaultInventoryRows;

    try {
      const savedInventoryRows = window.localStorage.getItem(inventoryStorageKey);
      if (!savedInventoryRows) return defaultInventoryRows;

      const parsed = JSON.parse(savedInventoryRows);
      if (!Array.isArray(parsed)) return defaultInventoryRows;

      return parsed.map((row, index) => ({
        id: String(row.id || `stock-${index + 1}`),
        partNumber: String(row.partNumber || row.part || "Unnamed part"),
        description: String(row.description || row.package || ""),
        qtyAvailable: Number(row.qtyAvailable || row.qty || row.stock || 0),
        location: String(row.location || ""),
        leadTime: String(row.leadTime || row.leadtime || ""),
        status: String(row.status || "Review"),
        customerVisible: Boolean(row.customerVisible),
      }));
    } catch {
      return defaultInventoryRows;
    }
  });
  const [salesRows, setSalesRows] = useState<SalesReportRow[]>(() => {
    if (typeof window === "undefined") return defaultSalesRows;

    try {
      const savedSalesRows = window.localStorage.getItem(salesReportStorageKey);
      if (!savedSalesRows) return defaultSalesRows;

      const parsed = JSON.parse(savedSalesRows);
      if (!Array.isArray(parsed)) return defaultSalesRows;

      return parsed.map((row, index) => ({
        id: String(row.id || `sale-${index + 1}`),
        date: String(row.date || ""),
        company: String(row.company || "Unnamed company"),
        modelType: String(row.modelType || row.model || ""),
        partNumber: String(row.partNumber || row.part || ""),
        partType: String(row.partType || row.type || ""),
        frequency: String(row.frequency || ""),
        qty: Number(row.qty || row.quantity || 0),
        buyPriceUsd: Number(row.buyPriceUsd || row.buyUsd || 0),
        soldPriceUsd: Number(row.soldPriceUsd || row.soldUsd || 0),
        buyPriceKrw: Number(row.buyPriceKrw || row.buyKrw || 0),
        soldPriceKrw: Number(row.soldPriceKrw || row.soldKrw || 0),
      }));
    } catch {
      return defaultSalesRows;
    }
  });
  const [reportQuery, setReportQuery] = useState("");
  const [reportView, setReportView] = useState<ReportView>("date");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/auth/session", {
      credentials: "include",
    })
      .then(async (response) => {
        if (cancelled) return;

        if (!response.ok) {
          setAuthStatus("unauthenticated");
          return;
        }

        const body = await response.json().catch(() => null);
        setAdminUser(body?.user ?? null);
        setAuthStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        setAuthStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRfqs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rfqs.filter((rfq) => {
      const matchesMode = mode === "All" || rfq.priority === mode;
      const matchesQuery =
        normalizedQuery === "" ||
        Object.values(rfq).join(" ").toLowerCase().includes(normalizedQuery);

      return matchesMode && matchesQuery;
    });
  }, [mode, query]);

  const favoriteTools = useMemo(() => {
    return favoriteIds
      .map((id) => adminTools.find((tool) => tool.id === id))
      .filter((tool): tool is (typeof adminTools)[number] => Boolean(tool));
  }, [favoriteIds]);

  const otherTools = useMemo(() => {
    return adminTools.filter((tool) => !favoriteIds.includes(tool.id));
  }, [favoriteIds]);

  const openTool = (toolId: string) => {
    if (!adminTools.some((tool) => tool.id === toolId)) return;

    setActiveToolId(toolId);
    window.localStorage.setItem(activeToolStorageKey, toolId);
  };

  const refreshCurrentTool = () => {
    window.localStorage.setItem(activeToolStorageKey, activeToolId);
    window.location.reload();
  };

  const promoteFavorite = (toolId: string | null) => {
    if (!toolId || !adminTools.some((tool) => tool.id === toolId)) return;

    openTool(toolId);
    setFavoriteIds((currentFavorites) => {
      const nextFavorites = [toolId, ...currentFavorites.filter((id) => id !== toolId)].slice(0, 4);
      window.localStorage.setItem(favoriteStorageKey, JSON.stringify(nextFavorites));
      return nextFavorites;
    });
  };

  const receivedCount = arCustomers.filter((customer) => Boolean(customer.receivedDate)).length;
  const arProgress = arCustomers.length === 0 ? 0 : Math.round((receivedCount / arCustomers.length) * 100);
  const arTotalDue = arCustomers.reduce((total, customer) => total + customer.amountDue, 0);
  const arOpenDue = arCustomers
    .filter((customer) => !customer.receivedDate)
    .reduce((total, customer) => total + customer.amountDue, 0);
  const customerVisibleInventoryCount = inventoryRows.filter((row) => row.customerVisible).length;
  const needsInventoryUpdateCount = inventoryRows.filter((row) => (
    row.qtyAvailable <= 0 || ["Needs update", "Short", "Out of stock"].includes(row.status)
  )).length;
  const filteredSalesRows = useMemo(() => {
    const normalizedQuery = reportQuery.trim().toLowerCase();
    if (!normalizedQuery) return salesRows;

    return salesRows.filter((row) => (
      [
        row.date,
        row.company,
        row.modelType,
        row.partNumber,
        row.partType,
        row.frequency,
        String(row.qty),
      ].join(" ").toLowerCase().includes(normalizedQuery)
    ));
  }, [reportQuery, salesRows]);
  const totalSalesQty = filteredSalesRows.reduce((total, row) => total + row.qty, 0);
  const totalSalesUsd = filteredSalesRows.reduce((total, row) => total + getUsdLineTotal(row), 0);
  const totalSalesKrw = filteredSalesRows.reduce((total, row) => total + getKrwLineTotal(row), 0);
  const totalSalesProfit = filteredSalesRows.reduce((total, row) => total + getUsdProfit(row), 0);
  const reportGroupRows = useMemo(() => {
    const groups = new Map<string, { key: string; qty: number; usd: number; profit: number; count: number }>();

    filteredSalesRows.forEach((row) => {
      const key = getReportKey(row, reportView);
      const current = groups.get(key) ?? { key, qty: 0, usd: 0, profit: 0, count: 0 };
      current.qty += row.qty;
      current.usd += getUsdLineTotal(row);
      current.profit += getUsdProfit(row);
      current.count += 1;
      groups.set(key, current);
    });

    return Array.from(groups.values()).sort((left, right) => right.usd - left.usd).slice(0, 8);
  }, [filteredSalesRows, reportView]);
  const topSalesRow = reportGroupRows[0];

  const saveArCustomers = (nextCustomers: ArCustomer[]) => {
    setArCustomers(nextCustomers);
    window.localStorage.setItem(arStorageKey, JSON.stringify(nextCustomers));
  };

  const updateArCustomer = (customerId: string, update: Partial<ArCustomer>) => {
    saveArCustomers(arCustomers.map((customer) => (
      customer.id === customerId ? { ...customer, ...update } : customer
    )));
  };

  const updateArReceivedDate = (customerId: string, receivedDate: string) => {
    updateArCustomer(
      customerId,
      receivedDate
        ? { focus: false, memo: "입금 완료", receivedDate }
        : { receivedDate },
    );
  };

  const saveInventoryRows = (nextRows: InventoryRow[]) => {
    setInventoryRows(nextRows);
    window.localStorage.setItem(inventoryStorageKey, JSON.stringify(nextRows));
  };

  const updateInventoryRow = (rowId: string, update: Partial<InventoryRow>) => {
    saveInventoryRows(inventoryRows.map((row) => (
      row.id === rowId ? { ...row, ...update } : row
    )));
  };

  const saveSalesRows = (nextRows: SalesReportRow[]) => {
    setSalesRows(nextRows);
    window.localStorage.setItem(salesReportStorageKey, JSON.stringify(nextRows));
  };

  const handleSalesUpload = (file: File | undefined) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      if (lines.length === 0) return;

      const firstRow = parseCsvLine(lines[0]);
      const firstRowLooksLikeHeader = firstRow.some((cell) => (
        ["date", "company", "customer", "model", "frequency", "qty", "quantity", "sold price"].includes(cell.toLowerCase().trim())
      ));
      const headers = firstRowLooksLikeHeader ? firstRow.map(normalizeHeader) : [];
      const dataLines = firstRowLooksLikeHeader ? lines.slice(1) : lines;
      const uploadedRows = dataLines.map((line, index) => {
        const row = parseCsvLine(line);

        return {
          id: `sale-upload-${Date.now()}-${index}`,
          date: readCsvCell(row, headers, ["date", "sold date", "invoice date", "order date"], 0),
          company: readCsvCell(row, headers, ["company", "company name", "customer", "customer name"], 1) || `Uploaded Company ${index + 1}`,
          modelType: readCsvCell(row, headers, ["model", "model type", "series"], 2),
          partNumber: readCsvCell(row, headers, ["part", "part number", "partnumber", "item", "mpn"], 3),
          partType: readCsvCell(row, headers, ["part type", "type", "category", "essential part type"], 4),
          frequency: readCsvCell(row, headers, ["frequency", "freq"], 5),
          qty: Number(readCsvCell(row, headers, ["qty", "quantity", "pcs"], 6).replace(/,/g, "")) || 0,
          buyPriceUsd: parseMoney(readCsvCell(row, headers, ["buy price usd", "buy usd", "cost usd", "unit cost usd"], 7)),
          soldPriceUsd: parseMoney(readCsvCell(row, headers, ["sold price usd", "sell price usd", "sold usd", "unit sold usd", "unit price usd"], 8)),
          buyPriceKrw: parseMoney(readCsvCell(row, headers, ["buy price krw", "buy krw", "cost krw", "unit cost krw"], 9)),
          soldPriceKrw: parseMoney(readCsvCell(row, headers, ["sold price krw", "sell price krw", "sold krw", "unit sold krw", "unit price krw"], 10)),
        };
      });

      saveSalesRows(uploadedRows);
      openTool("hotlist");
    };
    reader.readAsText(file);
  };

  const handleInventoryUpload = (file: File | undefined) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      if (lines.length === 0) return;

      const firstRow = parseCsvLine(lines[0]);
      const firstRowLooksLikeHeader = firstRow.some((cell) => (
        ["part", "part number", "item", "description", "qty", "stock", "status"].includes(cell.toLowerCase().trim())
      ));
      const headers = firstRowLooksLikeHeader ? firstRow.map(normalizeHeader) : [];
      const dataLines = firstRowLooksLikeHeader ? lines.slice(1) : lines;
      const uploadedRows = dataLines.map((line, index) => {
        const row = parseCsvLine(line);
        const qty = Number(readCsvCell(row, headers, ["qty", "quantity", "stock", "available", "qty available"], 2).replace(/,/g, "")) || 0;
        const status = readCsvCell(row, headers, ["status", "condition", "publish status"], 5) || (qty > 0 ? "Review" : "Needs update");
        const customerVisible = ["1", "true", "yes", "y", "public", "customer", "publishable"].includes(
          readCsvCell(row, headers, ["customer visible", "public", "publish", "show"], 6).toLowerCase(),
        );

        return {
          id: `stock-upload-${Date.now()}-${index}`,
          partNumber: readCsvCell(row, headers, ["part", "part number", "partnumber", "item", "mpn"], 0) || `Uploaded Part ${index + 1}`,
          description: readCsvCell(row, headers, ["description", "desc", "package", "note"], 1),
          qtyAvailable: qty,
          location: readCsvCell(row, headers, ["location", "warehouse", "source"], 3),
          leadTime: readCsvCell(row, headers, ["lead time", "leadtime", "eta", "availability"], 4),
          status,
          customerVisible,
        };
      });

      saveInventoryRows(uploadedRows);
      openTool("inventory-stocks");
    };
    reader.readAsText(file);
  };

  const handleArUpload = (file: File | undefined) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const rows = text.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
      if (rows.length === 0) return;

      const firstRow = rows[0].toLowerCase();
      const dataRows = firstRow.includes("company") ? rows.slice(1) : rows;
      const uploadedCustomers = dataRows.map((row, index) => {
        const [company = "", amountDue = "0", dueDate = "", contactEmail = "", focus = ""] = row.split(",").map((cell) => cell.trim());
        return {
          id: `ar-upload-${Date.now()}-${index}`,
          company: company || `Uploaded Customer ${index + 1}`,
          amountDue: Number(amountDue.replace(/[$,]/g, "")) || 0,
          dueDate,
          receivedDate: "",
          memo: "",
          focus: ["1", "true", "yes", "focus", "red"].includes(focus.toLowerCase()),
          contactEmail,
        };
      });

      saveArCustomers(uploadedCustomers);
      setEmailDraftCustomerId(null);
      openTool("ar-iou");
    };
    reader.readAsText(file);
  };

  if (authStatus === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-950">
        <div className="border border-slate-200 bg-white p-6 text-center shadow-sm">
          <LockKeyhole className="mx-auto mb-3 h-7 w-7 text-primary" />
          <div className="font-display text-xl font-bold">Checking admin session</div>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5 text-slate-950">
        <div className="max-w-md border border-slate-200 bg-white p-6 text-center shadow-sm">
          <LockKeyhole className="mx-auto mb-4 h-10 w-10 text-rose-700" />
          <h1 className="mb-3 font-display text-2xl font-bold">Admin login required</h1>
          <p className="mb-6 text-sm leading-6 text-slate-600">
            Sourcing cost, quote margin, and internal RFQ templates are Sunny admin-only.
            Please log in before opening the SPA Admin Portal.
          </p>
          <Link href="/admin-login">
            <Button className="h-11 gap-2">
              <LockKeyhole className="h-4 w-4" />
              Go to Admin Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", {
      credentials: "include",
      method: "POST",
    }).catch(() => null);
    window.location.href = "/admin-login";
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 font-sans">
      <div className="grid min-h-screen lg:grid-cols-[264px_1fr]">
        <aside className="border-r border-slate-200 bg-white">
          <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-5">
            <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-10 w-auto" />
            <div className="min-w-0 leading-tight">
              <div className="font-display text-lg font-bold">Sunny SPA</div>
              <div className="text-xs font-medium text-slate-500">Admin Console</div>
            </div>
          </div>

          <nav className="space-y-4 px-3 py-4">
            <div>
              <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Favorites</div>
              <div className="space-y-1">
                {favoriteTools.map((item, index) => (
                  <button
                    key={item.label}
                    draggable
                    onClick={() => openTool(item.id)}
                    onDragStart={() => setDraggedToolId(item.id)}
                    onDragEnd={() => setDraggedToolId(null)}
                    className={`flex h-11 w-full items-center gap-3 px-3 text-left text-sm font-semibold transition-colors ${
                      item.id === activeToolId
                        ? "border border-slate-200 bg-slate-950 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                    data-testid={`button-admin-nav-${item.id}`}
                  >
                    {item.navIcon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Other tools</div>
              <div className="space-y-1">
                {otherTools.map((item) => (
                  <button
                    key={item.label}
                    draggable
                    onClick={() => promoteFavorite(item.id)}
                    onDragStart={() => setDraggedToolId(item.id)}
                    onDragEnd={() => setDraggedToolId(null)}
                    className="flex h-11 w-full items-center gap-3 px-3 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
                    data-testid={`button-admin-nav-${item.id}`}
                  >
                    {item.navIcon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          <div className="mx-3 mt-3 border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold">
              <LockKeyhole className="h-4 w-4 text-emerald-600" />
              Secure Admin
            </div>
            <p className="text-xs leading-5 text-slate-600">
              Owner-only access now; Sunny member accounts can be added later from private environment config.
            </p>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex min-h-20 flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
              <div className="flex items-center gap-3">
                <Link href="/">
                  <Button variant="outline" size="icon" className="h-10 w-10 bg-white" aria-label="Back to site">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight">SPA Admin Portal</h1>
                  <p className="text-sm text-slate-500">
                    {adminUser?.name || adminUser?.username || "Sunny admin"} | {adminUser?.role || "owner"} access
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex h-10 min-w-0 flex-1 items-center border border-slate-300 bg-slate-50 md:w-80 md:flex-none">
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="h-10 border-0 bg-transparent focus-visible:ring-0"
                    placeholder="Search folder, file, role, document"
                    data-testid="input-admin-search"
                  />
                  <Search className="mr-3 h-4 w-4 shrink-0 text-slate-500" />
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10 bg-white" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button className="h-10 gap-2" onClick={handleLogout} variant="outline">
                  <LockKeyhole className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <section className="px-4 py-5 lg:px-6">
            <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {favoriteTools.map((metric, index) => (
                <article
                  key={metric.label}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    promoteFavorite(draggedToolId);
                    setDraggedToolId(null);
                  }}
                  onClick={() => openTool(metric.id)}
                  className={`cursor-pointer border bg-white p-4 shadow-sm transition-colors hover:border-slate-300 ${
                    metric.id === activeToolId ? "border-slate-950" : "border-slate-200"
                  }`}
                  data-testid={`card-favorite-${metric.id}`}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center border ${metric.tone}`}>
                      {metric.icon}
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{metric.delta}</span>
                  </div>
                  {metric.id === "ar-iou" ? (
                    <>
                      <div className={`font-display text-3xl font-bold ${arProgress === 100 ? "text-emerald-700" : "text-rose-700"}`}>
                        {arProgress}%
                      </div>
                      <div className="mt-2 h-2 bg-slate-100">
                        <div
                          className={`h-2 ${arProgress === 100 ? "bg-emerald-600" : "bg-rose-600"}`}
                          style={{ width: `${arProgress}%` }}
                        />
                      </div>
                      <div className="mt-2 text-sm text-slate-600">{metric.label}</div>
                      <div className="mt-2 text-sm text-slate-600">{receivedCount}/{arCustomers.length} collected</div>
                    </>
                  ) : metric.id === "inventory-stocks" ? (
                    <>
                      <div className="font-display text-3xl font-bold">{inventoryRows.length}</div>
                      <div className="mt-1 text-sm text-slate-600">{metric.label}</div>
                      <div className="mt-2 text-sm text-slate-600">{needsInventoryUpdateCount} need update</div>
                    </>
                  ) : metric.id === "hotlist" ? (
                    <>
                      <div className="font-display text-3xl font-bold">{salesRows.length}</div>
                      <div className="mt-1 text-sm text-slate-600">{metric.label}</div>
                      <div className="mt-2 text-sm text-slate-600">{formatMoney(salesRows.reduce((total, row) => total + getUsdLineTotal(row), 0))} sales</div>
                    </>
                  ) : (
                    <>
                      <div className="font-display text-3xl font-bold">{index + 1}</div>
                      <div className="mt-1 text-sm text-slate-600">{metric.label}</div>
                    </>
                  )}
                </article>
              ))}
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
              {activeToolId === "ar-iou" ? (
                <section className="border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-4 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="font-display text-xl font-bold">A/R - IOU Monthly Collection</h2>
                      <p className="text-sm text-slate-500">
                        May 2026 list from AR 2026.May.xlsx: date received turns customer green; focus customers stay red until paid.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        className="h-9 gap-2 bg-white"
                        onClick={refreshCurrentTool}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                      </Button>
                      <label className="inline-flex h-9 cursor-pointer items-center gap-2 border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <Upload className="h-4 w-4" />
                        Upload CSV
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          className="hidden"
                          onChange={(event) => handleArUpload(event.target.files?.[0])}
                          data-testid="input-ar-upload"
                        />
                      </label>
                      <Button
                        variant="outline"
                        className="h-9 bg-white"
                        onClick={() => {
                          saveArCustomers(defaultArCustomers);
                          setEmailDraftCustomerId(null);
                        }}
                      >
                        Reset Sample
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-3">
                    <div className="border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-bold uppercase text-slate-500">Collection Meter</div>
                      <div className={`mt-1 font-display text-3xl font-bold ${arProgress === 100 ? "text-emerald-700" : "text-rose-700"}`}>
                        {arProgress}%
                      </div>
                      <div className="mt-2 h-2 bg-white">
                        <div
                          className={`h-2 ${arProgress === 100 ? "bg-emerald-600" : "bg-rose-600"}`}
                          style={{ width: `${arProgress}%` }}
                        />
                      </div>
                    </div>
                    <div className="border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-bold uppercase text-slate-500">Customers Collected</div>
                      <div className="mt-1 font-display text-3xl font-bold">{receivedCount}/{arCustomers.length}</div>
                      <div className="mt-2 text-sm text-slate-500">Green lines are paid</div>
                    </div>
                    <div className="border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-bold uppercase text-slate-500">Open Balance</div>
                      <div className="mt-1 font-display text-3xl font-bold">{formatMoney(arOpenDue)}</div>
                      <div className="mt-2 text-sm text-slate-500">{formatMoney(arTotalDue)} monthly total</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-bold">Customer</th>
                          <th className="px-4 py-3 font-bold">Amount Due</th>
                          <th className="px-4 py-3 font-bold">Due Date</th>
                          <th className="px-4 py-3 font-bold">Date Received</th>
                          <th className="px-4 py-3 font-bold">Memo</th>
                          <th className="px-4 py-3 font-bold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {arCustomers.map((customer) => {
                          const isPaid = Boolean(customer.receivedDate);
                          const emailDraftType = emailDraftTypes[customer.id] ?? "first-reminder";
                          const emailDraft = getArEmailDraft(customer, emailDraftType);
                          const emailSubject = getArEmailSubject(emailDraftType);

                          return (
                            <>
                              <tr
                                key={customer.id}
                                className={`${
                                  isPaid
                                    ? "bg-emerald-50"
                                    : customer.focus
                                      ? "bg-rose-50"
                                      : "hover:bg-slate-50"
                                }`}
                              >
                                <td className="px-4 py-4">
                                  <div className="font-semibold text-slate-950">{customer.company}</div>
                                  <label className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-rose-700">
                                    <input
                                      type="checkbox"
                                      checked={customer.focus}
                                      onChange={(event) => updateArCustomer(customer.id, { focus: event.target.checked })}
                                    />
                                    Focus customer
                                  </label>
                                </td>
                                <td className="px-4 py-4 font-semibold">{formatMoney(customer.amountDue)}</td>
                                <td className="px-4 py-4 text-slate-600">{customer.dueDate || "No date"}</td>
                                <td className="px-4 py-4">
                                  <Input
                                    type="date"
                                    value={customer.receivedDate}
                                    onChange={(event) => updateArReceivedDate(customer.id, event.target.value)}
                                    className="h-9 min-w-36 bg-white"
                                    data-testid={`input-ar-received-${customer.id}`}
                                  />
                                </td>
                                <td className="px-4 py-4">
                                  <Input
                                    value={customer.memo}
                                    onChange={(event) => updateArCustomer(customer.id, { memo: event.target.value })}
                                    placeholder="Memo"
                                    className="h-9 min-w-48 bg-white"
                                    data-testid={`input-ar-memo-${customer.id}`}
                                  />
                                </td>
                                <td className="px-4 py-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 bg-white"
                                    onClick={() => setEmailDraftCustomerId(emailDraftCustomerId === customer.id ? null : customer.id)}
                                  >
                                    Email Draft
                                  </Button>
                                </td>
                              </tr>
                              {emailDraftCustomerId === customer.id && (
                                <tr key={`${customer.id}-email`} className="bg-slate-50">
                                  <td className="px-4 py-4" colSpan={6}>
                                    <div className="relative grid gap-3 pr-10">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-8 w-8 border border-slate-200 bg-white p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                        onClick={() => setEmailDraftCustomerId(null)}
                                        aria-label="Close email draft"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                      <div className="grid gap-2 lg:grid-cols-[220px_1fr] lg:items-center">
                                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500" htmlFor={`select-ar-email-${customer.id}`}>
                                          Draft option
                                        </label>
                                        <div className="relative">
                                          <select
                                            id={`select-ar-email-${customer.id}`}
                                            value={emailDraftType}
                                            onChange={(event) => setEmailDraftTypes((currentTypes) => ({
                                              ...currentTypes,
                                              [customer.id]: event.target.value as ArEmailDraftType,
                                            }))}
                                            className="h-10 w-full appearance-none border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-primary"
                                            data-testid={`select-ar-email-draft-${customer.id}`}
                                          >
                                            {arEmailDraftOptions.map((option) => (
                                              <option key={option.id} value={option.id}>{option.label}</option>
                                            ))}
                                          </select>
                                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                        </div>
                                      </div>
                                      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
                                        <textarea
                                          readOnly
                                          value={emailDraft}
                                          className="min-h-44 w-full border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700"
                                        />
                                        <div className="flex flex-wrap gap-2">
                                          <Button
                                            variant="outline"
                                            className="h-9 bg-white"
                                            onClick={() => navigator.clipboard?.writeText(emailDraft)}
                                          >
                                            Copy Draft
                                          </Button>
                                          <a
                                            className="inline-flex h-9 items-center border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                            href={`mailto:${customer.contactEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailDraft)}`}
                                          >
                                            Open Email
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : activeToolId === "inventory-stocks" ? (
                <section className="border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-4 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="font-display text-xl font-bold">Inventory-Stocks</h2>
                      <p className="text-sm text-slate-500">
                        Upload the latest stock list as CSV. Customer-visible rows can later feed public stock previews after review.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        className="h-9 gap-2 bg-white"
                        onClick={refreshCurrentTool}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                      </Button>
                      <label className="inline-flex h-9 cursor-pointer items-center gap-2 border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <Upload className="h-4 w-4" />
                        Upload CSV
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          className="hidden"
                          onChange={(event) => handleInventoryUpload(event.target.files?.[0])}
                          data-testid="input-inventory-upload"
                        />
                      </label>
                      <Button
                        variant="outline"
                        className="h-9 bg-white"
                        onClick={() => saveInventoryRows(defaultInventoryRows)}
                      >
                        Reset Sample
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-3">
                    <div className="border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-bold uppercase text-slate-500">Inventory Lines</div>
                      <div className="mt-1 font-display text-3xl font-bold">{inventoryRows.length}</div>
                      <div className="mt-2 text-sm text-slate-500">Latest uploaded working list</div>
                    </div>
                    <div className="border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-bold uppercase text-slate-500">Customer Visible</div>
                      <div className="mt-1 font-display text-3xl font-bold text-emerald-700">{customerVisibleInventoryCount}</div>
                      <div className="mt-2 text-sm text-slate-500">Can be reused for public preview later</div>
                    </div>
                    <div className="border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-bold uppercase text-slate-500">Needs Update</div>
                      <div className={`mt-1 font-display text-3xl font-bold ${needsInventoryUpdateCount > 0 ? "text-rose-700" : "text-emerald-700"}`}>
                        {needsInventoryUpdateCount}
                      </div>
                      <div className="mt-2 text-sm text-slate-500">Zero stock or follow-up rows</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-bold">Part / Item</th>
                          <th className="px-4 py-3 font-bold">Description</th>
                          <th className="px-4 py-3 font-bold">Qty</th>
                          <th className="px-4 py-3 font-bold">Location</th>
                          <th className="px-4 py-3 font-bold">Lead Time</th>
                          <th className="px-4 py-3 font-bold">Customer View</th>
                          <th className="px-4 py-3 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inventoryRows.map((row) => (
                          <tr key={row.id} className={row.qtyAvailable <= 0 || row.status === "Needs update" ? "bg-rose-50" : "hover:bg-slate-50"}>
                            <td className="px-4 py-4">
                              <div className="font-semibold text-slate-950">{row.partNumber}</div>
                            </td>
                            <td className="px-4 py-4 text-slate-600">{row.description || "No description"}</td>
                            <td className="px-4 py-4 font-semibold">{row.qtyAvailable.toLocaleString()}</td>
                            <td className="px-4 py-4 text-slate-600">{row.location || "No location"}</td>
                            <td className="px-4 py-4 text-slate-600">{row.leadTime || "No lead time"}</td>
                            <td className="px-4 py-4">
                              <label className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
                                <input
                                  type="checkbox"
                                  checked={row.customerVisible}
                                  onChange={(event) => updateInventoryRow(row.id, { customerVisible: event.target.checked })}
                                />
                                Customer safe
                              </label>
                            </td>
                            <td className="px-4 py-4">
                              <select
                                value={row.status}
                                onChange={(event) => updateInventoryRow(row.id, { status: event.target.value })}
                                className={`h-9 border px-2 text-xs font-bold outline-none ${statusClass(row.status)}`}
                                data-testid={`select-inventory-status-${row.id}`}
                              >
                                {["Publishable", "Ready", "Review", "Needs update", "Short", "Out of stock", "SPA only", "Internal only"].map((status) => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : activeToolId === "hotlist" ? (
                <section className="border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-4 border-b border-slate-200 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h2 className="font-display text-xl font-bold">Reporting, Forecast, Review</h2>
                        <p className="text-sm text-slate-500">
                          Upload sales history as CSV from Excel: date, company, model, frequency, qty, buy price, and sold price.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          className="h-9 gap-2 bg-white"
                          onClick={refreshCurrentTool}
                        >
                          <RefreshCw className="h-4 w-4" />
                          Refresh
                        </Button>
                        <label className="inline-flex h-9 cursor-pointer items-center gap-2 border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                          <Upload className="h-4 w-4" />
                          Upload CSV
                          <input
                            type="file"
                            accept=".csv,text/csv"
                            className="hidden"
                            onChange={(event) => handleSalesUpload(event.target.files?.[0])}
                            data-testid="input-sales-report-upload"
                          />
                        </label>
                        <Button
                          variant="outline"
                          className="h-9 bg-white"
                          onClick={() => saveSalesRows(defaultSalesRows)}
                        >
                          Reset Sample
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-center">
                      <div className="flex h-10 items-center border border-slate-300 bg-slate-50">
                        <Input
                          value={reportQuery}
                          onChange={(event) => setReportQuery(event.target.value)}
                          className="h-10 border-0 bg-transparent focus-visible:ring-0"
                          placeholder="Search date, company, model, frequency, part, qty"
                          data-testid="input-sales-report-search"
                        />
                        <Search className="mr-3 h-4 w-4 shrink-0 text-slate-500" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {reportViews.map((view) => (
                          <button
                            key={view.id}
                            onClick={() => setReportView(view.id)}
                            className={`h-9 border px-3 text-sm font-semibold transition-colors ${
                              reportView === view.id
                                ? "border-slate-950 bg-slate-950 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {view.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-4">
                    <div className="border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-bold uppercase text-slate-500">Sales Lines</div>
                      <div className="mt-1 font-display text-3xl font-bold">{filteredSalesRows.length}</div>
                      <div className="mt-2 text-sm text-slate-500">{salesRows.length} total uploaded</div>
                    </div>
                    <div className="border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-bold uppercase text-slate-500">Qty Sold</div>
                      <div className="mt-1 font-display text-3xl font-bold text-violet-700">{totalSalesQty.toLocaleString()}</div>
                      <div className="mt-2 text-sm text-slate-500">Filtered parts quantity</div>
                    </div>
                    <div className="border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-bold uppercase text-slate-500">Sales Amount</div>
                      <div className="mt-1 font-display text-3xl font-bold">{formatMoney(totalSalesUsd)}</div>
                      <div className="mt-2 text-sm text-slate-500">{formatKrw(totalSalesKrw)}</div>
                    </div>
                    <div className="border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-bold uppercase text-slate-500">Estimated Profit</div>
                      <div className={`mt-1 font-display text-3xl font-bold ${totalSalesProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {formatMoney(totalSalesProfit)}
                      </div>
                      <div className="mt-2 text-sm text-slate-500">Sold minus buy price</div>
                    </div>
                  </div>

                  <div className="grid gap-4 border-b border-slate-200 p-4 lg:grid-cols-[1fr_280px]">
                    <div className="border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-violet-700" />
                        <div className="text-sm font-bold">Report View: {reportViews.find((view) => view.id === reportView)?.label}</div>
                      </div>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={reportGroupRows} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="key" tickLine={false} axisLine={false} fontSize={11} />
                            <YAxis tickLine={false} axisLine={false} fontSize={12} />
                            <Tooltip />
                            <Area type="monotone" dataKey="usd" name="USD sales" stroke="#6d28d9" fill="#ede9fe" strokeWidth={2} />
                            <Area type="monotone" dataKey="profit" name="Profit" stroke="#059669" fill="#d1fae5" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="border border-slate-200 bg-white p-3">
                      <div className="text-xs font-bold uppercase text-slate-500">Forecast Focus</div>
                      <div className="mt-2 font-display text-2xl font-bold">{topSalesRow?.key ?? "No data"}</div>
                      <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <div className="flex justify-between gap-3">
                          <span>Qty</span>
                          <span className="font-semibold text-slate-950">{(topSalesRow?.qty ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span>Sales</span>
                          <span className="font-semibold text-slate-950">{formatMoney(topSalesRow?.usd ?? 0)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span>Profit</span>
                          <span className="font-semibold text-slate-950">{formatMoney(topSalesRow?.profit ?? 0)}</span>
                        </div>
                      </div>
                      <p className="mt-4 text-xs leading-5 text-slate-500">
                        Use the top result to spot parts, frequencies, companies, or qty bands worth preparing for next forecast.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1120px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-bold">Date</th>
                          <th className="px-4 py-3 font-bold">Company</th>
                          <th className="px-4 py-3 font-bold">Model / Part</th>
                          <th className="px-4 py-3 font-bold">Frequency</th>
                          <th className="px-4 py-3 font-bold">Qty</th>
                          <th className="px-4 py-3 font-bold">Buy Price</th>
                          <th className="px-4 py-3 font-bold">Sold Price</th>
                          <th className="px-4 py-3 font-bold">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredSalesRows.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50">
                            <td className="px-4 py-4 text-slate-600">{row.date || "No date"}</td>
                            <td className="px-4 py-4">
                              <div className="font-semibold text-slate-950">{row.company}</div>
                              <div className="text-xs text-slate-500">{row.partType || "No part type"}</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-semibold text-slate-950">{row.modelType || "No model"}</div>
                              <div className="text-xs text-slate-500">{row.partNumber || "No part"}</div>
                            </td>
                            <td className="px-4 py-4 text-slate-600">{row.frequency || "No frequency"}</td>
                            <td className="px-4 py-4 font-semibold">{row.qty.toLocaleString()}</td>
                            <td className="px-4 py-4 text-slate-600">
                              <div>{formatMoney(row.buyPriceUsd || row.buyPriceKrw / krwPerUsd)}</div>
                              <div className="text-xs">{formatKrw(row.buyPriceKrw || row.buyPriceUsd * krwPerUsd)}</div>
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              <div>{formatMoney(row.soldPriceUsd || row.soldPriceKrw / krwPerUsd)}</div>
                              <div className="text-xs">{formatKrw(row.soldPriceKrw || row.soldPriceUsd * krwPerUsd)}</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-semibold text-slate-950">{formatMoney(getUsdLineTotal(row))}</div>
                              <div className="text-xs text-slate-500">{formatKrw(getKrwLineTotal(row))}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : (
              <section className="border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold">RFQ Review Queue</h2>
                    <p className="text-sm text-slate-500">Showing {filteredRfqs.length} masked workflow examples</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {["All", "High", "Normal"].map((option) => (
                      <button
                        key={option}
                        onClick={() => setMode(option)}
                        className={`h-9 border px-3 text-sm font-semibold transition-colors ${
                          mode === option
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                        data-testid={`button-filter-${option.toLowerCase()}`}
                      >
                        {option}
                      </button>
                    ))}
                    <Button variant="outline" className="h-9 gap-2 bg-white">
                      <Filter className="h-4 w-4" />
                      More
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-bold">RFQ</th>
                        <th className="px-4 py-3 font-bold">Requester</th>
                        <th className="px-4 py-3 font-bold">Request / Exposure</th>
                        <th className="px-4 py-3 font-bold">Status</th>
                        <th className="px-4 py-3 font-bold">Age</th>
                        <th className="px-4 py-3 font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRfqs.map((rfq) => (
                        <tr key={rfq.id} className="hover:bg-slate-50">
                          <td className="px-4 py-4">
                            <div className="font-semibold text-slate-950">{rfq.id}</div>
                            <div className="text-xs text-slate-500">{rfq.handler}</div>
                          </td>
                          <td className="px-4 py-4 font-medium">{rfq.company}</td>
                          <td className="px-4 py-4">
                            <div className="font-medium">{rfq.item}</div>
                            <div className="text-xs text-slate-500">{rfq.qty} pcs</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex border px-2 py-1 text-xs font-bold ${statusClass(rfq.status)}`}>
                              {rfq.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-600">{rfq.age}</td>
                          <td className="px-4 py-4">
                            <Button size="sm" variant="outline" className="h-8 bg-white">
                              Open
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              )}

              <aside className="space-y-5">
                <section className="border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-xl font-bold">Weekly Flow</h2>
                  <p className="text-sm text-slate-500">Example admin volume, not public business data</p>
                    </div>
                    <Button variant="outline" size="icon" className="h-9 w-9 bg-white" aria-label="Download chart">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} />
                        <Tooltip />
                        <Area type="monotone" dataKey="po" stroke="#0f766e" fill="#ccfbf1" strokeWidth={2} />
                        <Area type="monotone" dataKey="rfq" stroke="#d97706" fill="#fef3c7" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Clock3 className="h-5 w-5 text-slate-600" />
                    <h2 className="font-display text-xl font-bold">Activity</h2>
                  </div>
                  <div className="space-y-3">
                    {activity.map((item) => (
                      <div key={item.text} className="flex gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center bg-slate-100 text-slate-600">
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-5">{item.text}</p>
                          <p className="text-xs text-slate-500">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="border border-rose-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-rose-700" />
                    <h2 className="font-display text-xl font-bold">Admin Templates</h2>
                  </div>
                  <div className="space-y-4">
                    {adminTemplates.map((template) => (
                      <div key={template.file} className="border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="font-semibold">{template.name}</div>
                          <span className="border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">
                            {template.status}
                          </span>
                        </div>
                        <p className="mb-3 text-sm leading-6 text-slate-600">{template.summary}</p>
                        <div className="mb-3 grid gap-1 text-xs text-slate-600">
                          <div><span className="font-semibold">Folder:</span> {template.folder}</div>
                          <div className="break-all"><span className="font-semibold">File:</span> {template.file}</div>
                          <div className="break-all font-mono text-[11px] text-slate-500">{template.path}</div>
                        </div>
                        <Button variant="outline" className="h-9 gap-2 bg-white" disabled>
                          <Download className="h-4 w-4" />
                          Protected download after admin auth
                        </Button>
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <section className="border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 p-4">
                  <div className="flex items-center gap-2">
                    <Boxes className="h-5 w-5 text-slate-600" />
                    <h2 className="font-display text-xl font-bold">SunnyKR File Zones</h2>
                  </div>
                  <Button variant="outline" className="h-9 gap-2 bg-white">
                    <FileSpreadsheet className="h-4 w-4" />
                    Export
                  </Button>
                </div>
                <div className="divide-y divide-slate-100">
                  {inventoryRows.map((row) => (
                    <div key={row.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                      <div>
                        <div className="font-semibold">{row.partNumber}</div>
                        <div className="text-sm text-slate-500">{row.description || "Inventory stock line"}</div>
                      </div>
                      <div className="text-sm text-slate-600 sm:text-right">
                        <div>{row.qtyAvailable.toLocaleString()} available</div>
                        <div>{row.customerVisible ? "Customer visible" : "Admin only"}</div>
                      </div>
                      <span className={`w-fit border px-2 py-1 text-xs font-bold ${statusClass(row.status)}`}>
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 p-4">
                  <div className="flex items-center gap-2">
                    <PackageSearch className="h-5 w-5 text-slate-600" />
                    <h2 className="font-display text-xl font-bold">Private Workbook Monitor</h2>
                  </div>
                  <Button variant="outline" className="h-9 gap-2 bg-white">
                    <ChevronDown className="h-4 w-4" />
                    This week
                  </Button>
                </div>
                <div className="divide-y divide-slate-100">
                  {poRows.map((row) => (
                    <div key={row.po} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{row.po}</span>
                          <span className={`border px-2 py-1 text-xs font-bold ${statusClass(row.stage)}`}>
                            {row.stage}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {row.company} | {row.part}
                        </div>
                      </div>
                      <div className="text-sm md:text-right">
                        <div className="font-semibold">{row.etd}</div>
                        <div className="text-slate-500">{row.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <section className="border border-slate-200 bg-white p-4 shadow-sm">
                <FileText className="mb-3 h-6 w-6 text-slate-600" />
                <h2 className="font-display text-lg font-bold">Document Requests</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Route files from `03_Documents_Public`, `04_Documents_SPA_Private`, and `05_Spec_Sheets` according to approval level.
                </p>
                <Button variant="outline" className="mt-4 h-9 bg-white" asChild>
                  <Link href="/documents">Open Library</Link>
                </Button>
              </section>

              <section className="border border-slate-200 bg-white p-4 shadow-sm">
                <ShieldCheck className="mb-3 h-6 w-6 text-emerald-700" />
                <h2 className="font-display text-lg font-bold">Access Approvals</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Follow the SunnyKR access plan: email verification, admin approval, then admin, approved_vendor, pending, or blocked.
                </p>
                <Button variant="outline" className="mt-4 h-9 bg-white">Review Vendors</Button>
              </section>

              <section className="border border-slate-200 bg-white p-4 shadow-sm">
                <CheckCircle2 className="mb-3 h-6 w-6 text-sky-700" />
                <h2 className="font-display text-lg font-bold">Quote Publishing</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Keep RFQ/PO/email examples masked before using them for demos, AI training, or tests.
                </p>
                <Button variant="outline" className="mt-4 h-9 bg-white">Prepare Quote</Button>
              </section>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
