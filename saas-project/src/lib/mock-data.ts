// Mock data for GST Reconcile SaaS app

export interface Client {
  id: string;
  name: string;
  gstin: string;
  industry: string;
  createdAt: string;
  status: 'active' | 'pending' | 'reconciled';
  totalITC: number;
  riskAmount: number;
  pendingRecon: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorGstin: string;
  vendorName: string;
  invoiceDate: string;
  taxableValue: number;
  gstAmount: number;
  source: 'purchase' | '2b';
  status: 'matched' | 'missing_books' | 'missing_2b' | 'value_mismatch';
  mismatchAmount?: number;
}

export interface Vendor {
  id: string;
  name: string;
  gstin: string;
  filingStatus: 'filed' | 'not_filed' | 'partial';
  lastFiledMonth: string;
  itcAmount: number;
  riskLevel: 'low' | 'medium' | 'high';
  invoiceCount: number;
}

export interface DashboardStats {
  totalClients: number;
  pendingRecon: number;
  totalITC: number;
  riskAmount: number;
}

export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Raj Enterprises Pvt Ltd',
    gstin: '27AADCR5555Q1ZV',
    industry: 'Manufacturing',
    createdAt: '2024-10-01',
    status: 'reconciled',
    totalITC: 4820000,
    riskAmount: 184000,
    pendingRecon: 0,
  },
  {
    id: '2',
    name: 'Sharma & Sons Trading',
    gstin: '06AAHCS7894H1ZC',
    industry: 'Trading',
    createdAt: '2024-10-15',
    status: 'pending',
    totalITC: 1250000,
    riskAmount: 92000,
    pendingRecon: 2,
  },
  {
    id: '3',
    name: 'Patel Tech Solutions',
    gstin: '24AABCP1234K1Z5',
    industry: 'IT Services',
    createdAt: '2024-11-01',
    status: 'active',
    totalITC: 680000,
    riskAmount: 45000,
    pendingRecon: 1,
  },
  {
    id: '4',
    name: 'Mehta Constructions',
    gstin: '08AADCM6789J1ZQ',
    industry: 'Construction',
    createdAt: '2024-11-10',
    status: 'pending',
    totalITC: 2340000,
    riskAmount: 310000,
    pendingRecon: 3,
  },
  {
    id: '5',
    name: 'Gupta Medical Devices',
    gstin: '09AABCG4321L1ZA',
    industry: 'Healthcare',
    createdAt: '2024-12-01',
    status: 'active',
    totalITC: 890000,
    riskAmount: 67000,
    pendingRecon: 1,
  },
  {
    id: '6',
    name: 'Joshi Retail Chain',
    gstin: '27AABCJ8765M1ZF',
    industry: 'Retail',
    createdAt: '2024-12-15',
    status: 'reconciled',
    totalITC: 560000,
    riskAmount: 0,
    pendingRecon: 0,
  },
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-1001',
    vendorGstin: '27AABCS1429B1ZS',
    vendorName: 'Steel Corp India Pvt Ltd',
    invoiceDate: '2024-10-05',
    taxableValue: 500000,
    gstAmount: 90000,
    source: 'purchase',
    status: 'matched',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-1002',
    vendorGstin: '07AADCF0975A1ZF',
    vendorName: 'FastTrack Logistics',
    invoiceDate: '2024-10-08',
    taxableValue: 125000,
    gstAmount: 22500,
    source: 'purchase',
    status: 'missing_2b',
    mismatchAmount: 22500,
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-1003',
    vendorGstin: '29AABCM0791J1ZA',
    vendorName: 'Mumbai Chemicals Co',
    invoiceDate: '2024-10-12',
    taxableValue: 300000,
    gstAmount: 54000,
    source: 'purchase',
    status: 'value_mismatch',
    mismatchAmount: 5400,
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-1004',
    vendorGstin: '33AACCG6842J1Z8',
    vendorName: 'Chennai Garments Ltd',
    invoiceDate: '2024-10-15',
    taxableValue: 200000,
    gstAmount: 10000,
    source: 'purchase',
    status: 'matched',
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-1005',
    vendorGstin: '19AADCP7752R1ZQ',
    vendorName: 'Precision Tools Pvt Ltd',
    invoiceDate: '2024-10-18',
    taxableValue: 450000,
    gstAmount: 81000,
    source: '2b',
    status: 'missing_books',
    mismatchAmount: 81000,
  },
  {
    id: '6',
    invoiceNumber: 'INV-2024-1006',
    vendorGstin: '24AABCE1234P1Z2',
    vendorName: 'Excel Electronics',
    invoiceDate: '2024-10-20',
    taxableValue: 180000,
    gstAmount: 32400,
    source: 'purchase',
    status: 'matched',
  },
  {
    id: '7',
    invoiceNumber: 'INV-2024-1007',
    vendorGstin: '08AADCK5678Q1ZV',
    vendorName: 'Kapoor Packaging',
    invoiceDate: '2024-10-22',
    taxableValue: 80000,
    gstAmount: 14400,
    source: 'purchase',
    status: 'matched',
  },
  {
    id: '8',
    invoiceNumber: 'INV-2024-1008',
    vendorGstin: '09AABCL9012R1Z5',
    vendorName: 'Lucknow Auto Parts',
    invoiceDate: '2024-10-25',
    taxableValue: 220000,
    gstAmount: 39600,
    source: 'purchase',
    status: 'missing_2b',
    mismatchAmount: 39600,
  },
  {
    id: '9',
    invoiceNumber: 'INV-2024-1009',
    vendorGstin: '06AAHCS7894H1ZC',
    vendorName: 'Sharma & Sons Supply',
    invoiceDate: '2024-10-28',
    taxableValue: 350000,
    gstAmount: 63000,
    source: 'purchase',
    status: 'value_mismatch',
    mismatchAmount: 12600,
  },
  {
    id: '10',
    invoiceNumber: 'INV-2024-1010',
    vendorGstin: '27AADCR5555Q1ZV',
    vendorName: 'Raj Distributors',
    invoiceDate: '2024-10-31',
    taxableValue: 620000,
    gstAmount: 111600,
    source: 'purchase',
    status: 'matched',
  },
];

export const MOCK_VENDORS: Vendor[] = [
  {
    id: '1',
    name: 'FastTrack Logistics',
    gstin: '07AADCF0975A1ZF',
    filingStatus: 'not_filed',
    lastFiledMonth: 'Aug 2024',
    itcAmount: 22500,
    riskLevel: 'high',
    invoiceCount: 3,
  },
  {
    id: '2',
    name: 'Lucknow Auto Parts',
    gstin: '09AABCL9012R1Z5',
    filingStatus: 'not_filed',
    lastFiledMonth: 'Sep 2024',
    itcAmount: 39600,
    riskLevel: 'high',
    invoiceCount: 5,
  },
  {
    id: '3',
    name: 'Mumbai Chemicals Co',
    gstin: '29AABCM0791J1ZA',
    filingStatus: 'partial',
    lastFiledMonth: 'Oct 2024',
    itcAmount: 54000,
    riskLevel: 'medium',
    invoiceCount: 4,
  },
  {
    id: '4',
    name: 'Sharma & Sons Supply',
    gstin: '06AAHCS7894H1ZC',
    filingStatus: 'partial',
    lastFiledMonth: 'Oct 2024',
    itcAmount: 63000,
    riskLevel: 'medium',
    invoiceCount: 2,
  },
  {
    id: '5',
    name: 'Steel Corp India Pvt Ltd',
    gstin: '27AABCS1429B1ZS',
    filingStatus: 'filed',
    lastFiledMonth: 'Oct 2024',
    itcAmount: 90000,
    riskLevel: 'low',
    invoiceCount: 8,
  },
  {
    id: '6',
    name: 'Chennai Garments Ltd',
    gstin: '33AACCG6842J1Z8',
    filingStatus: 'filed',
    lastFiledMonth: 'Oct 2024',
    itcAmount: 10000,
    riskLevel: 'low',
    invoiceCount: 3,
  },
  {
    id: '7',
    name: 'Excel Electronics',
    gstin: '24AABCE1234P1Z2',
    filingStatus: 'filed',
    lastFiledMonth: 'Oct 2024',
    itcAmount: 32400,
    riskLevel: 'low',
    invoiceCount: 6,
  },
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalClients: 6,
  pendingRecon: 7,
  totalITC: 10540000,
  riskAmount: 698000,
};

export const MOCK_ACTIVITY = [
  { client: 'Raj Enterprises Pvt Ltd', action: 'Reconciliation Complete', time: '2 hours ago', status: 'success' },
  { client: 'Sharma & Sons Trading', action: 'GSTR-2B Uploaded', time: '5 hours ago', status: 'info' },
  { client: 'Patel Tech Solutions', action: 'ITC Risk Alert', time: 'Yesterday', status: 'warning' },
  { client: 'Mehta Constructions', action: 'Purchase Register Uploaded', time: 'Yesterday', status: 'info' },
  { client: 'Gupta Medical Devices', action: 'Vendor Risk Detected', time: '2 days ago', status: 'danger' },
  { client: 'Joshi Retail Chain', action: 'Report Downloaded', time: '3 days ago', status: 'success' },
];

export const RECONCILIATION_SUMMARY = {
  total: 10,
  matched: 5,
  missingBooks: 1,
  missing2B: 2,
  valueMismatch: 2,
  totalITC: 518500,
  matchedITC: 305000,
  riskITC: 213500,
};

export const MONTHLY_DATA = [
  { month: 'May', itc: 380000, risk: 45000 },
  { month: 'Jun', itc: 420000, risk: 62000 },
  { month: 'Jul', itc: 395000, risk: 38000 },
  { month: 'Aug', itc: 510000, risk: 91000 },
  { month: 'Sep', itc: 475000, risk: 55000 },
  { month: 'Oct', itc: 518500, risk: 213500 },
];
