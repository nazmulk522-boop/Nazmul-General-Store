/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, FormEvent, ChangeEvent } from 'react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, 
  Coins, 
  Smartphone, 
  ReceiptText, 
  History, 
  TrendingUp, 
  PlusCircle, 
  Trash2, 
  Search, 
  Printer, 
  ArrowRightLeft, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Calendar, 
  Wifi, 
  Volume2, 
  VolumeX, 
  FileSpreadsheet, 
  Layers, 
  Sparkles, 
  Copy, 
  Plus, 
  Edit2, 
  Wallet,
  ArrowDownToLine,
  CloudLightning,
  CloudUpload,
  Info,
  Check,
  ShoppingBag,
  BarChart3,
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';
import { AccountKey, Balances, TransactionActionType, TransactionRecord, PurchaseRecord, CardStock, CardUnit, TelecomCustomer, TelecomCustomerTxn } from './types';
import { BANGLADESHI_OPERATORS } from './data';
import GeneralStore from './components/GeneralStore';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  uploadBackupToDrive, 
  listBackupsFromDrive, 
  downloadBackupFromDrive, 
  deleteBackupFromDrive, 
  DriveBackupFile 
} from './firebase';
import { User as FirebaseAuthUser } from 'firebase/auth';

// Helper function to convert English digits to Bengali numerals
function toBengaliNumber(val: string | number): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit, 10)]);
}

// Format local date/time neatly in Bengali
function formatDateTimeBangla(timestamp: number): string {
  const date = new Date(timestamp);
  const timeStr = date.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${dateStr}, ${timeStr}`;
}

// Thermal printing element helper using hidden iframe
export const printElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);
  
  const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!iframeDoc) return;
  
  iframeDoc.open();
  iframeDoc.write(`
    <html>
      <head>
        <title>Receipt</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 10px;
            color: #000;
            background: #fff;
          }
          * {
            box-sizing: border-box;
          }
          .no-print { display: none !important; }
          .text-slate-900 { color: #000 !important; }
          .text-slate-600 { color: #333 !important; }
          .text-indigo-600 { color: #000 !important; }
          .bg-slate-50 { background: #f9fafb !important; border: 1px solid #ddd !important; }
          .bg-indigo-50 { background: #f3f4f6 !important; }
          .border-dashed { border-style: dashed !important; }
          .border-slate-300 { border-color: #000 !important; }
        </style>
        <script src="https://cdn.tailwindcss.com"><\/script>
      </head>
      <body>
        <div class="p-4" style="max-width: 320px; margin: 0 auto;">
          ${element.innerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
              setTimeout(function() {
                window.parent.document.body.removeChild(window.frameElement);
              }, 500);
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  iframeDoc.close();
};

// Download element as PNG helper using html2canvas
export const downloadPNG = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });
    
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Failed to generate PNG:", err);
    alert("PNG ছবি তৈরিতে ত্রুটি হয়েছে। দয়া করে আবার চেষ্টা করুন।");
  }
};

export default function App() {
  // App Mode State: telecom vs general_store
  const [appMode, setAppMode] = useState<'telecom' | 'general_store'>(() => {
    const saved = localStorage.getItem('nazmul_app_mode');
    return saved === 'general_store' ? 'general_store' : 'telecom';
  });

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('nazmul_telecom_sound');
    return saved === null ? true : saved === 'true';
  });

  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('nazmul_telecom_dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nazmul_telecom_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nazmul_telecom_dark_mode', 'false');
    }
  }, [darkMode]);

  // State: Balances
  const [balances, setBalances] = useState<Balances>(() => {
    const saved = localStorage.getItem('nazmul_telecom_balances');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use default */ }
    }
    return {
      cash: 25000,
      bkash: 8000,
      nagad: 5000,
      rocket: 4000,
      gp: 3000,
      robi: 2000,
      airtel: 1500,
      banglalink: 1500
    };
  });

  // State: Card Stocks
  const [cardStock, setCardStock] = useState<CardStock>(() => {
    const saved = localStorage.getItem('nazmul_telecom_card_stock');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use default */ }
    }
    return {
      gp: { 19: 10, 29: 10, 39: 10, 49: 10 },
      robi: { 19: 15, 29: 15, 39: 15, 49: 15 },
      airtel: { 19: 8, 29: 8, 39: 8, 49: 8 },
      banglalink: { 19: 12, 29: 12, 39: 12, 49: 12 }
    };
  });

  const [cardUnits, setCardUnits] = useState<CardUnit[]>(() => {
    const savedUnits = localStorage.getItem('nazmul_telecom_card_units');
    if (savedUnits) {
      try {
        return JSON.parse(savedUnits);
      } catch (e) {
        console.error("Failed to parse card units:", e);
      }
    }

    // Migration from existing card_stock
    const savedStock = localStorage.getItem('nazmul_telecom_card_stock');
    let oldStock: CardStock = {
      gp: { 19: 10, 29: 10, 39: 10, 49: 10 },
      robi: { 19: 15, 29: 15, 39: 15, 49: 15 },
      airtel: { 19: 8, 29: 8, 39: 8, 49: 8 },
      banglalink: { 19: 12, 29: 12, 39: 12, 49: 12 }
    };
    if (savedStock) {
      try {
        oldStock = JSON.parse(savedStock);
      } catch (e) {
        console.error("Failed to parse old stock for migration:", e);
      }
    }

    const initialUnits: CardUnit[] = [];
    const operators: ('gp' | 'robi' | 'airtel' | 'banglalink')[] = ['gp', 'robi', 'airtel', 'banglalink'];
    const prices: (19 | 29 | 39 | 49)[] = [19, 29, 39, 49];

    operators.forEach(op => {
      prices.forEach(pr => {
        const qty = oldStock[op]?.[pr] ?? 0;
        const defaultBuyPrice = pr - 0.5;
        for (let i = 0; i < qty; i++) {
          initialUnits.push({
            id: `UNIT-${op}-${pr}-${Date.now()}-${Math.random().toString().slice(2, 6)}-${i}`,
            operator: op,
            cardPrice: pr,
            buyPrice: defaultBuyPrice,
            timestamp: Date.now()
          });
        }
      });
    });

    return initialUnits;
  });

  const saveCardUnits = (newUnits: CardUnit[]) => {
    setCardUnits(newUnits);
    localStorage.setItem('nazmul_telecom_card_units', JSON.stringify(newUnits));

    // Update old cardStock for backwards compatibility and rendering
    const computedStock: CardStock = {
      gp: { 19: 0, 29: 0, 39: 0, 49: 0 },
      robi: { 19: 0, 29: 0, 39: 0, 49: 0 },
      airtel: { 19: 0, 29: 0, 39: 0, 49: 0 },
      banglalink: { 19: 0, 29: 0, 39: 0, 49: 0 }
    };

    newUnits.forEach(unit => {
      if (computedStock[unit.operator] && (unit.cardPrice === 19 || unit.cardPrice === 29 || unit.cardPrice === 39 || unit.cardPrice === 49)) {
        computedStock[unit.operator][unit.cardPrice]++;
      }
    });

    setCardStock(computedStock);
    localStorage.setItem('nazmul_telecom_card_stock', JSON.stringify(computedStock));
  };

  const reconstructCardUnitsFromStock = (stock: CardStock) => {
    const initialUnits: CardUnit[] = [];
    const operators: ('gp' | 'robi' | 'airtel' | 'banglalink')[] = ['gp', 'robi', 'airtel', 'banglalink'];
    const prices: (19 | 29 | 39 | 49)[] = [19, 29, 39, 49];

    operators.forEach(op => {
      prices.forEach(pr => {
        const qty = stock[op]?.[pr] ?? 0;
        const defaultBuyPrice = pr - 0.5;
        for (let i = 0; i < qty; i++) {
          initialUnits.push({
            id: `UNIT-${op}-${pr}-${Date.now()}-${Math.random().toString().slice(2, 6)}-${i}`,
            operator: op,
            cardPrice: pr,
            buyPrice: defaultBuyPrice,
            timestamp: Date.now()
          });
        }
      });
    });

    saveCardUnits(initialUnits);
  };

  // State: Transactions history
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem('nazmul_telecom_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use default */ }
    }
    // Seed records if empty for active look and feel
    return [
      {
        id: 'TXN-060201',
        accountKey: 'bkash',
        actionType: 'cash_out',
        amount: 5000,
        amountReceived: 5000,
        commission: 20, // 4 Tk per 1000
        phone: '01715888222',
        trxId: 'BKB729A88Z',
        timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
        note: 'ব্যক্তিগত ক্যাশআউট'
      },
      {
        id: 'TXN-060202',
        accountKey: 'gp',
        actionType: 'load',
        amount: 200,
        amountReceived: 200,
        commission: 5.4, // 27 Tk per 1000
        phone: '01305445229',
        timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        note: 'জরুরি লোড'
      },
      {
        id: 'TXN-060203',
        accountKey: 'robi',
        actionType: 'minute_card',
        cardPrice: 29,
        amount: 28.5,
        amountReceived: 30,
        commission: 1.5,
        phone: '01815234990',
        timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
        note: 'মিনিট কার্ড বিক্রি'
      }
    ];
  });

  // State: Purchases history
  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => {
    const saved = localStorage.getItem('nazmul_telecom_purchases');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use default */ }
    }
    return [];
  });

  // State: Telecom Customers (Baki/Credit Ledger connected to General Store)
  const [telecomCustomers, setTelecomCustomers] = useState<TelecomCustomer[]>(() => {
    const saved = localStorage.getItem('nazmul_store_customers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use default */ }
    }
    // Seeds for telecom/store customers to give a nice starting experience
    return [
      { id: 'c1', name: 'সেতু ভাই', phone: '', due: 1229, transactions: [{ id: 't1', type: 'sale_due', amount: 1229, date: '2026-07-01', note: 'পূর্বের বকেয়া খাতা', timestamp: Date.now() }] },
      { id: 'c2', name: 'তাইবা, তাবাসসুম', phone: '', due: 311, transactions: [{ id: 't2', type: 'sale_due', amount: 311, date: '2026-07-01', note: 'পূর্বের বকেয়া খাতা', timestamp: Date.now() }] },
      { id: 'c3', name: 'মাসুদ (গোস্ত)', phone: '', due: 50, transactions: [{ id: 't3', type: 'sale_due', amount: 50, date: '2026-07-01', note: 'পূর্বের বকেয়া', timestamp: Date.now() }] },
      { id: 'c4', name: 'সফুর (গোস্ত)', phone: '', due: 360, transactions: [{ id: 't4', type: 'sale_due', amount: 360, date: '2026-07-01', note: 'পূর্বের বকেয়া', timestamp: Date.now() }] },
      { id: 'c5', name: 'আলিম (গোস্ত)', phone: '', due: 560, transactions: [{ id: 't5', type: 'sale_due', amount: 560, date: '2026-07-01', note: 'পূর্বের বকেয়া', timestamp: Date.now() }] },
      { id: 'c6', name: 'দুলাল (ফার্নিচার)', phone: '', due: 85, transactions: [{ id: 't6', type: 'sale_due', amount: 85, date: '2026-07-01', note: 'পূর্বের বকেয়া', timestamp: Date.now() }] },
      { id: 'c7', name: 'সাগর (ফার্নিচার)', phone: '', due: 250, transactions: [{ id: 't7', type: 'sale_due', amount: 250, date: '2026-07-01', note: 'পূর্বের বকেয়া', timestamp: Date.now() }] },
      { id: 'c8', name: 'সায়েমের দুলাভাই', phone: '', due: 190, transactions: [{ id: 't8', type: 'sale_due', amount: 190, date: '2026-07-01', note: 'পূর্বের বকেয়া', timestamp: Date.now() }] },
      { id: 'c9', name: 'কায়দা আজম', phone: '', due: 12, transactions: [{ id: 't9', type: 'sale_due', amount: 12, date: '2026-07-01', note: 'পূর্বের বকেয়া', timestamp: Date.now() }] },
      { id: 'c10', name: 'আরিফ (বাস)', phone: '', due: 120, transactions: [{ id: 't10', type: 'sale_due', amount: 120, date: '2026-07-01', note: 'পূর্বের বকেয়া', timestamp: Date.now() }] }
    ];
  });

  // General App State
  const [activeAccount, setActiveAccount] = useState<AccountKey>('bkash');
  const [activeAction, setActiveAction] = useState<TransactionActionType>('cash_out');
  const [selectedCardPrice, setSelectedCardPrice] = useState<19 | 29 | 39 | 49>(29);

  // Form Inputs: New Transaction
  const [phone, setPhone] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [amountReceivedInput, setAmountReceivedInput] = useState<string>('');
  const [trxId, setTrxId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isTelecomDue, setIsTelecomDue] = useState<boolean>(false);
  const [selectedTelecomCustomerId, setSelectedTelecomCustomerId] = useState<string>('new');
  const [newTelecomCustomerName, setNewTelecomCustomerName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Inputs: Manual Balance Edit
  const [showEditModal, setShowEditModal] = useState<AccountKey | 'cash' | 'commission' | 'volume' | null>(null);
  const [editAmountVal, setEditAmountVal] = useState<string>('');

  // UI state
  const [mainView, setMainView] = useState<'txn' | 'summary'>('txn');

  const [commissionOffset, setCommissionOffset] = useState<number>(() => {
    const saved = localStorage.getItem('nazmul_telecom_commission_offset');
    return saved ? parseFloat(saved) : 0;
  });
  const [volumeOffset, setVolumeOffset] = useState<number>(() => {
    const saved = localStorage.getItem('nazmul_telecom_volume_offset');
    return saved ? parseFloat(saved) : 0;
  });

  const saveCommissionOffset = (val: number) => {
    setCommissionOffset(val);
    localStorage.setItem('nazmul_telecom_commission_offset', String(val));
  };

  const saveVolumeOffset = (val: number) => {
    setVolumeOffset(val);
    localStorage.setItem('nazmul_telecom_volume_offset', String(val));
  };

  // Form Inputs: Buy (ক্রয়)
  const [buyTab, setBuyTab] = useState<'balance' | 'cards'>('balance');
  const [buyAccount, setBuyAccount] = useState<AccountKey>('bkash');
  const [buyBalanceAmount, setBuyBalanceAmount] = useState<string>('');
  const [buyCardOperator, setBuyCardOperator] = useState<'gp' | 'robi' | 'airtel' | 'banglalink'>('gp');
  const [buyCardPrice, setBuyCardPrice] = useState<19 | 29 | 39 | 49>(19);
  const [buyCardQty, setBuyCardQty] = useState<string>('5');
  const [buyCardCostInput, setBuyCardCostInput] = useState<string>('18.5');
  const [buySuccessMsg, setBuySuccessMsg] = useState<string | null>(null);

  // Form Inputs: Telecom Baki / Credit Ledger
  const [selectedBakiCustomerId, setSelectedBakiCustomerId] = useState<string | null>(null);
  const [bakiActionType, setBakiActionType] = useState<'due' | 'payment'>('payment');
  const [bakiFormAmount, setBakiFormAmount] = useState<string>('');
  const [bakiFormNote, setBakiFormNote] = useState<string>('');
  const [editingBakiCustomer, setEditingBakiCustomer] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null);

  // Form Inputs: Manual Card Stock Edit
  const [showCardEditModal, setShowCardEditModal] = useState<{
    operator: 'gp' | 'robi' | 'airtel' | 'banglalink';
    price: 19 | 29 | 39 | 49;
  } | null>(null);
  const [editCardQtyVal, setEditCardQtyVal] = useState<string>('');

  // Update buying price input when template selection changes
  useEffect(() => {
    setBuyCardCostInput(String(buyCardPrice - 0.5));
  }, [buyCardPrice]);

  // UI state
  const [dashboardTab, setDashboardTab] = useState<'statement' | 'buy' | 'backup' | 'baki'>('statement');
  const [statementFilter, setStatementFilter] = useState<'all' | 'daily' | 'monthly'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSlip, setSelectedSlip] = useState<TransactionRecord | null>(null);

  // Real Google Drive & Google Auth state
  const [googleUser, setGoogleUser] = useState<FirebaseAuthUser | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [driveBackingUp, setDriveBackingUp] = useState<boolean>(false);
  const [driveBackUpSuccess, setDriveBackUpSuccess] = useState<boolean>(false);
  const [backupList, setBackupList] = useState<DriveBackupFile[]>([]);
  const [loadingBackups, setLoadingBackups] = useState<boolean>(false);
  const [driveError, setDriveError] = useState<string | null>(null);

  // Load backups list helper
  const loadDriveBackupsList = async () => {
    setLoadingBackups(true);
    setDriveError(null);
    try {
      const list = await listBackupsFromDrive();
      setBackupList(list);
    } catch (err: any) {
      console.error("Failed to load backups list:", err);
      // We only set error state if authenticated to prevent noisy console-based logs
      setDriveError("ড্রাইভ থেকে ব্যাকআপ ফাইল লিস্ট লোড করা সম্ভব হয়নি। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setLoadingBackups(false);
    }
  };

  // Auth state listener on load
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setNeedsAuth(false);
        setDriveError(null);
      },
      () => {
        setGoogleUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch backups automatically when tab changes or login succeeds
  useEffect(() => {
    if (dashboardTab === 'backup' && googleUser) {
      loadDriveBackupsList();
    }
  }, [dashboardTab, googleUser]);

  // Save state helpers
  const saveBalances = (newB: Balances) => {
    setBalances(newB);
    localStorage.setItem('nazmul_telecom_balances', JSON.stringify(newB));
  };

  const saveCardStock = (newS: CardStock) => {
    setCardStock(newS);
    localStorage.setItem('nazmul_telecom_card_stock', JSON.stringify(newS));
  };

  const saveTransactions = (newT: TransactionRecord[]) => {
    setTransactions(newT);
    localStorage.setItem('nazmul_telecom_transactions', JSON.stringify(newT));
  };

  const savePurchases = (newP: PurchaseRecord[]) => {
    setPurchases(newP);
    localStorage.setItem('nazmul_telecom_purchases', JSON.stringify(newP));
  };

  const saveTelecomCustomers = (newC: TelecomCustomer[]) => {
    setTelecomCustomers(newC);
    localStorage.setItem('nazmul_store_customers', JSON.stringify(newC));
  };

  // Card stock total valuation helper based on actual buy prices of remaining stock
  const getCardStockValue = (operator: 'gp' | 'robi' | 'airtel' | 'banglalink'): number => {
    const operatorUnits = cardUnits.filter(u => u.operator === operator);
    const totalVal = operatorUnits.reduce((sum, unit) => sum + unit.buyPrice, 0);
    return Math.round(totalVal * 100) / 100;
  };

  // Helper to get oldest card buy price for a given brand and price variant
  const getOldestCardBuyPrice = (operator: 'gp' | 'robi' | 'airtel' | 'banglalink', price: 19 | 29 | 39 | 49): number => {
    const matchingUnits = cardUnits.filter(u => u.operator === operator && u.cardPrice === price);
    if (matchingUnits.length > 0) {
      return matchingUnits[0].buyPrice;
    }
    return price - 0.5;
  };

  // Get dynamic operator balance which includes SIM balance + total card stock valuation
  const getOperatorTotalBalance = (operator: AccountKey): number => {
    const base = balances[operator] || 0;
    if (operator === 'gp' || operator === 'robi' || operator === 'airtel' || operator === 'banglalink') {
      return base + getCardStockValue(operator);
    }
    return base;
  };

  // Sound generator
  const playSound = (freq = 880, dura = 0.1, type: OscillatorType = 'sine') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dura);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + dura);
    } catch (e) {
      console.warn("AudioContext failed to load or initiate: ", e);
    }
  };

  // Save sound setting preference
  useEffect(() => {
    localStorage.setItem('nazmul_telecom_sound', String(soundEnabled));
  }, [soundEnabled]);

  // Adjust active action type on account shift automatically
  useEffect(() => {
    if (activeAccount === 'bkash' || activeAccount === 'nagad' || activeAccount === 'rocket') {
      setActiveAction('cash_out');
    } else {
      setActiveAction('load');
    }
  }, [activeAccount]);

  // Auto-Detect Operator and change activeAccount when phone is entered
  useEffect(() => {
    const cleanPhone = phone.trim();
    if (cleanPhone.length >= 3) {
      const prefix = cleanPhone.slice(0, 3);
      if (prefix === '017' || prefix === '013') {
        if (activeAccount !== 'gp') {
          setActiveAccount('gp');
          playSound(1000, 0.05);
        }
      } else if (prefix === '018') {
        if (activeAccount !== 'robi') {
          setActiveAccount('robi');
          playSound(1000, 0.05);
        }
      } else if (prefix === '016') {
        if (activeAccount !== 'airtel') {
          setActiveAccount('airtel');
          playSound(1000, 0.05);
        }
      } else if (prefix === '019' || prefix === '014') {
        if (activeAccount !== 'banglalink') {
          setActiveAccount('banglalink');
          playSound(1000, 0.05);
        }
      }
    }
  }, [phone]);

  // Dynamic automatic calculation of card prices
  // Dynamic automatic calculation of card prices
  useEffect(() => {
    if (activeAction === 'minute_card') {
      const basePrice = selectedCardPrice;
      const oldestBuyPrice = getOldestCardBuyPrice(activeAccount as 'gp' | 'robi' | 'airtel' | 'banglalink', basePrice);
      const customerReceipt = basePrice + 1.0;
      setAmountInput(String(oldestBuyPrice));
      if (!isTelecomDue) {
        setAmountReceivedInput(String(customerReceipt));
      }
    } else if (activeAction === 'load' || activeAction === 'cash_in' || activeAction === 'pay_bill') {
      // For loads, standard amounts from account matches amount received usually
      if (!isTelecomDue) {
        setAmountReceivedInput(amountInput);
      }
    } else if (activeAction === 'cash_out') {
      // For cash out, what we received into the digital wallet of agent is the Cash Out amount.
      // What we given to the customer in cash is the same amount.
      if (!isTelecomDue) {
        setAmountReceivedInput(amountInput);
      }
    }
  }, [activeAction, selectedCardPrice, amountInput, activeAccount, cardUnits, isTelecomDue]);

  // Calculations for summarized metrics
  // total online balance = Sum of bKash, Nagad, Rocket, GP, Robi, Airtel, BL and card stock valuations
  const totalOnlineBalance = useMemo(() => {
    return (
      balances.bkash +
      balances.nagad +
      balances.rocket +
      getOperatorTotalBalance('gp') +
      getOperatorTotalBalance('robi') +
      getOperatorTotalBalance('airtel') +
      getOperatorTotalBalance('banglalink')
    );
  }, [balances, cardUnits]);

  // Metrics specifically calculated for TODAY only
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, [transactions, purchases]);

  const todayMetrics = useMemo(() => {
    let commission = 0;
    let volume = 0;
    transactions.forEach(t => {
      if (t.timestamp >= todayStart) {
        commission += t.commission;
        // Total Volume of transactions performed
        if (t.actionType === 'minute_card') {
          volume += t.cardPrice || 0;
        } else {
          volume += t.amount;
        }
      }
    });
    return {
      commission: Math.round(commission * 100) / 100,
      volume: Math.round(volume * 100) / 100
    };
  }, [transactions, todayStart]);

  const activeCommission = useMemo(() => {
    return Math.max(0, Math.round((todayMetrics.commission + commissionOffset) * 100) / 100);
  }, [todayMetrics.commission, commissionOffset]);

  const activeVolume = useMemo(() => {
    return Math.max(0, Math.round((todayMetrics.volume + volumeOffset) * 100) / 100);
  }, [todayMetrics.volume, volumeOffset]);

  const displayCashWithCommission = useMemo(() => {
    return Math.round((balances.cash + activeCommission) * 100) / 100;
  }, [balances.cash, activeCommission]);

  // Master Transaction Handler
  const handlePerformTransaction = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const clientPhone = phone.trim() || 'N/A';

    const amt = parseFloat(amountInput) || 0;
    const received = isNaN(parseFloat(amountReceivedInput)) ? 0 : parseFloat(amountReceivedInput);

    if (isNaN(amt) || amt <= 0) {
      setErrorMsg('দয়া করে সঠিক টাকার পরিমাণ লিখুন।');
      playSound(300, 0.3, 'sawtooth');
      return;
    }

    // Safety checks depending on service
    if (activeAction === 'load' && (activeAccount !== 'gp' && activeAccount !== 'robi' && activeAccount !== 'airtel' && activeAccount !== 'banglalink')) {
      setErrorMsg('মোবাইল লোড করার জন্য Grameenphone, Robi, Airtel বা Banglalink একাউন্ট সিলেক্ট করুন।');
      return;
    }

    // Find card unit if active action is minute_card
    let unitToSell: CardUnit | null = null;
    if (activeAction === 'minute_card') {
      const operator = activeAccount as 'gp' | 'robi' | 'airtel' | 'banglalink';
      const matchingUnits = cardUnits.filter(u => u.operator === operator && u.cardPrice === selectedCardPrice);
      if (matchingUnits.length === 0) {
        setErrorMsg(`দুঃখিত, ${activeAccount.toUpperCase()} সিমে ৳${selectedCardPrice} মূল্যের মিনিট কার্ড স্টক আউট! অনুগ্রহ করে ক্রয় করে স্টক পুনরায় বৃদ্ধি করুন।`);
        playSound(300, 0.3, 'sawtooth');
        return;
      }
      unitToSell = matchingUnits[0]; // FIFO: oldest unit
    }

    // Calculate commission
    let calculatedCommission = 0;
    if (activeAction === 'cash_out') {
      calculatedCommission = (amt / 1000) * 4; // commission 4 Tk per 1000 Tk
    } else if (activeAction === 'cash_in') {
      calculatedCommission = (amt / 1000) * 3.75; // commission 3.75 Tk per 1000 Tk
    } else if (activeAction === 'pay_bill') {
      calculatedCommission = 0; // standard flat zero commission
    } else if (activeAction === 'load') {
      calculatedCommission = (amt / 1000) * 27; // commission 27 Tk per 1000 (i.e. 2.7%)
    } else if (activeAction === 'minute_card') {
      if (unitToSell) {
        calculatedCommission = received - unitToSell.buyPrice;
      } else {
        calculatedCommission = received - (selectedCardPrice - 0.5);
      }
    }

    calculatedCommission = Math.round(calculatedCommission * 100) / 100;

    // Check balances (skip cash_out and minute_card because minute_card relies on stock inventory assets)
    if (activeAction !== 'cash_out' && activeAction !== 'minute_card') {
      const availableSrcBalance = balances[activeAccount];
      if (availableSrcBalance < amt) {
        setErrorMsg(`দুঃখিত! ${activeAccount.toUpperCase()} একاون্টে যথেষ্ট ব্যালেন্স নেই। বর্তমান ব্যালেন্স: ৳${availableSrcBalance}`);
        playSound(300, 0.3, 'sawtooth');
        return;
      }
    }

    // Perform transaction balance modification
    const updatedBalances = { ...balances };

    if (activeAction === 'cash_out') {
      // Wallet increases by Amount (digital wallet gets +amount)
      // Cash decreases by Amount given to customer (cash hand gets -amount)
      updatedBalances[activeAccount] += amt;
      updatedBalances.cash -= amt;
    } else if (activeAction === 'cash_in') {
      // Wallet decreases by Amount
      // Cash increases by Amount received from customer
      updatedBalances[activeAccount] -= amt;
      updatedBalances.cash += received;
    } else if (activeAction === 'pay_bill') {
      // Wallet decreases by Amount
      // Cash increases by Amount received from customer
      updatedBalances[activeAccount] -= amt;
      updatedBalances.cash += received;
    } else if (activeAction === 'load') {
      // Retailer balance decreases by Amount
      // Cash increases by Amount received from customer
      updatedBalances[activeAccount] -= amt;
      updatedBalances.cash += received;
    } else if (activeAction === 'minute_card') {
      // Retailer SIM balance does NOT decrease because it's scratch card stock asset
      // Cash increases by amount received (received)
      updatedBalances.cash += received;

      // Decrement Card Stock (Units)
      if (unitToSell) {
        const updatedUnits = cardUnits.filter(u => u.id !== unitToSell!.id);
        saveCardUnits(updatedUnits);
      }
    }

    // We can also add commission to Cash in some workflows, but usually, we keep commission tracked in analytics.
    saveBalances(updatedBalances);

    // Save transaction
    const txnRefId = `TXN-${Date.now().toString().slice(-6)}`;
    const newTransaction: TransactionRecord = {
      id: txnRefId,
      accountKey: activeAccount,
      actionType: activeAction,
      cardPrice: activeAction === 'minute_card' ? selectedCardPrice : undefined,
      amount: amt,
      amountReceived: received,
      commission: calculatedCommission,
      phone: clientPhone,
      trxId: trxId.trim() || undefined,
      timestamp: Date.now(),
      note: note.trim() || undefined
    };

    saveTransactions([newTransaction, ...transactions]);

    // Handle telecom credit/due (baki) system
    const expectedVal = activeAction === 'minute_card' ? (selectedCardPrice + 1) : amt;
    const dueAmount = Math.max(0, expectedVal - received);
    if (isTelecomDue && dueAmount > 0) {
      let updatedCustomers = [...telecomCustomers];
      const newTxn: TelecomCustomerTxn = {
        id: `T-TX-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: 'sale_due',
        amount: dueAmount,
        date: new Date().toISOString().split('T')[0],
        note: `বাকিতে ${activeAction === 'load' ? 'ফ্লেক্সিলোড' : activeAction === 'minute_card' ? 'মিনিট কার্ড' : activeAction === 'cash_in' ? 'ক্যাশ ইন' : activeAction === 'pay_bill' ? 'পে বিল' : activeAction} (${activeAccount.toUpperCase()})` + (note.trim() ? `: ${note.trim()}` : ''),
        timestamp: Date.now(),
        transactionId: txnRefId
      };

      if (selectedTelecomCustomerId === 'new') {
        const newCustName = newTelecomCustomerName.trim() || 'নতুন গ্রাহক';
        const newCust: TelecomCustomer = {
          id: `c-${Date.now()}`,
          name: newCustName,
          phone: clientPhone === 'N/A' ? '' : clientPhone,
          due: dueAmount,
          transactions: [newTxn]
        };
        updatedCustomers = [newCust, ...updatedCustomers];
      } else {
        updatedCustomers = updatedCustomers.map(cust => {
          if (cust.id === selectedTelecomCustomerId) {
            return {
              ...cust,
              due: cust.due + dueAmount,
              transactions: [newTxn, ...cust.transactions]
            };
          }
          return cust;
        });
      }
      saveTelecomCustomers(updatedCustomers);
    }

    // Success signals
    playSound(1200, 0.15, 'sine');
    setTimeout(() => playSound(1500, 0.2, 'sine'), 120);
    setSuccessMsg('লেনদেনটি সফলভাবে সম্পন্ন ও খাতায় নথিবদ্ধ হয়েছে!');
    
    // Auto populate slip
    setSelectedSlip(newTransaction);

    // Clear form inputs
    setPhone('');
    setAmountInput('');
    setAmountReceivedInput('');
    setTrxId('');
    setNote('');
    setIsTelecomDue(false);
    setNewTelecomCustomerName('');
    setSelectedTelecomCustomerId('new');
  };

  // Direct manual balance adjustments
  const handleManualBalanceAdjustment = (e: FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;

    const amt = parseFloat(editAmountVal);
    if (isNaN(amt)) {
      alert("দয়া করে সঠিক সংখ্যা লিখুন!");
      return;
    }

    if (showEditModal === 'commission') {
      const calculatedOffset = amt - todayMetrics.commission;
      saveCommissionOffset(calculatedOffset);
    } else if (showEditModal === 'volume') {
      const calculatedOffset = amt - todayMetrics.volume;
      saveVolumeOffset(calculatedOffset);
    } else {
      const updatedBalances = { ...balances };
      if (showEditModal === 'cash') {
        updatedBalances.cash = amt;
      } else {
        updatedBalances[showEditModal] = amt;
      }
      saveBalances(updatedBalances);
    }

    playSound(880, 0.1);
    setShowEditModal(null);
    setEditAmountVal('');
  };

  // Telecom Credit/Baki Payment & Due Submit Handler
  const handleTelecomBakiSubmit = (e: FormEvent, customerId: string) => {
    e.preventDefault();
    const amt = parseFloat(bakiFormAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('দয়া করে সঠিক টাকার পরিমাণ লিখুন!');
      return;
    }

    const updatedCustomers = telecomCustomers.map(cust => {
      if (cust.id === customerId) {
        const diff = bakiActionType === 'due' ? amt : -amt;
        const newDue = Math.max(0, cust.due + diff);

        const newTxn: TelecomCustomerTxn = {
          id: `T-TX-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          type: bakiActionType === 'due' ? 'sale_due' : 'payment_received',
          amount: amt,
          date: new Date().toISOString().split('T')[0],
          note: bakiFormNote.trim() || (bakiActionType === 'payment' ? 'জমা পরিশোধ' : 'নতুন বাকি'),
          timestamp: Date.now()
        };

        return {
          ...cust,
          due: newDue,
          transactions: [newTxn, ...cust.transactions]
        };
      }
      return cust;
    });

    // If it's a cash payment received, increase the Cash balance
    if (bakiActionType === 'payment') {
      const updatedBalances = { ...balances };
      updatedBalances.cash += amt;
      saveBalances(updatedBalances);
    }

    saveTelecomCustomers(updatedCustomers);
    setBakiFormAmount('');
    setBakiFormNote('');
    playSound(1200, 0.15, 'sine');
  };

  // Update Customer Info (Name and Phone) in Baki Khata
  const handleUpdateTelecomCustomer = (customerId: string, name: string, phone: string) => {
    if (!name.trim()) {
      alert('গ্রাহকের নাম অবশ্যই দিতে হবে!');
      return;
    }
    const updated = telecomCustomers.map(cust => {
      if (cust.id === customerId) {
        return {
          ...cust,
          name: name.trim(),
          phone: phone.trim()
        };
      }
      return cust;
    });
    saveTelecomCustomers(updated);
    setEditingBakiCustomer(null);
    playSound(1100, 0.1, 'sine');
  };

  // Delete Customer from Baki Khata
  const handleDeleteTelecomCustomer = (customerId: string) => {
    const updated = telecomCustomers.filter(cust => cust.id !== customerId);
    saveTelecomCustomers(updated);
    if (selectedBakiCustomerId === customerId) {
      setSelectedBakiCustomerId(null);
    }
    setShowDeleteConfirmId(null);
    playSound(800, 0.15, 'sawtooth');
  };

  // Direct manual card stock adjustments
  const handleManualCardStockAdjustment = (e: FormEvent) => {
    e.preventDefault();
    if (!showCardEditModal) return;

    const qty = parseInt(editCardQtyVal, 10);
    if (isNaN(qty) || qty < 0) {
      alert("দয়া করে সঠিক ইতিবাচক সংখ্যা লিখুন!");
      return;
    }

    const { operator, price } = showCardEditModal;
    const matchingUnits = cardUnits.filter(u => u.operator === operator && u.cardPrice === price);
    const otherUnits = cardUnits.filter(u => !(u.operator === operator && u.cardPrice === price));

    const currentCount = matchingUnits.length;
    let updatedMatchingUnits = [...matchingUnits];

    if (qty > currentCount) {
      // Need to add (qty - currentCount) cards
      const needed = qty - currentCount;
      const defaultBuyPrice = price - 0.5;
      for (let i = 0; i < needed; i++) {
        updatedMatchingUnits.push({
          id: `UNIT-${operator}-${price}-${Date.now()}-${Math.random().toString().slice(2, 6)}-manual-${i}`,
          operator,
          cardPrice: price,
          buyPrice: defaultBuyPrice,
          timestamp: Date.now()
        });
      }
    } else if (qty < currentCount) {
      // Need to remove (currentCount - qty) cards (remove newest first, keeping oldest in stock)
      updatedMatchingUnits = updatedMatchingUnits.slice(0, qty);
    }

    const updatedUnits = [...otherUnits, ...updatedMatchingUnits];
    saveCardUnits(updatedUnits);

    playSound(880, 0.1);
    setShowCardEditModal(null);
    setEditCardQtyVal('');
  };

  // Purchasing balance & minute cards (ক্রয় অপশন)
  const handlePerformPurchase = (e: FormEvent) => {
    e.preventDefault();
    setBuySuccessMsg(null);

    const updatedBalances = { ...balances };

    if (buyTab === 'balance') {
      const amt = parseFloat(buyBalanceAmount);
      if (isNaN(amt) || amt <= 0) {
        alert('দয়া করে ক্রয়ের জন্য সঠিক অ্যামাউন্ট লিখুন।');
        return;
      }

      if (balances.cash < amt) {
        alert(`দুঃখিত! ক্যাশ ইন হ্যান্ডে পর্যাপ্ত ক্যাশ নেই। বর্তমান ক্যাশ: ৳${balances.cash}`);
        return;
      }

      // Stock up Account balance
      updatedBalances[buyAccount] += amt;
      // Decrement cash
      updatedBalances.cash -= amt;

      const newPurchase: PurchaseRecord = {
        id: `PUR-${Date.now().toString().slice(-5)}`,
        timestamp: Date.now(),
        purchaseType: 'balance',
        accountKey: buyAccount,
        amount: amt
      };

      savePurchases([newPurchase, ...purchases]);
      setBuyBalanceAmount('');
      saveBalances(updatedBalances);

    } else {
      // Stock up Minute Cards
      const qty = parseInt(buyCardQty);
      if (isNaN(qty) || qty <= 0) {
        alert('দয়া করে সঠিক সংখ্যা পরিমাণ লিখুন।');
        return;
      }

      // Purchase price config (editable cost)
      const pricePerCard = parseFloat(buyCardCostInput);
      if (isNaN(pricePerCard) || pricePerCard <= 0) {
        alert('দয়া করে সঠিক কেনা মূল্য লিখুন।');
        return;
      }
      const totalCost = qty * pricePerCard;

      if (balances.cash < totalCost) {
        alert(`দুঃখিত! পর্যাপ্ত ক্যাশ ব্যালেন্স নেই। এই ক্রয়ের জন্য ৳${totalCost} প্রয়োজন। বর্তমান ক্যাশ: ৳${balances.cash}`);
        return;
      }

      // Deduct cash from drawer
      updatedBalances.cash -= totalCost;

      // Add to Card Stock levels (Units)
      const newUnitsToAdd: CardUnit[] = [];
      for (let i = 0; i < qty; i++) {
        newUnitsToAdd.push({
          id: `UNIT-${buyCardOperator}-${buyCardPrice}-${Date.now()}-${Math.random().toString().slice(2, 6)}-${i}`,
          operator: buyCardOperator,
          cardPrice: buyCardPrice,
          buyPrice: pricePerCard,
          timestamp: Date.now()
        });
      }

      const updatedUnits = [...cardUnits, ...newUnitsToAdd];
      saveCardUnits(updatedUnits);

      const newPurchase: PurchaseRecord = {
        id: `PUR-${Date.now().toString().slice(-5)}`,
        timestamp: Date.now(),
        purchaseType: 'cards',
        accountKey: buyCardOperator as AccountKey,
        cardPrice: buyCardPrice,
        quantity: qty,
        amount: totalCost
      };

      savePurchases([newPurchase, ...purchases]);
      setBuyCardQty('5');
      saveBalances(updatedBalances);
    }

    setBuySuccessMsg('ক্রয় সফল হয়েছে এবং ব্যালেন্স/স্টকে যোগ করা হয়েছে! ক্যাশ ড্রয়ার থেকে সমান পরিমাণ টাকা কাটা হয়েছে।');
    playSound(1100, 0.2);
    setTimeout(() => {
      setBuySuccessMsg(null);
    }, 4000);
  };

  // Google Drive & Auth Handlers
  const handleGoogleLogin = async () => {
    playSound(950, 0.1);
    setDriveError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setNeedsAuth(false);
        // Load backups list after login
        await loadDriveBackupsList();
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setDriveError("গুগল ড্রাইভ অথরাইজেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  const handleGoogleLogout = async () => {
    playSound(800, 0.15);
    const confirmed = window.confirm("আপনি কি গুগল ড্রাইভ থেকে সাইন আউট করতে চান?");
    if (!confirmed) return;
    try {
      await logout();
      setGoogleUser(null);
      setNeedsAuth(true);
      setBackupList([]);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleDriveBackupUpload = async () => {
    playSound(900, 0.1);
    setDriveError(null);

    if (needsAuth || !googleUser) {
      // Prompt sign in
      try {
        const result = await googleSignIn();
        if (!result) return;
        setGoogleUser(result.user);
        setNeedsAuth(false);
      } catch (err) {
        console.error("Auth failed on backup:", err);
        setDriveError("গুগল ড্রাইভ অথরাইজেশন ব্যর্থ হয়েছে। ব্যাকআপ নেওয়া সম্ভব হয়নি।");
        return;
      }
    }

    setDriveBackingUp(true);
    setDriveBackUpSuccess(false);

    try {
      const backupData = {
        balances,
        transactions,
        purchases,
        cardStock,
        cardUnits,
        commissionOffset,
        volumeOffset,
        timestamp: Date.now()
      };
      await uploadBackupToDrive(backupData);
      setDriveBackUpSuccess(true);
      playSound(1300, 0.25);
      
      // Refresh the list of files
      await loadDriveBackupsList();
      
      setTimeout(() => setDriveBackUpSuccess(false), 6000);
    } catch (err: any) {
      console.error("Backup failed:", err);
      setDriveError("গুগল ড্রাইভে ব্যাকআপ আপলোড করতে ব্যর্থ হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন।");
    } finally {
      setDriveBackingUp(false);
    }
  };

  const handleDriveBackupRestore = async (fileId: string, fileName: string) => {
    playSound(950, 0.15);
    const confirmed = window.confirm(
      `সতর্কবার্তা!\n\nআপনি কি নিশ্চিতভাবে "${fileName}" ব্যাকআপ ফাইলটি থেকে ডাটা রিস্টোর করতে চান?\n\nএর ফলে আপনার বর্তমান ফোনের সমস্ত ট্রানজেকশন, ব্যালেন্স এবং স্টক ডিলিট হয়ে ব্যাকআপের ডাটা দিয়ে রিপ্লেস হয়ে যাবে। এই কাজ আর আনডু করা যাবে না!`
    );
    if (!confirmed) return;

    setLoadingBackups(true);
    setDriveError(null);

    try {
      const backupData = await downloadBackupFromDrive(fileId);
      
      if (!backupData || (!backupData.balances && !backupData.transactions)) {
        throw new Error("Invalid backup format");
      }

      if (backupData.balances) saveBalances(backupData.balances);
      if (backupData.cardUnits) {
        saveCardUnits(backupData.cardUnits);
      } else if (backupData.cardStock) {
        reconstructCardUnitsFromStock(backupData.cardStock);
      }
      if (backupData.transactions) saveTransactions(backupData.transactions);
      if (backupData.purchases) savePurchases(backupData.purchases);
      
      if (typeof backupData.commissionOffset === 'number') {
        saveCommissionOffset(backupData.commissionOffset);
      }
      if (typeof backupData.volumeOffset === 'number') {
        saveVolumeOffset(backupData.volumeOffset);
      }

      playSound(1200, 0.3);
      alert("অভিনন্দন! গুগল ড্রাইভ থেকে ডাটা রিস্টোর সফল হয়েছে এবং আপনার ডাটাবেস আপডেট করা হয়েছে।");
    } catch (err: any) {
      console.error("Restore failed:", err);
      setDriveError("ড্রাইভ ফাইল থেকে ডাটা রিস্টোর করতে সমস্যা হয়েছে। ব্যাকআপ ফাইলটি সঠিক কিনা নিশ্চিত করুন।");
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleDriveBackupDelete = async (fileId: string, fileName: string) => {
    playSound(800, 0.2);
    const confirmed = window.confirm(
      `আপনি কি নিশ্চিতভাবে গুগল ড্রাইভ থেকে "${fileName}" ব্যাকআপ ফাইলটি চিরতরে ডিলিট করতে চান?`
    );
    if (!confirmed) return;

    setLoadingBackups(true);
    setDriveError(null);

    try {
      await deleteBackupFromDrive(fileId);
      await loadDriveBackupsList();
      playSound(1000, 0.15);
    } catch (err: any) {
      console.error("Delete failed:", err);
      setDriveError("ব্যাকআপ ফাইলটি ডিলিট করতে সমস্যা হয়েছে। দয়া করে আবার ট্রাই করুন।");
    } finally {
      setLoadingBackups(false);
    }
  };

  // Download statement as clean UTF-8 CSV
  const handleCSVDownload = () => {
    playSound(950, 0.1);
    
    // Filtering statement records as scheduled
    const listToExport = filteredTransactionsForStatement;
    if (listToExport.length === 0) {
      alert('রপ্তানি করার মতো কোনো স্টেটমেন্ট রেকর্ড পাওয়া যায়নি!');
      return;
    }

    let csvContent = "\uFEFF"; // UTF-8 byte order mark to display Bengali correctly in Excel
    csvContent += "Serial No,ID,Date,Service Mobile,Account,Action Type,Price (Amount),Amount Received (Cash In),Commission (Profit),Transaction ID,Note\n";
    
    listToExport.forEach((t, i) => {
      const serial = i + 1;
      const formattedDate = new Date(t.timestamp).toLocaleDateString('bn-BD') + " " + new Date(t.timestamp).toLocaleTimeString('bn-BD');
      const serviceName = translateActionType(t.actionType, t.cardPrice);
      const isCard = t.actionType === 'minute_card';
      const actualAmt = isCard ? (t.cardPrice || 0) : t.amount;
      
      csvContent += `${serial},"${t.id}","${formattedDate}","${t.phone}","${t.accountKey.toUpperCase()}","${serviceName}",${actualAmt},${t.amountReceived},${t.commission},"${t.trxId || ''}","${t.note || ''}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `nazmul_telecom_statement_${statementFilter}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper Translate function Bangla text
  const translateActionType = (act: TransactionActionType, cardPrice?: number) => {
    switch (act) {
      case 'cash_out': return 'ক্যাশ আউট';
      case 'cash_in': return 'ক্যাশ ইন';
      case 'pay_bill': return 'পে বিল';
      case 'load': return 'ফ্লেক্সিলোড রিচার্জ';
      case 'minute_card': return `${cardPrice} টাকার মিনিট কার্ড`;
      default: return act;
    }
  };

  // Filtering transactions for Daily/Monthly lists
  const filteredTransactionsForStatement = useMemo(() => {
    return transactions.filter(t => {
      // Query filter
      const matchesSearch = searchQuery === '' || 
        t.phone.includes(searchQuery) || 
        (t.trxId && t.trxId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.id.includes(searchQuery);

      if (!matchesSearch) return false;

      // Period filter
      if (statementFilter === 'all') return true;

      const recordDate = new Date(t.timestamp);
      const today = new Date();

      if (statementFilter === 'daily') {
        const isToday = recordDate.getDate() === today.getDate() && 
                        recordDate.getMonth() === today.getMonth() && 
                        recordDate.getFullYear() === today.getFullYear();
        return isToday;
      }

      if (statementFilter === 'monthly') {
        const isThisMonth = recordDate.getMonth() === today.getMonth() && 
                            recordDate.getFullYear() === today.getFullYear();
        return isThisMonth;
      }

      return true;
    });
  }, [transactions, statementFilter, searchQuery]);

  // Import Backup logic
  const handleBackupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.balances && data.transactions && data.cardStock) {
          saveBalances(data.balances);
          if (data.cardUnits) {
            saveCardUnits(data.cardUnits);
          } else {
            reconstructCardUnitsFromStock(data.cardStock);
          }
          saveTransactions(data.transactions);
          if (data.purchases) savePurchases(data.purchases);
          alert('অভিনন্দন! আপনার ব্যাকআপ ডাটা সফলভাবে টেলিকমে পুনরুদ্ধার করা হয়েছে।');
          playSound(1500, 0.3);
        } else {
          alert('ভুল ফাইল ফরম্যাট! ডাটা ঠিকভাবে রিড করা সম্ভব হয়নি।');
        }
      } catch (err) {
        alert('ফাইল রীড করার সময় গোলযোগ দেখা দিয়েছে।');
      }
    };
    reader.readAsText(file);
  };

  // Download raw database backup JSON
  const downloadJSONBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      balances,
      transactions,
      purchases,
      cardStock,
      cardUnits,
      timestamp: Date.now()
    }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `nazmul_telecom_backup_raw_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  // Delete transaction record with verification sound
  const handleDeleteTransaction = (id: string) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই লেনদেন রেকর্ড খাতা থেকে মুছে ফেলতে চান? এটি ব্যালেন্স পুনরায় রিভার্ট করবে না।")) {
      const remaining = transactions.filter(t => t.id !== id);
      saveTransactions(remaining);
      playSound(350, 0.2, 'sawtooth');
    }
  };

  // Revert and void transaction completely
  const handleCancelAndRevertTransaction = (id: string) => {
    const txn = transactions.find(t => t.id === id);
    if (!txn) return;

    if (confirm(`আপনি কি নিশ্চিতভাবে এই লেনদেনটি বাতিল ও রিভার্ট করতে চান? \n\nধরণ: ${translateActionType(txn.actionType, txn.cardPrice)}\nপরিমাণ: ৳${txn.amount}\n\nবাতিল করলে টাকা পূর্বের ব্যালেন্স ও স্টকে স্বয়ংক্রিয়ভাবে ফেরত যাবে!`)) {
      const updatedBalances = { ...balances };
      const updatedCardStock = { ...cardStock };

      if (txn.actionType === 'cash_out') {
        // Cash Out did: wallet += amt, cash -= amt
        updatedBalances[txn.accountKey] -= txn.amount;
        updatedBalances.cash += txn.amount;
      } else if (txn.actionType === 'cash_in' || txn.actionType === 'pay_bill' || txn.actionType === 'load') {
        // Did: wallet -= amt, cash += received
        updatedBalances[txn.accountKey] += txn.amount;
        updatedBalances.cash -= txn.amountReceived;
      } else if (txn.actionType === 'minute_card') {
        // Did: cash += received, stock -= 1
        updatedBalances.cash -= txn.amountReceived;
        
        const operator = txn.accountKey as 'gp' | 'robi' | 'airtel' | 'banglalink';
        const price = txn.cardPrice as 19 | 29 | 39 | 49;
        const buyPrice = txn.amountReceived - txn.commission;

        const returnedUnit: CardUnit = {
          id: `UNIT-${operator}-${price}-${Date.now()}-reverted-${Math.random().toString().slice(2, 6)}`,
          operator,
          cardPrice: price,
          buyPrice: buyPrice || (price - 0.5),
          timestamp: Date.now()
        };

        const updatedUnits = [returnedUnit, ...cardUnits];
        saveCardUnits(updatedUnits);
      }

      saveBalances(updatedBalances);

      // Remove transaction from ledger
      const remaining = transactions.filter(t => t.id !== id);
      saveTransactions(remaining);

      playSound(350, 0.25, 'sawtooth');
      alert('লেনদেনেটি সফলভাবে বাতিল করা হয়েছে এবং সকল ব্যালেন্স ও স্টক পূর্বের অবস্থায় ফেরত নেওয়া হয়েছে।');
    }
  };

  // Handle manual ledger clear
  const handleResetLedger = () => {
    if (confirm("সতর্কতা! আপনি কি আজকের ডিজিটাল লেনদেনের খাতা সম্পূর্ণ মুছে ফেলতে চান?")) {
      saveTransactions([]);
      savePurchases([]);
      playSound(400, 0.4, 'triangle');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-pink-100 antialiased text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      
      {/* Top Multi-Store Mode Switcher */}
      <div className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center py-2 sm:h-16 gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏪</span>
            <div>
              <span className="font-extrabold tracking-tight text-sm sm:text-base text-slate-100 block sm:inline">নাজমুল মাল্টি-স্টোর</span>
              <span className="text-[10px] sm:ml-2 font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-bold">MULTI v2.5</span>
            </div>
          </div>
          
          <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800/80 shadow-inner w-full sm:w-auto">
            <button
              onClick={() => { setAppMode('telecom'); playSound(1000, 0.1); }}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${appMode === 'telecom' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
            >
              <span>📱</span> টেলিকম রিচার্জ
            </button>
            <button
              onClick={() => { setAppMode('general_store'); playSound(1200, 0.1); }}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${appMode === 'general_store' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
            >
              <span>🏪</span> জেনারেল স্টোর
            </button>
          </div>
        </div>
      </div>

      {appMode === 'general_store' ? (
        <GeneralStore 
          soundEnabled={soundEnabled} 
          playSound={playSound}
          onSwitchToTelecom={() => { setAppMode('telecom'); playSound(1000, 0.1); }}
        />
      ) : (
        <>
          {/* 1. Header Banner & Sound control */}
      <header id="app_header" className="bg-slate-900 text-white shadow-md border-b-2 border-indigo-500 py-5 px-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-inner text-white animate-pulse">
              <Store size={26} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                নাজমুল টেলিকম <span className="text-[10px] uppercase font-mono font-bold bg-pink-600 text-white px-2 py-0.5 rounded-full select-none">Live v2.0</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">বিকাশ, নগদ, রকেট ওয়ালেট ও অপারেটর রিচার্জ খাতা সিস্টেম</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-slate-300">
            <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 font-sans font-bold flex items-center gap-1.5 text-indigo-300">
              <Wifi size={14} className="text-emerald-500" /> Web App Terminal
            </span>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all ${soundEnabled ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}
              title={soundEnabled ? "সাউন্ড বন্ধ করুন" : "সাউন্ড অন করুন"}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span>{soundEnabled ? "শব্দ সক্রিয়" : "বধির মোড"}</span>
            </button>

            <button 
              onClick={() => { setDarkMode(!darkMode); playSound(880, 0.05); }}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all ${darkMode ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
              title={darkMode ? "লাইট মোড চালু করুন" : "ডার্ক মোড চালু করুন"}
            >
              {darkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-300" />}
              <span>{darkMode ? "লাইট মোড" : "ডার্ক মোড"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 1.5 View Control Switch */}
      <nav id="view_navigation_tabs" className="bg-slate-100 py-3 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full max-w-sm sm:max-w-md grid grid-cols-2 gap-1 font-sans">
            <button
              onClick={() => { setMainView('txn'); playSound(950, 0.05); }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mainView === 'txn' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Smartphone size={15} />
              নতুন লেনদেন উইন্ডো
            </button>
            <button
              onClick={() => { setMainView('summary'); playSound(950, 0.05); }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mainView === 'summary' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <BarChart3 size={15} />
              ম্যানেজার ড্যাশবোর্ড ও খাতা
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Top-Level High Fidelity Metrics row */}
      {mainView === 'summary' && (
        <section id="metric-summary-panel" className="bg-white border-b border-slate-200 shadow-sm py-5 px-4 animate-fade-in">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Online Balance */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl p-4 border border-indigo-100 flex items-center justify-between shadow-sm">
              <div>
                <span className="block text-[11px] uppercase text-indigo-600 font-bold tracking-wider mb-1">মোট অনলাইন ব্যালেন্স</span>
                <strong className="text-base sm:text-lg md:text-xl font-black text-indigo-950 font-mono tracking-tight">
                  ৳{toBengaliNumber(totalOnlineBalance.toLocaleString('en-US'))}
                </strong>
                <p className="text-[9px] text-indigo-500 font-medium mt-0.5">সবগুলো মোবাইল ওয়াлеটের মোট যোগফল</p>
              </div>
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow">
                <Wallet size={18} />
              </div>
            </div>

            {/* Cash In Hand drawer */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="block text-[11px] uppercase text-emerald-700 font-bold tracking-wider mb-1">ক্যাশ টাকা (ড্রয়ার)</span>
                  <button 
                    onClick={() => {
                      setShowEditModal('cash');
                      setEditAmountVal(String(balances.cash));
                      playSound(900, 0.05);
                    }}
                    className="text-emerald-600 hover:text-emerald-800 p-0.5 whitespace-nowrap cursor-pointer" 
                    title="ক্যাশ এডিট করুন"
                  >
                    <Edit2 size={11} />
                  </button>
                </div>
                <strong className="text-base sm:text-lg md:text-xl font-black text-emerald-950 font-mono tracking-tight block">
                  ৳{toBengaliNumber(displayCashWithCommission.toLocaleString('en-US'))}
                </strong>
                <p className="text-[10px] text-emerald-650 font-bold mt-0.5 select-none block">
                  শুধু ক্যাশ: ৳{toBengaliNumber(balances.cash.toLocaleString('en-US'))}
                </p>
                <p className="text-[9px] text-emerald-500 font-medium select-none block">হাতে ক্যাশ লেনদেন ফান্ড ক্যাপিটাল</p>
              </div>
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow">
                <Coins size={18} />
              </div>
            </div>

            {/* Today's Commission */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-2xl p-4 border border-pink-100 flex items-center justify-between shadow-sm animate-fade-in">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="block text-[11px] uppercase text-pink-700 font-bold tracking-wider mb-1">আজকের মোট কমিশন</span>
                  <button 
                    onClick={() => {
                      setShowEditModal('commission');
                      setEditAmountVal(String(activeCommission));
                      playSound(900, 0.05);
                    }}
                    className="text-pink-600 hover:text-pink-800 p-0.5 whitespace-nowrap cursor-pointer" 
                    title="কমিশন এডিট করুন"
                  >
                    <Edit2 size={11} />
                  </button>
                </div>
                <strong className="text-base sm:text-lg md:text-xl font-black text-pink-950 font-mono tracking-tight">
                  ৳{toBengaliNumber(activeCommission.toLocaleString('en-US'))}
                </strong>
                <p className="text-[9px] text-pink-500 font-bold mt-0.5">১০০% রিয়েল-টাইম হিসাব প্রফিট</p>
              </div>
              <div className="w-10 h-10 bg-pink-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow">
                <TrendingUp size={18} />
              </div>
            </div>

            {/* Today's Volume */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl p-4 border border-cyan-100 flex items-center justify-between shadow-sm animate-fade-in">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="block text-[11px] uppercase text-cyan-700 font-bold tracking-wider mb-1">আজকের মোট লেনদেন</span>
                  <button 
                    onClick={() => {
                      setShowEditModal('volume');
                      setEditAmountVal(String(activeVolume));
                      playSound(900, 0.05);
                    }}
                    className="text-cyan-600 hover:text-cyan-800 p-0.5 whitespace-nowrap cursor-pointer" 
                    title="লেনদেন ভলিউম এডিট করুন"
                  >
                    <Edit2 size={11} />
                  </button>
                </div>
                <strong className="text-base sm:text-lg md:text-xl font-black text-cyan-950 font-mono tracking-tight">
                  ৳{toBengaliNumber(activeVolume.toLocaleString('en-US'))}
                </strong>
                <p className="text-[9px] text-cyan-500 font-medium mt-0.5">আজকে সম্পন্ন করা মোট খাতা ভলিউম</p>
              </div>
              <div className="w-10 h-10 bg-cyan-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow">
                <History size={18} />
              </div>
            </div>

          </div>
        </section>
      )}

      {/* 3. Account balance visual list (বিকাশ, নগদ, রকেট, জিপি, রবি, এয়ারটেল, বাংলালিংক এর আলাদা ব্যালেন্স) */}
      {mainView === 'txn' && (
        <div className="bg-slate-100 py-2.5 px-4 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 select-none">
            <Layers size={10} className="text-slate-500" />
            ওয়ালেট ও সিম ক্যাশ ব্যালেন্স সমূহ (ক্লিক করে সোর্স নির্বাচন করুন):
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            
            {/* bKash Card */}
            <div 
              onClick={() => {
                setActiveAccount('bkash');
                playSound(950, 0.05);
              }}
              className={`rounded-xl p-2 md:p-2.5 border transition-all cursor-pointer relative select-none ${activeAccount === 'bkash' ? 'bg-pink-600 text-white border-pink-700 shadow ring-2 ring-pink-350' : 'bg-white hover:bg-pink-50 text-slate-800 border-slate-200 hover:border-pink-350'}`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-extrabold text-[10px] sm:text-xs">বিকাশ</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditModal('bkash');
                    setEditAmountVal(String(balances.bkash));
                    playSound(900, 0.05);
                  }}
                  className={`p-0.5 rounded cursor-pointer transition-colors ${activeAccount === 'bkash' ? 'text-pink-200 hover:text-white hover:bg-pink-700/40' : 'text-slate-400 hover:text-pink-600 hover:bg-slate-100'}`} 
                  title="বিকাশ ব্যালেন্স এডিট"
                >
                  <Edit2 size={9} />
                </button>
              </div>
              <div className="mt-0.5">
                <strong className="text-xs sm:text-sm md:text-base font-black font-mono tracking-tight leading-none block">
                  ৳{balances.bkash.toLocaleString('en-US')}
                </strong>
              </div>
            </div>

            {/* Nagad Card */}
            <div 
              onClick={() => {
                setActiveAccount('nagad');
                playSound(950, 0.05);
              }}
              className={`rounded-xl p-2 md:p-2.5 border transition-all cursor-pointer relative select-none ${activeAccount === 'nagad' ? 'bg-orange-600 text-white border-orange-700 shadow ring-2 ring-orange-355' : 'bg-white hover:bg-orange-50 text-slate-800 border-slate-200 hover:border-orange-355'}`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-extrabold text-[10px] sm:text-xs">নগদ</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditModal('nagad');
                    setEditAmountVal(String(balances.nagad));
                    playSound(900, 0.05);
                  }}
                  className={`p-0.5 rounded cursor-pointer transition-colors ${activeAccount === 'nagad' ? 'text-orange-200 hover:text-white hover:bg-orange-700/40' : 'text-slate-400 hover:text-orange-650 hover:bg-slate-100'}`} 
                  title="নগদ ব্যালেন্স এডিট"
                >
                  <Edit2 size={9} />
                </button>
              </div>
              <div className="mt-0.5">
                <strong className="text-xs sm:text-sm md:text-base font-black font-mono tracking-tight leading-none block">
                  ৳{balances.nagad.toLocaleString('en-US')}
                </strong>
              </div>
            </div>

            {/* Rocket Card */}
            <div 
              onClick={() => {
                setActiveAccount('rocket');
                playSound(950, 0.05);
              }}
              className={`rounded-xl p-2 md:p-2.5 border transition-all cursor-pointer relative select-none ${activeAccount === 'rocket' ? 'bg-violet-600 text-white border-violet-700 shadow ring-2 ring-violet-350' : 'bg-white hover:bg-violet-50 text-slate-800 border-slate-200 hover:border-violet-350'}`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-extrabold text-[10px] sm:text-xs">রকেট</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditModal('rocket');
                    setEditAmountVal(String(balances.rocket));
                    playSound(900, 0.05);
                  }}
                  className={`p-0.5 rounded cursor-pointer transition-colors ${activeAccount === 'rocket' ? 'text-violet-200 hover:text-white hover:bg-violet-700/40' : 'text-slate-400 hover:text-violet-600 hover:bg-slate-100'}`} 
                  title="রকেট ব্যালেন্স এডিট"
                >
                  <Edit2 size={9} />
                </button>
              </div>
              <div className="mt-0.5">
                <strong className="text-xs sm:text-sm md:text-base font-black font-mono tracking-tight leading-none block">
                  ৳{balances.rocket.toLocaleString('en-US')}
                </strong>
              </div>
            </div>

            {/* GP Card */}
            <div 
              onClick={() => {
                setActiveAccount('gp');
                playSound(950, 0.05);
              }}
              className={`rounded-xl p-2 md:p-2.5 border transition-all cursor-pointer relative select-none ${activeAccount === 'gp' ? 'bg-sky-600 text-white border-sky-700 shadow ring-2 ring-sky-350' : 'bg-white hover:bg-sky-50 text-slate-800 border-slate-200 hover:border-sky-350'}`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-extrabold text-[10px] sm:text-xs">জিপি</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditModal('gp');
                    setEditAmountVal(String(balances.gp));
                    playSound(900, 0.05);
                  }}
                  className={`p-0.5 rounded cursor-pointer transition-colors ${activeAccount === 'gp' ? 'text-sky-200 hover:text-white hover:bg-sky-700/40' : 'text-slate-400 hover:text-sky-600 hover:bg-slate-100'}`} 
                  title="জিপি রিটেইলার ব্যালেন্স এডিট"
                >
                  <Edit2 size={9} />
                </button>
              </div>
              <div className="mt-0.5">
                <strong className="text-xs sm:text-sm md:text-base font-black font-mono tracking-tight leading-none block">
                  ৳{getOperatorTotalBalance('gp').toLocaleString('en-US')}
                </strong>
                <span className={`text-[7px] sm:text-[8px] font-bold block mt-0.5 select-none tracking-tighter truncate ${activeAccount === 'gp' ? 'text-sky-100' : 'text-slate-400'}`}>
                  সিম: ৳{balances.gp.toLocaleString()} |  কার্ড: ৳{getCardStockValue('gp').toLocaleString()}
                </span>
              </div>
            </div>

            {/* Robi Card */}
            <div 
              onClick={() => {
                setActiveAccount('robi');
                playSound(950, 0.05);
              }}
              className={`rounded-xl p-2 md:p-2.5 border transition-all cursor-pointer relative select-none ${activeAccount === 'robi' ? 'bg-rose-600 text-white border-rose-700 shadow ring-2 ring-rose-350' : 'bg-white hover:bg-rose-50 text-slate-800 border-slate-200 hover:border-rose-350'}`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-extrabold text-[10px] sm:text-xs">রবি</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditModal('robi');
                    setEditAmountVal(String(balances.robi));
                    playSound(900, 0.05);
                  }}
                  className={`p-0.5 rounded cursor-pointer transition-colors ${activeAccount === 'robi' ? 'text-rose-200 hover:text-white hover:bg-rose-700/40' : 'text-slate-400 hover:text-rose-650 hover:bg-slate-100'}`} 
                  title="রবি রিটেইলার ব্যালেন্স এডিট"
                >
                  <Edit2 size={9} />
                </button>
              </div>
              <div className="mt-0.5">
                <strong className="text-xs sm:text-sm md:text-base font-black font-mono tracking-tight leading-none block">
                  ৳{getOperatorTotalBalance('robi').toLocaleString('en-US')}
                </strong>
                <span className={`text-[7px] sm:text-[8px] font-bold block mt-0.5 select-none tracking-tighter truncate ${activeAccount === 'robi' ? 'text-rose-100' : 'text-slate-400'}`}>
                  সিম: ৳{balances.robi.toLocaleString()} |  কার্ড: ৳{getCardStockValue('robi').toLocaleString()}
                </span>
              </div>
            </div>

            {/* Airtel Card */}
            <div 
              onClick={() => {
                setActiveAccount('airtel');
                playSound(950, 0.05);
              }}
              className={`rounded-xl p-2 md:p-2.5 border transition-all cursor-pointer relative select-none ${activeAccount === 'airtel' ? 'bg-red-600 text-white border-red-700 shadow ring-2 ring-red-355' : 'bg-white hover:bg-red-50 text-slate-800 border-slate-200 hover:border-red-350'}`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-extrabold text-[10px] sm:text-xs">এয়ারটেল</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditModal('airtel');
                    setEditAmountVal(String(balances.airtel));
                    playSound(900, 0.05);
                  }}
                  className={`p-0.5 rounded cursor-pointer transition-colors ${activeAccount === 'airtel' ? 'text-red-200 hover:text-white hover:bg-red-700/40' : 'text-slate-400 hover:text-red-650 hover:bg-slate-100'}`} 
                  title="এয়ারটেল রিটেইলার ব্যালেন্স এডিট"
                >
                  <Edit2 size={9} />
                </button>
              </div>
              <div className="mt-0.5">
                <strong className="text-xs sm:text-sm md:text-base font-black font-mono tracking-tight leading-none block">
                  ৳{getOperatorTotalBalance('airtel').toLocaleString('en-US')}
                </strong>
                <span className={`text-[7px] sm:text-[8px] font-bold block mt-0.5 select-none tracking-tighter truncate ${activeAccount === 'airtel' ? 'text-red-100' : 'text-slate-400'}`}>
                  সিম: ৳{balances.airtel.toLocaleString()} |  কার্ড: ৳{getCardStockValue('airtel').toLocaleString()}
                </span>
              </div>
            </div>

            {/* Banglalink Card */}
            <div 
              onClick={() => {
                setActiveAccount('banglalink');
                playSound(950, 0.05);
              }}
              className={`rounded-xl p-2 md:p-2.5 border transition-all cursor-pointer relative select-none ${activeAccount === 'banglalink' ? 'bg-orange-500 text-white border-orange-600 shadow ring-2 ring-orange-251' : 'bg-white hover:bg-orange-50 text-slate-800 border-slate-200 hover:border-orange-255'}`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-extrabold text-[10px] sm:text-xs">বাংলালিংক</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditModal('banglalink');
                    setEditAmountVal(String(balances.banglalink));
                    playSound(900, 0.05);
                  }}
                  className={`p-0.5 rounded cursor-pointer transition-colors ${activeAccount === 'banglalink' ? 'text-orange-200 hover:text-white hover:bg-orange-600/40' : 'text-slate-400 hover:text-orange-550 hover:bg-slate-100'}`} 
                  title="বাংলালিংক রিটেইলার ব্যালেন্স এডিট"
                >
                  <Edit2 size={9} />
                </button>
              </div>
              <div className="mt-0.5">
                <strong className="text-xs sm:text-sm md:text-base font-black font-mono tracking-tight leading-none block">
                  ৳{getOperatorTotalBalance('banglalink').toLocaleString('en-US')}
                </strong>
                <span className={`text-[7px] sm:text-[8px] font-bold block mt-0.5 select-none tracking-tighter truncate ${activeAccount === 'banglalink' ? 'text-orange-100' : 'text-slate-400'}`}>
                  সিম: ৳{balances.banglalink.toLocaleString()} |  কার্ড: ৳{getCardStockValue('banglalink').toLocaleString()}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
      )}

      {/* 4. Main Body Split Workspace */}
      <main className={`flex-1 max-w-7xl w-full mx-auto p-4 ${mainView === 'txn' ? 'flex justify-center' : 'grid grid-cols-1 lg:grid-cols-11 gap-6 items-start'}`}>
        
        {/* Left Side: New Transaction Entry Panel */}
        {mainView === 'txn' && (
          <section className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 space-y-4">
          
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-sm md:text-base text-slate-800 flex items-center gap-1.5 select-none">
              <PlusCircle size={18} className="text-indigo-600" />
              নতুন লেনদেন করুন (Transact)
            </h2>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                মেইল ও লোকাল খাতা
              </span>
            </div>
          </div>

          {/* Active Account display banner */}
          <div className={`p-3 rounded-xl flex items-center justify-between border ${activeAccount === 'bkash' ? 'bg-pink-50 border-pink-100 text-pink-700' : activeAccount === 'nagad' ? 'bg-orange-50 border-orange-100 text-orange-700' : activeAccount === 'rocket' ? 'bg-violet-50 border-violet-100 text-violet-700' : 'bg-sky-50 border-sky-100 text-sky-700'}`}>
            <div className="flex items-center gap-1.5 select-none">
              <Smartphone size={16} />
              <div className="text-left leading-none">
                <span className="text-[9px] uppercase font-bold tracking-widest opacity-80 block">Selected account:</span>
                <span className="text-xs font-black">{activeAccount.toUpperCase()} Digital Asset</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded-lg border">
              ব্যালেন্স: ৳{toBengaliNumber(balances[activeAccount].toLocaleString('en-US'))}
            </span>
          </div>

          <form onSubmit={handlePerformTransaction} className="space-y-4">
            
            {/* Dynamic Interactive Service type selection inside selected account */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">লেনদেনের ধরণ (Service):</label>
              
              {/* E-Wallet Accounts Context */}
              {(activeAccount === 'bkash' || activeAccount === 'nagad' || activeAccount === 'rocket') ? (
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setActiveAction('cash_out'); playSound(920, 0.05); }}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all ${activeAction === 'cash_out' ? 'bg-indigo-600 text-white border-indigo-700 font-extrabold shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    ক্যাশ আউট
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveAction('cash_in'); playSound(920, 0.05); }}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all ${activeAction === 'cash_in' ? 'bg-indigo-600 text-white border-indigo-700 font-extrabold shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    ক্যাশ ইন
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveAction('pay_bill'); playSound(920, 0.05); }}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all ${activeAction === 'pay_bill' ? 'bg-indigo-600 text-white border-indigo-700 font-extrabold shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    পে বিল
                  </button>
                </div>
              ) : (
                /* Mobile SIM Operators Context */
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setActiveAction('load'); playSound(920, 0.05); }}
                    className={`py-2 px-2 text-center rounded-lg border text-xs font-bold transition-all ${activeAction === 'load' ? 'bg-indigo-600 text-white border-indigo-700 font-extrabold shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    ফ্লেক্সিলোড
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveAction('minute_card'); playSound(920, 0.05); }}
                    className={`py-2 px-2 text-center rounded-lg border text-xs font-bold transition-all ${activeAction === 'minute_card' ? 'bg-indigo-600 text-white border-indigo-700 font-extrabold shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    মিনিট কার্ড
                  </button>
                </div>
              )}
            </div>

            {/* Dynamic Minute Card options view */}
            {activeAction === 'minute_card' && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
                <span className="block text-[10px] text-indigo-700 font-extrabold uppercase">মিনিট কার্ডের সাইজ নির্বাচন করুন:</span>
                <div className="grid grid-cols-4 gap-1">
                  {[19, 29, 39, 49].map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => {
                        setSelectedCardPrice(size as 19 | 29 | 39 | 49);
                        playSound(1050, 0.05);
                      }}
                      className={`py-1 px-0.5 text-center text-xs font-bold rounded border ${selectedCardPrice === size ? 'bg-pink-600 text-white border-pink-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                      {size} টাকা
                    </button>
                  ))}
                </div>
                
                {/* Visual Formula presentation breakdown */}
                <div className="text-[10px] text-slate-500 bg-white p-2 rounded border border-slate-100 leading-normal space-y-0.5">
                  <div className="flex justify-between">
                    <span>স্টক একাউন্ট থেকে কাটবে:</span>
                    <strong className="font-mono text-slate-700">৳{selectedCardPrice - 0.5}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>কাস্টমার ক্যাশ পরিশোধ করবে:</span>
                    <strong className="font-mono text-slate-700">৳{selectedCardPrice + 1}</strong>
                  </div>
                  <div className="flex justify-between text-pink-600 font-bold border-t border-slate-100 pt-0.5 mt-0.5">
                    <span>আপনার নিট লাভ (কমিশন):</span>
                    <strong className="font-mono">৳১.৫০</strong>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>বর্তমান স্টক:</span>
                    <strong>{(cardStock[activeAccount as 'gp' | 'robi' | 'airtel' | 'banglalink']?.[selectedCardPrice] ?? 0)} টি</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Commission Policy visual brief alert badge */}
            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-[10px] flex items-center gap-1 text-slate-500 select-none">
              <Info size={12} className="text-slate-400 shrink-0" />
              <span>
                {activeAction === 'cash_out' && "কমিশন নীতি: হাজারে ৪ টাকা বা ০.৪% লাভ যোগ হবে।"}
                {activeAction === 'cash_in' && "কমিশন নীতি: হাজারে ৩.৭৫ টাকা বা ০.৩৭৫% লাভ যোগ হবে।"}
                {activeAction === 'pay_bill' && "কমিশন নীতি: এই সেবায় কোনো কমিশন বা লাভ প্রযোজ্য নয়।"}
                {activeAction === 'load' && "কমিশন নীতি: ফ্লেক্সিলোডে হাজারে ২৭ টাকা বা ২.৭% সাব-কমিশন লাভ।"}
                {activeAction === 'minute_card' && "কমিশন নীতি: প্রতি কার্ড বিক্রিতে নিশ্চিত ৳১.৫০ টাকা লাভ।"}
              </span>
            </div>

            {/* Client Mobile Number Input */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">গ্রাহকের মোবাইল নম্বর (ঐচ্ছিক):</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="যেমন: 01700000000 (ঐচ্ছিক)"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-sm font-bold font-mono tracking-wide focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-[9px] text-slate-400 select-none uppercase font-bold">
                  Autodetect
                </span>
              </div>
            </div>

            {/* Price section: From Account and Cash received */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">
                  {activeAction === 'minute_card' ? 'একাউন্ট থেকে কাটবে (Minus):' : 'টাকার পরিমাণ (Amount):'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    disabled={activeAction === 'minute_card'}
                    placeholder="৳ টাকার সংখ্যা"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed border border-slate-200 focus:bg-white rounded-xl px-3 py-2 pl-6 text-xs sm:text-sm font-black font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                  <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs font-bold">৳</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">কাস্টমার থেকে পেয়েছি (Cash):</label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    disabled={activeAction === 'minute_card' && !isTelecomDue}
                    placeholder="৳ পেয়েছি"
                    value={amountReceivedInput}
                    onChange={(e) => setAmountReceivedInput(e.target.value)}
                    className="w-full bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed border border-slate-200 focus:bg-white rounded-xl px-3 py-2 pl-6 text-xs sm:text-sm font-black font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                  <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs font-bold">৳</span>
                </div>
              </div>
            </div>

            {/* TrxID (ঐচ্ছিক) */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">TrxID / ট্রানজেকশন আইডি (ঐচ্ছিক):</label>
              <input
                type="text"
                placeholder="যেমন: CKB29398AZ3"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
              />
            </div>

            {/* Note / বিবরণ (ঐচ্ছিক) */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">লেনদেন মন্তব্য / বিবরণ (ঐচ্ছিক):</label>
              <input
                type="text"
                placeholder="যেমন: ডেক্সটপ রিচার্জ, বাকী হিসাব ইত্যাদি"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Telecom Credit/Due (Baki) section */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isTelecomDue}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsTelecomDue(checked);
                    playSound(1000, 0.05);
                    if (checked) {
                      setAmountReceivedInput('0');
                    } else {
                      if (activeAction === 'minute_card') {
                        setAmountReceivedInput(String(selectedCardPrice + 1));
                      } else {
                        setAmountReceivedInput(amountInput);
                      }
                    }
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase">
                  বাকিতে লেনদেন (Baki/Due Transaction)?
                </span>
              </label>

              {isTelecomDue && (
                <div className="space-y-2.5 pt-1.5 border-t border-slate-200 dark:border-slate-800 animate-fadeIn">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                      বাকির খাতার কাস্টমার নির্বাচন করুন:
                    </label>
                    <select
                      value={selectedTelecomCustomerId}
                      onChange={(e) => {
                        setSelectedTelecomCustomerId(e.target.value);
                        playSound(1000, 0.05);
                      }}
                      className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="new">+ নতুন কাস্টমার যোগ করুন</option>
                      {telecomCustomers.map(cust => (
                        <option key={cust.id} value={cust.id}>
                          {cust.name} {cust.phone ? `(${cust.phone})` : ''} - বাকি: ৳{cust.due}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedTelecomCustomerId === 'new' && (
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                        নতুন কাস্টমারের নাম:
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: রহিম কাকা, মাসুদ ভাই"
                        value={newTelecomCustomerName}
                        onChange={(e) => setNewTelecomCustomerName(e.target.value)}
                        className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        required={isTelecomDue}
                      />
                    </div>
                  )}

                  {/* Visual calculator of baki amount */}
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 font-medium flex justify-between items-center">
                    <span>বাকি হিসাবের খাতায় জমা হবে:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">৳{Math.max(0, (activeAction === 'minute_card' ? selectedCardPrice : (parseFloat(amountInput) || 0)) - (parseFloat(amountReceivedInput) || 0)).toFixed(2)}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-900 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Transaction Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check size={18} />
              লেনদেন সম্পন্ন করুন
            </button>

          </form>

        </section>
        )}

        {/* Right Side: Tabbed Panel with Statements, Purchase, and Drive Backups */}
        {mainView === 'summary' && (
        <section className="col-span-1 lg:col-span-11 flex flex-col space-y-4">
          
          {/* Main Workspace Navigation Options */}
          <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-1">
            <button
              onClick={() => { setDashboardTab('statement'); playSound(920, 0.05); }}
              className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${dashboardTab === 'statement' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <ReceiptText size={15} />
              লেনদেনের খাতা (Daily Log)
            </button>
            <button
              onClick={() => { setDashboardTab('buy'); playSound(920, 0.05); }}
              className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${dashboardTab === 'buy' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <ShoppingBag size={15} />
              ক্রয় ও স্টক (Load & Cards Buy)
            </button>
            <button
              onClick={() => { setDashboardTab('backup'); playSound(920, 0.05); }}
              className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${dashboardTab === 'backup' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <CloudUpload size={15} />
              রিপোর্ট, এক্সপোর্ট ও ক্লাউড
            </button>
            <button
              onClick={() => { setDashboardTab('baki'); playSound(920, 0.05); }}
              className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${dashboardTab === 'baki' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Wallet size={15} />
              বাকি খাতা (Due Ledger)
            </button>
          </div>

          {/* Tab 1: Interactive Daily Ledger Log (লেনদেনের খাতা) */}
          {dashboardTab === 'statement' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-extrabold text-sm md:text-base text-slate-800">লেনদেন ও ডেইলি স্টেটমেন্ট খাতা</h3>
                  <p className="text-xs text-slate-400">রিয়েল-টাইম ডাটা ট্র্যাকিং খাতা এবং প্রিন্ট সুবিধা</p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    value={statementFilter}
                    onChange={(e) => {
                      setStatementFilter(e.target.value as 'all' | 'daily' | 'monthly');
                      playSound(920, 0.05);
                    }}
                    className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
                  >
                    <option value="all">সব রেকর্ড</option>
                    <option value="daily">শুধুমাত্র আজকের স্টেটমেন্ট</option>
                    <option value="monthly">শুধুমাত্র এই মাসের স্টেটমেন্ট</option>
                  </select>
                  
                  <button
                    onClick={handleResetLedger}
                    className="p-2 text-red-500 hover:text-white border border-red-200 hover:bg-red-500 text-xs font-bold rounded-xl shrink-0 transition-colors cursor-pointer"
                    title="খাতা খালি করুন"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Advanced search widget */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="মোবাইল নম্বর, TrxID বা ভাউচার আইডি দিয়ে সার্চ করুন..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-8 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <Search size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>

              {/* Interactive Table representation */}
              <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-[400px]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-550 text-slate-600 font-bold">
                      <th className="py-2.5 px-3">লেনদেন প্রকার</th>
                      <th className="py-2.5 px-3 text-center">একাউন্ট</th>
                      <th className="py-2.5 px-3">গ্রাহক মোবাইল</th>
                      <th className="py-2.5 px-3 text-right">একাউন্ট চার্জ</th>
                      <th className="py-2.5 px-3 text-right">আদায়কৃত ক্যাশ</th>
                      <th className="py-2.5 px-3 text-right">কমিশন (Profit)</th>
                      <th className="py-2.5 px-3 text-center">ক্রিয়া</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredTransactionsForStatement.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 italic font-medium">
                          কোনো খাতা রেকর্ড এই ফিল্টারে খুঁজে পাওয়া যায়নি!
                        </td>
                      </tr>
                    ) : (
                      filteredTransactionsForStatement.map((t, idx) => {
                        const isCard = t.actionType === 'minute_card';
                        return (
                          <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-800 tracking-tight block">
                                {translateActionType(t.actionType, t.cardPrice)}
                              </span>
                              <span className="text-[9px] text-slate-400 block font-mono">
                                {new Date(t.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${t.accountKey === 'bkash' ? 'bg-pink-100 text-pink-700' : t.accountKey === 'nagad' ? 'bg-orange-100 text-orange-700' : t.accountKey === 'rocket' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
                                {t.accountKey}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold tracking-wide">
                              {t.phone}
                              {t.trxId && (
                                <span className="block text-[9px] text-indigo-500 font-bold uppercase">
                                  TrxID: {t.trxId}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                              ৳{isCard ? (t.cardPrice || 0) - 0.5 : t.amount}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                              ৳{t.amountReceived}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-black text-emerald-600">
                              +৳{t.commission.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => { setSelectedSlip(t); playSound(1000, 0.1); }}
                                  className="p-1 bg-slate-100 hover:bg-slate-900 hover:text-white rounded text-slate-600 transition-all cursor-pointer"
                                  title="মেমো টিকিট প্রিন্ট"
                                >
                                  <Printer size={12} />
                                </button>
                                <button
                                  onClick={() => handleCancelAndRevertTransaction(t.id)}
                                  className="p-1 bg-amber-50 hover:bg-amber-500 hover:text-white rounded text-amber-600 transition-all cursor-pointer"
                                  title="লেনদেন বাতিল ও ব্যালেন্স রিস্টোর (Revert)"
                                >
                                  <RotateCcw size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTransaction(t.id)}
                                  className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-all cursor-pointer"
                                  title="ডিলিট করুন (শুধু রেকর্ড মুছবে)"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* General footer statement notice */}
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-2 text-[10px] text-indigo-950 font-medium leading-relaxed leading-snug">
                <Sparkles size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  সর্বমোট ভাউচার সংখ্যা: <strong className="font-mono text-sm">{filteredTransactionsForStatement.length}</strong> টি। সবগুলো লেনদেন ব্রাউজারের লোকাল স্টোরেজে নিরাপদে ক্যাশ স্টোর থাকে।
                </span>
              </div>

            </div>
          )}

          {/* Tab 2: Purchase & Card stock Inventory Ledger (ক্রয় ও স্টক) */}
          {dashboardTab === 'buy' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
              
              <div className="pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-sm md:text-base text-slate-800">মালিকের রিটেইল ব্যালেন্স ক্রয় (Inventory Buy)</h3>
                <p className="text-xs text-slate-400">একাউন্টে নতুন ব্যালেন্স স্টক আপ করুন, ক্রয়ের টাকা ক্যাশ ড্রয়ার থেকে স্বয়ংক্রিয়ভাবে মাইনাস হবে</p>
              </div>

              {/* Purchase layout selectors */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setBuyTab('balance'); playSound(920, 0.05); }}
                  className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${buyTab === 'balance' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'}`}
                >
                  ডিজিটাল ওয়ালেট ব্যালেন্স ক্রয়
                </button>
                <button
                  type="button"
                  onClick={() => { setBuyTab('cards'); playSound(920, 0.05); }}
                  className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${buyTab === 'cards' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'}`}
                >
                  মিনিট কার্ড মিনিট স্টক ক্রয়
                </button>
              </div>

              {buySuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs flex items-center gap-1.5 animate-bounce select-none">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{buySuccessMsg}</span>
                </div>
              )}

              {/* Purchase option form logic dynamic selection */}
              <form onSubmit={handlePerformPurchase} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                
                {buyTab === 'balance' ? (
                  <>
                    <div className="md:col-span-4">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">কোন একাউন্টের জন্য:</label>
                      <select
                        value={buyAccount}
                        onChange={(e) => setBuyAccount(e.target.value as AccountKey)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-700"
                      >
                        <option value="bkash">বিকাশ (bKash)</option>
                        <option value="nagad">নগদ (Nagad)</option>
                        <option value="rocket">রকেট (Rocket)</option>
                        <option value="gp">জিপি (Grameenphone SIM)</option>
                        <option value="robi">রবি (Robi SIM)</option>
                        <option value="airtel">এয়ারটেল (Airtel SIM)</option>
                        <option value="banglalink">বাংলালিংক (BL SIM)</option>
                      </select>
                    </div>

                    <div className="md:col-span-5">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">ক্রয় ব্যালেন্স পরিমাণ (৳):</label>
                      <input
                        type="number"
                        placeholder="৳ টাকার অংক লিখুন"
                        value={buyBalanceAmount}
                        onChange={(e) => setBuyBalanceAmount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold font-mono"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">অপারেটর সিম:</label>
                      <select
                        value={buyCardOperator}
                        onChange={(e) => setBuyCardOperator(e.target.value as 'gp' | 'robi' | 'airtel' | 'banglalink')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-700 font-sans"
                      >
                        <option value="gp">জিপি (GP)</option>
                        <option value="robi">রবি (Robi)</option>
                        <option value="airtel">এয়ারটেল (Airtel)</option>
                        <option value="banglalink">বাংলালিংক (BL)</option>
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">কার্ড মূল্য (স্টক মূল্য):</label>
                      <select
                        value={buyCardPrice}
                        onChange={(e) => setBuyCardPrice(parseInt(e.target.value) as 19 | 29 | 39 | 49)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-700 font-sans"
                      >
                        <option value="19">১৯ টাকার মিনিট কার্ড</option>
                        <option value="29">২৯ টাকার মিনিট কার্ড</option>
                        <option value="39">৩৯ টাকার মিনিট কার্ড</option>
                        <option value="49">৪৯ টাকার মিনিট কার্ড</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">কার্ড সংখ্যা (পিস):</label>
                      <input
                        type="number"
                        placeholder="কয়টি কার্ড নিবেন"
                        value={buyCardQty}
                        onChange={(e) => setBuyCardQty(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold font-mono h-8"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">কেনা মূল্য (প্রতিটির ৳):</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="প্রতিটির কেনা মূল্য"
                        value={buyCardCostInput}
                        onChange={(e) => setBuyCardCostInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold font-mono h-8"
                        required
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className={`w-full py-2 bg-slate-900 border hover:bg-slate-800 text-white font-bold rounded-lg text-xs cursor-pointer shadow hover:shadow-md transition-all h-8 flex items-center justify-center ${buyTab === 'balance' ? 'md:col-span-3' : 'md:col-span-2'}`}
                >
                  স্টক সেভ করুন
                </button>

              </form>

              {/* Interactive stock inventory levels display */}
              <div className="space-y-3">
                <div className="flex items-center gap-1 select-none">
                  <Layers size={14} className="text-indigo-600" />
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase">কার্ড স্টকের বর্তমান অবস্থান (Stock Inventory Levels):</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* GP Stocks */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left font-sans space-y-1.5 shadow-sm">
                    <span className="text-xs font-black text-sky-700 block border-b border-sky-100 pb-1">Grameenphone Stocks</span>
                    <div className="text-[10px] space-y-1">
                      {[19, 29, 39, 49].map((price) => (
                        <div key={price} className="flex justify-between items-center py-0.5 hover:bg-slate-150 px-1 rounded transition-colors group">
                          <span className="text-slate-500">৳{price} মিনিট:</span>
                          <div className="flex items-center gap-1">
                            <strong className="font-mono text-slate-900 font-extrabold">{(cardStock.gp?.[price as 19 | 29 | 39 | 49] ?? 0)} টি</strong>
                            <button
                              type="button"
                              onClick={() => {
                                setShowCardEditModal({ operator: 'gp', price: price as 19 | 29 | 39 | 49 });
                                setEditCardQtyVal(String(cardStock.gp?.[price as 19 | 29 | 39 | 49] ?? 0));
                                playSound(900, 0.05);
                              }}
                              className="text-slate-400 hover:text-indigo-600 p-0.5 rounded transition-all cursor-pointer opacity-80"
                              title="স্টক সংখ্যা এডিট করুন"
                            >
                              <Edit2 size={9} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Robi Stocks */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left font-sans space-y-1.5 shadow-sm">
                    <span className="text-xs font-black text-rose-700 block border-b border-rose-100 pb-1">Robi Stocks</span>
                    <div className="text-[10px] space-y-1">
                      {[19, 29, 39, 49].map((price) => (
                        <div key={price} className="flex justify-between items-center py-0.5 hover:bg-slate-150 px-1 rounded transition-colors group">
                          <span className="text-slate-500">৳{price} মিনিট:</span>
                          <div className="flex items-center gap-1">
                            <strong className="font-mono text-slate-900 font-extrabold">{(cardStock.robi?.[price as 19 | 29 | 39 | 49] ?? 0)} টি</strong>
                            <button
                              type="button"
                              onClick={() => {
                                setShowCardEditModal({ operator: 'robi', price: price as 19 | 29 | 39 | 49 });
                                setEditCardQtyVal(String(cardStock.robi?.[price as 19 | 29 | 39 | 49] ?? 0));
                                playSound(900, 0.05);
                              }}
                              className="text-slate-400 hover:text-indigo-600 p-0.5 rounded transition-all cursor-pointer opacity-80"
                              title="স্টক সংখ্যা এডিট করুন"
                            >
                              <Edit2 size={9} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Airtel Stocks */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left font-sans space-y-1.5 shadow-sm">
                    <span className="text-xs font-black text-red-700 block border-b border-red-100 pb-1">Airtel Stocks</span>
                    <div className="text-[10px] space-y-1">
                      {[19, 29, 39, 49].map((price) => (
                        <div key={price} className="flex justify-between items-center py-0.5 hover:bg-slate-150 px-1 rounded transition-colors group">
                          <span className="text-slate-500">৳{price} মিনিট:</span>
                          <div className="flex items-center gap-1">
                            <strong className="font-mono text-slate-900 font-extrabold">{(cardStock.airtel?.[price as 19 | 29 | 39 | 49] ?? 0)} টি</strong>
                            <button
                              type="button"
                              onClick={() => {
                                setShowCardEditModal({ operator: 'airtel', price: price as 19 | 29 | 39 | 49 });
                                setEditCardQtyVal(String(cardStock.airtel?.[price as 19 | 29 | 39 | 49] ?? 0));
                                playSound(900, 0.05);
                              }}
                              className="text-slate-400 hover:text-indigo-600 p-0.5 rounded transition-all cursor-pointer opacity-80"
                              title="স্টক সংখ্যা এডিট করুন"
                            >
                              <Edit2 size={9} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BL Stocks */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left font-sans space-y-1.5 shadow-sm">
                    <span className="text-xs font-black text-orange-700 block border-b border-orange-100 pb-1">Banglalink Stocks</span>
                    <div className="text-[10px] space-y-1">
                      {[19, 29, 39, 49].map((price) => (
                        <div key={price} className="flex justify-between items-center py-0.5 hover:bg-slate-150 px-1 rounded transition-colors group">
                          <span className="text-slate-500">৳{price} মিনিট:</span>
                          <div className="flex items-center gap-1">
                            <strong className="font-mono text-slate-900 font-extrabold">{(cardStock.banglalink?.[price as 19 | 29 | 39 | 49] ?? 0)} টি</strong>
                            <button
                              type="button"
                              onClick={() => {
                                setShowCardEditModal({ operator: 'banglalink', price: price as 19 | 29 | 39 | 49 });
                                setEditCardQtyVal(String(cardStock.banglalink?.[price as 19 | 29 | 39 | 49] ?? 0));
                                playSound(900, 0.05);
                              }}
                              className="text-slate-400 hover:text-indigo-600 p-0.5 rounded transition-all cursor-pointer opacity-80"
                              title="স্টক সংখ্যা এডিট করুন"
                            >
                              <Edit2 size={9} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Tab 3: Monthly Statements, Backup JSON, Cloud Backup */}
          {dashboardTab === 'backup' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
              
              <div className="pb-2 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-sm md:text-base text-slate-800">রিপোর্ট, ডাটা এক্সপোর্ট এবং গুগল ড্রাইভ ক্লাউড সেভ</h3>
                  <p className="text-xs text-slate-400">প্রতিদিনের হিসাব ফাইল ডাউনলোড করুন অথবা গুগল ড্রাইভে ক্লাউড ব্যাকআপ করে সুরক্ষিত রাখুন</p>
                </div>
                {/* Account details or Login indicator inside header */}
                {googleUser && (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 self-start shadow-2xs">
                    {googleUser.photoURL ? (
                      <img src={googleUser.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-5 h-5 rounded-full border border-slate-300" />
                    ) : (
                      <div className="w-5 h-5 bg-indigo-650 text-white rounded-full flex items-center justify-center text-[10px] font-bold uppercase">{googleUser.displayName?.charAt(0) || 'U'}</div>
                    )}
                    <div className="text-left">
                      <p className="text-[10px] font-black text-slate-800 line-clamp-1">{googleUser.displayName}</p>
                      <p className="text-[8px] text-slate-400 font-medium line-clamp-1">{googleUser.email}</p>
                    </div>
                    <button 
                      onClick={handleGoogleLogout} 
                      className="ml-1 text-[9px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer border-l border-slate-200 pl-2"
                    >
                      সাইন আউট
                    </button>
                  </div>
                )}
              </div>

              {/* Error warning display */}
              {driveError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs font-bold">
                  <AlertCircle size={15} className="text-rose-600 shrink-0" />
                  <span>{driveError}</span>
                </div>
              )}

              {/* Google Drive Connection / Logged Out Prompt */}
              {needsAuth && (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-3.5 max-w-md mx-auto">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-650 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    <CloudLightning size={24} />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">গুগল ড্রাইভ সেভ ও ক্লাউড সিকিউরিটি অ্যাক্টিভ করুন</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      আপনার হিসাব এবং ক্যাশ খাতার ব্যাকআপ সরাসরি আপনার নিজের পার্সোনাল গুগল ড্রাইভে সুরক্ষিত রাখতে পারেন। এতে ফোন হারালেও যেকোনো সময় সব ডাটা ফিরে পাবেন।
                    </p>
                  </div>
                  <button
                    onClick={handleGoogleLogin}
                    className="flex items-center gap-2.5 bg-white border border-slate-300 rounded-xl px-4 py-2 hover:bg-slate-50 transition-all font-bold text-xs text-slate-700 cursor-pointer shadow-sm mx-auto"
                  >
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>গুগল ড্রাইভ দিয়ে লগইন করুন</span>
                  </button>
                </div>
              )}

              {/* Download row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Safe download sheet summary */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
                  <div className="flex gap-2 items-start text-indigo-950">
                    <FileSpreadsheet size={20} className="text-indigo-650 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-extrabold">ডিজিটাল স্টেটমেন্ট এক্সেল/CSV ডাউনলোড</h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        আপনার ক্যাশ লেজার খাতা ফাইলটি স্ট্যান্ডার্ড ক্যারেক্টার UTF-8 এনকোড করা এক্সেল শিটে সেভ করতে পারবেন।
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCSVDownload}
                    className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <ArrowDownToLine size={14} />
                    ভাউচার স্টেটমেন্ট ডাউনলোড করুন (CSV)
                  </button>
                </div>

                {/* Google drive safe action */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
                  <div className="flex gap-2 items-start text-emerald-950">
                    <CloudUpload size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-extrabold">গুগল ড্রাইভ ক্লাউড ব্যাকআপ</h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        {googleUser ? `সংযুক্ত অ্যাকাউন্ট: ${googleUser.email}` : "আপনার প্রতিদিনের ক্যাশ ক্লোজিং হিস্ট্রি সরাসরি নির্দিষ্ট ড্রাইভ ক্লাউডে আপলোড করে সুরক্ষিত রাখুন।"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDriveBackupUpload}
                    disabled={driveBackingUp}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <CloudUpload size={14} />
                    {driveBackingUp ? "ব্যাকআপ আপলোড হচ্ছে..." : "গুগল ড্রাইভে ডাটা ব্যাকআপ করুন"}
                  </button>
                </div>

              </div>

              {/* Cloud Drive Backup Progress Visual */}
              <AnimatePresence>
                {driveBackingUp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 overflow-hidden text-center"
                  >
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block animate-pulse">
                      আপনার নিরাপদ ক্লাউড ব্যাকআপ ফাইলটি গুগল ড্রাইভে পাঠানো হচ্ছে...
                    </span>
                    <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden relative">
                      <div className="bg-emerald-600 h-full w-2/3 rounded-full animate-pulse transition-all duration-1000" style={{ width: '90%' }}></div>
                    </div>
                  </motion.div>
                )}

                {driveBackUpSuccess && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 overflow-hidden text-emerald-800 text-xs font-bold"
                  >
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>সাফল্যের সাথে আপনার সম্পূর্ণ টেলিকম ডাটাবেস গুগল ড্রাইভে ব্যাকআপ করা হয়েছে!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Real Google Drive Backup File List & Restore */}
              {googleUser && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[11px] font-black text-slate-700 uppercase block tracking-wider">ড্রাইভ ক্লাউড ব্যাকআপ হিস্ট্রি ({backupList.length}টি ফাইল):</span>
                    <button
                      onClick={() => loadDriveBackupsList()}
                      disabled={loadingBackups}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={10} className={loadingBackups ? "animate-spin" : ""} />
                      রিলোড লিস্ট
                    </button>
                  </div>

                  {loadingBackups && backupList.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400 font-bold">
                      গুগল ড্রাইভ থেকে আপনার ব্যাকআপ ফাইলগুলো খোঁজা হচ্ছে...
                    </div>
                  ) : backupList.length === 0 ? (
                    <div className="text-center py-6 text-[11px] text-slate-400 leading-relaxed font-bold">
                      গুগল ড্রাইভে এখনো কোনো ব্যাকআপ ফাইল পাওয়া যায়নি।<br />
                      নতুন ব্যাকআপ ফাইল তৈরি করতে উপরের "গুগল ড্রাইভে ডাটা ব্যাকআপ করুন" বাটনে ক্লিক করুন।
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {backupList.map((file, idx) => {
                        const fileTimestampStr = file.name.split('_').pop()?.replace('.json', '');
                        const fileTime = fileTimestampStr ? new Date(parseInt(fileTimestampStr)) : new Date(file.createdTime);
                        const displayTime = fileTime.getTime() ? formatDateTimeBangla(fileTime.getTime()) : file.createdTime;
                        const sizeKB = file.size ? `${(parseInt(file.size) / 1024).toFixed(1)} KB` : '1.5 KB';

                        return (
                          <div key={file.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-slate-300 transition-colors">
                            <div className="space-y-0.5">
                              <p className="font-extrabold text-slate-800 select-none text-[11px] truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                                {toBengaliNumber(idx + 1)}. ব্যাকআপ ফাইল - {sizeKB}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                সময়: {toBengaliNumber(displayTime)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleDriveBackupRestore(file.id, file.name)}
                                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 hover:text-indigo-800 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-indigo-100"
                              >
                                <RotateCcw size={11} />
                                রিস্টোর
                              </button>
                              <button
                                onClick={() => handleDriveBackupDelete(file.id, file.name)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg hover:text-rose-700 transition-colors cursor-pointer border border-rose-100"
                                title="ব্যাকআপ ডিলিট করুন"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Raw JSON database export-import backup panel for actual transfers */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <span className="text-[10px] font-black text-slate-500 uppercase block">র ব্যাকআপ ইউটিলিটি ফাইলের মাধ্যমে ট্রান্সফার (Manual Data Transfer):</span>
                <p className="text-[10px] text-slate-400">
                  অন্য কোনো ফোনে নাজমুল টেলিকমের আপনার এই হিস্ট্রি ট্রান্সফার করতে এখানে ফাইল এক্সপোর্ট করুন, নতুন ফোনে ওই ফাইল আপলোড দিলে সব ডাটা সঙ্গে সঙ্গে কপি হয়ে যাবে।
                </p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={downloadJSONBackup}
                    className="py-1.5 border border-slate-300 hover:bg-slate-50 text-[11px] font-bold text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    ব্যাকআপ ফাইল এক্সপোর্ট করুন (.json)
                  </button>
                  <label className="border border-slate-300 hover:bg-slate-50 text-[11px] font-bold text-slate-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center text-center">
                    ব্যাকআপ ফাইল ইমপোর্ট করুন (.json)
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleBackupUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

            </div>
          )}

          {/* Tab 4: Telecom Credit/Due (Baki) Ledger */}
          {dashboardTab === 'baki' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
              <div className="pb-2 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-sm md:text-base text-slate-800">টেলিকম বাকি খাতা ও কাস্টমার লেজার</h3>
                  <p className="text-xs text-slate-400">বাকিতে দেওয়া ফ্লেক্সিলোড ও মিনিট কার্ডের হিসাব, জমা পরিশোধ এবং বিস্তারিত রিপোর্ট খাতা</p>
                </div>
                {/* Visual indicator of total outstanding due */}
                <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 self-start shadow-2xs text-right">
                  <span className="text-[10px] text-rose-500 font-extrabold block uppercase">সর্বমোট বকেয়া (Total Outstanding)</span>
                  <strong className="text-xl font-black text-rose-600 font-mono">৳{telecomCustomers.reduce((sum, c) => sum + c.due, 0).toFixed(2)}</strong>
                </div>
              </div>

              {/* Baki Ledger Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left side: Customer selection / search */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="text-xs font-black text-slate-500 uppercase tracking-wider block text-left">গ্রাহকদের তালিকা:</div>
                  
                  {/* Customer list container */}
                  <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                    {telecomCustomers.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        কোনো বাকি কাস্টমার রেকর্ড নেই।
                      </div>
                    ) : (
                      telecomCustomers.map(cust => {
                        const isSelected = selectedBakiCustomerId === cust.id;
                        return (
                          <div
                            key={cust.id}
                            onClick={() => {
                              setSelectedBakiCustomerId(cust.id);
                              playSound(1000, 0.05);
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${isSelected ? 'bg-indigo-50/55 border-indigo-200 ring-2 ring-indigo-500/10' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">{cust.name}</h4>
                                <p className="text-[10px] font-mono text-slate-400 font-bold">{cust.phone || 'N/A'}</p>
                              </div>
                              <div className="text-right">
                                <span className={`text-xs font-black font-mono block ${cust.due > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  ৳{cust.due}
                                </span>
                                <span className="text-[9px] text-slate-400 font-medium">বকেয়া</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Manual add customer helper form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const nameInput = form.elements.namedItem('custName') as HTMLInputElement;
                      const phoneInput = form.elements.namedItem('custPhone') as HTMLInputElement;
                      const name = nameInput.value.trim();
                      const phone = phoneInput.value.trim();
                      
                      if (!name) return;

                      // Check if already exists
                      if (telecomCustomers.some(c => c.name.toLowerCase() === name.toLowerCase())) {
                        alert('এই নামের কাস্টমার ইতিমধ্যে রয়েছে!');
                        return;
                      }

                      const newCust: TelecomCustomer = {
                        id: `T-CUST-${Date.now()}`,
                        name,
                        phone,
                        due: 0,
                        transactions: []
                      };

                      saveTelecomCustomers([newCust, ...telecomCustomers]);
                      setSelectedBakiCustomerId(newCust.id);
                      form.reset();
                      playSound(1200, 0.15, 'sine');
                    }}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-left"
                  >
                    <span className="text-[10px] font-black text-slate-500 uppercase block">+ নতুন গ্রাহক খাতা খুলুন:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        name="custName"
                        placeholder="গ্রাহকের নাম"
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none"
                        required
                      />
                      <input
                        type="tel"
                        name="custPhone"
                        placeholder="মোবাইল (ঐচ্ছিক)"
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      কাস্টমার খাতা সেভ করুন
                    </button>
                  </form>
                </div>

                {/* Right side: Selected Customer Detailed Statement & Payment Action */}
                <div className="lg:col-span-7 space-y-4">
                  {selectedBakiCustomerId ? (() => {
                    const customer = telecomCustomers.find(c => c.id === selectedBakiCustomerId);
                    if (!customer) return <div className="text-center py-12 text-slate-400 text-xs">গ্রাহকটি খুঁজে পাওয়া যায়নি।</div>;

                    return (
                      <div className="space-y-4">
                        {/* Selected Customer Header Banner / Edit Form */}
                        {editingBakiCustomer && editingBakiCustomer.id === customer.id ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleUpdateTelecomCustomer(customer.id, editingBakiCustomer.name, editingBakiCustomer.phone);
                            }}
                            className="p-4 bg-amber-50/40 border border-amber-200 rounded-2xl space-y-3 text-left"
                          >
                            <span className="text-[11px] font-black text-amber-800 uppercase block">✏️ গ্রাহকের তথ্য পরিবর্তন (Edit Customer Info)</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">গ্রাহকের নাম:</label>
                                <input
                                  type="text"
                                  value={editingBakiCustomer.name}
                                  onChange={(e) => setEditingBakiCustomer({ ...editingBakiCustomer, name: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:ring-1 focus:ring-amber-400 focus:outline-none"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">মোবাইল নম্বর:</label>
                                <input
                                  type="tel"
                                  value={editingBakiCustomer.phone}
                                  onChange={(e) => setEditingBakiCustomer({ ...editingBakiCustomer, phone: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold font-mono focus:ring-1 focus:ring-amber-400 focus:outline-none"
                                  placeholder="মোবাইল নম্বর"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingBakiCustomer(null);
                                  playSound(900, 0.05);
                                }}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                              >
                                বাতিল করুন
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                              >
                                <Check size={12} />
                                সেভ করুন
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50/20 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-left">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-extrabold text-sm md:text-base text-slate-800">{customer.name}</h4>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingBakiCustomer({ id: customer.id, name: customer.name, phone: customer.phone });
                                      playSound(1000, 0.05);
                                    }}
                                    className="p-1 hover:bg-slate-200 text-slate-500 hover:text-amber-600 rounded-md transition-colors cursor-pointer"
                                    title="গ্রাহকের নাম বা ফোন এডিট করুন"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowDeleteConfirmId(customer.id);
                                      playSound(1000, 0.05);
                                    }}
                                    className="p-1 hover:bg-slate-200 text-slate-500 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                                    title="গ্রাহকের খাতা ডিলিট করুন"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-slate-400 font-medium">মোবাইল: {customer.phone || 'N/A'}</p>
                            </div>
                            <div className="text-right sm:border-l sm:pl-4 border-slate-200 min-w-[120px]">
                              <span className="text-[10px] text-slate-400 font-bold block uppercase">চলতি বকেয়া (Current Due)</span>
                              <strong className="text-2xl font-black text-rose-600 font-mono">৳{customer.due}</strong>
                            </div>
                          </div>
                        )}

                        {/* Delete Confirmation Card */}
                        {showDeleteConfirmId === customer.id && (
                          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-left space-y-3">
                            <h4 className="font-extrabold text-xs md:text-sm text-rose-800 flex items-center gap-1.5">
                              ⚠️ সতর্কবার্তা: কাস্টমার খাতা ডিলিট করুন
                            </h4>
                            <p className="text-xs text-rose-700 leading-relaxed">
                              আপনি কি নিশ্চিত যে আপনি <strong>{customer.name}</strong>-এর খাতাটি স্থায়ীভাবে মুছে ফেলতে চান? গ্রাহকের সমস্ত পূর্ববর্তী বকেয়া এবং জমা পরিশোধের হিসাব মুছে যাবে!
                              {customer.due > 0 && (
                                <span className="block mt-1 font-bold">
                                  🚨 গ্রাহকের নিকট এখনো ৳{customer.due} টাকা বকেয়া বাকি আছে!
                                </span>
                              )}
                            </p>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => {
                                  setShowDeleteConfirmId(null);
                                  playSound(900, 0.05);
                                }}
                                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                              >
                                বাতিল করুন
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteTelecomCustomer(customer.id);
                                }}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                              >
                                নিশ্চিত মুছুন
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Payment & Manual Due Entry Block */}
                        <div className="p-4 rounded-2xl border border-indigo-150 bg-indigo-50/20 border-indigo-200 text-left space-y-3">
                          <span className="text-[11px] font-black text-indigo-750 uppercase block">নতুন জমা বা বাকি এন্ট্রি (Record Payment / New Due):</span>
                          
                          <form onSubmit={(e) => handleTelecomBakiSubmit(e, customer.id)} className="space-y-3">
                            <div className="grid grid-cols-3 gap-2.5">
                              <div>
                                <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-1">লেনদেনের ধরণ:</label>
                                <select
                                  value={bakiActionType}
                                  onChange={(e) => {
                                    setBakiActionType(e.target.value as 'due' | 'payment');
                                    playSound(1000, 0.05);
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold"
                                >
                                  <option value="payment">জমা পরিশোধ (Cash In)</option>
                                  <option value="due">নতুন বকেয়া (Due Out)</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-1">টাকার পরিমাণ (Amount):</label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="৳ পরিমাণ"
                                    value={bakiFormAmount}
                                    onChange={(e) => setBakiFormAmount(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 pl-5 text-xs font-extrabold font-mono"
                                    required
                                  />
                                  <span className="absolute left-1.5 top-2 text-slate-400 text-xs font-bold">৳</span>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-1">বিবরণ (Note):</label>
                                <input
                                  type="text"
                                  placeholder="যেমন: জমা পরিশোধ"
                                  value={bakiFormNote}
                                  onChange={(e) => setBakiFormNote(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Check size={14} />
                              নিশ্চিত করুন ও খাতা আপডেট করুন
                            </button>
                          </form>
                        </div>

                        {/* Notice & Communication Block */}
                        {customer.due > 0 && (
                          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-2xl text-left space-y-2.5">
                            <span className="text-[10px] font-black text-amber-800 uppercase block">🔔 বকেয়া তাগাদা নোটিশ (Due Payment Alert):</span>
                            
                            <div className="bg-white p-2.5 rounded-xl border border-amber-100 text-[11px] font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">
                              {`প্রিয় ${customer.name}, \nনাজমুল জেনারেল স্টোর ও টেলিকম এ আপনার বকেয়া বাকির পরিমাণ হচ্ছে ৳${customer.due} টাকা। \nবকেয়া টাকাটি দ্রুত পরিশোধ করার জন্য অনুরোধ করা হলো। \nধন্যবাদ!\n\nনাজমুল টেলিকম ও জেনারেল স্টোর`}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <a
                                href={`https://api.whatsapp.com/send?phone=${
                                  (((customer.phone || '').replace(/\D/g, '').startsWith('0') ? '88' : '') + (customer.phone || '').replace(/\D/g, ''))
                                }&text=${encodeURIComponent(
                                  `প্রিয় ${customer.name},\nনাজমুল জেনারেল স্টোর ও টেলিকম এ আপনার বকেয়া বাকির পরিমাণ হচ্ছে ৳${customer.due} টাকা।\nবকেয়া টাকাটি দ্রুত পরিশোধ করার জন্য অনুরোধ করা হলো।\n\nধন্যবাদ!\nনাজমুল টেলিকম ও জেনারেল স্টোর`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors text-center"
                              >
                                WhatsApp পাঠান
                              </a>
                              <a
                                href={`sms:${customer.phone || ''}?body=${encodeURIComponent(
                                  `Prio ${customer.name}, Nazmul Telecom o General Store e apnar baki holo ${customer.due} taka. Baki porishodh korar anurodh roilo. Dhonnobad! Nazmul Telecom.`
                                )}`}
                                className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors text-center"
                              >
                                SMS পাঠান
                              </a>
                              <button
                                onClick={() => {
                                  const message = `প্রিয় ${customer.name},\nনাজমুল জেনারেল স্টোর ও টেলিকম এ আপনার বকেয়া বাকির পরিমাণ হচ্ছে ৳${customer.due} টাকা।\nবকেয়া টাকাটি দ্রুত পরিশোধ করার জন্য অনুরোধ করা হলো।\n\nধন্যবাদ!\nনাজমুল টেলিকম ও জেনারেল স্টোর`;
                                  navigator.clipboard.writeText(message);
                                  alert(`নোটিশ মেসেজ কপি হয়েছে!`);
                                  playSound(1300, 0.1);
                                }}
                                className="py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors text-center"
                              >
                                মেসেজ কপি করুন
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Customer Transaction Statements List */}
                        <div className="space-y-2 text-left">
                          <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">গ্রাহকের পূর্ববর্তী হিসাব বিবরণী:</span>
                          
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 font-sans">
                            {customer.transactions.length === 0 ? (
                              <div className="text-center py-6 text-slate-400 text-xs">
                                কোনো লেনদেনের ইতিহাস নেই।
                              </div>
                            ) : (
                              customer.transactions.map(txn => {
                                const isDue = txn.type === 'due' || txn.type === 'sale_due';
                                return (
                                  <div
                                    key={txn.id}
                                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className={`p-2 rounded-full ${isDue ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        <Wallet size={14} />
                                      </div>
                                      <div>
                                        <h5 className="font-extrabold text-slate-800">{txn.note || (isDue ? 'বাকিতে লেনদেন' : 'জমা পরিশোধ')}</h5>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                          {formatDateTimeBangla(txn.timestamp)}
                                          {txn.transactionId && ` | ভাউচার আইডি: ${txn.transactionId}`}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className={`font-mono font-black text-xs md:text-sm ${isDue ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {isDue ? '+' : '-'} ৳{txn.amount}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })() : (
                    <div className="h-full border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                      <Wallet size={36} className="text-slate-300 animate-pulse" />
                      <p className="text-xs font-bold">অনুগ্রহ করে বাম পাশের তালিকা থেকে কাস্টমার নির্বাচন করুন।</p>
                      <p className="text-[10px] text-slate-400">তার বিস্তারিত খাতা ও পূর্ববর্তী বিবরণ এখানে প্রদর্শিত হবে।</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </section>
        )}

      </main>

      {/* 5. Thermal Memo Slip Modal Popover Mockup */}
      <AnimatePresence>
        {selectedSlip && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden max-w-[340px] w-full border border-slate-100 shadow-2xl p-5 space-y-4"
            >
              
              {/* Receipt Content wrapper for PNG capture and Print */}
              <div id="telecom-receipt-card" className="bg-white p-2">
                {/* Paper Top Receipt Badge */}
                <div className="text-center font-sans space-y-1">
                  <div className="text-indigo-600 bg-indigo-50 w-11 h-11 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <ReceiptText size={20} />
                  </div>
                  <h4 className="font-black text-base text-slate-900 tracking-tight">নাজমুল টেলিকম (মেমো স্লিপ)</h4>
                  <p className="text-[10px] text-slate-400 font-medium">ভাউচার রসিদ আইডি: {selectedSlip.id}</p>
                </div>

                {/* Details stack */}
                <div className="bg-slate-50 rounded-2xl p-3.5 text-xs text-slate-600 space-y-2 border border-slate-200/55 mt-3">
                  <div className="flex justify-between">
                    <span>গ্রাহকের নম্বর:</span>
                    <strong className="font-mono text-slate-900 text-sm tracking-wide">{selectedSlip.phone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>তারিখ ও সময়:</span>
                    <span className="font-medium text-slate-700">{formatDateTimeBangla(selectedSlip.timestamp)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>লেনদেনের মাধ্যম:</span>
                    <strong className="font-bold uppercase text-indigo-700">{selectedSlip.accountKey}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>কাজের ধরণ:</span>
                    <strong className="font-extrabold text-slate-800">{translateActionType(selectedSlip.actionType, selectedSlip.cardPrice)}</strong>
                  </div>
                  
                  {selectedSlip.trxId && (
                    <div className="flex justify-between border-t border-slate-200/70 pt-1.5 mt-1.5">
                      <span>Transaction ID:</span>
                      <strong className="font-mono text-indigo-600 uppercase font-bold">{selectedSlip.trxId}</strong>
                    </div>
                  )}

                  {selectedSlip.note && (
                    <div className="flex justify-between border-t border-slate-200/70 pt-1.5 mt-1.5 text-[10px] text-slate-400">
                      <span>মন্তব্য / নোটিফিকেশন:</span>
                      <span className="italic">{selectedSlip.note}</span>
                    </div>
                  )}
                </div>

                {/* Core Financial Block */}
                <div className="border-y-2 border-dashed border-slate-300 py-3.5 text-center px-2 space-y-1 mt-3">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">আদায়কৃত ক্যাশ টাকা</span>
                  <strong className="text-3xl font-black text-indigo-950 font-mono tracking-tight block">
                    ৳{toBengaliNumber(selectedSlip.amountReceived)}
                  </strong>
                  <span className="text-[9px] text-indigo-500 font-bold block bg-indigo-50 py-0.5 rounded-full px-2 max-w-max mx-auto select-none">
                    * সফলভাবে ট্র্যাকিং ডেটায় সংরক্ষিত
                  </span>
                </div>

                {/* Barcode Mock */}
                <div className="flex flex-col items-center justify-center select-none pt-2">
                  <div className="h-7 w-44 bg-slate-800 flex items-center justify-center rounded overflow-hidden opacity-90 mb-1 relative bg-white border border-slate-200">
                    <div className="absolute inset-x-2 inset-y-1 flex justify-between">
                      <div className="bg-black w-1.5 h-full" />
                      <div className="bg-black w-0.5 h-full" />
                      <div className="bg-black w-1 h-full" />
                      <div className="bg-black w-2 h-full" />
                      <div className="bg-black w-0.5 h-full" />
                      <div className="bg-black w-1.5 h-full" />
                      <div className="bg-black w-0.5 h-full" />
                      <div className="bg-black w-1.5 h-full" />
                      <div className="bg-black w-2 h-full" />
                      <div className="bg-black w-1 h-full" />
                      <div className="bg-black w-0.5 h-full" />
                      <div className="bg-black w-1.5 h-full" />
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono tracking-wider">REF-{selectedSlip.id}</span>
                </div>
              </div>

              {/* Close and tool utilities grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    const textContent = `নাজমুল টেলিকম\nরসিদ আইডি: ${selectedSlip.id}\nমোবাইল: ${selectedSlip.phone}\nধরণ: ${translateActionType(selectedSlip.actionType, selectedSlip.cardPrice)}\nপরিমাণ: ৳${selectedSlip.amountReceived}\nধন্যবাদ, আবার আসবেন!`;
                    navigator.clipboard.writeText(textContent);
                    alert('মেমো স্লিপ কপি সম্পন্ন হয়েছে!');
                    playSound(1300, 0.1);
                  }}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Copy size={12} />
                  কপি মেমো
                </button>
                <button
                  onClick={() => {
                    playSound(950, 0.1);
                    downloadPNG('telecom-receipt-card', `telecom_memo_${selectedSlip.id}.png`);
                  }}
                  className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ArrowDownToLine size={12} />
                  ডাউনলোড PNG
                </button>
                <button
                  onClick={() => {
                    playSound(1100, 0.1);
                    printElement('telecom-receipt-card');
                  }}
                  className="py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer size={12} />
                  থার্মাল প্রিন্ট
                </button>
                <button
                  onClick={() => { setSelectedSlip(null); playSound(650, 0.08); }}
                  className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-xl cursor-pointer shadow transition-all flex items-center justify-center"
                >
                  বন্ধ করুন
                </button>
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* 6. Inline Popover Modal: manual balance modification edit */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl overflow-hidden max-w-sm w-full border border-slate-100 shadow-2xl p-5 space-y-4"
            >
              
              <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-800 uppercase flex items-center gap-1.5">
                  <Edit2 size={14} className="text-indigo-600" />
                  ব্যালেন্স এডিট করুন
                </h4>
                <button 
                  onClick={() => setShowEditModal(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  বন্ধ
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-normal">
                আপনি ম্যানুয়ালি <span className="font-bold text-slate-800 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                  {showEditModal === 'cash' ? 'হাতের ক্যাশ ড্রয়ার' : showEditModal === 'commission' ? 'আজকের মোট কমিশন' : showEditModal === 'volume' ? 'আজকের মোট লেনদেন' : showEditModal.toUpperCase()}
                </span> সংখ্যা পরিবর্তন করছেন।
              </p>

              <form onSubmit={handleManualBalanceAdjustment} className="space-y-4">
                
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">নতুন পরিমাণ (টাকা):</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder="টাকার পরিমাণ লিখুন"
                      value={editAmountVal}
                      onChange={(e) => setEditAmountVal(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pl-6 font-mono font-bold text-slate-800 text-xs sm:text-sm"
                      required
                      autoFocus
                    />
                    <span className="absolute left-2.5 top-2 ml-0.5 text-slate-400 font-bold text-xs select-none">৳</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(null)}
                    className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow"
                  >
                    আপডেট নিশ্চিত করুন
                  </button>
                </div>

              </form>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* Cardio Stock Manual Edit Modal */}
      <AnimatePresence>
        {showCardEditModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl overflow-hidden max-w-sm w-full border border-slate-100 shadow-2xl p-5 space-y-4"
            >
              
              <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-800 uppercase flex items-center gap-1.5 font-sans">
                  <Edit2 size={14} className="text-indigo-600" />
                  কার্ড স্টক এডিট করুন
                </h4>
                <button 
                  onClick={() => setShowCardEditModal(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  বন্ধ
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-normal font-sans">
                আপনি ম্যানুয়ালি <span className="font-bold text-slate-800 uppercase bg-slate-100 px-1.5 py-0.5 rounded">{showCardEditModal.operator.toUpperCase()}</span> অপারেটরে <span className="font-extrabold text-indigo-600">৳{showCardEditModal.price}</span> মিনিটের কার্ড সংখ্যা পরিবর্তন করছেন।
              </p>

              <form onSubmit={handleManualCardStockAdjustment} className="space-y-4">
                
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 font-sans">নতুন স্টক সংখ্যা (টি):</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="টপ আপ সংখ্যা লিখুন"
                      value={editCardQtyVal}
                      onChange={(e) => setEditCardQtyVal(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono font-bold text-slate-800 text-xs sm:text-sm"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCardEditModal(null)}
                    className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl cursor-pointer font-sans"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow font-sans"
                  >
                    স্টক আপডেট করুন
                  </button>
                </div>

              </form>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* 7. Footer details */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 px-4 text-center text-xs mt-auto">
        <div className="max-w-7xl mx-auto space-y-2 select-none">
          <p className="font-bold text-slate-200">নাজমুল টেলিকম (Nazmul Telecom) © ২০২৬</p>
          <p className="text-slate-500 max-w-md mx-auto text-[11px]">
            বিকাশ, নগদ, রকেট ওয়ালেট ও অপারেটর রিচার্জ খাতা সিস্টেম। সকল ডেটা ক্লায়েন্ট ব্রাউজারে সুরক্ষিত।
          </p>
        </div>
      </footer>

        </>
      )}

    </div>
  );
}
