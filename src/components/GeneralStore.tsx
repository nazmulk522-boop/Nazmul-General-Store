import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { 
  Store, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  BookOpen, 
  FileSpreadsheet, 
  Share2, 
  Download, 
  Upload, 
  Shield, 
  Key, 
  ChevronLeft, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  CheckCircle,
  UserPlus,
  RefreshCw,
  Lock,
  Volume2,
  Eye,
  Printer,
  Copy,
  MessageCircle,
  Send,
  Check,
  Phone,
  Mail
} from 'lucide-react';
import { 
  StoreProduct, 
  StoreSale, 
  StoreSaleItem, 
  StoreCustomer, 
  StoreCustomerTxn, 
  StorePurchase, 
  StoreDailyLedger 
} from '../types';

interface GeneralStoreProps {
  soundEnabled: boolean;
  playSound: (frequency: number, duration: number, type?: 'sine' | 'square' | 'sawtooth' | 'triangle') => void;
  onSwitchToTelecom: () => void;
}

// Thermal printing helper
const printElement = (elementId: string) => {
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
const downloadPNG = async (elementId: string, filename: string) => {
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

export default function GeneralStore({ soundEnabled, playSound, onSwitchToTelecom }: GeneralStoreProps) {
  // --- AUTH / PIN SYSTEM ---
  const [pinVerified, setPinVerified] = useState<boolean>(() => {
    return sessionStorage.getItem('nazmul_store_auth_verified') === 'true';
  });
  const [pin, setPin] = useState<string>(() => {
    return localStorage.getItem('nazmul_store_pin') || '1234';
  });
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);
  const [showPinChangeModal, setShowPinChangeModal] = useState<boolean>(false);
  const [oldPinVal, setOldPinVal] = useState<string>('');
  const [newPinVal, setNewPinVal] = useState<string>('');

  // --- GENERAL STORE APP STATE ---
  const [view, setView] = useState<'dashboard' | 'products' | 'new_sale' | 'credit_ledger' | 'reports' | 'daily_ledger'>('dashboard');

  // Products
  const [products, setProducts] = useState<StoreProduct[]>(() => {
    const saved = localStorage.getItem('nazmul_store_products');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    // Seeds
    return [
      { id: 'p1', name: 'জিরাস চিপস (ছোট)', buyPrice: 4.38, sellPrice: 5.00, stock: 27 },
      { id: 'p2', name: 'জিরাস চিপস (বড়)', buyPrice: 8.00, sellPrice: 10.00, stock: 21 },
      { id: 'p3', name: 'বোম্বে চিপস', buyPrice: 8.00, sellPrice: 10.00, stock: 7 },
      { id: 'p4', name: 'রিং চিপস', buyPrice: 8.00, sellPrice: 10.00, stock: 37 },
      { id: 'p5', name: 'মাইটি চিপস', buyPrice: 8.25, sellPrice: 10.00, stock: 0 },
      { id: 'p6', name: 'প্রান ডাউল ভাজা', buyPrice: 4.00, sellPrice: 5.00, stock: 19 },
      { id: 'p7', name: 'আরকু চানাচুর', buyPrice: 4.00, sellPrice: 5.00, stock: 15 },
      { id: 'p8', name: 'পাইন এ্যাপেল বিস্কুট', buyPrice: 4.00, sellPrice: 5.00, stock: 10 },
      { id: 'p9', name: 'মিল্ক প্লাস বিস্কুট', buyPrice: 8.50, sellPrice: 10.00, stock: 10 }
    ];
  });

  // Customers (Credit ledger)
  const [customers, setCustomers] = useState<StoreCustomer[]>(() => {
    const saved = localStorage.getItem('nazmul_store_customers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    // Seeds
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

  // Sales
  const [sales, setSales] = useState<StoreSale[]>(() => {
    const saved = localStorage.getItem('nazmul_store_sales');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  // Daily purchases / Cash-minus
  const [dailyLedgers, setDailyLedgers] = useState<StoreDailyLedger[]>(() => {
    const saved = localStorage.getItem('nazmul_store_daily_ledgers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  // Current Date string YYYY-MM-DD
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [ledgerDateFilter, setLedgerDateFilter] = useState<string>(getTodayDateString());

  // Save utility wrappers
  const saveProducts = (data: StoreProduct[]) => {
    setProducts(data);
    localStorage.setItem('nazmul_store_products', JSON.stringify(data));
  };

  const saveCustomers = (data: StoreCustomer[]) => {
    setCustomers(data);
    localStorage.setItem('nazmul_store_customers', JSON.stringify(data));
  };

  const saveSales = (data: StoreSale[]) => {
    setSales(data);
    localStorage.setItem('nazmul_store_sales', JSON.stringify(data));
  };

  const saveDailyLedgers = (data: StoreDailyLedger[]) => {
    setDailyLedgers(data);
    localStorage.setItem('nazmul_store_daily_ledgers', JSON.stringify(data));
  };

  // Load manual cash when date filter changes
  useEffect(() => {
    const ledger = dailyLedgers.find(l => l.date === ledgerDateFilter);
    if (ledger && ledger.manualCash !== undefined) {
      setManualCashInput(String(ledger.manualCash));
    } else {
      setManualCashInput('');
    }
  }, [ledgerDateFilter, dailyLedgers]);

  // --- CALCULATED STATS FOR GENERAL STORE ---
  const todayStr = getTodayDateString();

  const todaySales = sales.filter(s => s.date === todayStr);
  const totalSalesToday = todaySales.reduce((acc, curr) => acc + curr.grandTotal, 0);
  const totalProfitToday = todaySales.reduce((acc, curr) => acc + curr.profit, 0);

  const totalItemsInStock = products.reduce((acc, curr) => acc + curr.stock, 0);
  const totalStockValueBuy = products.reduce((acc, curr) => acc + (curr.stock * curr.buyPrice), 0);

  // Low stock alert list
  const lowStockProducts = products.filter(p => p.stock <= 5);

  // --- PIN SUBMISSION ---
  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput === pin) {
      setPinVerified(true);
      setPinError(false);
      sessionStorage.setItem('nazmul_store_auth_verified', 'true');
      playSound(1200, 0.1, 'sine');
    } else {
      setPinError(true);
      setPinInput('');
      playSound(150, 0.3, 'sawtooth');
    }
  };

  const handleKeypadClick = (val: string) => {
    playSound(700, 0.05, 'sine');
    if (val === 'clear') {
      setPinInput('');
    } else if (val === 'back') {
      setPinInput(prev => prev.slice(0, -1));
    } else {
      if (pinInput.length < 4) {
        const newVal = pinInput + val;
        setPinInput(newVal);
        if (newVal.length === 4) {
          // Auto-submit on 4th digit
          setTimeout(() => {
            if (newVal === pin) {
              setPinVerified(true);
              setPinError(false);
              sessionStorage.setItem('nazmul_store_auth_verified', 'true');
              playSound(1200, 0.1, 'sine');
            } else {
              setPinError(true);
              setPinInput('');
              playSound(150, 0.3, 'sawtooth');
            }
          }, 150);
        }
      }
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPinVal !== pin) {
      alert("বর্তমান পিন সঠিক নয়!");
      playSound(150, 0.3, 'sawtooth');
      return;
    }
    if (newPinVal.length !== 4 || isNaN(Number(newPinVal))) {
      alert("নতুন পিন ৪ সংখ্যার হতে হবে!");
      playSound(150, 0.3, 'sawtooth');
      return;
    }
    setPin(newPinVal);
    localStorage.setItem('nazmul_store_pin', newPinVal);
    alert("পিন সফলভাবে পরিবর্তন করা হয়েছে!");
    playSound(1000, 0.15, 'sine');
    setShowPinChangeModal(false);
    setOldPinVal('');
    setNewPinVal('');
  };

  const handleLockOut = () => {
    setPinVerified(false);
    sessionStorage.removeItem('nazmul_store_auth_verified');
    playSound(400, 0.1, 'sine');
  };

  // --- PRODUCTS MANAGEMENT STATE ---
  const [prodSearch, setProdSearch] = useState<string>('');
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);

  // Add/Edit product inputs
  const [prodName, setProdName] = useState<string>('');
  const [prodBuyPrice, setProdBuyPrice] = useState<string>('');
  const [prodSellPrice, setProdSellPrice] = useState<string>('');
  const [prodStock, setProdStock] = useState<string>('');

  const handleAddOrEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName) return;

    const bPrice = parseFloat(prodBuyPrice) || 0;
    const sPrice = parseFloat(prodSellPrice) || 0;
    const stk = parseInt(prodStock) || 0;

    if (editingProduct) {
      // Edit
      const updated = products.map(p => p.id === editingProduct.id ? { ...p, name: prodName, buyPrice: bPrice, sellPrice: sPrice, stock: stk } : p);
      saveProducts(updated);
      playSound(900, 0.1);
    } else {
      // Add
      const newProd: StoreProduct = {
        id: 'PROD-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: prodName,
        buyPrice: bPrice,
        sellPrice: sPrice,
        stock: stk
      };
      saveProducts([...products, newProd]);
      playSound(1100, 0.1);
    }

    setProdName('');
    setProdBuyPrice('');
    setProdSellPrice('');
    setProdStock('');
    setEditingProduct(null);
    setShowAddProductModal(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই পণ্যটি ডিলিট করতে চান?")) {
      saveProducts(products.filter(p => p.id !== id));
      playSound(300, 0.15, 'sawtooth');
    }
  };

  // --- NEW SALE (SELL WINDOW) ---
  const [selectedCustomerForSale, setSelectedCustomerForSale] = useState<string>('Unknown');
  const [customCustomerSearch, setCustomCustomerSearch] = useState<string>('');
  const [paymentMethodForSale, setPaymentMethodForSale] = useState<'Cash' | 'Due' | 'Mobile Banking'>('Cash');
  const [saleDate, setSaleDate] = useState<string>(getTodayDateString());

  const [saleSearchProductQuery, setSaleSearchProductQuery] = useState<string>('');
  const [currentSelectedProductId, setCurrentSelectedProductId] = useState<string>('');
  const [saleQuantity, setSaleQuantity] = useState<string>('1');

  // Multi-item sale cart state
  const [saleCart, setSaleCart] = useState<{ product: StoreProduct; quantity: number }[]>([]);

  // Calculate Grand Total for Cart
  const cartGrandTotal = saleCart.reduce((acc, item) => acc + (item.product.sellPrice * item.quantity), 0);

  const handleAddToCart = () => {
    const prod = products.find(p => p.id === currentSelectedProductId);
    if (!prod) {
      alert("দয়া করে একটি পণ্য সিলেক্ট করুন!");
      return;
    }
    const qty = parseInt(saleQuantity) || 1;
    if (qty <= 0) {
      alert("পরিমাণ সঠিক নয়!");
      return;
    }
    if (prod.stock < qty) {
      alert(`স্টকে পর্যাপ্ত নেই! বর্তমানে মাত্র ${prod.stock} টি আছে।`);
      playSound(150, 0.2, 'sawtooth');
      return;
    }

    // Check if already in cart
    const existingIndex = saleCart.findIndex(item => item.product.id === prod.id);
    if (existingIndex > -1) {
      const currentInCart = saleCart[existingIndex].quantity;
      if (prod.stock < currentInCart + qty) {
        alert("স্টকের সীমা অতিক্রম করছে!");
        return;
      }
      const updatedCart = [...saleCart];
      updatedCart[existingIndex].quantity += qty;
      setSaleCart(updatedCart);
    } else {
      setSaleCart([...saleCart, { product: prod, quantity: qty }]);
    }

    playSound(950, 0.05);
    setCurrentSelectedProductId('');
    setSaleSearchProductQuery('');
    setSaleQuantity('1');
  };

  const handleRemoveFromCart = (index: number) => {
    const updated = [...saleCart];
    updated.splice(index, 1);
    setSaleCart(updated);
    playSound(400, 0.1);
  };

  const generateTextMemo = (sale: StoreSale) => {
    let text = `=================================\n`;
    text += `      নাজমুল জেনারেল স্টোর       \n`;
    text += `    বিক্রয় মেমো (Cash Receipt)    \n`;
    text += `=================================\n`;
    text += `মেমো আইডি: ${sale.id}\n`;
    text += `তারিখ: ${sale.date}\n`;
    text += `গ্রাহকের নাম: ${sale.customerName}\n`;
    text += `পরিশোধের মাধ্যম: ${sale.paymentMethod === 'Cash' ? 'নগদ (Cash)' : sale.paymentMethod === 'Due' ? 'বাকি (Due)' : 'মোবাইল ব্যাংকিং'}\n`;
    text += `---------------------------------\n`;
    text += `পণ্যের নাম        দর   পরিমাণ  মোট\n`;
    text += `---------------------------------\n`;
    sale.items.forEach((item) => {
      const nameShort = item.name.slice(0, 14);
      const namePad = nameShort + ' '.repeat(Math.max(0, 14 - nameShort.length));
      const rateStr = String(item.sellPrice).padStart(4, ' ');
      const qtyStr = String(item.quantity).padStart(4, ' ');
      const totalStr = String(item.sellPrice * item.quantity).padStart(5, ' ');
      text += `${namePad}  ${rateStr}   ${qtyStr}  ৳${totalStr}\n`;
    });
    text += `---------------------------------\n`;
    text += `সর্বমোট মূল্য: ৳${sale.grandTotal.toFixed(2)}\n`;
    text += `=================================\n`;
    text += `   ধন্যবাদ, আবার আসবেন!      \n`;
    text += `=================================\n`;
    return text;
  };

  const downloadSaleMemoFile = (sale: StoreSale) => {
    try {
      const memoText = generateTextMemo(sale);
      const blob = new Blob([memoText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `nazmul_store_memo_${sale.customerName}_${sale.id}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Error downloading memo:", e);
    }
  };

  const handleSaveSaleSubmit = () => {
    if (saleCart.length === 0) {
      alert("কার্ট খালি! দয়া করে কমপক্ষে একটি পণ্য যোগ করুন।");
      return;
    }

    // Grand total and profit calculation
    let totalSaleCost = 0;
    let totalSaleRevenue = 0;

    const saleItems: StoreSaleItem[] = saleCart.map(item => {
      totalSaleCost += item.product.buyPrice * item.quantity;
      totalSaleRevenue += item.product.sellPrice * item.quantity;
      return {
        productId: item.product.id,
        name: item.product.name,
        buyPrice: item.product.buyPrice,
        sellPrice: item.product.sellPrice,
        quantity: item.quantity
      };
    });

    const profit = totalSaleRevenue - totalSaleCost;
    const finalCustomer = selectedCustomerForSale === 'Custom' ? (customCustomerSearch.trim() || 'Unknown') : selectedCustomerForSale;

    const newSale: StoreSale = {
      id: 'GS-SALE-' + Date.now(),
      customerName: finalCustomer,
      paymentMethod: paymentMethodForSale,
      date: saleDate,
      timestamp: Date.now(),
      items: saleItems,
      grandTotal: totalSaleRevenue,
      profit: profit
    };

    // Deduct Stock
    const updatedProducts = products.map(p => {
      const cartItem = saleCart.find(c => c.product.id === p.id);
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      }
      return p;
    });

    // Update Customer Due Ledger if Payment Method is 'Due'
    if (paymentMethodForSale === 'Due' && finalCustomer !== 'Unknown') {
      const existingCust = customers.find(c => c.name.toLowerCase() === finalCustomer.toLowerCase());
      if (existingCust) {
        const updatedCusts = customers.map(c => {
          if (c.id === existingCust.id) {
            return {
              ...c,
              due: c.due + totalSaleRevenue,
              transactions: [
                ...c.transactions,
                {
                  id: 'TXN-' + Date.now(),
                  type: 'sale_due',
                  amount: totalSaleRevenue,
                  date: saleDate,
                  note: `${saleItems.map(si => `${si.name} (${si.quantity}টি)`).join(', ')} বকেয়া ক্রয়`,
                  timestamp: Date.now()
                }
              ]
            };
          }
          return c;
        });
        saveCustomers(updatedCusts);
      } else {
        // Create new customer
        const newCust: StoreCustomer = {
          id: 'CUST-' + Date.now(),
          name: finalCustomer,
          due: totalSaleRevenue,
          transactions: [
            {
              id: 'TXN-' + Date.now(),
              type: 'sale_due',
              amount: totalSaleRevenue,
              date: saleDate,
              note: `${saleItems.map(si => `${si.name} (${si.quantity}টি)`).join(', ')} বকেয়া ক্রয়`,
              timestamp: Date.now()
            }
          ]
        };
        saveCustomers([...customers, newCust]);
      }
    }

    saveProducts(updatedProducts);
    saveSales([newSale, ...sales]);

    playSound(1150, 0.2);
    
    // Automatically download memo
    downloadSaleMemoFile(newSale);
    setActiveMemoSale(newSale);

    // Reset Form
    setSaleCart([]);
    setSelectedCustomerForSale('Unknown');
    setCustomCustomerSearch('');
    setSaleCustomerSearchQuery('');
    setPaymentMethodForSale('Cash');
    setSaleSearchProductQuery('');
    setCurrentSelectedProductId('');
    setSaleQuantity('1');
    setView('dashboard');
  };

  const handleResetSaleForm = () => {
    setSaleCart([]);
    setSelectedCustomerForSale('Unknown');
    setCustomCustomerSearch('');
    setPaymentMethodForSale('Cash');
    setSaleSearchProductQuery('');
    setCurrentSelectedProductId('');
    setSaleQuantity('1');
    playSound(400, 0.15, 'triangle');
  };

  // --- CREDIT LEDGER STATE ---
  const [custSearch, setCustSearch] = useState<string>('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState<string>('');
  const [newCustPhone, setNewCustPhone] = useState<string>('');
  const [newCustInitialDue, setNewCustInitialDue] = useState<string>('0');

  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<StoreCustomer | null>(null);
  const [tempReminderPhone, setTempReminderPhone] = useState<string>('');
  const [paymentReceivedAmount, setPaymentReceivedAmount] = useState<string>('');
  const [paymentReceivedCreditedAmount, setPaymentReceivedCreditedAmount] = useState<string>('');
  const [paymentReceivedNote, setPaymentReceivedNote] = useState<string>('');

  // Bulk Notice States
  const [showBulkReminderModal, setShowBulkReminderModal] = useState<boolean>(false);
  const [selectedBulkCustomerIds, setSelectedBulkCustomerIds] = useState<string[]>([]);
  const [currentBulkIndex, setCurrentBulkIndex] = useState<number>(0);

  // Autocomplete search states
  const [saleCustomerSearchQuery, setSaleCustomerSearchQuery] = useState<string>('');
  const [showSaleCustomerDropdown, setShowSaleCustomerDropdown] = useState<boolean>(false);
  const [activeMemoSale, setActiveMemoSale] = useState<StoreSale | null>(null);
  const [onlyLowStockFilter, setOnlyLowStockFilter] = useState<boolean>(false);
  const [showPurchaseSuggestions, setShowPurchaseSuggestions] = useState<boolean>(false);
  const [manualCashInput, setManualCashInput] = useState<string>('');

  // Set temp reminder phone when a customer details sidebar is opened
  useEffect(() => {
    if (selectedCustomerDetails) {
      setTempReminderPhone(selectedCustomerDetails.phone || '');
    } else {
      setTempReminderPhone('');
    }
  }, [selectedCustomerDetails]);

  // Report search & navigation states
  const [reportTab, setReportTab] = useState<'products' | 'transactions'>('products');
  const [reportSearchCustomer, setReportSearchCustomer] = useState<string>('');
  const [reportSearchDate, setReportSearchDate] = useState<string>('');

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const initialDueVal = parseFloat(newCustInitialDue) || 0;
    const newCust: StoreCustomer = {
      id: 'CUST-' + Date.now(),
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      due: initialDueVal,
      transactions: initialDueVal > 0 ? [
        {
          id: 'TXN-INIT-' + Date.now(),
          type: 'sale_due',
          amount: initialDueVal,
          date: getTodayDateString(),
          note: 'পূর্বের খাতা ওপেনিং ব্যালেন্স',
          timestamp: Date.now()
        }
      ] : []
    };

    saveCustomers([...customers, newCust]);
    playSound(1100, 0.1);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustInitialDue('0');
    setShowAddCustomerModal(false);
  };

  const handleReceiveDuePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerDetails) return;

    const received = parseFloat(paymentReceivedAmount) || 0;
    const credited = parseFloat(paymentReceivedCreditedAmount) || 0;
    const noteText = paymentReceivedNote.trim();

    if (received <= 0 && credited <= 0) {
      alert("টাকার পরিমাণ সঠিক নয়! জমা পরিমাণ অথবা বাকি পরিমাণ উল্লেখ করুন।");
      return;
    }

    let currentDue = selectedCustomerDetails.due;
    let updatedTxns = [...selectedCustomerDetails.transactions];

    if (credited > 0) {
      currentDue += credited;
      updatedTxns.push({
        id: 'TXN-' + Date.now() + '-CR',
        type: 'sale_due',
        amount: credited,
        date: getTodayDateString(),
        note: noteText || 'বাকি দেওয়া হলো',
        timestamp: Date.now()
      });
    }

    if (received > 0) {
      currentDue = Math.max(0, currentDue - received);
      updatedTxns.push({
        id: 'TXN-' + Date.now() + '-RC',
        type: 'payment_received',
        amount: received,
        date: getTodayDateString(),
        note: noteText || 'জমা গ্রহণ',
        timestamp: Date.now()
      });
    }

    const updatedCusts = customers.map(c => {
      if (c.id === selectedCustomerDetails.id) {
        return {
          ...c,
          due: currentDue,
          transactions: updatedTxns
        };
      }
      return c;
    });

    saveCustomers(updatedCusts);
    
    // Also trigger update on current viewer
    const freshData = updatedCusts.find(c => c.id === selectedCustomerDetails.id) || null;
    setSelectedCustomerDetails(freshData);

    playSound(1200, 0.2, 'sine');
    alert("লেনদেন সফলভাবে সংরক্ষণ করা হয়েছে!");
    setPaymentReceivedAmount('');
    setPaymentReceivedCreditedAmount('');
    setPaymentReceivedNote('');
  };

  const handleEditCustomerName = (cust: StoreCustomer) => {
    const newName = prompt("কাস্টমারের নতুন নাম লিখুন:", cust.name);
    if (newName && newName.trim() && newName.trim() !== cust.name) {
      const updated = customers.map(c => {
        if (c.id === cust.id) {
          return { ...c, name: newName.trim() };
        }
        return c;
      });
      saveCustomers(updated);
      if (selectedCustomerDetails?.id === cust.id) {
        setSelectedCustomerDetails({ ...selectedCustomerDetails, name: newName.trim() });
      }
      playSound(1000, 0.1, 'sine');
      alert("কাস্টমারের নাম সফলভাবে পরিবর্তন করা হয়েছে!");
    }
  };

  const handleUpdateCustomerPhone = (id: string, newPhone: string) => {
    const updated = customers.map(c => {
      if (c.id === id) {
        return { ...c, phone: newPhone.trim() };
      }
      return c;
    });
    saveCustomers(updated);
    if (selectedCustomerDetails?.id === id) {
      setSelectedCustomerDetails({ ...selectedCustomerDetails, phone: newPhone.trim() });
    }
    playSound(1000, 0.1, 'sine');
    alert("কাস্টমারের মোবাইল নাম্বার সংরক্ষণ করা হয়েছে!");
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই কাস্টমার ফাইল ডিলিট করতে চান? বকেয়া হিসাব মুছে যাবে!")) {
      saveCustomers(customers.filter(c => c.id !== id));
      setSelectedCustomerDetails(null);
      playSound(300, 0.2, 'sawtooth');
    }
  };

  // --- DAILY LEDGER (হিসাব খাতা) STATE ---
  const [purchaseProdName, setPurchaseProdName] = useState<string>('');
  const [purchaseQty, setPurchaseQty] = useState<string>('1');
  const [purchaseCost, setPurchaseCost] = useState<string>('');
  const [purchaseSellPrice, setPurchaseSellPrice] = useState<string>('');

  // Get active ledger for the selected date
  const activeLedger = dailyLedgers.find(l => l.date === ledgerDateFilter) || { date: ledgerDateFilter, closeCash: null, purchases: [] };

  const handleAddPurchaseCost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseProdName.trim() || !purchaseCost) {
      alert("দয়া করে বিবরণ ও খরচের পরিমাণ লিখুন!");
      return;
    }

    const pCost = parseFloat(purchaseCost) || 0;
    const pQty = parseInt(purchaseQty) || 1;
    const sPrice = purchaseSellPrice ? parseFloat(purchaseSellPrice) : undefined;

    const newPurchase: StorePurchase = {
      id: 'PURCH-' + Date.now(),
      productName: purchaseProdName.trim(),
      qty: pQty,
      purchaseAmount: pCost,
      sellPrice: sPrice,
      timestamp: Date.now()
    };

    // Update product stock if match found by name (case insensitive)
    const existingProd = products.find(p => p.name.toLowerCase() === purchaseProdName.trim().toLowerCase());
    if (existingProd) {
      const updated = products.map(p => {
        if (p.id === existingProd.id) {
          return {
            ...p,
            stock: p.stock + pQty,
            buyPrice: pCost / pQty,
            sellPrice: sPrice || p.sellPrice
          };
        }
        return p;
      });
      saveProducts(updated);
    } else {
      // Prompt to create new product? Or do it silently
      if (sPrice) {
        const newP: StoreProduct = {
          id: 'PROD-' + Date.now(),
          name: purchaseProdName.trim(),
          buyPrice: pCost / pQty,
          sellPrice: sPrice,
          stock: pQty
        };
        saveProducts([...products, newP]);
      }
    }

    // Save in ledger purchases
    const ledgerIndex = dailyLedgers.findIndex(l => l.date === ledgerDateFilter);
    let updatedLedgers = [...dailyLedgers];
    if (ledgerIndex > -1) {
      updatedLedgers[ledgerIndex].purchases = [...updatedLedgers[ledgerIndex].purchases, newPurchase];
    } else {
      updatedLedgers.push({
        date: ledgerDateFilter,
        closeCash: null,
        purchases: [newPurchase]
      });
    }

    saveDailyLedgers(updatedLedgers);
    playSound(1000, 0.1, 'sine');

    // Reset input
    setPurchaseProdName('');
    setPurchaseQty('1');
    setPurchaseCost('');
    setPurchaseSellPrice('');
  };

  const handleSelectPurchaseSuggestion = (prod: StoreProduct) => {
    setPurchaseProdName(prod.name);
    setPurchaseQty('1');
    // Calculate total cost based on quantity 1 and current buyPrice
    setPurchaseCost(String(prod.buyPrice));
    setPurchaseSellPrice(String(prod.sellPrice));
    setShowPurchaseSuggestions(false);
    playSound(900, 0.05);
  };

  const handleRemovePurchase = (purchaseId: string) => {
    const ledgerIndex = dailyLedgers.findIndex(l => l.date === ledgerDateFilter);
    if (ledgerIndex > -1) {
      let updatedLedgers = [...dailyLedgers];
      updatedLedgers[ledgerIndex].purchases = updatedLedgers[ledgerIndex].purchases.filter(p => p.id !== purchaseId);
      saveDailyLedgers(updatedLedgers);
      playSound(350, 0.15, 'sawtooth');
    }
  };

  const handleSaveManualCash = () => {
    const val = parseFloat(manualCashInput) || 0;
    const ledgerIndex = dailyLedgers.findIndex(l => l.date === ledgerDateFilter);
    let updatedLedgers = [...dailyLedgers];
    if (ledgerIndex > -1) {
      updatedLedgers[ledgerIndex].manualCash = val;
    } else {
      updatedLedgers.push({
        date: ledgerDateFilter,
        closeCash: null,
        purchases: [],
        manualCash: val
      });
    }
    saveDailyLedgers(updatedLedgers);
    playSound(1000, 0.1, 'sine');
    alert("ড্রয়ার ক্যাশ সফলভাবে আপডেট করা হয়েছে!");
  };

  const handleCloseDayToggle = () => {
    const currentSalesVal = sales.filter(s => s.date === ledgerDateFilter).reduce((acc, curr) => acc + curr.grandTotal, 0);
    const currentPurchasesVal = activeLedger.purchases.reduce((acc, curr) => acc + curr.purchaseAmount, 0);
    const calculatedClose = currentSalesVal - currentPurchasesVal;

    const ledgerIndex = dailyLedgers.findIndex(l => l.date === ledgerDateFilter);
    let updatedLedgers = [...dailyLedgers];

    if (activeLedger.closeCash !== null) {
      // Reopen
      if (confirm("আপনি কি আজকের ক্লোজড হিসাব পুনরায় চালু করতে চান?")) {
        if (ledgerIndex > -1) {
          updatedLedgers[ledgerIndex].closeCash = null;
        }
        playSound(950, 0.1);
      }
    } else {
      // Close
      if (confirm(`আপনি কি আজকের দিন বন্ধ (Close Day) করতে চান? আজকের মোট নেট ক্যাশ: ৳${calculatedClose.toFixed(2)} টাকা।`)) {
        if (ledgerIndex > -1) {
          updatedLedgers[ledgerIndex].closeCash = calculatedClose;
        } else {
          updatedLedgers.push({
            date: ledgerDateFilter,
            closeCash: calculatedClose,
            purchases: []
          });
        }
        playSound(1200, 0.3, 'sine');
      }
    }
    saveDailyLedgers(updatedLedgers);
  };

  // --- REPORT CALCULATIONS ---
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('monthly');

  const getFilteredSalesForReport = () => {
    const now = Date.now();
    return sales.filter(s => {
      const saleTime = s.timestamp;
      const diffDays = (now - saleTime) / (1000 * 60 * 60 * 24);
      if (reportPeriod === 'daily') return diffDays <= 1;
      if (reportPeriod === 'weekly') return diffDays <= 7;
      if (reportPeriod === 'monthly') return diffDays <= 30;
      return true; // all
    });
  };

  const reportSales = getFilteredSalesForReport();
  const reportTotalRevenue = reportSales.reduce((acc, curr) => acc + curr.grandTotal, 0);
  const reportTotalProfit = reportSales.reduce((acc, curr) => acc + curr.profit, 0);
  const reportTotalDueSales = reportSales.filter(s => s.paymentMethod === 'Due').reduce((acc, curr) => acc + curr.grandTotal, 0);

  // --- BACKUP & RESTORE UTILITIES ---
  const handleExportFullBackup = () => {
    try {
      const dataStr = JSON.stringify({
        products,
        sales,
        customers,
        dailyLedgers,
        pin
      }, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `Nazmul_General_Store_Backup_${new Date().toISOString().slice(0,10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      playSound(1200, 0.25, 'sine');
    } catch (e) {
      alert("ব্যাকআপ তৈরি করতে সমস্যা হয়েছে!");
    }
  };

  const handleImportFullBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
    if (!file) return;

    fileReader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.products && parsed.customers) {
          if (confirm("সতর্কতা! আপনি কি ব্যাকআপ ফাইলটি রিস্টোর করতে চান? আপনার বর্তমান সমস্ত মুদিখানা তথ্য প্রতিস্থাপিত হবে।")) {
            saveProducts(parsed.products || []);
            saveCustomers(parsed.customers || []);
            saveSales(parsed.sales || []);
            saveDailyLedgers(parsed.dailyLedgers || []);
            if (parsed.pin) {
              setPin(parsed.pin);
              localStorage.setItem('nazmul_store_pin', parsed.pin);
            }
            playSound(1250, 0.4, 'sine');
            alert("সফলভাবে ব্যাকআপ ফাইল রিস্টোর সম্পন্ন হয়েছে!");
          }
        } else {
          alert("ভুল ব্যাকআপ ফরম্যাট! সঠিক নাজমুল জেনারেল স্টোর ফাইল সিলেক্ট করুন।");
        }
      } catch (err) {
        alert("ফাইল পড়তে সমস্যা হয়েছে!");
      }
    };
    fileReader.readAsText(file);
  };

  const handleClearTodaySales = () => {
    if (confirm("সতর্কতা! আপনি কি আজকের মুদি বিক্রয়ের সমস্ত রেকর্ড ডিলিট করতে চান? এর ফলে স্টকের পরিমাণ পুনরায় পরিবর্তিত হবে না।")) {
      const nonTodaySales = sales.filter(s => s.date !== todayStr);
      saveSales(nonTodaySales);
      playSound(300, 0.4, 'sawtooth');
      alert("আজকের বিক্রির হিসাব মুছে ফেলা হয়েছে!");
    }
  };

  // Convert English numbers to Bengali
  const toBnNum = (val: string | number): string => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(val).replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit, 10)]);
  };

  // --- PIN LOCK VIEW ---
  if (!pinVerified) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 bg-slate-50 dark:bg-[#090d16] font-sans transition-all duration-300">
        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm flex flex-col items-center text-center">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-4">
            <Lock size={36} className="animate-bounce" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">নাজমুল জেনারেল স্টোর</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">পিন দিয়ে মুদিখানা ড্যাসবোর্ড আনলক করুন (ডিফল্ট: ১২৩৪)</p>

          <form onSubmit={handlePinSubmit} className="w-full">
            <input 
              type="password"
              value={pinInput}
              readOnly
              placeholder="••••"
              className={`w-full text-center text-3xl font-mono tracking-[1em] py-3.5 rounded-2xl border-2 mb-6 ${pinError ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600' : 'border-indigo-200 dark:border-indigo-900 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white focus:border-indigo-500'}`}
            />
            
            {/* Custom 3x4 keypad */}
            <div className="grid grid-cols-3 gap-3 mb-4 font-mono">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadClick(num)}
                  className="py-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#111827] dark:hover:bg-[#1e293b] text-xl font-bold text-slate-800 dark:text-slate-200 transition-colors shadow-sm"
                >
                  {toBnNum(num)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleKeypadClick('clear')}
                className="py-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-sm font-bold text-rose-600 dark:text-rose-400 transition-colors shadow-sm"
              >
                মুছুন
              </button>
              <button
                type="button"
                onClick={() => handleKeypadClick('0')}
                className="py-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#111827] dark:hover:bg-[#1e293b] text-xl font-bold text-slate-800 dark:text-slate-200 transition-colors shadow-sm"
              >
                {toBnNum('0')}
              </button>
              <button
                type="button"
                onClick={() => handleKeypadClick('back')}
                className="py-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 text-sm font-bold text-amber-600 dark:text-amber-400 transition-colors shadow-sm"
              >
                ←
              </button>
            </div>

            {pinError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold animate-pulse mb-3">পিন ভুল হয়েছে! পুনরায় চেষ্টা করুন।</p>
            )}

            <button
              onClick={onSwitchToTelecom}
              type="button"
              className="mt-2 w-full py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#111827] border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all"
            >
              টেলিকম খাতা সিস্টেমে ফিরে যান
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- CORE SYSTEM DASHBOARD & VIEWS ---
  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#090d16] font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* HEADER BANNER FOR STORE MODE */}
      <div className="bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md">
              <Store size={24} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                নাজমুল জেনারেল স্টোর <span className="text-[10px] bg-indigo-600 text-white py-0.5 px-2 rounded-full uppercase font-mono">মুদিখানা খাতা</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">মুদি দোকান স্টক ও ক্যাশ বিক্রয় ব্যবস্থাপনা প্যানেল</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              onClick={handleLockOut}
              className="px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 dark:border-rose-950/40 dark:hover:bg-rose-950/10 text-rose-600 dark:text-rose-400 font-sans font-bold flex items-center gap-1 transition-all"
            >
              <Lock size={12} /> লক করুন
            </button>
            <button
              onClick={onSwitchToTelecom}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-[#111827] text-slate-600 dark:text-slate-300 font-sans font-bold flex items-center gap-1 transition-all"
            >
              টেলিকম মোড
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 space-y-6">

        {/* TOP LEVEL METRIC SUMMARY (When viewing Dashboard) */}
        {view === 'dashboard' && (
          <>
            {/* Grid Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Today's Profit */}
              <div className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/40 rounded-2xl p-4 md:p-5 flex flex-col justify-between shadow-sm">
                <span className="text-[11px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">আজকের মোট লাভ (Profit Today)</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">BDT</span>
                  <strong className="text-xl md:text-2xl font-black text-emerald-900 dark:text-emerald-300 font-mono">
                    {toBnNum(totalProfitToday.toFixed(2))}
                  </strong>
                </div>
              </div>

              {/* Today's Sales */}
              <div className="bg-blue-50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-950/40 rounded-2xl p-4 md:p-5 flex flex-col justify-between shadow-sm">
                <span className="text-[11px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">আজকের মোট বিক্রয় (Sales Today)</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">BDT</span>
                  <strong className="text-xl md:text-2xl font-black text-blue-900 dark:text-blue-300 font-mono">
                    {toBnNum(totalSalesToday.toFixed(2))}
                  </strong>
                </div>
              </div>

              {/* Total Stock Items */}
              <div className="bg-indigo-50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-950/40 rounded-2xl p-4 md:p-5 flex flex-col justify-between shadow-sm">
                <span className="text-[11px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">স্টকে মোট পণ্য (Items in Stock)</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <strong className="text-xl md:text-2xl font-black text-indigo-900 dark:text-indigo-300 font-mono">
                    {toBnNum(totalItemsInStock.toLocaleString('en-US'))}
                  </strong>
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">পিস</span>
                </div>
              </div>

              {/* Total Stock Value */}
              <div className="bg-fuchsia-50 dark:bg-fuchsia-950/10 border border-fuchsia-100 dark:border-fuchsia-950/40 rounded-2xl p-4 md:p-5 flex flex-col justify-between shadow-sm">
                <span className="text-[11px] uppercase font-bold text-fuchsia-600 dark:text-fuchsia-400 tracking-wider">স্টকের বর্তমান মূল্য (Stock Value)</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xs font-bold text-fuchsia-700 dark:text-fuchsia-300">BDT</span>
                  <strong className="text-xl md:text-2xl font-black text-fuchsia-900 dark:text-fuchsia-300 font-mono">
                    {toBnNum(totalStockValueBuy.toFixed(2))}
                  </strong>
                </div>
              </div>
            </div>

            {/* NAVIGATION MENU BUTTON GRID */}
            <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">মুদিখানা কন্ট্রোল প্যানেল</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* 1. Products */}
                <button
                  onClick={() => { setView('products'); playSound(900, 0.05); }}
                  className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow transition-all flex flex-col items-center justify-center gap-2 text-center relative overflow-hidden"
                >
                  {lowStockProducts.length > 0 && (
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                  )}
                  <FileSpreadsheet size={24} />
                  <span className="text-xs font-bold flex items-center gap-1">
                    পণ্য তালিকা / স্টক
                    {lowStockProducts.length > 0 && (
                      <span className="bg-amber-500 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                        {toBnNum(lowStockProducts.length)}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] opacity-80 font-mono font-medium">Products / Stock</span>
                </button>

                {/* 2. New Sale */}
                <button
                  onClick={() => { setView('new_sale'); playSound(900, 0.05); }}
                  className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow transition-all flex flex-col items-center justify-center gap-2 text-center"
                >
                  <Plus size={24} />
                  <span className="text-xs font-bold">নতুন বিক্রয় (Sell)</span>
                  <span className="text-[10px] opacity-80 font-mono font-medium">New Sale</span>
                </button>

                {/* 3. Credit Ledger */}
                <button
                  onClick={() => { setView('credit_ledger'); playSound(900, 0.05); }}
                  className="p-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow transition-all flex flex-col items-center justify-center gap-2 text-center"
                >
                  <Users size={24} />
                  <span className="text-xs font-bold">বাকি খাতা (Ledger)</span>
                  <span className="text-[10px] opacity-80 font-mono font-medium">Credit Ledger</span>
                </button>

                {/* 4. Daily Ledger */}
                <button
                  onClick={() => { setView('daily_ledger'); playSound(900, 0.05); }}
                  className="p-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl shadow transition-all flex flex-col items-center justify-center gap-2 text-center border border-slate-700"
                >
                  <BookOpen size={24} />
                  <span className="text-xs font-bold">হিসাব খাতা (Ledger)</span>
                  <span className="text-[10px] opacity-80 font-mono font-medium">Daily Ledger</span>
                </button>

                {/* 5. Reports */}
                <button
                  onClick={() => { setView('reports'); playSound(900, 0.05); }}
                  className="p-4 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl shadow-sm transition-all flex flex-col items-center justify-center gap-2 text-center"
                >
                  <TrendingUp size={24} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold">বিক্রয় রিপোর্ট</span>
                  <span className="text-[10px] text-slate-400 font-mono">Reports</span>
                </button>

                {/* 6. Change PIN */}
                <button
                  onClick={() => { setShowPinChangeModal(true); playSound(900, 0.05); }}
                  className="p-4 bg-violet-50 dark:bg-violet-950/20 hover:bg-violet-100 dark:hover:bg-violet-950/40 border border-violet-200 dark:border-violet-900/60 text-violet-700 dark:text-violet-400 rounded-2xl shadow-sm transition-all flex flex-col items-center justify-center gap-2 text-center"
                >
                  <Key size={24} />
                  <span className="text-xs font-bold">পিন পরিবর্তন</span>
                  <span className="text-[10px] text-slate-400 font-mono">Change PIN</span>
                </button>

                {/* 7. Clear Today Sales */}
                <button
                  onClick={handleClearTodaySales}
                  className="p-4 bg-amber-50 dark:bg-amber-950/15 hover:bg-amber-100/80 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 rounded-2xl shadow-sm transition-all flex flex-col items-center justify-center gap-2 text-center"
                >
                  <RefreshCw size={24} />
                  <span className="text-xs font-bold">আজকের সেলস মুছুন</span>
                  <span className="text-[10px] text-slate-400 font-mono">Clear Sales</span>
                </button>

                {/* 8. Backup Download */}
                <button
                  onClick={handleExportFullBackup}
                  className="p-4 bg-fuchsia-50 dark:bg-fuchsia-950/15 hover:bg-fuchsia-100 border border-fuchsia-200 dark:border-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-400 rounded-2xl shadow-sm transition-all flex flex-col items-center justify-center gap-2 text-center"
                >
                  <Download size={24} />
                  <span className="text-xs font-bold">ব্যাকআপ ডাউনলোড</span>
                  <span className="text-[10px] text-slate-400 font-mono">Full Export</span>
                </button>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                {/* Restore Import File Input */}
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/15 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-2xl text-xs font-bold text-rose-700 dark:text-rose-400 cursor-pointer transition-all">
                  <Upload size={16} />
                  <span>ব্যাকআপ ফাইল ইমপোর্ট (.JSON)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFullBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* RECENT SALES CAROUSEL OR LIST (DASHBOARD) */}
            <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">আজকের সাম্প্রতিক মুদি বিক্রয় ({toBnNum(todaySales.length)}টি)</h3>
                <span className="text-xs text-slate-400 font-bold font-mono">{todayStr}</span>
              </div>

              {todaySales.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                  আজকে এখনো কোনো মুদি পণ্য বিক্রয় করা হয়নি।
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[300px]">
                  {todaySales.map(sale => (
                    <div key={sale.id} className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm text-slate-900 dark:text-slate-100">{sale.customerName}</strong>
                          <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full ${sale.paymentMethod === 'Cash' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : sale.paymentMethod === 'Due' ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' : 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'}`}>
                            {sale.paymentMethod === 'Cash' ? 'নগদ' : sale.paymentMethod === 'Due' ? 'বাকি' : 'মোবাইল ব্যাংকিং'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {sale.items.map(it => `${it.name} (${toBnNum(it.quantity)}টি)`).join(', ')}
                        </p>
                      </div>
                      <div className="text-right font-mono">
                        <strong className="block text-sm text-slate-900 dark:text-slate-100">৳{toBnNum(sale.grandTotal)}</strong>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">লাভ: ৳{toBnNum(sale.profit.toFixed(1))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* --- PRODUCTS MANAGEMENT VIEW --- */}
        {view === 'products' && (
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <button
                onClick={() => setView('dashboard')}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <ChevronLeft size={16} /> ড্যাশবোর্ডে ফিরুন
              </button>
              <h3 className="text-base font-black text-slate-950 dark:text-white">পণ্য ও স্টক ডেটাবেজ</h3>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProdName('');
                  setProdBuyPrice('');
                  setProdSellPrice('');
                  setProdStock('');
                  setShowAddProductModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 self-start shadow"
              >
                <Plus size={14} /> নতুন পণ্য যোগ করুন
              </button>
            </div>

            {/* Search and Stock Alert Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  placeholder="পণ্যের নাম লিখে খুঁজুন..."
                  value={prodSearch}
                  onChange={e => setProdSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  playSound(900, 0.05);
                  setOnlyLowStockFilter(!onlyLowStockFilter);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${onlyLowStockFilter ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50 font-extrabold shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'}`}
              >
                <AlertTriangle size={14} className={onlyLowStockFilter ? 'text-amber-600 dark:text-amber-400 animate-pulse' : 'text-slate-400'} />
                <span>স্টক অ্যালার্ট ({toBnNum(lowStockProducts.length)})</span>
              </button>
            </div>

            {/* In-place low stock summary alert box when the stock alert option/filter is active */}
            {onlyLowStockFilter && lowStockProducts.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl space-y-2 text-xs text-amber-800 dark:text-amber-300 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="shrink-0 text-amber-600 dark:text-amber-400" size={16} />
                  <strong className="font-black">স্টক শেষ হওয়ার সতর্কবার্তা ({toBnNum(lowStockProducts.length)}টি পণ্য):</strong>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lowStockProducts.map(p => (
                    <span 
                      key={p.id} 
                      className="bg-amber-100 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 px-3 py-1.5 rounded-xl font-bold flex items-center gap-2"
                    >
                      <span className="text-slate-900 dark:text-slate-100">{p.name}</span>
                      <span className="bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                        {toBnNum(p.stock)} টি অবশিষ্ট
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold">
                    <th className="py-3 px-4">পণ্যের নাম (Name)</th>
                    <th className="py-3 px-4">ক্রয় মূল্য (Buy)</th>
                    <th className="py-3 px-4">বিক্রয় মূল্য (Sell)</th>
                    <th className="py-3 px-4 text-center">স্টক পরিমাণ (Stock)</th>
                    <th className="py-3 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {products
                    .filter(p => p.name.toLowerCase().includes(prodSearch.toLowerCase()))
                    .filter(p => !onlyLowStockFilter || p.stock <= 5)
                    .map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{p.name}</td>
                        <td className="py-3.5 px-4 font-mono">৳{toBnNum(p.buyPrice.toFixed(2))}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">৳{toBnNum(p.sellPrice.toFixed(2))}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 font-mono font-bold rounded-full ${p.stock <= 5 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 animate-pulse' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                            {toBnNum(p.stock)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProdName(p.name);
                                setProdBuyPrice(String(p.buyPrice));
                                setProdSellPrice(String(p.sellPrice));
                                setProdStock(String(p.stock));
                                setShowAddProductModal(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 rounded-lg"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- NEW SALE VIEW --- */}
        {view === 'new_sale' && (
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <button
                onClick={() => setView('dashboard')}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <ChevronLeft size={16} /> ড্যাশবোর্ডে ফিরুন
              </button>
              <h3 className="text-base font-black text-slate-950 dark:text-white">নতুন মুদি বিক্রয় উইন্ডো</h3>
              <span className="text-xs text-slate-400 font-bold font-mono">{saleDate}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Side Form Controls */}
              <div className="space-y-4 border-r border-slate-100 dark:border-slate-800 pr-0 lg:pr-6">
                
                {/* 1. Customer Selection */}
                <div className="relative">
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">কাস্টমার সিলেক্ট করুন</label>
                  
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="কাস্টমারের নাম লিখে খুঁজুন..."
                        value={saleCustomerSearchQuery}
                        onChange={e => {
                          setSaleCustomerSearchQuery(e.target.value);
                          setShowSaleCustomerDropdown(true);
                        }}
                        onFocus={() => setShowSaleCustomerDropdown(true)}
                        onBlur={() => setTimeout(() => setShowSaleCustomerDropdown(false), 250)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-bold"
                      />
                      {showSaleCustomerDropdown && (
                        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                          <button
                            type="button"
                            onMouseDown={() => {
                              setSelectedCustomerForSale('Unknown');
                              setSaleCustomerSearchQuery('অজ্ঞাত (Unknown)');
                              setShowSaleCustomerDropdown(false);
                            }}
                            className="w-full text-left p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs text-slate-800 dark:text-slate-100 font-bold"
                          >
                            অজ্ঞাত (Unknown)
                          </button>
                          <button
                            type="button"
                            onMouseDown={() => {
                              setSelectedCustomerForSale('Custom');
                              setSaleCustomerSearchQuery('নতুন / অন্য নাম');
                              setShowSaleCustomerDropdown(false);
                            }}
                            className="w-full text-left p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs text-indigo-600 dark:text-indigo-400 font-bold"
                          >
                            + নতুন / অন্য নাম লিখুন
                          </button>
                          {customers
                            .filter(c => c.name.toLowerCase().includes(saleCustomerSearchQuery.toLowerCase()))
                            .map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onMouseDown={() => {
                                  setSelectedCustomerForSale(c.name);
                                  setSaleCustomerSearchQuery(c.name);
                                  setShowSaleCustomerDropdown(false);
                                }}
                                className="w-full text-left p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs flex justify-between items-center cursor-pointer"
                              >
                                <span className="text-slate-800 dark:text-slate-100 font-bold">{c.name}</span>
                                {c.due > 0 ? (
                                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold font-sans">বাকি: ৳{toBnNum(c.due)}</span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-sans">কোনো বাকি নেই</span>
                                )}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Selected Customer indicator badge */}
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <span>নির্বাচিত:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                      {selectedCustomerForSale === 'Unknown' ? 'অজ্ঞাত' : selectedCustomerForSale === 'Custom' ? `নতুন নাম (${customCustomerSearch || 'লিখুন'})` : selectedCustomerForSale}
                    </span>
                  </div>
                </div>

                {selectedCustomerForSale === 'Custom' && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">কাস্টমারের নাম লিখুন</label>
                    <input
                      type="text"
                      placeholder="যেমন: রহিম শেখ"
                      value={customCustomerSearch}
                      onChange={e => setCustomCustomerSearch(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {/* 2. Payment Method */}
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">মূল্য পরিশোধের মাধ্যম</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Cash', 'Due', 'Mobile Banking'].map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => {
                          setPaymentMethodForSale(method as any);
                          playSound(800, 0.05);
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${paymentMethodForSale === method ? 'bg-indigo-600 border-indigo-600 text-white shadow' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-100'}`}
                      >
                        {method === 'Cash' ? 'নগদ (Cash)' : method === 'Due' ? 'বাকি (Due)' : 'মোবাইল ব্যাংক'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Product Selection */}
                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <span className="block text-[11px] uppercase text-indigo-600 dark:text-indigo-400 font-bold tracking-wider">পণ্য কার্টে যোগ করুন</span>
                  
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-0.5">পণ্য সিলেক্ট করুন</label>
                    <select
                      value={currentSelectedProductId}
                      onChange={e => setCurrentSelectedProductId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] text-xs text-slate-900 dark:text-white font-bold"
                    >
                      <option value="">-- পণ্য নির্বাচন করুন --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                          {p.name} {p.stock <= 0 ? '(স্টক আউট)' : `(স্টক: ${p.stock}টি - মূল্য: ৳${p.sellPrice})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-1/3">
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">পরিমাণ (Qty)</label>
                      <input
                        type="number"
                        min="1"
                        value={saleQuantity}
                        onChange={e => setSaleQuantity(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] text-xs text-center font-bold"
                      />
                    </div>
                    <div className="flex-1 flex items-end">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow"
                      >
                        <Plus size={14} /> কার্টে যোগ করুন
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side Cart Listing */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">কার্ট আইটেম ({toBnNum(saleCart.length)}টি)</span>
                    <button
                      onClick={() => setSaleCart([])}
                      className="text-[10px] text-rose-600 hover:underline font-bold"
                    >
                      সমস্ত মুছুন
                    </button>
                  </div>

                  {saleCart.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      কোনো পণ্য যোগ করা হয়নি। বামদিকের ফর্ম থেকে সিলেক্ট করে কার্টে অ্যাড করুন।
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto">
                      {saleCart.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-xs border border-slate-100 dark:border-slate-800">
                          <div>
                            <strong className="text-slate-900 dark:text-slate-100">{item.product.name}</strong>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              ৳{toBnNum(item.product.sellPrice)} × {toBnNum(item.quantity)} পিস
                            </p>
                          </div>
                          <div className="flex items-center gap-3 font-mono">
                            <strong className="text-indigo-600 dark:text-indigo-400">৳{toBnNum(item.product.sellPrice * item.quantity)}</strong>
                            <button
                              onClick={() => handleRemoveFromCart(idx)}
                              className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtotals & Sell Button */}
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 font-mono">
                  <div className="flex justify-between text-xs text-slate-500 font-sans">
                    <span>আজকের বিক্রির তারিখ</span>
                    <span className="font-bold">{saleDate}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
                    <span className="text-xs font-bold font-sans">সর্বমোট মূল্য (Grand Total)</span>
                    <strong className="text-xl font-black text-indigo-600 dark:text-indigo-400">৳{toBnNum(cartGrandTotal.toFixed(2))}</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 font-sans">
                    <button
                      onClick={handleResetSaleForm}
                      className="py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600"
                    >
                      রিসেট (Reset)
                    </button>
                    <button
                      onClick={handleSaveSaleSubmit}
                      disabled={saleCart.length === 0}
                      className="py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow"
                    >
                      বিক্রি নিশ্চিত করুন
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* --- CREDIT LEDGER VIEW --- */}
        {view === 'credit_ledger' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            
            {/* Left lists (2 cols on desktop) */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <button
                  onClick={() => { setView('dashboard'); setSelectedCustomerDetails(null); }}
                  className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  <ChevronLeft size={16} /> ড্যাশবোর্ডে ফিরুন
                </button>
                <h3 className="text-base font-black text-slate-950 dark:text-white">বকেয়া খাতা (Credit Ledger)</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {customers.some(c => c.due > 0) && (
                    <button
                      onClick={() => {
                        const dueCustomers = customers.filter(c => c.due > 0);
                        setSelectedBulkCustomerIds(dueCustomers.map(c => c.id));
                        setCurrentBulkIndex(0);
                        setShowBulkReminderModal(true);
                        playSound(1000, 0.08);
                      }}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                    >
                      <MessageCircle size={14} className="animate-bounce" /> সবাইকে নোটিশ পাঠান
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddCustomerModal(true)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer transition-all"
                  >
                    <UserPlus size={14} /> নতুন কাস্টমার
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  placeholder="কাস্টমারের নাম বা ফোন লিখে খুঁজুন..."
                  value={custSearch}
                  onChange={e => setCustSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs"
                />
              </div>

              {/* Total Credit Summary Card */}
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/40 rounded-2xl flex justify-between items-center text-rose-800 dark:text-rose-400 font-mono">
                <span className="text-xs font-bold font-sans">সর্বমোট বকেয়া পাওনা (Total Due Receivable)</span>
                <strong className="text-lg font-black">৳{toBnNum(customers.reduce((acc, curr) => acc + curr.due, 0).toLocaleString('en-US'))}</strong>
              </div>

              {/* Customer Due List */}
              <div className="space-y-2 overflow-y-auto max-h-[350px]">
                {customers
                  .filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()) || (c.phone && c.phone.includes(custSearch)))
                  .map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => { setSelectedCustomerDetails(c); playSound(950, 0.05); }}
                      className={`p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all border ${selectedCustomerDetails?.id === c.id ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-900' : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 border-slate-100 dark:border-slate-800'}`}
                    >
                      {/* Left Info */}
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <strong className="text-sm font-bold text-slate-900 dark:text-slate-100">{c.name}</strong>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditCustomerName(c); }}
                              className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors cursor-pointer"
                              title="নাম সংশোধন করুন"
                            >
                              <Edit size={13} />
                            </button>
                          </div>
                          {c.phone && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{c.phone}</p>}
                        </div>
                      </div>

                      {/* Right Info & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800/60">
                        <div className="text-left sm:text-right font-mono shrink-0">
                          <span className="text-[9px] text-slate-400 font-sans block">বাকি পাওনা</span>
                          <strong className="text-sm font-black text-rose-600 dark:text-rose-400">৳{toBnNum(c.due)}</strong>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedCustomerDetails(c); playSound(950, 0.05); }}
                            className="px-3 py-1.5 bg-indigo-100/60 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-sans font-bold text-xs rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-950/80 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Eye size={12} /> ডিটেইলস
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(c.id); }}
                            className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
                            title="কাস্টমার ডিলিট করুন"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Right details sidebar (1 col on desktop) */}
            <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              {selectedCustomerDetails ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{selectedCustomerDetails.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">কাস্টমার ফাইল ও লেনদেন খাতা</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCustomer(selectedCustomerDetails.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="কাস্টমার ডিলিট করুন"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 font-mono text-center">
                    <span className="text-[11px] text-slate-400 font-sans">মোট বকেয়া ব্যালেন্স</span>
                    <strong className="block text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">৳{toBnNum(selectedCustomerDetails.due)}</strong>
                  </div>

                  {/* Free Due Payment Alerts (ফ্রি নোটিশ সেবা) */}
                  {selectedCustomerDetails.due > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl space-y-3 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-600 dark:text-amber-400">
                          <MessageCircle size={16} className="animate-pulse" />
                        </span>
                        <strong className="text-xs font-black text-amber-900 dark:text-amber-200">ফ্রি বকেয়া নোটিশ ও এলার্ট</strong>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                        কাস্টমারকে সম্পূর্ণ ফ্রিতে এসএমএস, হোয়াটসঅ্যাপ বা ইমেলের মাধ্যমে বকেয়া পরিশোধের নোটিশ পাঠান।
                      </p>

                      <div className="space-y-2">
                        <div className="flex gap-1.5">
                          <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
                              <Phone size={11} />
                            </span>
                            <input
                              type="text"
                              placeholder="মোবাইল বা ইমেল লিখুন..."
                              value={tempReminderPhone}
                              onChange={e => setTempReminderPhone(e.target.value)}
                              className="w-full pl-7 pr-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUpdateCustomerPhone(selectedCustomerDetails.id, tempReminderPhone)}
                            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                            title="নাম্বার সংরক্ষণ করুন"
                          >
                            <Check size={12} /> সংরক্ষণ
                          </button>
                        </div>

                        {/* Quick messaging grid links/buttons (2x2 grid for 4 buttons now) */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <a
                            href={`https://api.whatsapp.com/send?phone=${
                              (tempReminderPhone.replace(/\D/g, '').startsWith('0') ? '88' : '') + tempReminderPhone.replace(/\D/g, '')
                            }&text=${encodeURIComponent(
                              `প্রিয় ${selectedCustomerDetails.name},\nনাজমুল জেনারেল স্টোর এ আপনার বকেয়া বাকির পরিমাণ হচ্ছে ৳${toBnNum(selectedCustomerDetails.due)} টাকা।\nবকেয়া টাকাটি দ্রুত পরিশোধ করার জন্য অনুরোধ করা হলো।\n\nধন্যবাদ!\nনাজমুল জেনারেল স্টোর\nসাবানা রোড, বনবাড়িয়া\nসিরাজগঞ্জ সদর, সিরাজগঞ্জ`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => playSound(1100, 0.1)}
                            className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm text-center"
                          >
                            <MessageCircle size={12} /> হোয়াটসঅ্যাপ
                          </a>
                          <a
                            href={`sms:${tempReminderPhone}?body=${encodeURIComponent(
                              `Prio ${selectedCustomerDetails.name}, Nazmul General Store e apnar baki paona holo ${selectedCustomerDetails.due} taka. Baki taka porishodh korar anurodh roilo. Dhonnobad! Nazmul General Store.`
                            )}`}
                            onClick={() => playSound(1100, 0.1)}
                            className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm text-center"
                          >
                            <Send size={12} /> এসএমএস
                          </a>
                          <a
                            href={`mailto:${tempReminderPhone.includes('@') ? tempReminderPhone : ''}?subject=${encodeURIComponent(
                              'বকেয়া বাকির বিবরণী - নাজমুল জেনারেল স্টোর'
                            )}&body=${encodeURIComponent(
                              `প্রিয় ${selectedCustomerDetails.name},\nনাজমুল জেনারেল স্টোর এ আপনার বকেয়া বাকির পরিমাণ হচ্ছে ৳${toBnNum(selectedCustomerDetails.due)} টাকা।\nবকেয়া টাকাটি দ্রুত পরিশোধ করার জন্য অনুরোধ করা হলো।\n\nধন্যবাদ!\nনাজমুল জেনারেল স্টোর\nসাবানা রোড, বনবাড়িয়া\nসিরাজগঞ্জ সদর, সিরাজগঞ্জ`
                            )}`}
                            onClick={() => playSound(1100, 0.1)}
                            className="py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm text-center"
                          >
                            <Mail size={12} /> ইমেল নোটিশ
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              const message = `প্রিয় ${selectedCustomerDetails.name},\nনাজমুল জেনারেল স্টোর এ আপনার বকেয়া বাকির পরিমাণ হচ্ছে ৳${toBnNum(selectedCustomerDetails.due)} টাকা।\nবকেয়া টাকাটি দ্রুত পরিশোধ করার জন্য অনুরোধ করা হলো।\n\nধন্যবাদ!\nনাজমুল জেনারেল স্টোর\nসাবানা রোড, বনবাড়িয়া\nসিরাজগঞ্জ সদর, সিরাজগঞ্জ`;
                              navigator.clipboard.writeText(message);
                              alert("বকেয়া সতর্কবার্তা মেসেজ কপি সম্পন্ন হয়েছে!");
                              playSound(1300, 0.1);
                            }}
                            className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-slate-200 dark:border-slate-700"
                          >
                            <Copy size={11} /> কপি মেসেজ
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Receive / Give Credit Form */}
                  <form onSubmit={handleReceiveDuePayment} className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/40 p-4 rounded-2xl space-y-3">
                    <span className="block text-[11px] uppercase text-indigo-600 dark:text-indigo-400 font-bold tracking-wider">টাকা লেনদেন হিসাব (Add Transaction)</span>
                    
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">১. জমা পরিমাণ (Amount Received) - BDT</label>
                        <input
                          type="number"
                          placeholder="যেমন: ৫০"
                          value={paymentReceivedAmount}
                          onChange={e => setPaymentReceivedAmount(e.target.value)}
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-xs border border-slate-200 dark:border-slate-800 text-center font-bold font-mono text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">২. বাকি পরিমাণ (Amount Credited) - BDT</label>
                        <input
                          type="number"
                          placeholder="যেমন: ৩০"
                          value={paymentReceivedCreditedAmount}
                          onChange={e => setPaymentReceivedCreditedAmount(e.target.value)}
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-xs border border-slate-200 dark:border-slate-800 text-center font-bold font-mono text-rose-600 dark:text-rose-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">৩. মন্তব্য / নোট (Note)</label>
                        <input
                          type="text"
                          placeholder="যেমন: সাবান ও চিপস বাকি"
                          value={paymentReceivedNote}
                          onChange={e => setPaymentReceivedNote(e.target.value)}
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-xs border border-slate-200 dark:border-slate-800"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer mt-1"
                    >
                      সংরক্ষণ করুন (Save)
                    </button>
                  </form>

                  {/* Transaction History */}
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold mb-2 uppercase">বকেয়া লেনদেনের ইতিহাস</span>
                    <div className="space-y-2 overflow-y-auto max-h-[180px]">
                      {selectedCustomerDetails.transactions.map((t, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-xl text-xs flex justify-between items-center font-mono">
                          <div>
                            <span className={`text-[9px] font-sans px-1.5 py-0.5 rounded-full font-bold ${t.type === 'sale_due' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'}`}>
                              {t.type === 'sale_due' ? 'বকেয়া ক্রয়' : 'জমা রশিদ'}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1 font-sans">{t.note}</p>
                            <span className="text-[9px] text-slate-400 block mt-0.5">{t.date}</span>
                          </div>
                          <strong className={t.type === 'sale_due' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                            {t.type === 'sale_due' ? '+' : '-'}৳{toBnNum(t.amount)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-20 text-slate-400 text-xs">
                  বামে কোনো কাস্টমারের উপর ক্লিক করলে তাঁর বিস্তারিত হিসাব এখানে দেখতে পাবেন।
                </div>
              )}
            </div>

          </div>
        )}

        {/* --- DAILY LEDGER (হিসাব খাতা) VIEW --- */}
        {view === 'daily_ledger' && (
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <button
                onClick={() => setView('dashboard')}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <ChevronLeft size={16} /> ড্যাশবোর্ডে ফিরুন
              </button>
              <h3 className="text-base font-black text-slate-950 dark:text-white">হিসাব খাতা (Daily Ledger)</h3>
              
              {/* Date selection search */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={ledgerDateFilter}
                  onChange={e => setLedgerDateFilter(e.target.value)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-bold"
                />
                <button
                  onClick={() => setLedgerDateFilter(getTodayDateString())}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold rounded-lg"
                >
                  আজ (Today)
                </button>
              </div>
            </div>

            {/* Close Day indicator */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <Calendar size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold">তারিখ: <span className="font-mono">{toBnNum(ledgerDateFilter)}</span></span>
                <span className={`px-2 py-0.5 rounded font-black ${activeLedger.closeCash !== null ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                  {activeLedger.closeCash !== null ? 'ক্লোজড হিসাব (Closed)' : 'চলমান হিসাব (Open)'}
                </span>
              </div>
              <button
                onClick={handleCloseDayToggle}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow transition-all ${activeLedger.closeCash !== null ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {activeLedger.closeCash !== null ? '🔓 হিসাব পুনঃচালু করুন (Reopen)' : '🔒 ক্লোজ ডে (Close Day)'}
              </button>
            </div>

            {/* Metrics for Ledger date */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center font-mono">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-950/40 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-sans block mb-1 font-bold">মোট মুদি বিক্রয় (Sales)</span>
                <strong className="text-base font-black text-blue-900 dark:text-blue-300">৳{toBnNum(sales.filter(s => s.date === ledgerDateFilter).reduce((acc, curr) => acc + curr.grandTotal, 0))}</strong>
                <span className="text-[9px] text-slate-400 font-sans block mt-1">নগদ: ৳{toBnNum(sales.filter(s => s.date === ledgerDateFilter && s.paymentMethod !== 'Due').reduce((acc, curr) => acc + curr.grandTotal, 0))} | বাকি: ৳{toBnNum(sales.filter(s => s.date === ledgerDateFilter && s.paymentMethod === 'Due').reduce((acc, curr) => acc + curr.grandTotal, 0))}</span>
              </div>
              <div className="p-4 bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/40 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-sans block mb-1 font-bold">মোট ক্রয় / ক্যাশ মাইনাস</span>
                <strong className="text-base font-black text-rose-900 dark:text-rose-300">৳{toBnNum(activeLedger.purchases.reduce((acc, curr) => acc + curr.purchaseAmount, 0))}</strong>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/40 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-sans block mb-1 font-bold">বকেয়া আদায় (Credit Received)</span>
                <strong className="text-base font-black text-emerald-900 dark:text-emerald-300">
                  ৳{toBnNum(customers.reduce((acc, c) => acc + c.transactions.filter(t => t.type === 'payment_received' && t.date === ledgerDateFilter).reduce((sum, t) => sum + t.amount, 0), 0))}
                </strong>
              </div>
              <div className="p-4 bg-violet-50 dark:bg-violet-950/10 border border-violet-100 dark:border-violet-950/40 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-sans block mb-1 font-bold">নেট ডে ক্যাশ (Net Cash)</span>
                <strong className="text-base font-black text-violet-900 dark:text-violet-300">
                  ৳{toBnNum((
                    sales.filter(s => s.date === ledgerDateFilter && s.paymentMethod !== 'Due').reduce((acc, curr) => acc + curr.grandTotal, 0) +
                    customers.reduce((acc, c) => acc + c.transactions.filter(t => t.type === 'payment_received' && t.date === ledgerDateFilter).reduce((sum, t) => sum + t.amount, 0), 0) +
                    (activeLedger.manualCash || 0) -
                    activeLedger.purchases.reduce((acc, curr) => acc + curr.purchaseAmount, 0)
                  ).toFixed(2))}
                </strong>
                {activeLedger.manualCash ? (
                  <span className="text-[9px] text-violet-500 font-sans block mt-1">ড্রয়ার ক্যাশ এড: ৳{toBnNum(activeLedger.manualCash)}</span>
                ) : null}
              </div>
            </div>

            {/* Manual Drawer Cash Addition Form */}
            {activeLedger.closeCash === null && (
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-xs space-y-1 w-full sm:w-auto">
                  <strong className="block text-slate-700 dark:text-slate-300">ড্রয়ার ক্যাশ ম্যানুয়াল এড (Drawer Cash/Net Cash):</strong>
                  <p className="text-[10px] text-slate-400">ড্রয়ার ক্যাশের এই টাকা আজকের নেট ডে ক্যাশ (Net Cash) হিসাবের সাথে যোগ হবে।</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                  <input
                    type="number"
                    placeholder="টাকার পরিমাণ (যেমন: ৫০০)"
                    value={manualCashInput}
                    onChange={e => setManualCashInput(e.target.value)}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#1e293b] text-xs border border-slate-200 dark:border-slate-800 text-center font-bold w-full sm:w-36 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSaveManualCash}
                    className="px-4 py-2 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow"
                  >
                    সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            )}

            {/* Add Purchase (Cash Minus) form */}
            {activeLedger.closeCash === null && (
              <form onSubmit={handleAddPurchaseCost} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                <span className="block text-xs font-bold text-indigo-600 dark:text-indigo-400">নতুন ক্রয় খরচ যোগ করুন (Purchase Expense / Cash-minus)</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="relative">
                    <label className="block text-[10px] text-slate-500 font-bold mb-0.5">পণ্য / খরচের বিবরণ (Name)</label>
                    <input
                      type="text"
                      placeholder="যেমন: বোম্বে চিপস"
                      required
                      value={purchaseProdName}
                      onChange={e => {
                        setPurchaseProdName(e.target.value);
                        setShowPurchaseSuggestions(true);
                      }}
                      onFocus={() => setShowPurchaseSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowPurchaseSuggestions(false), 250)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-[#1e293b] text-xs border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                    {showPurchaseSuggestions && purchaseProdName.trim() && products.filter(p => p.name.toLowerCase().includes(purchaseProdName.toLowerCase())).length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {products
                          .filter(p => p.name.toLowerCase().includes(purchaseProdName.toLowerCase()))
                          .map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onMouseDown={() => handleSelectPurchaseSuggestion(p)}
                              className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-[11px] flex justify-between items-center cursor-pointer"
                            >
                              <span className="font-bold text-slate-800 dark:text-slate-100">{p.name}</span>
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">স্টক: {toBnNum(p.stock)} টি</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-0.5">পরিমাণ (Qty)</label>
                    <input
                      type="number"
                      min="1"
                      value={purchaseQty}
                      onChange={e => setPurchaseQty(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-[#1e293b] text-xs border border-slate-200 dark:border-slate-800 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-0.5">ক্রয় মূল্য (Total Cost)</label>
                    <input
                      type="number"
                      placeholder="মোট ক্রয় খরচ"
                      required
                      value={purchaseCost}
                      onChange={e => setPurchaseCost(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-[#1e293b] text-xs border border-slate-200 dark:border-slate-800 text-center font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-0.5">বিক্রয় মূল্য (optional)</label>
                    <input
                      type="number"
                      placeholder="প্রতি পিস বিক্রয় মূল্য"
                      value={purchaseSellPrice}
                      onChange={e => setPurchaseSellPrice(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-[#1e293b] text-xs border border-slate-200 dark:border-slate-800 text-center font-bold font-mono"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> ক্রয় রেকর্ড করুন (Purchase - Cash minus)
                </button>
              </form>
            )}

            {/* Purchases records list */}
            <div>
              <span className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-3">ক্রয় ও ক্যাশ মাইনাস হিসাবসমূহ</span>
              {activeLedger.purchases.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  এই তারিখে কোনো ক্রয় বা খরচ রেকর্ড করা হয়নি।
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-[180px]">
                  {activeLedger.purchases.map(p => (
                    <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl text-xs flex justify-between items-center font-mono">
                      <div>
                        <strong className="text-slate-900 dark:text-slate-100 font-sans">{p.productName}</strong>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
                          পরিমাণ: {toBnNum(p.qty)} পিস
                          {p.sellPrice && ` | নতুন বিক্রয় মূল্য: ৳${toBnNum(p.sellPrice)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <strong className="text-rose-600 dark:text-rose-400">৳{toBnNum(p.purchaseAmount)}</strong>
                        {activeLedger.closeCash === null && (
                          <button
                            onClick={() => handleRemovePurchase(p.id)}
                            className="p-1 text-rose-600 hover:bg-rose-100 rounded"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* --- REPORTS VIEW --- */}
        {view === 'reports' && (
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <button
                onClick={() => setView('dashboard')}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <ChevronLeft size={16} /> ড্যাশবোর্ডে ফিরুন
              </button>
              <h3 className="text-base font-black text-slate-950 dark:text-white">বিক্রয় রিপোর্ট ও পরিসংখ্যান</h3>
              
              {/* Filter */}
              <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                {['daily', 'weekly', 'monthly', 'all'].map(p => (
                  <button
                    key={p}
                    onClick={() => { setReportPeriod(p as any); playSound(900, 0.05); }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${reportPeriod === p ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-800 dark:text-slate-400'}`}
                  >
                    {p === 'daily' ? 'আজ' : p === 'weekly' ? 'সপ্তাহ' : p === 'monthly' ? 'মাস' : 'সব'}
                  </button>
                ))}
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-center">
              <div className="p-5 bg-blue-50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-950/40 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-sans block mb-1">মোট বিক্রয় (Total Revenue)</span>
                <strong className="text-xl font-black text-blue-900 dark:text-blue-300">৳{toBnNum(reportTotalRevenue.toFixed(2))}</strong>
              </div>
              <div className="p-5 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/40 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-sans block mb-1">মোট নিট লাভ (Total Net Profit)</span>
                <strong className="text-xl font-black text-emerald-900 dark:text-emerald-300">৳{toBnNum(reportTotalProfit.toFixed(2))}</strong>
              </div>
              <div className="p-5 bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/40 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-sans block mb-1">বকেয়া বিক্রয় (Due Sales)</span>
                <strong className="text-xl font-black text-rose-900 dark:text-rose-300">৳{toBnNum(reportTotalDueSales.toFixed(2))}</strong>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setReportTab('products'); playSound(900, 0.05); }}
                className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-all cursor-pointer ${reportTab === 'products' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              >
                পণ্যভিত্তিক বিক্রয় বিশ্লেষণ
              </button>
              <button
                type="button"
                onClick={() => { setReportTab('transactions'); playSound(900, 0.05); }}
                className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-all cursor-pointer ${reportTab === 'transactions' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              >
                লেনদেন রেকর্ড সমূহ (সার্চ ও মেমো ডাউনলোড)
              </button>
            </div>

            {/* Product wise breakdown list */}
            {reportTab === 'products' && (
              <div>
                <span className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">পণ্যভিত্তিক বিক্রয় বিশ্লেষণ</span>
                {reportSales.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    নির্বাচিত সময়কালে কোনো বিক্রয় ডেটা নেই।
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Collect and sum product quantities and total sells */}
                    {Array.from(
                      reportSales.reduce((map, sale) => {
                        sale.items.forEach(it => {
                          const existing = map.get(it.productId) || { name: it.name, qty: 0, revenue: 0, profit: 0 };
                          existing.qty += it.quantity;
                          existing.revenue += it.sellPrice * it.quantity;
                          existing.profit += (it.sellPrice - it.buyPrice) * it.quantity;
                          map.set(it.productId, existing);
                        });
                        return map;
                      }, new Map<string, { name: string; qty: number; revenue: number; profit: number }>())
                    ).map(([prodId, details], idx) => (
                      <div key={prodId} className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl flex justify-between items-center text-xs font-mono">
                        <div>
                          <strong className="text-slate-900 dark:text-slate-100 font-sans">{idx + 1}. {details.name}</strong>
                          <p className="text-[10px] text-slate-400 font-sans mt-0.5">মোট বিক্রি: {toBnNum(details.qty)}টি পিস</p>
                        </div>
                        <div className="text-right">
                          <strong className="text-slate-900 dark:text-slate-100 block">৳{toBnNum(details.revenue.toFixed(2))}</strong>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">লাভ: ৳{toBnNum(details.profit.toFixed(2))}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Transactions tab with search & filters */}
            {reportTab === 'transactions' && (
              <div className="space-y-4">
                {/* Search Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="relative">
                    <label className="block text-[10px] text-slate-500 font-bold mb-1 flex items-center gap-1">
                      <Search size={10} /> কাস্টমারের নাম দিয়ে খুঁজুন
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: সেতু ভাই বা অজ্ঞাত"
                      value={reportSearchCustomer}
                      onChange={e => setReportSearchCustomer(e.target.value)}
                      className="w-full p-2.5 pl-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-bold"
                    />
                    <Search size={12} className="absolute left-3 top-[32px] text-slate-400" />
                    {reportSearchCustomer && (
                      <button
                        type="button"
                        onClick={() => setReportSearchCustomer('')}
                        className="absolute right-3 top-[26px] py-1.5 px-2 text-xs text-slate-400 hover:text-slate-600 font-black cursor-pointer"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-[10px] text-slate-500 font-bold mb-1 flex items-center gap-1">
                      <Calendar size={10} /> নির্দিষ্ট তারিখ দিয়ে খুঁজুন
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="date"
                        value={reportSearchDate}
                        onChange={e => setReportSearchDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-bold font-mono"
                      />
                      {reportSearchDate && (
                        <button
                          type="button"
                          onClick={() => setReportSearchDate('')}
                          className="px-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-xl border border-rose-100 dark:border-rose-900/40 hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          মুছুন
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sales record list with custom search filters applied */}
                <div className="space-y-3">
                  {sales.filter(s => {
                    // Apply period filter first
                    const now = Date.now();
                    const diffDays = (now - s.timestamp) / (1000 * 60 * 60 * 24);
                    let inPeriod = true;
                    if (reportPeriod === 'daily') inPeriod = diffDays <= 1;
                    else if (reportPeriod === 'weekly') inPeriod = diffDays <= 7;
                    else if (reportPeriod === 'monthly') inPeriod = diffDays <= 30;

                    // Apply search filter
                    const customerNameLower = s.customerName.toLowerCase();
                    const searchQueryLower = reportSearchCustomer.toLowerCase();
                    const matchesCustomer = customerNameLower.includes(searchQueryLower);
                    
                    const matchesDate = !reportSearchDate || s.date === reportSearchDate;

                    return inPeriod && matchesCustomer && matchesDate;
                  }).length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      কোনো লেনদেন রেকর্ড পাওয়া যায়নি। কাস্টমারের নাম বা তারিখ পরিবর্তন করে পুনরায় চেষ্টা করুন।
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                      {sales
                        .filter(s => {
                          const now = Date.now();
                          const diffDays = (now - s.timestamp) / (1000 * 60 * 60 * 24);
                          let inPeriod = true;
                          if (reportPeriod === 'daily') inPeriod = diffDays <= 1;
                          else if (reportPeriod === 'weekly') inPeriod = diffDays <= 7;
                          else if (reportPeriod === 'monthly') inPeriod = diffDays <= 30;

                          const customerNameLower = s.customerName.toLowerCase();
                          const searchQueryLower = reportSearchCustomer.toLowerCase();
                          const matchesCustomer = customerNameLower.includes(searchQueryLower);
                          
                          const matchesDate = !reportSearchDate || s.date === reportSearchDate;

                          return inPeriod && matchesCustomer && matchesDate;
                        })
                        .map(s => (
                          <div key={s.id} className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3 hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                            {/* Header row */}
                            <div className="flex justify-between items-start gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                                    {s.customerName === 'Unknown' ? 'অজ্ঞাত (Unknown)' : s.customerName}
                                  </span>
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${s.paymentMethod === 'Cash' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : s.paymentMethod === 'Due' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'}`}>
                                    {s.paymentMethod === 'Cash' ? 'নগদ' : s.paymentMethod === 'Due' ? 'বাকি' : 'মোবাইল ব্যাংকিং'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono block mt-1">
                                  তারিখ: {toBnNum(s.date)} | আইডি: {s.id}
                                </span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[9px] text-slate-400 block font-sans">সর্বমোট বিল</span>
                                <strong className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">৳{toBnNum(s.grandTotal.toFixed(2))}</strong>
                              </div>
                            </div>

                            {/* Cart items list */}
                            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 bg-white dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-150 dark:border-slate-800/80">
                              {s.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between font-mono">
                                  <span className="font-sans text-slate-700 dark:text-slate-200 font-semibold">{idx + 1}. {item.name}</span>
                                  <span className="text-slate-500 dark:text-slate-400">{toBnNum(item.quantity)} পিস × ৳{toBnNum(item.sellPrice)} = ৳{toBnNum(item.sellPrice * item.quantity)}</span>
                                </div>
                              ))}
                            </div>

                            {/* Actions & stats footer */}
                            <div className="flex justify-between items-center text-[10px] pt-1">
                              <span className="text-slate-400 font-mono">
                                লাভ: <span className="text-emerald-600 dark:text-emerald-400 font-bold">৳{toBnNum(s.profit.toFixed(2))}</span>
                              </span>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => { playSound(950, 0.05); setActiveMemoSale(s); }}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer text-[10px]"
                                >
                                  <Eye size={10} /> মেমো দেখুন
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { playSound(1100, 0.05); downloadSaleMemoFile(s); }}
                                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer text-[10px]"
                                >
                                  <Download size={10} /> মেমো ডাউনলোড
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* --- ADD / EDIT PRODUCT MODAL --- */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
              {editingProduct ? 'পণ্য সংশোধন করুন' : 'নতুন পণ্য যোগ করুন'}
            </h4>

            <form onSubmit={handleAddOrEditProductSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">পণ্যের নাম (Product Name)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: জিরাস চিপস (ছোট)"
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">ক্রয় মূল্য (Buy Price)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="৳"
                    value={prodBuyPrice}
                    onChange={e => setProdBuyPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-center font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">বিক্রয় মূল্য (Sell Price)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="৳"
                    value={prodSellPrice}
                    onChange={e => setProdSellPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-center font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">স্টক পরিমাণ (Stock Qty)</label>
                <input
                  type="number"
                  required
                  placeholder="যেমন: ৩০"
                  value={prodStock}
                  onChange={e => setProdStock(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-center font-bold font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-500"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  {editingProduct ? 'পরিবর্তন করুন' : 'নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD CUSTOMER MODAL --- */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">বকেয়া খাতায় নতুন কাস্টমার যোগ করুন</h4>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">কাস্টমারের নাম (Customer Name)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সেতু ভাই (ফার্নিচার)"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">মোবাইল নাম্বার (Optional)</label>
                <input
                  type="text"
                  placeholder="যেমন: 01712..."
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">পূর্বের বকেয়া পাওনা (Initial Due)</label>
                <input
                  type="number"
                  placeholder="যেমন: ১০০০"
                  value={newCustInitialDue}
                  onChange={e => setNewCustInitialDue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-center font-bold font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-500"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- BULK REMINDER / NOTICE MODAL --- */}
      {showBulkReminderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} className="text-amber-500 animate-pulse" />
                <div>
                  <h4 className="font-black text-sm tracking-tight text-slate-900 dark:text-white">বকেয়া নোটিশ ও এলার্ট সহকারী (Bulk Notice)</h4>
                  <p className="text-[10px] text-slate-400 font-medium">নাজমুল জেনারেল স্টোর • সিরাজগঞ্জ</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowBulkReminderModal(false); playSound(650, 0.08); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            {/* Campaign Selection Summary & Bulk Copy Option */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Panel: Customer Select & Multi-check */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase block">১. প্রাপক তালিকা (কাস্টমার সিলেক্ট করুন)</span>
                
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {customers.filter(c => c.due > 0).map(c => {
                    const isChecked = selectedBulkCustomerIds.includes(c.id);
                    return (
                      <label 
                        key={c.id} 
                        className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition-all ${
                          isChecked 
                            ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-900/40 font-extrabold' 
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => {
                              playSound(1000, 0.05);
                              if (isChecked) {
                                setSelectedBulkCustomerIds(selectedBulkCustomerIds.filter(id => id !== c.id));
                              } else {
                                setSelectedBulkCustomerIds([...selectedBulkCustomerIds, c.id]);
                              }
                            }}
                            className="rounded text-amber-500 focus:ring-amber-500"
                          />
                          <span className="truncate max-w-[120px]">{c.name}</span>
                        </div>
                        <span className="font-mono text-[11px] text-rose-600 dark:text-rose-400">৳{toBnNum(c.due)}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setSelectedBulkCustomerIds(customers.filter(c => c.due > 0).map(c => c.id));
                      playSound(800, 0.06);
                    }}
                    className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    সব সিলেক্ট
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBulkCustomerIds([]);
                      playSound(500, 0.06);
                    }}
                    className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    সব বাদ দিন
                  </button>
                </div>
              </div>

              {/* Right Panel: Active Campaign Wizard */}
              <div className="bg-amber-50/40 dark:bg-amber-950/10 p-3 rounded-2xl border border-amber-100 dark:border-amber-950/30 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase block mb-2">২. নোটিশ কিউ (Notice Queue)</span>
                  
                  {selectedBulkCustomerIds.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 font-medium">
                      কোন কাস্টমার নির্বাচিত হয়নি। বাম পাশের তালিকা থেকে কাস্টমার সিলেক্ট করুন।
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Active queue counter */}
                      <div className="flex justify-between items-center text-[11px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 px-2.5 py-1.5 rounded-xl">
                        <span>নির্বাচিত: {toBnNum(selectedBulkCustomerIds.length)} জন</span>
                        <span className="font-mono">অবস্থান: {toBnNum(currentBulkIndex + 1)} / {toBnNum(selectedBulkCustomerIds.length)}</span>
                      </div>

                      {customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex]) && (
                        <div className="space-y-2">
                          <div>
                            <span className="text-[9px] text-slate-400 block font-medium">চলতি প্রাপক:</span>
                            <strong className="text-sm font-black text-slate-900 dark:text-white block">
                              {customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex])?.name}
                            </strong>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">বকেয়া পরিমাণ:</span>
                            <strong className="font-mono font-black text-rose-600 dark:text-rose-400">
                              ৳{toBnNum(customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex])?.due || 0)}
                            </strong>
                          </div>

                          <div>
                            <label className="text-[9px] text-slate-400 block font-semibold mb-1">মোবাইল / ইমেল সংশোধন:</label>
                            <input 
                              type="text"
                              value={customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex])?.phone || ''}
                              placeholder="মোবাইল বা ইমেল..."
                              onChange={(e) => {
                                const val = e.target.value;
                                const activeId = selectedBulkCustomerIds[currentBulkIndex];
                                const updated = customers.map(c => c.id === activeId ? { ...c, phone: val } : c);
                                saveCustomers(updated);
                              }}
                              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selectedBulkCustomerIds.length > 0 && (
                  <div className="flex justify-between gap-2 pt-3 border-t border-amber-200/50 dark:border-amber-900/20 mt-3">
                    <button
                      disabled={currentBulkIndex === 0}
                      onClick={() => {
                        setCurrentBulkIndex(prev => Math.max(0, prev - 1));
                        playSound(800, 0.05);
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 disabled:opacity-50 cursor-pointer text-slate-700 dark:text-slate-300"
                    >
                      পূর্ববর্তী
                    </button>
                    <button
                      disabled={currentBulkIndex >= selectedBulkCustomerIds.length - 1}
                      onClick={() => {
                        setCurrentBulkIndex(prev => Math.min(selectedBulkCustomerIds.length - 1, prev + 1));
                        playSound(900, 0.05);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      পরবর্তী ➔
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Campaign Message Preview & Actions */}
            {selectedBulkCustomerIds.length > 0 && customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex]) && (
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase block">৩. নোটিশ মেসেজ প্রিভিউ (Message Preview)</span>
                
                <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-900 text-[11px] font-medium leading-relaxed font-sans whitespace-pre-wrap text-slate-700 dark:text-slate-300 select-all border-l-4 border-l-amber-500 text-left">
                  {`প্রিয় ${customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex])?.name}, \nনাজমুল জেনারেল স্টোর এ আপনার বকেয়া বাকির পরিমাণ হচ্ছে ৳${toBnNum(customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex])?.due || 0)} টাকা। \nবকেয়া টাকাটি দ্রুত পরিশোধ করার জন্য অনুরোধ করা হলো। \nধন্যবাদ!\n\nনাজমুল জেনারেল স্টোর \nসাবানা রোড,  বনবাড়িয়া\nসিরাজগঞ্জ সদর, সিরাজগঞ্জ`}
                </div>

                {/* Sender action bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <a
                    href={`https://api.whatsapp.com/send?phone=${
                      (((customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex])?.phone || '').replace(/\D/g, '').startsWith('0') ? '88' : '') + (customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex])?.phone || '').replace(/\D/g, ''))
                    }&text=${encodeURIComponent(
                      `প্রিয় ${customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex])?.name},\nনাজমুল জেনারেল স্টোর এ আপনার বকেয়া বাকির পরিমাণ হচ্ছে ৳${toBnNum(customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex])?.due || 0)} টাকা।\nবকেয়া টাকাটি দ্রুত পরিশোধ করার জন্য অনুরোধ করা হলো।\n\nধন্যবাদ!\nনাজমুল জেনারেল স্টোর\nসাবানা রোড, বনবাড়িয়া\nসিরাজগঞ্জ সদর, সিরাজগঞ্জ`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playSound(1100, 0.1)}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm text-center"
                  >
                    <MessageCircle size={12} /> হোয়াটসঅ্যাপ
                  </a>
                  <a
                    href={`sms:${customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex])?.phone || ''}?body=${encodeURIComponent(
                      `Prio ${customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex])?.name}, Nazmul General Store e apnar baki paona holo ${customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex])?.due || 0} taka. Baki taka porishodh korar anurodh roilo. Dhonnobad! Nazmul General Store.`
                    )}`}
                    onClick={() => playSound(1100, 0.1)}
                    className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm text-center"
                  >
                    <Send size={12} /> এসএমএস
                  </a>
                  <a
                    href={`mailto:${(customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex])?.phone || '').includes('@') ? (customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex])?.phone || '') : ''}?subject=${encodeURIComponent(
                      'বকেয়া বাকির বিবরণী - নাজমুল জেনারেল স্টোর'
                    )}&body=${encodeURIComponent(
                      `প্রিয় ${customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex])?.name},\nনাজমুল জেনারেল স্টোর এ আপনার বকেয়া বাকির পরিমাণ হচ্ছে ৳${toBnNum(customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex])?.due || 0)} টাকা।\nবকেয়া টাকাটি দ্রুত পরিশোধ করার জন্য অনুরোধ করা হলো।\n\nধন্যবাদ!\nনাজমুল জেনারেল স্টোর\nসাবানা রোড, বনবাড়িয়া\nসিরাজগঞ্জ সদর, সিরাজগঞ্জ`
                    )}`}
                    onClick={() => playSound(1100, 0.1)}
                    className="py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm text-center"
                  >
                    <Mail size={12} /> ইমেল নোটিশ
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const activeCust = customers.find(c => c.id === selectedBulkCustomerIds[currentBulkIndex]);
                      if (activeCust) {
                        const message = `প্রিয় ${activeCust.name},\nনাজমুল জেনারেল স্টোর এ আপনার বকেয়া বাকির পরিমাণ হচ্ছে ৳${toBnNum(activeCust.due)} টাকা।\nবকেয়া টাকাটি দ্রুত পরিশোধ করার জন্য অনুরোধ করা হলো।\n\nধন্যবাদ!\nনাজমুল জেনারেল স্টোর\nসাবানা রোড, বনবাড়িয়া\nসিরাজগঞ্জ সদর, সিরাজগঞ্জ`;
                        navigator.clipboard.writeText(message);
                        alert(`${activeCust.name}-এর বকেয়া নোটিশ মেসেজ কপি সম্পন্ন হয়েছে!`);
                        playSound(1300, 0.1);
                      }
                    }}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    <Copy size={11} /> কপি মেসেজ
                  </button>
                </div>
              </div>
            )}

            {/* Combined Group report generator */}
            {selectedBulkCustomerIds.length > 0 && (
              <div className="pt-2 flex flex-col sm:flex-row justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    const lines = [
                      `নাজমুল জেনারেল স্টোর - সর্বমোট বকেয়া বিবরণী রিপোর্ট`,
                      `তারিখ: ${toBnNum(new Date().toLocaleDateString('bn-BD'))}`,
                      `---------------------------------------`
                    ];
                    const selectedCusts = customers.filter(c => selectedBulkCustomerIds.includes(c.id));
                    selectedCusts.forEach((c, index) => {
                      lines.push(`${toBnNum(index + 1)}. ${c.name}: ৳${toBnNum(c.due)} টাকা ${c.phone ? `(${c.phone})` : ''}`);
                    });
                    lines.push(`---------------------------------------`);
                    lines.push(`সর্বমোট নির্বাচিত বকেয়া: ৳${toBnNum(selectedCusts.reduce((sum, current) => sum + current.due, 0))} টাকা`);
                    lines.push(`\nসবাইকে দ্রুত বকেয়া টাকা পরিশোধের অনুরোধ রইল।\nধন্যবাদ,\nনাজমুল জেনারেল স্টোর।`);

                    navigator.clipboard.writeText(lines.join('\n'));
                    alert("সকল নির্বাচিত গ্রাহকের বকেয়া রিপোর্ট একসাথে কপি করা হয়েছে!");
                    playSound(1300, 0.15);
                  }}
                  className="py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-200 dark:border-slate-700 w-full text-center"
                >
                  <Copy size={14} /> সব গ্রাহকের বকেয়া রিপোর্ট একসাথে কপি করুন
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* --- CHANGE PIN MODAL --- */}
      {showPinChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Key size={16} className="text-indigo-600" /> সিকিউরিটি পিন পরিবর্তন করুন
            </h4>

            <form onSubmit={handleChangePinSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">বর্তমান ৪-সংখ্যার পিন</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  placeholder="••••"
                  value={oldPinVal}
                  onChange={e => setOldPinVal(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-center font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">নতুন ৪-সংখ্যার পিন</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  placeholder="••••"
                  value={newPinVal}
                  onChange={e => setNewPinVal(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-center font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinChangeModal(false);
                    setOldPinVal('');
                    setNewPinVal('');
                  }}
                  className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-500"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  পিন পরিবর্তন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- GROCERY SALE MEMO SLIP MODAL (NAZMUL GENERAL STORE) --- */}
      {activeMemoSale && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl overflow-hidden max-w-[340px] w-full border border-slate-100 shadow-2xl p-5 space-y-4">
            
            {/* Receipt Content Wrapper for Capture/Print */}
            <div id="grocery-receipt-card" className="bg-white p-2">
              <div className="text-center font-sans space-y-1">
                <div className="text-rose-600 bg-rose-50 w-11 h-11 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Store size={20} />
                </div>
                <h4 className="font-black text-base text-slate-900 tracking-tight">নাজমুল জেনারেল স্টোর</h4>
                <p className="text-[10px] text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded-full inline-block">মুদি খানা মেমো স্লিপ</p>
                <p className="text-[9px] text-slate-400 font-medium block mt-1">ভাউচার রসিদ আইডি: {activeMemoSale.id}</p>
              </div>

              {/* Details List */}
              <div className="bg-slate-50 rounded-2xl p-3 text-[11px] text-slate-600 space-y-2 border border-slate-200/55 mt-3">
                <div className="flex justify-between">
                  <span>ক্রেতার নাম:</span>
                  <strong className="text-slate-950 font-bold">{activeMemoSale.customerName === 'Unknown' ? 'সাধারণ কাস্টমার' : activeMemoSale.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>তারিখ ও সময়:</span>
                  <span className="font-medium text-slate-700">{toBnNum(activeMemoSale.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>লেনদেনের ধরণ:</span>
                  <span className={`px-2 py-0.5 rounded font-black text-[10px] ${activeMemoSale.paymentMethod === 'Cash' ? 'bg-emerald-100 text-emerald-800' : activeMemoSale.paymentMethod === 'Due' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}`}>
                    {activeMemoSale.paymentMethod === 'Cash' ? 'নগদ বিক্রয়' : activeMemoSale.paymentMethod === 'Due' ? 'বাকি বিক্রয়' : 'মোবাইল ব্যাংকিং'}
                  </span>
                </div>
              </div>

              {/* Items List Table */}
              <div className="mt-4 border-t border-slate-200 pt-3">
                <span className="text-[10px] uppercase font-black text-slate-400 block mb-1">ক্রয়কৃত পণ্যের বিবরণী</span>
                <div className="divide-y divide-slate-100 text-[11px]">
                  {activeMemoSale.items.map((item, index) => (
                    <div key={index} className="py-2 flex justify-between items-start">
                      <div>
                        <strong className="text-slate-900 block font-bold">{item.name}</strong>
                        <span className="text-slate-400 text-[10px] font-medium">
                          {toBnNum(item.quantity)} পিস × ৳{toBnNum(item.sellPrice.toFixed(2))}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        ৳{toBnNum((item.quantity * item.sellPrice).toFixed(2))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Financial Block */}
              <div className="border-y-2 border-dashed border-slate-300 py-3 text-center px-2 space-y-1 mt-3">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">মোট পরিশোধযোগ্য টাকা</span>
                <strong className="text-2xl font-black text-rose-950 font-mono tracking-tight block">
                  ৳{toBnNum(activeMemoSale.grandTotal.toFixed(2))}
                </strong>
                <span className="text-[9px] text-rose-500 font-bold block bg-rose-50 py-0.5 rounded-full px-2 max-w-max mx-auto select-none">
                  ধন্যবাদ, আবার আসবেন!
                </span>
              </div>

              {/* Barcode Mock */}
              <div className="flex flex-col items-center justify-center select-none pt-3">
                <div className="h-7 w-44 bg-slate-800 flex items-center justify-center rounded overflow-hidden opacity-90 mb-1 relative bg-white border border-slate-200">
                  <div className="absolute inset-x-2 inset-y-1 flex justify-between">
                    <div className="bg-black w-1.5 h-full" />
                    <div className="bg-black w-0.5 h-full" />
                    <div className="bg-black w-1.5 h-full" />
                    <div className="bg-black w-1 h-full" />
                    <div className="bg-black w-2 h-full" />
                    <div className="bg-black w-0.5 h-full" />
                    <div className="bg-black w-1.5 h-full" />
                    <div className="bg-black w-0.5 h-full" />
                    <div className="bg-black w-1.5 h-full" />
                    <div className="bg-black w-2 h-full" />
                    <div className="bg-black w-1 h-full" />
                    <div className="bg-black w-0.5 h-full" />
                  </div>
                </div>
                <span className="text-[8px] text-slate-400 font-mono tracking-wider">REF-{activeMemoSale.id}</span>
              </div>
            </div>

            {/* Utility buttons grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  const itemsList = activeMemoSale.items.map(it => `${it.name} (${toBnNum(it.quantity)} পিস)`).join(', ');
                  const textContent = `নাজমুল জেনারেল স্টোর\nমেমো আইডি: ${activeMemoSale.id}\nক্রেতা: ${activeMemoSale.customerName === 'Unknown' ? 'সাধারণ কাস্টমার' : activeMemoSale.customerName}\nপণ্য: ${itemsList}\nমোট: ৳${toBnNum(activeMemoSale.grandTotal.toFixed(2))}\nধন্যবাদ, আবার আসবেন!`;
                  navigator.clipboard.writeText(textContent);
                  alert('মুদিখানা মেমো কপি সম্পন্ন হয়েছে!');
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
                  downloadPNG('grocery-receipt-card', `grocery_memo_${activeMemoSale.id}.png`);
                }}
                className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download size={12} />
                ডাউনলোড PNG
              </button>
              <button
                onClick={() => {
                  playSound(1100, 0.1);
                  printElement('grocery-receipt-card');
                }}
                className="py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer size={12} />
                থার্মাল প্রিন্ট
              </button>
              <button
                onClick={() => { setActiveMemoSale(null); playSound(650, 0.08); }}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-xl cursor-pointer shadow transition-all flex items-center justify-center"
              >
                বন্ধ করুন
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
