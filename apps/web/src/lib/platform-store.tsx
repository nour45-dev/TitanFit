'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SupportedLocale } from '@gymos/config';

export type WorkspaceSection =
  | 'PUBLIC_STOREFRONT'
  | 'FREE_TRIAL_HUB'
  | 'OVERVIEW'
  | 'MEMBERS'
  | 'SUBSCRIPTIONS'
  | 'PAYMENTS'
  | 'CLASSES'
  | 'ACCESS_CONTROL'
  | 'POS_INVENTORY'
  | 'STAFF_TRAINERS'
  | 'MEMBER_PWA'
  | 'REPORTS'
  | 'SETTINGS'
  | 'SUPER_ADMIN';

export type UserRoleKey =
  | 'SUPER_ADMIN'
  | 'GYM_OWNER'
  | 'BRANCH_MANAGER'
  | 'RECEPTIONIST'
  | 'TRAINER'
  | 'MEMBER';

export interface BranchItem {
  id: string;
  nameEn: string;
  nameAr: string;
  cityEn: string;
  cityAr: string;
  addressEn: string;
  addressAr: string;
  phone: string;
  capacity: number;
  currentOccupancy: number;
  managerEn: string;
  managerAr: string;
  workingHours: string;
}

export interface MemberItem {
  id: string;
  code: string;
  fullNameEn: string;
  fullNameAr: string;
  phone: string;
  email: string;
  gender: 'MALE' | 'FEMALE';
  branchId: string;
  status: 'ACTIVE' | 'FROZEN' | 'EXPIRING_SOON' | 'EXPIRED';
  planNameEn: string;
  planNameAr: string;
  planId: string;
  startDate: string;
  endDate: string;
  remainingSessions: number | null;
  freezeDaysRemaining: number;
  tags: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodType: string;
  medicalConditions: string;
  injuries: string;
  assignedTrainerEn: string;
  assignedTrainerAr: string;
  checkInsCount: number;
  lastCheckIn: string;
  avatarInitials: string;
  streakDays: number;
  points: number;
}

export interface PlanItem {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  type: 'DURATION' | 'SESSION_PACK' | 'CLASS_PACK' | 'FAMILY' | 'CORPORATE';
  durationDays: number;
  priceEgp: number;
  sessionsCount: number | null;
  maxFreezeDays: number;
  gracePeriodDays: number;
  activeSubscribers: number;
  popular?: boolean;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  memberId: string;
  memberNameEn: string;
  memberNameAr: string;
  planNameEn: string;
  planNameAr: string;
  subtotalEgp: number;
  discountEgp: number;
  vatEgp: number;
  totalEgp: number;
  method: 'CASH' | 'PAYMOB_CARD' | 'FAWRY' | 'VODAFONE_CASH' | 'INSTAPAY' | 'STRIPE';
  referenceCode: string;
  status: 'PAID' | 'REFUNDED' | 'PENDING';
  createdAt: string;
  branchId: string;
  cashierName: string;
}

export interface ClassSessionItem {
  id: string;
  titleEn: string;
  titleAr: string;
  category: 'HIIT' | 'STRENGTH' | 'SPINNING' | 'BOXING' | 'YOGA' | 'CROSSFIT';
  trainerEn: string;
  trainerAr: string;
  roomEn: string;
  roomAr: string;
  branchId: string;
  dayEn: string;
  dayAr: string;
  timeRange: string;
  capacity: number;
  bookedMembers: Array<{ id: string; nameEn: string; nameAr: string; status: 'BOOKED' | 'CHECKED_IN' }>;
  waitlistMembers: Array<{ id: string; nameEn: string; nameAr: string; joinedAt: string }>;
}

export interface AccessLogItem {
  id: string;
  timestamp: string;
  memberCode: string;
  memberNameEn: string;
  memberNameAr: string;
  gateNameEn: string;
  gateNameAr: string;
  method: 'QR_ROTATING_HMAC' | 'RECEPTION_MANUAL' | 'RFID_WRISTBAND';
  decision: 'ALLOW_ACCESS' | 'DENY_EXPIRED' | 'DENY_FROZEN' | 'DENY_ANTIPASSBACK';
  reasonEn: string;
  reasonAr: string;
  relayPulseMs: number;
}

export interface PosProductItem {
  id: string;
  sku: string;
  nameEn: string;
  nameAr: string;
  category: 'PROTEIN' | 'PRE_WORKOUT' | 'DRINKS' | 'APPAREL' | 'ACCESSORIES';
  priceEgp: number;
  stock: number;
}

export interface StaffMemberItem {
  id: string;
  nameEn: string;
  nameAr: string;
  role: 'BRANCH_MANAGER' | 'TRAINER' | 'RECEPTIONIST';
  specialtyEn: string;
  specialtyAr: string;
  branchId: string;
  phone: string;
  activeClients: number;
  commissionRatePercent: number;
  monthlyRevenueEgp: number;
  rating: number;
  shiftEn: string;
  shiftAr: string;
}

export interface WorkoutLogEntry {
  id: string;
  exerciseEn: string;
  exerciseAr: string;
  weightKg: number;
  reps: number;
  sets: number;
  estimated1RmKg: number;
  isNewPr: boolean;
  loggedAt: string;
}

export interface ChatMessageItem {
  id: string;
  senderRole: 'TRAINER' | 'MEMBER';
  senderNameEn: string;
  senderNameAr: string;
  textEn: string;
  textAr: string;
  time: string;
}

export interface TenantSaaSItem {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  ownerEmail: string;
  password?: string;
  gymSecretCode: string;
  logoUrl?: string;
  primaryColor?: string;
  planTier: 'STARTER' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
  branchesCount: number;
  activeMembersCount: number;
  mrrEgp: number;
  cityEn: string;
  cityAr: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRoleKey;
  action: string;
  target: string;
  ipAddress: string;
  tenantSlug: string;
}

const INITIAL_BRANCHES: BranchItem[] = [
  {
    id: 'br-new-cairo',
    nameEn: 'TitanFit New Cairo Flagship',
    nameAr: 'تيتان فيت التجمع الخامس (الرئيسي)',
    cityEn: 'New Cairo — 5th Settlement',
    cityAr: 'القاهرة الجديدة — التجمع الخامس',
    addressEn: 'North 90th St, Beside Waterway 2',
    addressAr: 'شارع التسعين الشمالي، بجوار ووتر واي ٢',
    phone: '+20 100 450 9901',
    capacity: 250,
    currentOccupancy: 164,
    managerEn: 'Capt. Seif El-Din',
    managerAr: 'كابتن سيف الدين',
    workingHours: '05:30 AM – 12:00 AM',
  },
  {
    id: 'br-zayed',
    nameEn: 'TitanFit Sheikh Zayed Arena',
    nameAr: 'تيتان فيت الشيخ زايد أرينا',
    cityEn: 'Giza — Sheikh Zayed',
    cityAr: 'الجيزة — الشيخ زايد',
    addressEn: 'Arkan Plaza Extension, Gate 3',
    addressAr: 'امتداد أركان بلازا، بوابة ٣',
    phone: '+20 100 450 9902',
    capacity: 200,
    currentOccupancy: 118,
    managerEn: 'Nourhan El-Shamy',
    managerAr: 'نورهان الشامي',
    workingHours: '06:00 AM – 11:30 PM',
  },
  {
    id: 'br-maadi',
    nameEn: 'TitanFit Maadi Sarayat Club',
    nameAr: 'تيتان فيت المعادي السرايات',
    cityEn: 'Cairo — Maadi',
    cityAr: 'القاهرة — المعادي',
    addressEn: 'Road 9, Degla Square',
    addressAr: 'شارع ٩، ميدان دجلة',
    phone: '+20 100 450 9903',
    capacity: 150,
    currentOccupancy: 79,
    managerEn: 'Karim Abdelaziz',
    managerAr: 'كريم عبد العزيز',
    workingHours: '06:00 AM – 11:00 PM',
  },
];

const INITIAL_PLANS: PlanItem[] = [
  {
    id: 'plan-annual-vip',
    code: 'TITAN-VIP-12M',
    nameEn: 'Titan Elite Annual Pass (All Branches)',
    nameAr: 'باقة تيتان إيليت السنوية (جميع الفروع)',
    type: 'DURATION',
    durationDays: 365,
    priceEgp: 14500,
    sessionsCount: null,
    maxFreezeDays: 60,
    gracePeriodDays: 7,
    activeSubscribers: 642,
    popular: true,
  },
  {
    id: 'plan-monthly',
    code: 'TITAN-FLEX-1M',
    nameEn: 'Monthly Flex Access',
    nameAr: 'الاشتراك الشهري المرن',
    type: 'DURATION',
    durationDays: 30,
    priceEgp: 1950,
    sessionsCount: null,
    maxFreezeDays: 7,
    gracePeriodDays: 3,
    activeSubscribers: 412,
  },
];

const INITIAL_MEMBERS: MemberItem[] = [
  {
    id: 'mem-1001',
    code: 'TF-2026-1001',
    fullNameEn: 'Youssef El-Masry',
    fullNameAr: 'يوسف المصري',
    phone: '+201001234567',
    email: 'youssef.masry@titanfit.eg',
    gender: 'MALE',
    branchId: 'br-new-cairo',
    status: 'ACTIVE',
    planNameEn: 'Titan Elite Annual Pass (All Branches)',
    planNameAr: 'باقة تيتان إيليت السنوية (جميع الفروع)',
    planId: 'plan-annual-vip',
    startDate: '2026-01-15',
    endDate: '2027-01-15',
    remainingSessions: 18,
    freezeDaysRemaining: 45,
    tags: ['VIP', 'Powerlifting', 'Morning Crew'],
    emergencyContactName: 'Mona El-Masry',
    emergencyContactPhone: '+201009998877',
    bloodType: 'O+',
    medicalConditions: 'None — cleared for high-intensity training',
    injuries: 'Mild left rotator cuff stiffness (2024)',
    assignedTrainerEn: 'Coach Omar Hassan',
    assignedTrainerAr: 'كابتن عمر حسن',
    checkInsCount: 142,
    lastCheckIn: 'Today, 07:45 AM',
    avatarInitials: 'YM',
    streakDays: 19,
    points: 4850,
  },
];

const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-8841',
    memberId: 'mem-1001',
    memberNameEn: 'Youssef El-Masry',
    memberNameAr: 'يوسف المصري',
    planNameEn: 'Titan Elite Annual Pass (All Branches)',
    planNameAr: 'باقة تيتان إيليت السنوية (جميع الفروع)',
    subtotalEgp: 14500,
    discountEgp: 2900,
    vatEgp: 1624,
    totalEgp: 13224,
    method: 'INSTAPAY',
    referenceCode: 'IPA-992837412-CIB',
    status: 'PAID',
    createdAt: '2026-10-26 10:14 AM',
    branchId: 'br-new-cairo',
    cashierName: 'Nadia (Reception)',
  },
];

const INITIAL_CLASSES: ClassSessionItem[] = [
  {
    id: 'cls-101',
    titleEn: 'Titan MetCon HIIT & Conditioning',
    titleAr: 'تيتان هيت وتكييف بدني عالي الشدة',
    category: 'HIIT',
    trainerEn: 'Coach Omar Hassan',
    trainerAr: 'كابتن عمر حسن',
    roomEn: 'Arena Studio A (Main Floor)',
    roomAr: 'قاعة أرينا A (الطابق الرئيسي)',
    branchId: 'br-new-cairo',
    dayEn: 'Today',
    dayAr: 'اليوم',
    timeRange: '06:00 PM – 07:00 PM',
    capacity: 20,
    bookedMembers: [
      { id: 'mem-1001', nameEn: 'Youssef El-Masry', nameAr: 'يوسف المصري', status: 'CHECKED_IN' },
      { id: 'mem-1002', nameEn: 'Mariam Abdel-Rahman', nameAr: 'مريم عبد الرحمن', status: 'BOOKED' },
      { id: 'mem-1003', nameEn: 'Ahmed Khaled El-baz', nameAr: 'أحمد خالد الباز', status: 'BOOKED' },
    ],
    waitlistMembers: [
      { id: 'mem-1004', nameEn: 'Salma El-Gendy', nameAr: 'سلمى الجندي', joinedAt: '02:15 PM' },
      { id: 'mem-1005', nameEn: 'Mostafa Mahmoud', nameAr: 'مصطفى محمود', joinedAt: '03:05 PM' },
    ],
  },
];

const INITIAL_ACCESS_LOGS: AccessLogItem[] = [
  {
    id: 'acc-1',
    timestamp: '09:12:04 AM',
    memberCode: 'TF-2026-1001',
    memberNameEn: 'Youssef El-Masry',
    memberNameAr: 'يوسف المصري',
    gateNameEn: 'Main Lobby Turnstile #1',
    gateNameAr: 'بوابة الدخول الرئيسية #١',
    method: 'QR_ROTATING_HMAC',
    decision: 'ALLOW_ACCESS',
    reasonEn: 'Valid rotating HMAC-SHA256 QR token — Active Annual Plan',
    reasonAr: 'رمز QR مشفر صالح — باقة سنوية نشطة',
    relayPulseMs: 1500,
  },
];

const INITIAL_POS_PRODUCTS: PosProductItem[] = [
  {
    id: 'pos-1',
    sku: 'SUP-ISO-2KG',
    nameEn: 'Optimum Gold Standard Whey Isolate (2.27 kg)',
    nameAr: 'واي بروتين أيزوليت جولد ستاندرد (٢.٢٧ كجم)',
    category: 'PROTEIN',
    priceEgp: 4250,
    stock: 24,
  },
  {
    id: 'pos-3',
    sku: 'DRK-SHK-PRO',
    nameEn: 'Fresh Post-Workout Double Protein Shake (45g Protein)',
    nameAr: 'مشروب بروتين شيك طازج بعد التمرين (٤٥ جم بروتين)',
    category: 'DRINKS',
    priceEgp: 165,
    stock: 95,
  },
];

const INITIAL_STAFF: StaffMemberItem[] = [
  {
    id: 'stf-1',
    nameEn: 'Coach Omar Hassan',
    nameAr: 'كابتن عمر حسن',
    role: 'TRAINER',
    specialtyEn: 'Head Strength & Conditioning Coach (CSCS)',
    specialtyAr: 'كبير مدربي القوة والتكييف البدني (CSCS)',
    branchId: 'br-new-cairo',
    phone: '+201005551122',
    activeClients: 28,
    commissionRatePercent: 35,
    monthlyRevenueEgp: 112000,
    rating: 4.95,
    shiftEn: '06:00 AM – 03:00 PM',
    shiftAr: '٠٦:٠٠ ص – ٠٣:٠٠ م',
  },
];

const INITIAL_WORKOUT_LOGS: WorkoutLogEntry[] = [
  {
    id: 'wk-1',
    exerciseEn: 'Barbell Back Squat',
    exerciseAr: 'سكوات خلفي بالبار الحر',
    weightKg: 140,
    reps: 5,
    sets: 4,
    estimated1RmKg: 163.3,
    isNewPr: true,
    loggedAt: 'Today, 08:10 AM',
  },
];

const INITIAL_CHAT: ChatMessageItem[] = [
  {
    id: 'msg-1',
    senderRole: 'TRAINER',
    senderNameEn: 'Coach Omar Hassan',
    senderNameAr: 'كابتن عمر حسن',
    textEn: 'Great squat depth this morning Youssef! Keep protein above 185g today and hydrate with 3.5L water.',
    textAr: 'أداء ممتاز في السكوات صباح اليوم يا يوسف! حافظ على البروتين فوق ١٨٥ جم اليوم واشرب ٣.٥ لتر مياه.',
    time: '09:05 AM',
  },
  {
    id: 'msg-2',
    senderRole: 'MEMBER',
    senderNameEn: 'Youssef El-Masry',
    senderNameAr: 'يوسف المصري',
    textEn: 'Thanks Coach! Hit 140kg x 5 reps cleanly. Should we increase RDL load on Thursday?',
    textAr: 'شكراً يا كابتن! جبت ١٤٠ كجم ٥ عدات بتركيز عالي. هل نزود وزن الديدليفت يوم الخميس؟',
    time: '09:14 AM',
  },
];

const INITIAL_TENANTS: TenantSaaSItem[] = [
  {
    id: 'ten-1',
    slug: 'titanfit-egypt',
    nameEn: 'TitanFit Egypt (Flagship Group)',
    nameAr: 'مجموعة أندية تيتان فيت مصر',
    ownerEmail: 'owner@titanfit.eg',
    password: 'owner123',
    gymSecretCode: 'TF-7711',
    logoUrl: '/brand/logo.png',
    primaryColor: '#D97706',
    planTier: 'ENTERPRISE',
    status: 'ACTIVE',
    branchesCount: 3,
    activeMembersCount: 2840,
    mrrEgp: 1850000,
    cityEn: 'Cairo & Giza, Egypt',
    cityAr: 'القاهرة والجيزة، مصر',
  },
  {
    id: 'ten-2',
    slug: 'peak-fitness',
    nameEn: 'Peak Fitness Cairo',
    nameAr: 'بيك فيتنس القاهرة',
    ownerEmail: 'coach.ahmed@peakfit.eg',
    password: 'coach123',
    gymSecretCode: 'PK-8820',
    logoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=200&q=80',
    primaryColor: '#059669',
    planTier: 'PRO',
    status: 'ACTIVE',
    branchesCount: 2,
    activeMembersCount: 1190,
    mrrEgp: 690000,
    cityEn: 'New Cairo, Egypt',
    cityAr: 'التجمع الخامس، القاهرة',
  },
];

const INITIAL_AUDITS: AuditEntry[] = [
  {
    id: 'aud-1',
    timestamp: '2026-10-27 09:42:11',
    actorEmail: 'owner@titanfit.eg',
    actorRole: 'GYM_OWNER',
    action: 'SUBSCRIPTION_PAYMENT_RECORDED',
    target: 'INV-2026-8841 (EGP 13,224 via InstaPay)',
    ipAddress: '197.55.142.18',
    tenantSlug: 'titanfit-egypt',
  },
];

export interface PlatformStoreContextValue {
  locale: SupportedLocale;
  setLocale: (l: SupportedLocale) => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  activeSection: WorkspaceSection;
  setActiveSection: (s: WorkspaceSection) => void;
  activeRole: UserRoleKey;
  setActiveRole: (r: UserRoleKey) => void;
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  branches: BranchItem[];
  members: MemberItem[];
  plans: PlanItem[];
  invoices: InvoiceItem[];
  classes: ClassSessionItem[];
  accessLogs: AccessLogItem[];
  posProducts: PosProductItem[];
  staff: StaffMemberItem[];
  workoutLogs: WorkoutLogEntry[];
  chatMessages: ChatMessageItem[];
  tenants: TenantSaaSItem[];
  auditLogs: AuditEntry[];
  impersonatedTenant: string | null;
  setImpersonatedTenant: (slug: string | null) => void;
  brandAccentHex: string;
  setBrandAccentHex: (hex: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  // Auth & Multi-Tenant State
  isAuthenticated: boolean;
  currentUser: {
    email: string;
    name: string;
    role: UserRoleKey;
    tenantSlug?: string;
    logoUrl?: string;
    primaryColor?: string;
  } | null;
  activeTenantCustom: TenantSaaSItem | null;
  login: (
    email: string,
    password?: string,
    gymSecretCode?: string,
  ) => { success: boolean; role?: UserRoleKey; tenant?: TenantSaaSItem; message?: string };
  loginWithGymCode: (gymSecretCode: string) => { success: boolean; role?: UserRoleKey; tenant?: TenantSaaSItem; message?: string };
  logout: () => void;
  // Actions
  addMember: (data: {
    fullNameEn: string;
    fullNameAr: string;
    phone: string;
    email: string;
    gender: 'MALE' | 'FEMALE';
    planId: string;
    branchId: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    bloodType: string;
    medicalConditions: string;
  }) => void;
  toggleMemberFreeze: (memberId: string, freezeDays?: number) => void;
  createInvoicePayment: (data: {
    memberId: string;
    planId: string;
    method: InvoiceItem['method'];
    couponCode?: string;
    referenceCode?: string;
  }) => InvoiceItem;
  refundInvoice: (invoiceId: string) => void;
  createPlan: (data: {
    nameEn: string;
    nameAr: string;
    type: PlanItem['type'];
    durationDays: number;
    priceEgp: number;
    maxFreezeDays: number;
  }) => void;
  createClassSession: (data: {
    titleEn: string;
    titleAr: string;
    category: ClassSessionItem['category'];
    trainerEn: string;
    roomEn: string;
    timeRange: string;
    capacity: number;
  }) => void;
  cancelAndPromoteWaitlist: (classId: string) => string;
  bookMemberIntoClass: (classId: string, memberId: string) => void;
  simulateGateScan: (memberId: string, gateNameEn: string, gateNameAr: string) => AccessLogItem;
  completePosCheckout: (
    cart: Array<{ productId: string; qty: number }>,
    method: InvoiceItem['method'],
    memberId?: string,
  ) => void;
  logWorkoutSet: (exerciseEn: string, exerciseAr: string, weightKg: number, reps: number, sets: number) => WorkoutLogEntry;
  sendChatMessage: (text: string, senderRole?: 'TRAINER' | 'MEMBER') => void;
  addTenant: (
    nameEn: string,
    nameAr: string,
    ownerEmail: string,
    planTier: TenantSaaSItem['planTier'],
    cityEn: string,
    password?: string,
    logoUrl?: string,
    primaryColor?: string,
    slugCustom?: string,
    gymSecretCodeCustom?: string,
  ) => TenantSaaSItem;
  toggleTenantStatus: (tenantId: string) => void;
}

const PlatformContext = createContext<PlatformStoreContextValue | null>(null);

export function PlatformProvider({
  children,
  initialLocale = 'ar',
}: {
  children: React.ReactNode;
  initialLocale?: SupportedLocale;
}) {
  const [locale, setLocale] = useState<SupportedLocale>(initialLocale);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('PUBLIC_STOREFRONT');
  const [activeRole, setActiveRole] = useState<UserRoleKey>('GYM_OWNER');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [branches] = useState<BranchItem[]>(INITIAL_BRANCHES);
  const [members, setMembers] = useState<MemberItem[]>(INITIAL_MEMBERS);
  const [plans, setPlans] = useState<PlanItem[]>(INITIAL_PLANS);
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [classes, setClasses] = useState<ClassSessionItem[]>(INITIAL_CLASSES);
  const [accessLogs, setAccessLogs] = useState<AccessLogItem[]>(INITIAL_ACCESS_LOGS);
  const [posProducts, setPosProducts] = useState<PosProductItem[]>(INITIAL_POS_PRODUCTS);
  const [staff] = useState<StaffMemberItem[]>(INITIAL_STAFF);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogEntry[]>(INITIAL_WORKOUT_LOGS);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>(INITIAL_CHAT);
  const [tenants, setTenants] = useState<TenantSaaSItem[]>(INITIAL_TENANTS);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(INITIAL_AUDITS);
  const [impersonatedTenant, setImpersonatedTenantState] = useState<string | null>(null);
  const [brandAccentHex, setBrandAccentHex] = useState<string>('#D4AF37');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication & Custom Tenant Branding State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    name: string;
    role: UserRoleKey;
    tenantSlug?: string;
    logoUrl?: string;
    primaryColor?: string;
  } | null>(null);

  const activeTenantCustom =
    tenants.find((t) => t.slug === (currentUser?.tenantSlug || impersonatedTenant)) ?? null;

  const login: PlatformStoreContextValue['login'] = (email, password, gymSecretCode) => {
    const trimmed = email.trim().toLowerCase();

    // 1. Check Super Admin (noureldin / 010023 or admin@titanfit.com / admin123)
    const cleanPass = (password || '').trim();

    // 1. Check if SaaS Super Admin (Captain Nour El-Din) - strictly requires correct credentials
    if (
      (trimmed === 'noureldin' && cleanPass === '010023') ||
      (trimmed === 'admin@titanfit.com' && cleanPass === 'admin123')
    ) {
      const user = {
        email: trimmed === 'noureldin' ? 'noureldin@titanfit.com' : trimmed,
        name: locale === 'ar' ? 'كابتن نور الدين (مالك المنصة)' : 'Capt. Nour El-Din (Super Admin)',
        role: 'SUPER_ADMIN' as UserRoleKey,
        logoUrl: '/brand/logo.png',
        primaryColor: '#D97706',
      };
      setIsAuthenticated(true);
      setCurrentUser(user);
      setActiveRole('SUPER_ADMIN');
      setActiveSection('SUPER_ADMIN');
      setBrandAccentHex('#D97706');
      appendAudit('SUPER_ADMIN_LOGIN', 'Full SaaS Control Plane access granted to Nour El-Din');
      showToast(
        locale === 'ar'
          ? 'مرحباً بك يا كابتن نور الدين! تم فتح لوحة تحكم المنصة والـ SaaS بالكامل 👑'
          : 'Welcome Capt. Nour El-Din! Full SaaS Control Plane Unlocked 👑',
      );
      return { success: true, role: 'SUPER_ADMIN' };
    }

    // 2. Check if Trainee logging in via Gym Secret PIN / Code
    const targetCode = gymSecretCode || (trimmed.startsWith('tf-') || trimmed.startsWith('pk-') ? trimmed : '');
    if (targetCode) {
      const gymMatch = tenants.find((t) => t.gymSecretCode.toLowerCase() === targetCode.toLowerCase());
      if (gymMatch) {
        return loginWithGymCode(gymMatch.gymSecretCode);
      }
    }

    // 3. Check if registered Tenant Gym Owner with REAL credentials
    const tenantMatch = tenants.find(
      (t) => t.ownerEmail.toLowerCase() === trimmed || t.slug.toLowerCase() === trimmed,
    );

    if (tenantMatch) {
      const expectedPassword = tenantMatch.password || 'coach123';
      if (!cleanPass || cleanPass !== expectedPassword) {
        return {
          success: false,
          message:
            locale === 'ar'
              ? 'كلمة المرور غير صحيحة لحساب هذا النادي. يرجى التأكد من كلمة المرور المسلمة لك من إدارة المنصة.'
              : 'Invalid password for this gym account. Please check your credentials provided by platform administration.',
        };
      }
      const user = {
        email: tenantMatch.ownerEmail,
        name: locale === 'ar' ? tenantMatch.nameAr : tenantMatch.nameEn,
        role: 'GYM_OWNER' as UserRoleKey,
        tenantSlug: tenantMatch.slug,
        logoUrl: tenantMatch.logoUrl || '/brand/logo.png',
        primaryColor: tenantMatch.primaryColor || '#059669',
      };
      setIsAuthenticated(true);
      setCurrentUser(user);
      setActiveRole('GYM_OWNER');
      setActiveSection('OVERVIEW');
      if (tenantMatch.primaryColor) setBrandAccentHex(tenantMatch.primaryColor);
      appendAudit('TENANT_OWNER_LOGIN', `Tenant logged in: ${tenantMatch.slug}`);
      showToast(
        locale === 'ar'
          ? `مرحباً بك في لوحة تحكم نادي "${tenantMatch.nameAr}"!`
          : `Welcome to ${tenantMatch.nameEn} Dashboard!`,
      );
      return { success: true, role: 'GYM_OWNER', tenant: tenantMatch };
    }

    // 4. Any other credentials are STRICTLY REJECTED — NO loose fallback login
    return {
      success: false,
      message:
        locale === 'ar'
          ? 'بيانات تسجيل الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور المسلمة لك من إدارة المنصة.'
          : 'Invalid login credentials. Please verify your email and password provided by platform administration.',
    };
  };

  const loginWithGymCode: PlatformStoreContextValue['loginWithGymCode'] = (code) => {
    const trimmed = code.trim().toUpperCase();
    const gymMatch = tenants.find((t) => t.gymSecretCode.toUpperCase() === trimmed);
    if (!gymMatch) {
      return {
        success: false,
        message:
          locale === 'ar'
            ? `الرقم السري "${code}" غير صحيح. يرجى مراجعة إدارة ناديك للحصول على كود الجيم الصحيح.`
            : `Gym Secret Code "${code}" is invalid. Please contact your gym management.`,
      };
    }

    const memberUser = {
      email: `member@${gymMatch.slug}.app`,
      name: locale === 'ar' ? `متدرب (${gymMatch.nameAr})` : `Member (${gymMatch.nameEn})`,
      role: 'MEMBER' as UserRoleKey,
      tenantSlug: gymMatch.slug,
      logoUrl: gymMatch.logoUrl || '/brand/logo.png',
      primaryColor: gymMatch.primaryColor || '#059669',
    };
    setIsAuthenticated(true);
    setCurrentUser(memberUser);
    setActiveRole('MEMBER');
    setActiveSection('MEMBER_PWA');
    if (gymMatch.primaryColor) setBrandAccentHex(gymMatch.primaryColor);
    appendAudit('MEMBER_GYM_CODE_LOGIN', `Trainee entered via gym code: ${trimmed} (${gymMatch.slug})`);
    showToast(
      locale === 'ar'
        ? `🎉 مرحباً بك في نادي "${gymMatch.nameAr}"! تم فتح تطبيق المتدرب وجداول التمارين والأنظمة الغذائية الخاصة بناديك 🏋️‍♂️`
        : `🎉 Welcome to ${gymMatch.nameEn}! Your Member Portal is unlocked.`,
    );
    return { success: true, role: 'MEMBER', tenant: gymMatch };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setImpersonatedTenantState(null);
    setActiveSection('PUBLIC_STOREFRONT');
    setActiveRole('GYM_OWNER');
    setBrandAccentHex('#D4AF37');
    showToast(
      locale === 'ar'
        ? 'تم تسجيل الخروج بنجاح والعودة للموقع الرئيسي'
        : 'Logged out successfully',
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const appendAudit = (action: string, target: string) => {
    const newAudit: AuditEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorEmail:
        activeRole === 'SUPER_ADMIN'
          ? 'platform@titanfit.io'
          : activeRole === 'GYM_OWNER'
            ? 'owner@titanfit.eg'
            : 'staff@titanfit.eg',
      actorRole: activeRole,
      action,
      target,
      ipAddress: '197.55.142.18',
      tenantSlug: impersonatedTenant ?? 'titanfit-egypt',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  const setImpersonatedTenant = (slug: string | null) => {
    setImpersonatedTenantState(slug);
    if (slug) {
      appendAudit('SUPER_ADMIN_IMPERSONATION_START', `Impersonated tenant: ${slug}`);
      showToast(
        locale === 'ar'
          ? `تم تفعيل وضع الدعم المسجل للمستأجر: ${slug}`
          : `Audited impersonation active for tenant: ${slug}`,
      );
    } else {
      appendAudit('SUPER_ADMIN_IMPERSONATION_END', 'Ended tenant impersonation');
    }
  };

  const addMember: PlatformStoreContextValue['addMember'] = (data) => {
    const plan = plans.find((p) => p.id === data.planId) ?? plans[0]!;
    const code = `TF-2026-${1006 + members.length}`;
    const initials = data.fullNameEn
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const newMember: MemberItem = {
      id: `mem-${Date.now()}`,
      code,
      fullNameEn: data.fullNameEn,
      fullNameAr: data.fullNameAr || data.fullNameEn,
      phone: data.phone,
      email: data.email,
      gender: data.gender,
      branchId: data.branchId === 'ALL' ? 'br-new-cairo' : data.branchId,
      status: 'ACTIVE',
      planNameEn: plan.nameEn,
      planNameAr: plan.nameAr,
      planId: plan.id,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + plan.durationDays * 86400000).toISOString().slice(0, 10),
      remainingSessions: plan.sessionsCount,
      freezeDaysRemaining: plan.maxFreezeDays,
      tags: ['New Member', 'AES-256 Vault'],
      emergencyContactName: data.emergencyContactName || 'On File',
      emergencyContactPhone: data.emergencyContactPhone || '+201000000000',
      bloodType: data.bloodType || 'O+',
      medicalConditions: data.medicalConditions || 'None',
      injuries: 'None',
      assignedTrainerEn: 'Coach Omar Hassan',
      assignedTrainerAr: 'كابتن عمر حسن',
      checkInsCount: 1,
      lastCheckIn: 'Just now',
      avatarInitials: initials || 'TF',
      streakDays: 1,
      points: 250,
    };
    setMembers((prev) => [newMember, ...prev]);
    appendAudit('MEMBER_CREATED_WITH_ENCRYPTED_HEALTH_VAULT', `${code} (${data.fullNameEn})`);
    showToast(
      locale === 'ar'
        ? `تم تسجيل العضو ${newMember.fullNameAr} بنجاح برقم ${code}`
        : `Member ${newMember.fullNameEn} registered with ID ${code}`,
    );
  };

  const toggleMemberFreeze = (memberId: string, freezeDays = 14) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const nextStatus = m.status === 'FROZEN' ? 'ACTIVE' : 'FROZEN';
        const currentEnd = new Date(m.endDate).getTime();
        const extendedEnd =
          nextStatus === 'FROZEN'
            ? new Date(currentEnd + freezeDays * 86400000).toISOString().slice(0, 10)
            : m.endDate;
        appendAudit(
          nextStatus === 'FROZEN' ? 'SUBSCRIPTION_FROZEN' : 'SUBSCRIPTION_UNFROZEN',
          `${m.code} — New expiry: ${extendedEnd}`,
        );
        showToast(
          locale === 'ar'
            ? nextStatus === 'FROZEN'
              ? `تم تجميد اشتراك ${m.fullNameAr} وتمديد الانتهاء إلى ${extendedEnd}`
              : `تم إعادة تفعيل اشتراك ${m.fullNameAr}`
            : nextStatus === 'FROZEN'
              ? `Frozen ${m.fullNameEn} subscription; expiry extended to ${extendedEnd}`
              : `Unfrozen ${m.fullNameEn} subscription`,
        );
        return {
          ...m,
          status: nextStatus,
          endDate: extendedEnd,
          freezeDaysRemaining:
            nextStatus === 'FROZEN'
              ? Math.max(0, m.freezeDaysRemaining - freezeDays)
              : m.freezeDaysRemaining,
        };
      }),
    );
  };

  const createInvoicePayment: PlatformStoreContextValue['createInvoicePayment'] = (data) => {
    const member = members.find((m) => m.id === data.memberId) ?? members[0]!;
    const plan = plans.find((p) => p.id === data.planId) ?? plans[0]!;
    const couponUpper = (data.couponCode ?? '').trim().toUpperCase();
    const discountRate =
      couponUpper === 'RAMADAN20'
        ? 0.2
        : couponUpper === 'TITAN15'
          ? 0.15
          : couponUpper === 'CORPORATE25'
            ? 0.25
            : 0;
    const subtotalEgp = plan.priceEgp;
    const discountEgp = Math.round(subtotalEgp * discountRate);
    const netEgp = subtotalEgp - discountEgp;
    const vatEgp = Math.round(netEgp * 0.14);
    const totalEgp = netEgp + vatEgp;
    const invoiceNumber = `INV-2026-${8844 + invoices.length}`;

    const newInvoice: InvoiceItem = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      memberId: member.id,
      memberNameEn: member.fullNameEn,
      memberNameAr: member.fullNameAr,
      planNameEn: plan.nameEn,
      planNameAr: plan.nameAr,
      subtotalEgp,
      discountEgp,
      vatEgp,
      totalEgp,
      method: data.method,
      referenceCode: data.referenceCode || `${data.method.slice(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'PAID',
      createdAt: 'Just now',
      branchId: member.branchId,
      cashierName: 'TitanFit Cashier POS',
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setMembers((prev) =>
      prev.map((m) =>
        m.id === member.id
          ? {
              ...m,
              status: 'ACTIVE',
              planId: plan.id,
              planNameEn: plan.nameEn,
              planNameAr: plan.nameAr,
              endDate: new Date(Date.now() + plan.durationDays * 86400000).toISOString().slice(0, 10),
            }
          : m,
      ),
    );
    appendAudit('INVOICE_ISSUED_AND_PAID', `${invoiceNumber} (${totalEgp} EGP via ${data.method})`);
    showToast(
      locale === 'ar'
        ? `تم إصدار الفاتورة الضريبية ${invoiceNumber} بمبلغ ${totalEgp.toLocaleString('ar-EG')} ج.م`
        : `Issued Tax Invoice ${invoiceNumber} for EGP ${totalEgp.toLocaleString()}`,
    );
    return newInvoice;
  };

  const refundInvoice = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        appendAudit('INVOICE_REFUNDED', `${inv.invoiceNumber} (${inv.totalEgp} EGP)`);
        showToast(
          locale === 'ar'
            ? `تم استرداد الفاتورة ${inv.invoiceNumber} بنجاح`
            : `Refunded invoice ${inv.invoiceNumber}`,
        );
        return { ...inv, status: 'REFUNDED' };
      }),
    );
  };

  const createPlan: PlatformStoreContextValue['createPlan'] = (data) => {
    const newPlan: PlanItem = {
      id: `plan-${Date.now()}`,
      code: `TITAN-${data.type.slice(0, 3)}-${data.durationDays}D`,
      nameEn: data.nameEn,
      nameAr: data.nameAr || data.nameEn,
      type: data.type,
      durationDays: data.durationDays,
      priceEgp: data.priceEgp,
      sessionsCount: data.type === 'SESSION_PACK' ? 20 : null,
      maxFreezeDays: data.maxFreezeDays,
      gracePeriodDays: 5,
      activeSubscribers: 1,
    };
    setPlans((prev) => [newPlan, ...prev]);
    appendAudit('SUBSCRIPTION_PLAN_CREATED', `${newPlan.code} (${newPlan.priceEgp} EGP)`);
    showToast(
      locale === 'ar'
        ? `تمت إضافة باقة الاشتراك "${newPlan.nameAr}" بنجاح`
        : `Created subscription plan "${newPlan.nameEn}"`,
    );
  };

  const createClassSession: PlatformStoreContextValue['createClassSession'] = (data) => {
    const newCls: ClassSessionItem = {
      id: `cls-${Date.now()}`,
      titleEn: data.titleEn,
      titleAr: data.titleAr || data.titleEn,
      category: data.category,
      trainerEn: data.trainerEn,
      trainerAr: data.trainerEn,
      roomEn: data.roomEn,
      roomAr: data.roomEn,
      branchId: selectedBranchId === 'ALL' ? 'br-new-cairo' : selectedBranchId,
      dayEn: 'Today',
      dayAr: 'اليوم',
      timeRange: data.timeRange,
      capacity: data.capacity,
      bookedMembers: [],
      waitlistMembers: [],
    };
    setClasses((prev) => [newCls, ...prev]);
    appendAudit('CLASS_SCHEDULE_CREATED', `${newCls.titleEn} (${newCls.timeRange})`);
    showToast(
      locale === 'ar'
        ? `تمت جدولة حصة "${newCls.titleAr}" بنجاح`
        : `Scheduled class "${newCls.titleEn}"`,
    );
  };

  const cancelAndPromoteWaitlist = (classId: string): string => {
    let message = '';
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id !== classId) return cls;
        const remainingBooked = cls.bookedMembers.slice(0, -1);
        const promoted = cls.waitlistMembers[0];
        const remainingWaitlist = cls.waitlistMembers.slice(1);
        if (promoted) {
          remainingBooked.push({
            id: promoted.id,
            nameEn: promoted.nameEn,
            nameAr: promoted.nameAr,
            status: 'BOOKED',
          });
          message =
            locale === 'ar'
              ? `تمت ترقية ${promoted.nameAr} تلقائياً من قائمة الانتظار إلى مؤكد (BOOKED) وإرسال إشعار واتساب!`
              : `Waitlist #1 (${promoted.nameEn}) automatically promoted to BOOKED and notified via WhatsApp!`;
        } else {
          message =
            locale === 'ar'
              ? 'تم إلغاء آخر حجز وإتاحة المقعد فوراً.'
              : 'Cancelled booking and freed 1 spot.';
        }
        return {
          ...cls,
          bookedMembers: remainingBooked,
          waitlistMembers: remainingWaitlist,
        };
      }),
    );
    appendAudit('CLASS_WAITLIST_AUTO_PROMOTED', `Class ${classId}`);
    if (message) showToast(message);
    return message;
  };

  const bookMemberIntoClass = (classId: string, memberId: string) => {
    const member = members.find((m) => m.id === memberId) ?? members[0]!;
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id !== classId) return cls;
        if (cls.bookedMembers.some((b) => b.id === member.id)) return cls;
        if (cls.bookedMembers.length >= cls.capacity) {
          return {
            ...cls,
            waitlistMembers: [
              ...cls.waitlistMembers,
              {
                id: member.id,
                nameEn: member.fullNameEn,
                nameAr: member.fullNameAr,
                joinedAt: 'Just now',
              },
            ],
          };
        }
        return {
          ...cls,
          bookedMembers: [
            ...cls.bookedMembers,
            {
              id: member.id,
              nameEn: member.fullNameEn,
              nameAr: member.fullNameAr,
              status: 'BOOKED',
            },
          ],
        };
      }),
    );
    showToast(
      locale === 'ar'
        ? `تم تسجيل حجز ${member.fullNameAr} في الحصة بنجاح`
        : `Booked ${member.fullNameEn} into class`,
    );
  };

  const simulateGateScan = (
    memberId: string,
    gateNameEn: string,
    gateNameAr: string,
  ): AccessLogItem => {
    const member = members.find((m) => m.id === memberId) ?? members[0]!;
    let decision: AccessLogItem['decision'] = 'ALLOW_ACCESS';
    let reasonEn = `Valid rotating HMAC-SHA256 QR token — ${member.planNameEn}`;
    let reasonAr = `رمز QR مشفر صالح — ${member.planNameAr}`;
    let relayPulseMs = 1500;

    if (member.status === 'EXPIRED') {
      decision = 'DENY_EXPIRED';
      reasonEn = `Subscription expired on ${member.endDate} — Gate locked`;
      reasonAr = `انتهى الاشتراك بتاريخ ${member.endDate} — البوابة مغلقة`;
      relayPulseMs = 0;
    } else if (member.status === 'FROZEN') {
      decision = 'DENY_FROZEN';
      reasonEn = `Membership is currently FROZEN — Unfreeze required at Reception`;
      reasonAr = `الاشتراك مجمد حالياً — يرجى فك التجميد من الاستقبال`;
      relayPulseMs = 0;
    }

    const logItem: AccessLogItem = {
      id: `acc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      memberCode: member.code,
      memberNameEn: member.fullNameEn,
      memberNameAr: member.fullNameAr,
      gateNameEn,
      gateNameAr,
      method: 'QR_ROTATING_HMAC',
      decision,
      reasonEn,
      reasonAr,
      relayPulseMs,
    };

    setAccessLogs((prev) => [logItem, ...prev]);
    if (decision === 'ALLOW_ACCESS') {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id
            ? { ...m, checkInsCount: m.checkInsCount + 1, lastCheckIn: 'Just now' }
            : m,
        ),
      );
    }
    appendAudit('TURNSTILE_ACCESS_DECISION', `${member.code}: ${decision} (${gateNameEn})`);
    showToast(
      decision === 'ALLOW_ACCESS'
        ? locale === 'ar'
          ? `✅ تم فتح البوابة (${gateNameAr}) للعضو ${member.fullNameAr} (نبضة 1500ms)`
          : `✅ Gate opened (${gateNameEn}) for ${member.fullNameEn} (1500ms pulse)`
        : locale === 'ar'
          ? `⛔ تم رفض الدخول للعضو ${member.fullNameAr}: ${reasonAr}`
          : `⛔ Access Denied for ${member.fullNameEn}: ${reasonEn}`,
    );
    return logItem;
  };

  const completePosCheckout: PlatformStoreContextValue['completePosCheckout'] = (
    cart,
    method,
    memberId,
  ) => {
    const member = members.find((m) => m.id === memberId) ?? members[0]!;
    let subtotalEgp = 0;
    const itemNamesEn: string[] = [];
    const itemNamesAr: string[] = [];

    setPosProducts((prev) =>
      prev.map((prod) => {
        const line = cart.find((c) => c.productId === prod.id);
        if (!line) return prod;
        subtotalEgp += prod.priceEgp * line.qty;
        itemNamesEn.push(`${line.qty}x ${prod.nameEn}`);
        itemNamesAr.push(`${line.qty}× ${prod.nameAr}`);
        return { ...prod, stock: Math.max(0, prod.stock - line.qty) };
      }),
    );

    const vatEgp = Math.round(subtotalEgp * 0.14);
    const totalEgp = subtotalEgp + vatEgp;
    const invoiceNumber = `POS-2026-${9100 + invoices.length}`;

    const newInvoice: InvoiceItem = {
      id: `inv-pos-${Date.now()}`,
      invoiceNumber,
      memberId: member.id,
      memberNameEn: member.fullNameEn,
      memberNameAr: member.fullNameAr,
      planNameEn: `POS Bar: ${itemNamesEn.join(', ') || 'Supplements'}`,
      planNameAr: `مبيعات البار: ${itemNamesAr.join('، ') || 'مكملات غذائية'}`,
      subtotalEgp,
      discountEgp: 0,
      vatEgp,
      totalEgp,
      method,
      referenceCode: `POS-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'PAID',
      createdAt: 'Just now',
      branchId: selectedBranchId === 'ALL' ? 'br-new-cairo' : selectedBranchId,
      cashierName: 'Supplement Bar POS #1',
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    appendAudit('POS_SALE_COMPLETED', `${invoiceNumber} (${totalEgp} EGP via ${method})`);
    showToast(
      locale === 'ar'
        ? `تم إتمام عملية بيع الكاشير ${invoiceNumber} بمبلغ ${totalEgp} ج.م وخصم المخزون`
        : `POS Sale ${invoiceNumber} completed (EGP ${totalEgp}) and stock updated`,
    );
  };

  const logWorkoutSet: PlatformStoreContextValue['logWorkoutSet'] = (
    exerciseEn,
    exerciseAr,
    weightKg,
    reps,
    sets,
  ) => {
    const estimated1RmKg = Math.round(weightKg * (1 + reps / 30) * 10) / 10;
    const previousBest = workoutLogs
      .filter((w) => w.exerciseEn.toLowerCase() === exerciseEn.toLowerCase())
      .reduce((max, w) => Math.max(max, w.estimated1RmKg), 0);
    const isNewPr = estimated1RmKg > previousBest;

    const entry: WorkoutLogEntry = {
      id: `wk-${Date.now()}`,
      exerciseEn,
      exerciseAr: exerciseAr || exerciseEn,
      weightKg,
      reps,
      sets,
      estimated1RmKg,
      isNewPr,
      loggedAt: 'Just now',
    };
    setWorkoutLogs((prev) => [entry, ...prev]);
    showToast(
      isNewPr
        ? locale === 'ar'
          ? `🏆 رقم قياسي شخصي جديد (NEW PR)! ${exerciseAr}: أقصى وزن تقديري ${estimated1RmKg} كجم`
          : `🏆 NEW PERSONAL RECORD! ${exerciseEn}: Est. 1RM ${estimated1RmKg} kg`
        : locale === 'ar'
          ? `تم تسجيل التمرين: ${exerciseAr} (${weightKg} كجم × ${reps} عدات)`
          : `Logged workout set: ${exerciseEn} (${weightKg} kg × ${reps} reps)`,
    );
    return entry;
  };

  const sendChatMessage = (text: string, senderRole: 'TRAINER' | 'MEMBER' = 'MEMBER') => {
    if (!text.trim()) return;
    const newMsg: ChatMessageItem = {
      id: `msg-${Date.now()}`,
      senderRole,
      senderNameEn: senderRole === 'TRAINER' ? 'Coach Omar Hassan' : 'Youssef El-Masry',
      senderNameAr: senderRole === 'TRAINER' ? 'كابتن عمر حسن' : 'يوسف المصري',
      textEn: text,
      textAr: text,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const addTenant: PlatformStoreContextValue['addTenant'] = (
    nameEn,
    nameAr,
    ownerEmail,
    planTier,
    cityEn,
    password,
    logoUrl,
    primaryColor,
    slugCustom,
    gymSecretCodeCustom,
  ) => {
    const slug = slugCustom || nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cleanPrefix = (slug.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'GYM');
    const secretCode = gymSecretCodeCustom?.trim().toUpperCase() || `${cleanPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTen: TenantSaaSItem = {
      id: `ten-${Date.now()}`,
      slug,
      nameEn,
      nameAr: nameAr || nameEn,
      ownerEmail,
      password: password || 'pass123',
      gymSecretCode: secretCode,
      logoUrl: logoUrl || '/brand/logo.png',
      primaryColor: primaryColor || '#059669',
      planTier,
      status: 'ACTIVE',
      branchesCount: 1,
      activeMembersCount: 25,
      mrrEgp: planTier === 'ENTERPRISE' ? 950000 : planTier === 'PRO' ? 420000 : 150000,
      cityEn: cityEn || 'Cairo, Egypt',
      cityAr: cityEn || 'القاهرة، مصر',
    };
    setTenants((prev) => [newTen, ...prev]);
    appendAudit('SAAS_TENANT_PROVISIONED', `${slug} (${planTier}) with gym code ${secretCode}`);
    showToast(
      locale === 'ar'
        ? `🎉 تم إنشاء حساب النادي "${newTen.nameAr}" بنجاح! كود المتدربين: ${newTen.gymSecretCode} • كلمة المرور: ${newTen.password}`
        : `🎉 Created tenant "${newTen.nameEn}"! Gym Code: ${newTen.gymSecretCode} • Password: ${newTen.password}`,
    );
    return newTen;
  };

  const toggleTenantStatus = (tenantId: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id !== tenantId) return t;
        const nextStatus = t.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
        appendAudit('SAAS_TENANT_STATUS_CHANGED', `${t.slug} -> ${nextStatus}`);
        return { ...t, status: nextStatus };
      }),
    );
  };

  return (
    <PlatformContext.Provider
      value={{
        locale,
        setLocale,
        theme,
        setTheme,
        activeSection,
        setActiveSection,
        activeRole,
        setActiveRole,
        selectedBranchId,
        setSelectedBranchId,
        branches,
        members,
        plans,
        invoices,
        classes,
        accessLogs,
        posProducts,
        staff,
        workoutLogs,
        chatMessages,
        tenants,
        auditLogs,
        impersonatedTenant,
        setImpersonatedTenant,
        brandAccentHex,
        setBrandAccentHex,
        toastMessage,
        showToast,
        isAuthenticated,
        currentUser,
        activeTenantCustom,
        login,
        loginWithGymCode,
        logout,
        addMember,
        toggleMemberFreeze,
        createInvoicePayment,
        refundInvoice,
        createPlan,
        createClassSession,
        cancelAndPromoteWaitlist,
        bookMemberIntoClass,
        simulateGateScan,
        completePosCheckout,
        logWorkoutSet,
        sendChatMessage,
        addTenant,
        toggleTenantStatus,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatformStore() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatformStore must be used inside PlatformProvider');
  return ctx;
}
