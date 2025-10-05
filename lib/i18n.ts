// Internationalization (i18n) for NotaryCalc Pro

export type Language = 'he' | 'en'

export const translations = {
  he: {
    // Header & Navigation
    appName: 'NotaryCalc Pro',
    dashboard: 'לוח בקרה',
    calculations: 'חישובים',
    clients: 'לקוחות',
    history: 'היסטוריה',
    settings: 'הגדרות',
    logout: 'יציאה',
    back: 'חזרה',

    // Dashboard
    welcome: 'שלום',
    user: 'משתמש',
    daysLeft: 'ימי ניסיון נותרו',
    trialPeriod: 'תקופת ניסיון',
    daysRemaining: 'ימים נותרו',
    enjoyFeatures: 'תהנה מכל התכונות חינם עד',
    upgradeNow: 'שדרג עכשיו - 39₪/חודש',
    redirecting: 'מעביר לתשלום...',

    // Stats
    calculationsThisMonth: 'חישובים החודש',
    totalFees: 'סה״כ תעריפים',
    clientsCount: 'לקוחות',
    status: 'סטטוס',
    noCalculationsYet: 'עדיין לא ביצעת חישובים',
    thisMonth: 'החודש',
    inList: 'ברשימה',
    trial: 'ניסיון',
    subscription: 'מנוי',

    // Getting Started
    gettingStarted: '🚀 בואו נתחיל',
    simpleSteps: '3 צעדים פשוטים',
    completeProfile: 'השלם את הפרופיל שלך',
    addOfficeDetails: 'הוסף פרטי משרד ולוגו בהגדרות',
    firstCalculation: 'צור את החישוב הראשון',
    tryCalculation: 'נסה לבצע חישוב תעריף נוטריון',
    addClients: 'הוסף לקוחות',
    createClientList: 'צור רשימת לקוחות לגישה מהירה',

    // Quick Actions
    quickActions: 'פעולות מהירות',
    newCalculation: 'חישוב חדש',
    createFeeCalculation: 'צור חישוב תעריף נוטריון חדש',
    createFee: 'צור חישוב תעריף',
    manageClients: 'נהל את רשימת הלקוחות שלך',
    newClient: 'לקוח חדש',
    addToList: 'הוסף לרשימה',
    viewHistory: 'צפה בחישובים קודמים',
    viewCalculations: 'צפה בחישובים',

    // Calculations
    calculation: 'חישוב',
    calculationDetails: 'פרטי חישוב',
    services: 'שירותים',
    quantity: 'כמות',
    copies: 'עותקים',
    pages: 'עמודים',
    translationWords: 'מילים בתרגום',
    subtotal: 'סכום ביניים',
    vat: 'מע״מ (18%)',
    totalToPay: 'סה״כ לתשלום',
    notes: 'הערות',
    clientName: 'שם לקוח',
    noClientName: 'ללא שם לקוח',
    date: 'תאריך',
    printPdf: 'הדפס / שמור PDF',
    save: 'שמור',
    delete: 'מחק',
    view: 'צפה',

    // History
    calculationHistory: 'היסטוריית חישובים',
    totalCalculations: 'סה״כ חישובים',
    monthlyRevenue: 'הכנסות החודש',
    totalRevenue: 'סה״כ הכנסות',
    searchPlaceholder: 'חפש לפי שם לקוח או הערות...',
    allTime: 'כל התקופה',
    lastMonth: 'חודש שעבר',
    noCalculations: 'אין חישובים',
    noSearchResults: 'לא נמצאו תוצאות לחיפוש',
    notDoneYet: 'עדיין לא ביצעת חישובים',
    createFirst: 'צור חישוב ראשון',

    // Clients
    clientManagement: 'ניהול לקוחות',
    addClient: 'הוסף לקוח',
    editClient: 'ערוך לקוח',
    phone: 'טלפון',
    email: 'אימייל',
    address: 'כתובת',
    idNumber: 'ת.ז',
    name: 'שם',
    actions: 'פעולות',
    edit: 'ערוך',
    cancel: 'ביטול',
    noClients: 'אין לקוחות',
    noClientsYet: 'עדיין לא הוספת לקוחות',
    addFirstClient: 'הוסף לקוח ראשון',
    searchClients: 'חפש לקוח...',

    // Messages
    loading: 'טוען...',
    loadingHistory: 'טוען היסטוריה...',
    loadingCalculation: 'טוען חישוב...',
    loadingClients: 'טוען לקוחות...',
    confirmDelete: 'האם אתה בטוח שברצונך למחוק חישוב זה?',
    deleteError: 'שגיאה במחיקה',
    loadError: 'שגיאה בטעינת החישוב',
    calculationNotFound: 'חישוב לא נמצא',

    // Footer
    basedOnRegulations: 'מבוסס על תקנות הנוטריונים (שכר שירותים), תשל״ט-1978',
    copyright: '© {year} NotaryCalc Pro',
  },
  en: {
    // Header & Navigation
    appName: 'NotaryCalc Pro',
    dashboard: 'Dashboard',
    calculations: 'Calculations',
    clients: 'Clients',
    history: 'History',
    settings: 'Settings',
    logout: 'Logout',
    back: 'Back',

    // Dashboard
    welcome: 'Hello',
    user: 'User',
    daysLeft: 'trial days left',
    trialPeriod: 'Trial Period',
    daysRemaining: 'days remaining',
    enjoyFeatures: 'Enjoy all features free until',
    upgradeNow: 'Upgrade Now - ₪39/month',
    redirecting: 'Redirecting to payment...',

    // Stats
    calculationsThisMonth: 'Calculations This Month',
    totalFees: 'Total Fees',
    clientsCount: 'Clients',
    status: 'Status',
    noCalculationsYet: 'No calculations yet',
    thisMonth: 'This Month',
    inList: 'In List',
    trial: 'Trial',
    subscription: 'Subscription',

    // Getting Started
    gettingStarted: '🚀 Getting Started',
    simpleSteps: '3 Simple Steps',
    completeProfile: 'Complete Your Profile',
    addOfficeDetails: 'Add office details and logo in settings',
    firstCalculation: 'Create Your First Calculation',
    tryCalculation: 'Try calculating a notary fee',
    addClients: 'Add Clients',
    createClientList: 'Create a client list for quick access',

    // Quick Actions
    quickActions: 'Quick Actions',
    newCalculation: 'New Calculation',
    createFeeCalculation: 'Create new notary fee calculation',
    createFee: 'Create fee calculation',
    manageClients: 'Manage your client list',
    newClient: 'New Client',
    addToList: 'Add to List',
    viewHistory: 'View previous calculations',
    viewCalculations: 'View Calculations',

    // Calculations
    calculation: 'Calculation',
    calculationDetails: 'Calculation Details',
    services: 'Services',
    quantity: 'Quantity',
    copies: 'Copies',
    pages: 'Pages',
    translationWords: 'Translation Words',
    subtotal: 'Subtotal',
    vat: 'VAT (18%)',
    totalToPay: 'Total to Pay',
    notes: 'Notes',
    clientName: 'Client Name',
    noClientName: 'No Client Name',
    date: 'Date',
    printPdf: 'Print / Save PDF',
    save: 'Save',
    delete: 'Delete',
    view: 'View',

    // History
    calculationHistory: 'Calculation History',
    totalCalculations: 'Total Calculations',
    monthlyRevenue: 'Monthly Revenue',
    totalRevenue: 'Total Revenue',
    searchPlaceholder: 'Search by client name or notes...',
    allTime: 'All Time',
    lastMonth: 'Last Month',
    noCalculations: 'No Calculations',
    noSearchResults: 'No search results found',
    notDoneYet: 'You haven\'t made any calculations yet',
    createFirst: 'Create First Calculation',

    // Clients
    clientManagement: 'Client Management',
    addClient: 'Add Client',
    editClient: 'Edit Client',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    idNumber: 'ID Number',
    name: 'Name',
    actions: 'Actions',
    edit: 'Edit',
    cancel: 'Cancel',
    noClients: 'No Clients',
    noClientsYet: 'You haven\'t added clients yet',
    addFirstClient: 'Add First Client',
    searchClients: 'Search client...',

    // Messages
    loading: 'Loading...',
    loadingHistory: 'Loading history...',
    loadingCalculation: 'Loading calculation...',
    loadingClients: 'Loading clients...',
    confirmDelete: 'Are you sure you want to delete this calculation?',
    deleteError: 'Error deleting',
    loadError: 'Error loading calculation',
    calculationNotFound: 'Calculation not found',

    // Footer
    basedOnRegulations: 'Based on Notary Regulations (Service Fees), 1978',
    copyright: '© {year} NotaryCalc Pro',
  }
}

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.')
  let value: any = translations[lang]

  for (const k of keys) {
    value = value?.[k]
  }

  return value || key
}

export function t(lang: Language, key: keyof typeof translations.he): string {
  return translations[lang][key] || translations.he[key] || key
}
