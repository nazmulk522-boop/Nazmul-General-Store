/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AccountKey = 'bkash' | 'nagad' | 'rocket' | 'gp' | 'robi' | 'airtel' | 'banglalink';

export interface Balances {
  cash: number;
  bkash: number;
  nagad: number;
  rocket: number;
  gp: number;
  robi: number;
  airtel: number;
  banglalink: number;
}

export type TransactionActionType = 'cash_out' | 'cash_in' | 'pay_bill' | 'load' | 'minute_card';

export interface TransactionRecord {
  id: string;
  accountKey: AccountKey;
  actionType: TransactionActionType;
  cardPrice?: 19 | 29 | 39 | 49;
  amount: number;         // Amount deducted from account (Cost of recharge/card, e.g. 18.5 for 19 Tk card)
  amountReceived: number; // Cash received from customer (e.g. 20 for 19 Tk card)
  commission: number;     // Profit earned
  phone: string;
  trxId?: string;
  timestamp: number;
  note?: string;
}

export interface PurchaseRecord {
  id: string;
  timestamp: number;
  purchaseType: 'balance' | 'cards';
  accountKey?: AccountKey;  // If balance purchase
  cardPrice?: 19 | 29 | 39 | 49; // If cards purchase
  quantity?: number;       // If cards purchase
  amount: number;          // Cost of purchase (decremented from Cash)
}

export interface CardStock {
  gp: { 19: number; 29: number; 39: number; 49: number };
  robi: { 19: number; 29: number; 39: number; 49: number };
  airtel: { 19: number; 29: number; 39: number; 49: number };
  banglalink: { 19: number; 29: number; 39: number; 49: number };
}

export interface CardUnit {
  id: string;
  operator: 'gp' | 'robi' | 'airtel' | 'banglalink';
  cardPrice: 19 | 29 | 39 | 49;
  buyPrice: number;
  timestamp: number;
}

// Operators definitions for data compatibility
export type OperatorId = 'gp' | 'robi' | 'banglalink' | 'airtel' | 'teletalk';

export interface MobileOperatorRef {
  id: OperatorId;
  nameBangla: string;
  nameEnglish: string;
  prefixes: string[];
  colorClass: string;
  bgHex: string;
  ussdCheckBalance: string;
  ussdCheckMyOffer: string;
  ussdInternetBalance: string;
}

export interface RechargePackage {
  id: string;
  operatorId: OperatorId;
  title: string;
  type: 'internet' | 'talktime' | 'combo' | 'rate_cutter';
  price: number;
  validity: string;
  description: string;
  commissionRate: number;
  ussdCode?: string;
}

// --- GENERAL STORE TYPES ---
export interface StoreProduct {
  id: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  buy?: number;
  sell?: number;
}

export interface StoreSaleItem {
  productId: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
}

export interface StoreSale {
  id: string;
  customerName: string;
  paymentMethod: 'Cash' | 'Due' | 'Mobile Banking';
  date: string; // YYYY-MM-DD
  timestamp: number;
  items: StoreSaleItem[];
  grandTotal: number;
  profit: number;
}

export interface StoreCustomerTxn {
  id: string;
  type: 'sale_due' | 'payment_received' | 'due' | 'payment';
  amount: number;
  date: string;
  note?: string;
  timestamp: number;
  transactionId?: string;
}

export interface StoreCustomer {
  id: string;
  name: string;
  phone?: string;
  due: number;
  transactions: StoreCustomerTxn[];
}

export interface StorePurchase {
  id: string;
  productName: string;
  qty: number;
  purchaseAmount: number; // Cost of purchase (cash minus)
  sellPrice?: number;     // Optional new sell price
  timestamp: number;
}

export interface StoreDailyLedger {
  date: string; // YYYY-MM-DD
  closeCash: number | null;
  purchases: StorePurchase[];
  manualCash?: number;
}

export type TelecomCustomerTxn = StoreCustomerTxn;
export type TelecomCustomer = StoreCustomer;

export interface KhelapiInfo {
  daysOverdue: number;
  category: '7_days' | '15_days' | '30_days' | 'none';
  categoryLabel: string;
  categoryBadgeClass: string;
  lastPaymentDate?: string;
  dueStartDate?: string;
  lastActivityTimestamp: number;
}

export function getCustomerKhelapiInfo(customer: { due: number; transactions?: { type?: string; amount?: number; date?: string; timestamp?: number }[] }): KhelapiInfo {
  if (!customer || customer.due <= 0) {
    return {
      daysOverdue: 0,
      category: 'none',
      categoryLabel: 'নিয়মিত',
      categoryBadgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      lastActivityTimestamp: Date.now()
    };
  }

  const txns = customer.transactions || [];
  
  // 1. Check if there was any payment received
  const paymentTxns = txns.filter(
    t => (t.type === 'payment_received' || t.type === 'payment') && (t.amount || 0) > 0
  );

  let referenceTimestamp = 0;
  let lastPaymentDate: string | undefined;
  let dueStartDate: string | undefined;

  if (paymentTxns.length > 0) {
    // Latest payment timestamp
    const latestPayment = paymentTxns.reduce((latest, t) => {
      const ts = t.timestamp || (t.date ? new Date(t.date).getTime() : 0);
      const prevTs = latest.timestamp || (latest.date ? new Date(latest.date).getTime() : 0);
      return ts > prevTs ? t : latest;
    }, paymentTxns[0]);
    
    referenceTimestamp = latestPayment.timestamp || (latestPayment.date ? new Date(latestPayment.date).getTime() : Date.now());
    lastPaymentDate = latestPayment.date || (latestPayment.timestamp ? new Date(latestPayment.timestamp).toISOString().split('T')[0] : undefined);
  } else {
    // If no payment was ever made, look for due creation transactions
    const dueTxns = txns.filter(
      t => (t.type === 'sale_due' || t.type === 'due') && (t.amount || 0) > 0
    );
    if (dueTxns.length > 0) {
      // Oldest due transaction timestamp (when the customer started owing money)
      const oldestDue = dueTxns.reduce((earliest, t) => {
        const ts = t.timestamp || (t.date ? new Date(t.date).getTime() : Date.now());
        const prevTs = earliest.timestamp || (earliest.date ? new Date(earliest.date).getTime() : Date.now());
        return ts < prevTs ? t : earliest;
      }, dueTxns[0]);
      referenceTimestamp = oldestDue.timestamp || (oldestDue.date ? new Date(oldestDue.date).getTime() : Date.now());
      dueStartDate = oldestDue.date || (oldestDue.timestamp ? new Date(oldestDue.timestamp).toISOString().split('T')[0] : undefined);
    } else {
      referenceTimestamp = Date.now();
    }
  }

  const now = Date.now();
  const diffMs = Math.max(0, now - referenceTimestamp);
  const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let category: '7_days' | '15_days' | '30_days' | 'none' = 'none';
  let categoryLabel = 'নিয়মিত';
  let categoryBadgeClass = 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  if (daysOverdue >= 30) {
    category = '30_days';
    categoryLabel = '৩০+ দিন খেলাপি';
    categoryBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
  } else if (daysOverdue >= 15) {
    category = '15_days';
    categoryLabel = '১৫-২৯ দিন খেলাপি';
    categoryBadgeClass = 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800';
  } else if (daysOverdue >= 7) {
    category = '7_days';
    categoryLabel = '৭-১৪ দিন খেলাপি';
    categoryBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
  }

  return {
    daysOverdue,
    category,
    categoryLabel,
    categoryBadgeClass,
    lastPaymentDate,
    dueStartDate,
    lastActivityTimestamp: referenceTimestamp
  };
}

