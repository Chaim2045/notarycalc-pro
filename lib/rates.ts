// תעריפי נוטריון לפי תקנות הנוטריונים (שכר שירותים), תשל״ט-1978

export const VAT_RATE = 0.18;

export const RATES = {
  signature: { first: 193, additional: 75, authorized: 75, copy: 75 },
  photocopy: {
    firstPage: 75,
    additionalPage: 13,
    multipleFirstPage: 26,
    multipleSecondPage: 13,
  },
  translation: {
    first100: 245,
    per100until1000: 193,
    per100after1000: 96,
    multipleCopy: 75,
  },
  will: { first: 286, additional: 143, multipleCopy: 86 },
  alive: 193,
  affidavit: { first: 195, additional: 78, multipleCopy: 75 },
  commercialDoc: { under80700: 1244, over80700: 2667 },
  cancellation: {
    registration: 204,
    certifiedCopy: 72,
    additionalCopy: 72,
  },
  prenup: { first: 435, multipleCopy: 72 },
  other: 315,
  outsideOffice: { firstHour: 630, halfHour: 193 },
  foreignLanguage: 102,
};

export const SERVICE_TYPES = [
  { value: "signature", label: "אימות חתימה" },
  { value: "photocopy", label: "אישור העתק צילומי" },
  { value: "translation", label: "אישור נכונות תרגום" },
  { value: "will", label: "אישור צוואה" },
  { value: "alive", label: "אישור שפלוני בחיים" },
  { value: "affidavit", label: "קבלת תצהיר" },
  { value: "commercialDoc", label: "העדת מסמך סחיר" },
  { value: "cancellation", label: "רישום ביטול ייפוי כוח" },
  { value: "prenup", label: "אימות הסכם ממון" },
  { value: "other", label: "פעולה אחרת" },
];

export const SIGNATURE_SUB_TYPES = [
  { value: "first", label: "חותם ראשון", price: 193 },
  { value: "additional", label: "חותם נוסף", price: 75 },
  { value: "authorized", label: "אישור מוסמך", price: 75 },
  { value: "copy", label: "העתק מאושר", price: 75 },
];

export const PHOTOCOPY_SUB_TYPES = [
  { value: "firstPage", label: "עמוד ראשון", price: 75 },
  { value: "additionalPage", label: "עמוד נוסף", price: 13 },
  { value: "multipleFirstPage", label: "העתק נוסף - עמוד ראשון", price: 26 },
  { value: "multipleSecondPage", label: "העתק נוסף - עמוד נוסף", price: 13 },
];

export const TRANSLATION_SUB_TYPES = [
  { value: "first100", label: "100 מילים ראשונות", price: 245 },
  { value: "per100until1000", label: "100 מילים עד 1000", price: 193 },
  { value: "per100after1000", label: "100 מילים לאחר 1000", price: 96 },
  { value: "multipleCopy", label: "העתק נוסף", price: 75 },
];

export const WILL_SUB_TYPES = [
  { value: "first", label: "צוואה - מסמך ראשון", price: 286 },
  { value: "additional", label: "צוואה - מסמך נוסף", price: 143 },
  { value: "multipleCopy", label: "העתק נוסף", price: 86 },
];

export const AFFIDAVIT_SUB_TYPES = [
  { value: "first", label: "תצהיר - מסמך ראשון", price: 195 },
  { value: "additional", label: "תצהיר - מסמך נוסף", price: 78 },
  { value: "multipleCopy", label: "העתק מאושר", price: 75 },
];

export const COMMERCIAL_DOC_SUB_TYPES = [
  { value: "under80700", label: "עד 80,700 ₪", price: 1244 },
  { value: "over80700", label: "מעל 80,700 ₪", price: 2667 },
];

export const CANCELLATION_SUB_TYPES = [
  { value: "registration", label: "רישום ביטול", price: 204 },
  { value: "certifiedCopy", label: "העתק מאושר", price: 72 },
  { value: "additionalCopy", label: "העתק נוסף", price: 72 },
];

export const PRENUP_SUB_TYPES = [
  { value: "first", label: "הסכם ממון - מסמך ראשון", price: 435 },
  { value: "multipleCopy", label: "העתק נוסף", price: 72 },
];

export const OUTSIDE_OFFICE_SUB_TYPES = [
  { value: "firstHour", label: "שעה ראשונה", price: 630 },
  { value: "halfHour", label: "כל חצי שעה", price: 193 },
];

// Helper function to get sub-types for a service
export function getSubTypes(serviceType: string) {
  switch (serviceType) {
    case "signature":
      return SIGNATURE_SUB_TYPES;
    case "photocopy":
      return PHOTOCOPY_SUB_TYPES;
    case "translation":
      return TRANSLATION_SUB_TYPES;
    case "will":
      return WILL_SUB_TYPES;
    case "affidavit":
      return AFFIDAVIT_SUB_TYPES;
    case "commercialDoc":
      return COMMERCIAL_DOC_SUB_TYPES;
    case "cancellation":
      return CANCELLATION_SUB_TYPES;
    case "prenup":
      return PRENUP_SUB_TYPES;
    case "outsideOffice":
      return OUTSIDE_OFFICE_SUB_TYPES;
    case "alive":
      return [{ value: "alive", label: "אישור שפלוני בחיים", price: 193 }];
    case "other":
      return [{ value: "other", label: "פעולה אחרת", price: 315 }];
    case "foreignLanguage":
      return [{ value: "foreignLanguage", label: "שפה זרה", price: 102 }];
    default:
      return [];
  }
}

// Translation calculation with breakdown
export function getTranslationBreakdown(words: number) {
  if (words === 0) return { lines: [], total: 0 };

  const lines: Array<{ text: string; calc: string; amount: number }> = [];
  let total = 0;

  if (words <= 100) {
    lines.push({
      text: `100 מילים ראשונות (עד ${words})`,
      calc: `1 × ₪245`,
      amount: 245,
    });
    total = 245;
  } else if (words <= 1000) {
    lines.push({
      text: "100 מילים ראשונות",
      calc: "1 × ₪245",
      amount: 245,
    });
    total = 245;

    const remaining = words - 100;
    const hundreds = Math.ceil(remaining / 100);
    const amount = hundreds * 193;
    lines.push({
      text: `${remaining} מילים נוספות (${hundreds} × 100)`,
      calc: `${hundreds} × ₪193`,
      amount,
    });
    total += amount;
  } else {
    lines.push({
      text: "100 מילים ראשונות",
      calc: "1 × ₪245",
      amount: 245,
    });
    total = 245;

    lines.push({
      text: "900 מילים הבאות (100-1000)",
      calc: "9 × ₪193",
      amount: 1737,
    });
    total += 1737;

    const remaining = words - 1000;
    const hundreds = Math.ceil(remaining / 100);
    const amount = hundreds * 96;
    lines.push({
      text: `${remaining} מילים אחרונות (${hundreds} × 100)`,
      calc: `${hundreds} × ₪96`,
      amount,
    });
    total += amount;
  }

  return { lines, total };
}

// Photocopy calculation with breakdown
export function getPhotocopyBreakdown(pages: number, copies: number) {
  const lines: Array<{
    text: string;
    subLines?: Array<{ text: string; calc: string; amount: number }>;
    amount: number;
  }> = [];
  let total = 0;

  for (let i = 1; i <= copies; i++) {
    if (i === 1) {
      const firstPage = 75;
      const additionalPages = (pages - 1) * 13;
      const copyTotal = firstPage + additionalPages;

      const subLines: Array<{ text: string; calc: string; amount: number }> = [
        { text: "עמוד ראשון", calc: "₪75", amount: firstPage },
      ];

      if (pages > 1) {
        subLines.push({
          text: `${pages - 1} עמודים נוספים`,
          calc: `${pages - 1} × ₪13`,
          amount: additionalPages,
        });
      }

      lines.push({
        text: `עותק #1 (${pages} עמודים)`,
        subLines,
        amount: copyTotal,
      });
      total += copyTotal;
    } else {
      const firstPage = 26;
      const additionalPages = (pages - 1) * 13;
      const copyTotal = firstPage + additionalPages;

      const subLines: Array<{ text: string; calc: string; amount: number }> = [
        {
          text: "עמוד ראשון (מחיר מופחת)",
          calc: "₪26",
          amount: firstPage,
        },
      ];

      if (pages > 1) {
        subLines.push({
          text: `${pages - 1} עמודים נוספים`,
          calc: `${pages - 1} × ₪13`,
          amount: additionalPages,
        });
      }

      lines.push({
        text: `עותק #${i} (${pages} עמודים)`,
        subLines,
        amount: copyTotal,
      });
      total += copyTotal;
    }
  }

  return { lines, total };
}

export function calculateTranslationCost(words: number): number {
  return getTranslationBreakdown(words).total;
}

export function calculateHalfTranslationCost(words: number): number {
  return calculateTranslationCost(words) * 0.5;
}

export function calculatePhotocopyCoast(pages: number, copies: number): number {
  return getPhotocopyBreakdown(pages, copies).total;
}

// Calculate price for a service (kept for backward compatibility)
export function calculateServicePrice(
  serviceType: string,
  subType: string,
  quantity: number
): number {
  const subTypes = getSubTypes(serviceType);
  const selected = subTypes.find((st) => st.value === subType);
  return selected ? selected.price * quantity : 0;
}
