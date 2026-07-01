/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MobileOperatorRef, RechargePackage } from './types';

export const BANGLADESHI_OPERATORS: MobileOperatorRef[] = [
  {
    id: 'gp',
    nameBangla: 'গ্রামীণফোন (GP)',
    nameEnglish: 'Grameenphone',
    prefixes: ['017', '013'],
    colorClass: 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-200 border-sky-400',
    bgHex: '#0077c5',
    ussdCheckBalance: '*566#',
    ussdCheckMyOffer: '*121*5#',
    ussdInternetBalance: '*121*1*4#'
  },
  {
    id: 'robi',
    nameBangla: 'রবি (Robi)',
    nameEnglish: 'Robi',
    prefixes: ['018'],
    colorClass: 'bg-red-500 hover:bg-red-600 focus:ring-red-200 border-red-400',
    bgHex: '#e31837',
    ussdCheckBalance: '*222#',
    ussdCheckMyOffer: '*999#',
    ussdInternetBalance: '*3#'
  },
  {
    id: 'banglalink',
    nameBangla: 'বাংলালিংক (BL)',
    nameEnglish: 'Banglalink',
    prefixes: ['019', '014'],
    colorClass: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-200 border-orange-400',
    bgHex: '#ff6600',
    ussdCheckBalance: '*124#',
    ussdCheckMyOffer: '*888#',
    ussdInternetBalance: '*5000*500#'
  },
  {
    id: 'airtel',
    nameBangla: 'এয়ারটেল (Airtel)',
    nameEnglish: 'Airtel',
    prefixes: ['016'],
    colorClass: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-200 border-rose-500',
    bgHex: '#ed1c24',
    ussdCheckBalance: '*778#',
    ussdCheckMyOffer: '*121*0#',
    ussdInternetBalance: '*3#'
  },
  {
    id: 'teletalk',
    nameBangla: 'টেলিটক (Teletalk)',
    nameEnglish: 'Teletalk',
    prefixes: ['015'],
    colorClass: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200 border-emerald-500',
    bgHex: '#009245',
    ussdCheckBalance: '*152#',
    ussdCheckMyOffer: '*86#',
    ussdInternetBalance: '*152#'
  }
];

export const POPULAR_RECHARGE_PACKAGES: RechargePackage[] = [
  // Grameenphone
  {
    id: 'gp-1gb',
    operatorId: 'gp',
    title: '১.৫ জিবি ইন্টারনেট প্যাক',
    type: 'internet',
    price: 69,
    validity: '৩ দিন',
    description: '১.৫ জিবি (৩ দিন মেয়াদে সবার জন্য প্রযোজ্য)',
    commissionRate: 0.027,
    ussdCode: '*121*3222#'
  },
  {
    id: 'gp-10gb-combo',
    operatorId: 'gp',
    title: '১০ জিবি + ২০০ মিনিট কম্বো',
    type: 'combo',
    price: 399,
    validity: '৩০ দিন',
    description: '১০ জিবি ইন্টারনেট ও ২০০ মিনিট যেকোনো নাম্বারে কথা বলার সুবিধা।',
    commissionRate: 0.03,
    ussdCode: '*121*5121#'
  },
  {
    id: 'gp-120min',
    operatorId: 'gp',
    title: '১২০ মিনিট টকটাইম',
    type: 'talktime',
    price: 98,
    validity: '৭ দিন',
    description: '১২০ মিনিট টকটাইম যেকোনো লোকাল নাম্বারে ২৪ ঘণ্টা।',
    commissionRate: 0.027,
    ussdCode: '*5000*120#'
  },

  // Robi
  {
    id: 'robi-5gb',
    operatorId: 'robi',
    title: '৫ জিবি স্পেশাল রিচার্জ',
    type: 'internet',
    price: 129,
    validity: '৭ দিন',
    description: '৫ জিবি সুপার ফাস্ট ইন্টারনেট প্যাক।',
    commissionRate: 0.027,
    ussdCode: '*123*129#'
  },
  {
    id: 'robi-350min',
    operatorId: 'robi',
    title: '৩৫০ মিনিট মেগা টকটাইম',
    type: 'talktime',
    price: 238,
    validity: '১৫ দিন',
    description: '৩৫০ মিনিট লোকাল টকটাইম টকটাইম যেকোনো নাম্বারে।',
    commissionRate: 0.027,
    ussdCode: '*0*238#'
  },
  {
    id: 'robi-combo-448',
    operatorId: 'robi',
    title: '১৫ জিবি + ৪০০ মিনিট মেগা প্যাক',
    type: 'combo',
    price: 448,
    validity: '৩০ দিন',
    description: '১৫ জিবি ইন্টারনেট ও ৪০০ মিনিট কথা বলার মাসব্যাপী সেরা অফার।',
    commissionRate: 0.035,
    ussdCode: '*123*448#'
  },

  // Banglalink
  {
    id: 'bl-internet-114',
    operatorId: 'banglalink',
    title: '৮ জিবি ধামাকা প্যাক',
    type: 'internet',
    price: 114,
    validity: '৭ দিন',
    description: '৮ জিবি ধামাকা ইন্টারনেট (মেয়াদ ৭ দিন)।',
    commissionRate: 0.027,
    ussdCode: '*5000*114#'
  },
  {
    id: 'bl-talktime-127',
    operatorId: 'banglalink',
    title: '১৮০ মিনিট কথা বলুন',
    type: 'talktime',
    price: 127,
    validity: '৭ দিন',
    description: '১৮০ মিনিট টকটাইম যেকোনো লোকাল অপারেটরে।',
    commissionRate: 0.027,
    ussdCode: '*1100*127#'
  },
  {
    id: 'bl-combo-549',
    operatorId: 'banglalink',
    title: '৩৫ জিবি + ৮০০ মিনিট কম্বো',
    type: 'combo',
    price: 549,
    validity: '৩০ দিন',
    description: '৩৫ জিবি সুপার-ইন্টারনেট ও ৮০০ মিনিট টকটাইম যেকোনো অপারেটরে।',
    commissionRate: 0.035,
    ussdCode: '*5000*549#'
  },

  // Airtel
  {
    id: 'airtel-10gb-169',
    operatorId: 'airtel',
    title: '১০ জিবি ইন্টারনেট স্পেশাল',
    type: 'internet',
    price: 169,
    validity: '৭ দিন',
    description: '১০ জিবি ধামাকা ইন্টারনেট এয়ারটেল কাস্টমার দের জন্য।',
    commissionRate: 0.027,
    ussdCode: '*121*169#'
  },
  {
    id: 'airtel-250min',
    operatorId: 'airtel',
    title: '২৫০ মিনিট বাজেট প্যাক',
    type: 'talktime',
    price: 168,
    validity: '১৫ দিন',
    description: '২৫০ মিনিট টকটাইম যেকোনো লোকাল নাম্বারে ১৫ দিন মেয়াদে।',
    commissionRate: 0.027,
    ussdCode: '*121*250#'
  },
  {
    id: 'airtel-mega-599',
    operatorId: 'airtel',
    title: '২৫ জিবি + ৫০০ মিনিট মেগা প্যাক',
    type: 'combo',
    price: 599,
    validity: '৩০ দিন',
    description: '২৫ জিবি মেগা ইন্টারনেট ও ৫০০ মিনিট টকটাইম।',
    commissionRate: 0.035,
    ussdCode: '*121*599#'
  },

  // Teletalk
  {
    id: 'tt-internet-97',
    operatorId: 'teletalk',
    title: '১৫ জিবি সাশ্রয়ী প্যাক',
    type: 'internet',
    price: 97,
    validity: '৭ দিন',
    description: 'টেলিটক স্পেশাল ১৫ জিবি ইন্টারনেট মেয়াদ ৭ দিন।',
    commissionRate: 0.027,
    ussdCode: '*111*97#'
  },
  {
    id: 'tt-talktime-59',
    operatorId: 'teletalk',
    title: '১০০ মিনিট টকটাইম',
    type: 'talktime',
    price: 59,
    validity: '৭ দিন',
    description: '১০০ মিনিট দিনরাত যেকোনো লোকাল নাম্বারে কথা বলুন।',
    commissionRate: 0.027,
    ussdCode: '*111*59#'
  }
];

// Helper functions
export function getOperatorByPhone(phone: string): MobileOperatorRef | null {
  // strip +88 or 88 prefix if any
  let clean = phone.replace(/^(?:\+880|880|0)/, '0');
  if (clean.length >= 3) {
    const prefix = clean.slice(0, 3);
    return BANGLADESHI_OPERATORS.find(op => op.prefixes.includes(prefix)) || null;
  }
  return null;
}

export function formatDateBengali(timestamp: number): string {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  
  // Custom substitution for Bengali numbers & elements
  const englishFormat = date.toLocaleString('bn-BD', options);
  return englishFormat;
}

export function translateServiceType(type: string, operatorName?: string): string {
  switch (type) {
    case 'bkash_cash_in': return 'বিকাশ ক্যাশ ইন (Cash In)';
    case 'bkash_cash_out': return 'বিকাশ ক্যাশ আউট (Cash Out)';
    case 'bkash_send_money': return 'বিকাশ সেন্ড মানি (Send Money)';
    case 'nagad_cash_in': return 'নগদ ক্যাশ ইন (Cash In)';
    case 'nagad_cash_out': return 'নগদ ক্যাশ আউট (Cash Out)';
    case 'rocket_cash_in': return 'রকেট ক্যাশ ইন (Cash In)';
    case 'rocket_cash_out': return 'রকেট ক্যাশ আউট (Cash Out)';
    case 'flexiload': return `ফ্লেক্সিলোড (${operatorName || 'মোবাইল রিচার্জ'})`;
    case 'balance_add': return 'ফান্ড বৃদ্ধি (যোগ)';
    case 'balance_sub': return 'ফান্ড হ্রাস (বিয়োগ)';
    default: return type;
  }
}
