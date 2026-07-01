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
