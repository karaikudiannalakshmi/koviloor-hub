// Central registry of all apps. Add/edit entries here to update the hub.
export const APPS = [
  // Karaikudi Annalakshmi
  {
    id: 'kal-payroll',
    name: 'KAL Payroll',
    description: 'Salary, attendance & bank file',
    url: 'https://payroll-olive-three.vercel.app/',
    icon: 'ti-cash',
    group: 'Karaikudi Annalakshmi'
  },
  {
    id: 'kal-purchases',
    name: 'KAL Purchases',
    description: 'Vendor purchase tracking',
    url: 'https://kal-purchases.vercel.app/',
    icon: 'ti-shopping-cart',
    group: 'Karaikudi Annalakshmi'
  },
  {
    id: 'kitchen-maint',
    name: 'Kitchen Maintenance',
    description: 'KAL kitchen equipment log',
    url: 'https://kal-kitchen-maintenance.vercel.app/',
    icon: 'ti-tools',
    group: 'Karaikudi Annalakshmi'
  },
  {
    id: 'waste-audit',
    name: 'Waste Audit',
    description: 'KAL waste tracking',
    url: 'https://kal-waste-audit.vercel.app/',
    icon: 'ti-trash',
    group: 'Karaikudi Annalakshmi'
  },
  {
    id: 'kal-monitor',
    name: 'KAL Monitor',
    description: 'Operations dashboard',
    url: 'https://kalmonitor.vercel.app/',
    icon: 'ti-activity',
    group: 'Karaikudi Annalakshmi'
  },

  // Koviloor Madalayam
  {
    id: 'koviloor-payroll',
    name: 'Madalayam Payroll',
    description: 'Koviloor Madalayam staff salary',
    url: 'https://koviloor-payroll.vercel.app/',
    icon: 'ti-cash',
    group: 'Koviloor Madalayam'
  },
  {
    id: 'property',
    name: 'Property Management',
    description: '130 properties, 8 locations',
    url: 'https://koviloor-property.vercel.app/',
    icon: 'ti-building',
    group: 'Koviloor Madalayam'
  },
  {
    id: 'koviloor-kitchen',
    name: 'Koviloor Kitchen',
    description: 'Menu planning, recipes & dish-wise reports',
    url: 'https://koviloor-kitchen.vercel.app/',
    icon: 'ti-chef-hat',
    group: 'Koviloor Madalayam'
  },
  {
    id: 'koviloor-kitchen-purchase',
    name: 'Kitchen Purchase List',
    description: 'Shopping list by date range & session',
    url: 'https://koviloor-kitchen.vercel.app/#rep_shop',
    icon: 'ti-shopping-cart',
    group: 'Koviloor Madalayam'
  },
  {
    id: 'guru-pooja',
    name: 'Guru Pooja',
    description: '70 days/year calendar',
    url: 'https://koviloor-gurupooja.vercel.app/',
    icon: 'ti-flame',
    group: 'Koviloor Madalayam'
  },
  {
    id: 'nwt-scholarship',
    name: 'NWT Scholarship',
    description: 'Student loans & renewals',
    url: 'https://nwt-app.vercel.app/',
    icon: 'ti-graduation-cap',
    group: 'Koviloor Madalayam'
  },
  {
    id: 'nagarathar-jobs',
    name: 'Nagarathar Jobs',
    description: 'Community job board',
    url: 'https://www.nagaratharjobs.com/',
    icon: 'ti-briefcase',
    group: 'Koviloor Madalayam'
  },
  {
    id: 'nagarathar-matrimony',
    name: 'Nagarathar Matrimony',
    description: 'Community matrimony service',
    url: 'https://nagaratharvaazhvinai.com/',
    icon: 'ti-heart',
    group: 'Koviloor Madalayam'
  },

  // Kasi / Varanasi
  {
    id: 'kasi-payroll',
    name: 'Kasi Payroll',
    description: 'KVKF Varanasi payroll',
    url: 'https://kasi-payroll.vercel.app/',
    icon: 'ti-cash',
    group: 'Kasi / Varanasi'
  },
  {
    id: 'annakshetra',
    name: 'Annakshetra Bills',
    description: 'Vendor bills & NEFT',
    url: 'https://annakshetra-bills.vercel.app/',
    icon: 'ti-receipt',
    group: 'Kasi / Varanasi'
  },

  // Coming Soon
  {
    id: 'kacpe-payroll',
    name: 'KACPE Payroll',
    description: 'College of Physical Education',
    url: null,
    icon: 'ti-school',
    group: 'Coming Soon',
    comingSoon: true
  }
]

export const GROUP_ORDER = [
  'Karaikudi Annalakshmi',
  'Koviloor Madalayam',
  'Kasi / Varanasi',
  'Coming Soon'
]
