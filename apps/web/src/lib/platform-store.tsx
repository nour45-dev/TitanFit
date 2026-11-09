'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { SupportedLocale } from '@gymos/config';
import {
  apiLogin,
  apiLogout,
  apiGetMe,
  apiRevokeSessions,
  apiFetchSyncState,
  apiPushSyncAction,
  apiRequestOtp,
  apiVerifyOtp,
} from './api-client';

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
  | 'CONTENT_LIBRARY'
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
  tempPassword?: string;
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
  assignedTrainerId?: string;
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
  whatsappNumber?: string;
  activeClients: number;
  commissionRatePercent: number;
  monthlyRevenueEgp: number;
  baseSalaryEgp?: number;
  ptSessionRateEgp?: number;
  totalPayoutsEgp?: number;
  rating: number;
  shiftEn: string;
  shiftAr: string;
  bioAr?: string;
  bioEn?: string;
  avatarUrl?: string;
}

export interface TrainerPayoutTransaction {
  id: string;
  trainerId: string;
  trainerNameAr: string;
  trainerNameEn: string;
  amountEgp: number;
  payoutType: 'SALARY' | 'COMMISSION' | 'BONUS';
  date: string;
  note: string;
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
  memberId?: string;
  trainerId?: string;
}

export interface TenantSaaSItem {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  ownerEmail: string;
  authVerifier?: string;
  gymSecretCode?: string;
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
    tempPassword: 'TF@2026',
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
    assignedTrainerId: 'stf-1',
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
    specialtyEn: 'Head Strength & Conditioning Lead (CSCS)',
    specialtyAr: 'كبير مدربي القوة والتكييف البدني وبناء الأجسام (CSCS)',
    branchId: 'br-new-cairo',
    phone: '+201005551122',
    whatsappNumber: '201005551122',
    activeClients: 28,
    commissionRatePercent: 35,
    monthlyRevenueEgp: 112000,
    baseSalaryEgp: 12000,
    ptSessionRateEgp: 450,
    totalPayoutsEgp: 39200,
    rating: 4.95,
    shiftEn: '06:00 AM – 03:00 PM',
    shiftAr: '٠٦:٠٠ ص – ٠٣:٠٠ م',
    bioAr: 'خبرة ١٠ سنوات في تدريب كبار الرياضيين وتأهيل بطولات كمال الأجسام والفيزيك مع برامج مخصصة للماكروز.',
    bioEn: '10+ years coaching elite athletes, hypertrophy and powerlifting with custom macro programming.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'stf-2',
    nameEn: 'Coach Sarah Ahmed',
    nameAr: 'كابتن سارة أحمد',
    role: 'TRAINER',
    specialtyEn: 'Clinical Sports Nutritionist & Women Fitness Specialist',
    specialtyAr: 'أخصائية التغذية العلاجية ونحت القوام ولياقة السيدات',
    branchId: 'br-new-cairo',
    phone: '+201007773344',
    whatsappNumber: '201007773344',
    activeClients: 34,
    commissionRatePercent: 40,
    monthlyRevenueEgp: 136000,
    baseSalaryEgp: 13500,
    ptSessionRateEgp: 500,
    totalPayoutsEgp: 54400,
    rating: 4.98,
    shiftEn: '09:00 AM – 05:00 PM',
    shiftAr: '٠٩:٠٠ ص – ٠٥:٠٠ م',
    bioAr: 'ماجستير التغذية الرياضية، متخصصة في خسارة الدهون العنيدة، تصحيح الهرمونات، وبرامج ما بعد الحمل.',
    bioEn: 'M.Sc. Sports Nutrition, fat loss and body contouring specialist with individualized meal plans.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'stf-3',
    nameEn: 'Coach Tarek El-Shazly',
    nameAr: 'كابتن طارق الشاذلي',
    role: 'TRAINER',
    specialtyEn: 'Powerlifting, Functional Mobility & Injury Rehab',
    specialtyAr: 'مدرب القوة البدنية، الموبيليتي وتأهيل إصابات المفاصل',
    branchId: 'br-zayed',
    phone: '+201008882211',
    whatsappNumber: '201008882211',
    activeClients: 22,
    commissionRatePercent: 30,
    monthlyRevenueEgp: 88000,
    baseSalaryEgp: 10000,
    ptSessionRateEgp: 400,
    totalPayoutsEgp: 26400,
    rating: 4.91,
    shiftEn: '01:00 PM – 10:00 PM',
    shiftAr: '٠١:٠٠ م – ١٠:٠٠ م',
    bioAr: 'بطل جمهورية سابق في رفع الأثقال، معتمد دولياً في تصحيح المسار الحركي والتعافي من تمزقات الأوتار.',
    bioEn: 'Former national powerlifter, certified in biomechanical correction and tendon rehabilitation.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
];

const INITIAL_TRAINER_PAYOUTS: TrainerPayoutTransaction[] = [
  {
    id: 'pay-1',
    trainerId: 'stf-1',
    trainerNameAr: 'كابتن عمر حسن',
    trainerNameEn: 'Coach Omar Hassan',
    amountEgp: 39200,
    payoutType: 'COMMISSION',
    date: '2026-11-01',
    note: 'صرف عمولة شهر أكتوبر (35% من مبيعات 112,000 ج.م)',
  },
  {
    id: 'pay-2',
    trainerId: 'stf-2',
    trainerNameAr: 'كابتن سارة أحمد',
    trainerNameEn: 'Coach Sarah Ahmed',
    amountEgp: 54400,
    payoutType: 'COMMISSION',
    date: '2026-11-01',
    note: 'صرف عمولة شهر أكتوبر (40% من مبيعات 136,000 ج.م)',
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

export interface CustomWorkoutVideoItem {
  id: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  levelAr: string;
  levelEn: string;
  durationMin: number;
  kcalBurn: number;
  coachAr: string;
  coachEn: string;
  videoSourceType: 'BUILTIN_ANIMATION' | 'VIDEO_URL' | 'UPLOADED_FILE';
  videoUrl: string;
  thumbnailUrl: string;
  motionType:
    | 'BENCH_PRESS'
    | 'INCLINE_PRESS'
    | 'CABLE_FLY'
    | 'LATERAL_RAISE'
    | 'TRICEPS_PUSHDOWN'
    | 'LAT_PULLDOWN'
    | 'BARBELL_ROW'
    | 'BICEPS_CURL'
    | 'BARBELL_SQUAT'
    | 'ROMANIAN_DEADLIFT';
  targetMuscleAr: string;
  targetMuscleEn: string;
  sets: number;
  reps: string;
  restSec: number;
  safetyTipAr: string;
  safetyTipEn: string;
  daySplit?: 'PUSH' | 'PULL' | 'LEGS' | 'UPPER' | 'CARDIO_CORE';
  targetAudience?: 'ALL' | 'SPECIFIC_MEMBER';
  targetMemberId?: string;
  targetMemberNameAr?: string;
  targetMemberNameEn?: string;
  createdAt: string;
}

export interface CustomNutritionRecipeItem {
  id: string;
  titleAr: string;
  titleEn: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  imageUrl: string;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  kcal: number;
  prepMin: number;
  ingredientsAr: string[];
  ingredientsEn: string[];
  stepsAr: string[];
  stepsEn: string[];
  economicAltAr: string;
  economicAltEn: string;
  createdAt: string;
}

export interface CustomClubFileItem {
  id: string;
  titleAr: string;
  titleEn: string;
  category: 'WORKOUT_PDF' | 'DIET_PDF' | 'GUIDE' | 'VIDEO_PACK';
  descriptionAr: string;
  descriptionEn: string;
  fileName: string;
  fileSizeLabel: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  targetAudience?: 'ALL' | 'SPECIFIC_MEMBER';
  targetMemberId?: string;
  targetMemberNameAr?: string;
  targetMemberNameEn?: string;
  createdAt: string;
}

const INITIAL_CUSTOM_WORKOUTS: CustomWorkoutVideoItem[] = [
  {
    id: 'cw-1',
    titleAr: 'تمرين صدر وكتف متكامل (فيديو متحرك ذاتي + شرح الإيقاع)',
    titleEn: 'Complete Chest & Shoulder Hypertrophy (Animated Studio)',
    categoryAr: 'دفع علوي (Push)',
    categoryEn: 'Upper Push',
    levelAr: 'مبتدئ / متوسط',
    levelEn: 'Beginner / Intermediate',
    durationMin: 40,
    kcalBurn: 360,
    coachAr: 'كابتن عمر حسن',
    coachEn: 'Coach Omar Hassan',
    videoSourceType: 'BUILTIN_ANIMATION',
    videoUrl: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=85',
    motionType: 'BENCH_PRESS',
    targetMuscleAr: 'الصدر الأوسط، الصدر العلوي، الكتف الجانبي، الترايسبس',
    targetMuscleEn: 'Mid/Upper Chest, Lateral Delts, Triceps',
    sets: 4,
    reps: '10 - 12',
    restSec: 75,
    safetyTipAr: 'اثبت لوحي الكتف للخلف وانزل ببطء خلال ٣ ثوانٍ مع الزفير عند الدفع للأعلى.',
    safetyTipEn: 'Retract scapulae, lower over 3 seconds, and exhale powerfully as you press up.',
    daySplit: 'PUSH',
    createdAt: '2026-11-01',
  },
  {
    id: 'cw-2',
    titleAr: 'تمرين سحب ظهر عريض وبايسبس (V-Taper Pull Studio)',
    titleEn: 'V-Taper Back & Biceps Pull Studio',
    categoryAr: 'سحب علوي (Pull)',
    categoryEn: 'Upper Pull',
    levelAr: 'جميع المستويات',
    levelEn: 'All Levels',
    durationMin: 45,
    kcalBurn: 390,
    coachAr: 'كابتن نور الدين',
    coachEn: 'Capt. Nour El-Din',
    videoSourceType: 'BUILTIN_ANIMATION',
    videoUrl: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=900&q=85',
    motionType: 'LAT_PULLDOWN',
    targetMuscleAr: 'المجنص العريض (Lats)، وسط الظهر، البايسبس',
    targetMuscleEn: 'Latissimus Dorsi, Mid-Back, Biceps',
    sets: 4,
    reps: '10 - 12',
    restSec: 75,
    safetyTipAr: 'اسحب بكوعك لأسفل باتجاه الجيب الخلفي ولا تتأرجح بأسفل الظهر.',
    safetyTipEn: 'Drive elbows down toward your back pockets and keep your torso stable.',
    daySplit: 'PULL',
    createdAt: '2026-11-02',
  },
  {
    id: 'cw-3',
    titleAr: 'قوة الأرجل والقطنية الآمنة (Squat & RDL Biomechanics)',
    titleEn: 'Lower Body Power & Safe Hinge Studio',
    categoryAr: 'أرجل وسفلي (Legs)',
    categoryEn: 'Lower Body',
    levelAr: 'متوسط',
    levelEn: 'Intermediate',
    durationMin: 50,
    kcalBurn: 460,
    coachAr: 'كابتن عمر حسن',
    coachEn: 'Coach Omar Hassan',
    videoSourceType: 'BUILTIN_ANIMATION',
    videoUrl: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=900&q=85',
    motionType: 'BARBELL_SQUAT',
    targetMuscleAr: 'الرباعية الأمامية، الخلفية، والأرداف (Glutes)',
    targetMuscleEn: 'Quadriceps, Hamstrings, and Glutes',
    sets: 4,
    reps: '8 - 10',
    restSec: 90,
    safetyTipAr: 'حافظ على استقامة العمود الفقري وادفع الأرض بكعب القدم بالكامل.',
    safetyTipEn: 'Maintain a neutral spine and drive through your mid-foot and heels.',
    daySplit: 'LEGS',
    createdAt: '2026-11-03',
  },
];

const INITIAL_CUSTOM_RECIPES: CustomNutritionRecipeItem[] = [
  {
    id: 'cr-1',
    titleAr: 'طاجن شوفان بالبيض والجبن القريش والأفوكادو (فطور طاقة عالي البروتين)',
    titleEn: 'Savory Egg, Cottage Cheese & Oat Power Bowl',
    mealType: 'BREAKFAST',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=85',
    proteinG: 36,
    carbsG: 45,
    fatsG: 14,
    kcal: 450, // 4*36 + 4*45 + 9*14 = 144 + 180 + 126 = 450 kcal
    prepMin: 10,
    ingredientsAr: ['3 بيضات كاملة مسلوقة أو أومليت', '100 جم جبن قريش مصري', '50 جم شوفان مطحون أو خبز بلدي', 'شرائح طماطم وخيار وزيت زيتون بكر'],
    ingredientsEn: ['3 whole eggs', '100g cottage cheese', '50g rolled oats or baladi bread', 'Fresh tomato, cucumber & olive oil drizzle'],
    stepsAr: [
      'اخفق البيض مع رشة فلفل أسود وكمون في طاسة غير لاصقة على نار هادئة.',
      'اهرس الجبن القريش مع ملعقة زيت زيتون وزعتر بري بجانب الشوفان المحمص.',
      'قدم الطبق ساخناً مع الخضروات الورقية الطازجة.',
    ],
    stepsEn: [
      'Scramble or poach the eggs with black pepper and cumin on low heat.',
      'Mash the cottage cheese with olive oil and oregano alongside toasted oats.',
      'Serve warm with fresh greens.',
    ],
    economicAltAr: 'بديل اقتصادي: استبدل الشوفان برغيف خبز بلدي أسمر + 4 ملاعق فول مدمس بدون زيت مضاف.',
    economicAltEn: 'Budget swap: Replace oats with 1 whole-wheat baladi flatbread + 4 tbsp fava beans.',
    createdAt: '2026-11-01',
  },
  {
    id: 'cr-2',
    titleAr: 'صدور دجاج مشوية بالليمون والثوم مع أرز بسمتي وبروكلي سوتيه',
    titleEn: 'Lemon Garlic Grilled Chicken Breast with Basmati Rice & Broccoli',
    mealType: 'LUNCH',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=85',
    proteinG: 52,
    carbsG: 60,
    fatsG: 12,
    kcal: 556, // 4*52 + 4*60 + 9*12 = 208 + 240 + 108 = 556 kcal
    prepMin: 20,
    ingredientsAr: ['220 جم صدور دجاج صافي', '160 جم أرز بسمتي أو مصري مسلوق', 'كوب بروكلي وكوسة سوتيه', 'تتبيلة ليمون وثوم مفروم وبابريكا مدخنة'],
    ingredientsEn: ['220g chicken breast', '160g cooked basmati rice', '1 cup steamed broccoli & zucchini', 'Lemon, garlic & smoked paprika marinade'],
    stepsAr: [
      'تبل صدور الدجاج بعصير الليمون والثوم والبابريكا لمدة ١٥ دقيقة.',
      'اشوِ الدجاج على الجريل الساخن ٤ دقائق لكل وجه حتى ينضج ويبقى طرياً.',
      'قدم الدجاج فوق الأرز المسلوق مع الخضار السوتيه.',
    ],
    stepsEn: [
      'Marinate chicken breast in lemon juice, garlic, and paprika for 15 minutes.',
      'Grill for 4 minutes per side until juicy and golden.',
      'Serve over steamed basmati rice with sautéed greens.',
    ],
    economicAltAr: 'بديل اقتصادي: علبة تونة مصفاة من الزيت أو ٢٥٠ جم سمك بلطي مشوي بالردة.',
    economicAltEn: 'Budget swap: 1 drained tuna tin or 250g grilled Nile tilapia.',
    createdAt: '2026-11-02',
  },
  {
    id: 'cr-3',
    titleAr: 'سمك سالمون أو ماكريل مشوي بالفرن مع بطاطا حلوة مشوية وسلطة خضراء',
    titleEn: 'Oven-Baked Omega Fish with Roasted Sweet Potato & Crisp Salad',
    mealType: 'DINNER',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=85',
    proteinG: 42,
    carbsG: 40,
    fatsG: 16,
    kcal: 472, // 4*42 + 4*40 + 9*16 = 168 + 160 + 144 = 472 kcal
    prepMin: 25,
    ingredientsAr: ['200 جم فيليه سمك مشوي (سالمون أو ماكريل أو بلطي)', '150 جم بطاطا حلوة مشوية بالفرن', 'طبق سلطة خضراء بالجرجير والليمون'],
    ingredientsEn: ['200g baked fish fillet', '150g oven-roasted sweet potato', 'Fresh arugula & lemon salad'],
    stepsAr: [
      'قطع البطاطا الحلوة مكعبات واشوها في الفرن أو الإيرفراير لمدة ١٨ دقيقة.',
      'تبل السمك بالكمون والليمون والكسبرة الجافة واشوه في الفرن لمدة ١٥ دقيقة.',
      'قدم الوجبة مع الجرجير الطازج.',
    ],
    stepsEn: [
      'Cube sweet potatoes and roast in the oven or air-fryer for 18 minutes.',
      'Season fish with cumin, lemon, and coriander and bake for 15 minutes.',
      'Serve with fresh arugula.',
    ],
    economicAltAr: 'بديل اقتصادي: ٢٠٠ جم صدور دجاج أو ١٥٠ جم جبن قريش مع بطاطس مسلوقة.',
    economicAltEn: 'Budget swap: 200g chicken breast or 150g cottage cheese with boiled potato.',
    createdAt: '2026-11-03',
  },
];

const INITIAL_CUSTOM_FILES: CustomClubFileItem[] = [
  {
    id: 'cf-1',
    titleAr: 'جدول التدريب الذاتي الشامل ٤ أسابيع (Push / Pull / Legs PDF)',
    titleEn: '4-Week Complete Self-Coaching Split Schedule (PPL Sheet)',
    category: 'WORKOUT_PDF',
    descriptionAr: 'ملف مطبوع جاهز لتسجيل أوزانك وعداتك أسبوعاً بأسبوع مع شرح الإحماء والتدرج في الأوزان.',
    descriptionEn: 'Printable 4-week workout log sheet with warm-up protocol and progressive overload guide.',
    fileName: 'TitanFit-4Week-Self-Training-Plan.html',
    fileSizeLabel: '420 KB',
    fileUrl: '#builtin-workout-plan-sheet',
    fileType: 'text/html',
    uploadedBy: 'إدارة تيتان فيت',
    createdAt: '2026-11-01',
  },
  {
    id: 'cf-2',
    titleAr: 'دليل الوجبات المصرية الاقتصادية وحساب الماكروز (4P + 4C + 9F)',
    titleEn: 'Egyptian Budget Nutrition & Macro Guide',
    category: 'DIET_PDF',
    descriptionAr: 'قائمة بدائل البروتين والنشويات والدهون الصحية من البيت المصري لثبات الوزن أو التنشيف أو الضخامة.',
    descriptionEn: 'Complete Egyptian household food swap table for cutting, maintenance, and lean bulking.',
    fileName: 'TitanFit-Egyptian-Nutrition-Guide.html',
    fileSizeLabel: '380 KB',
    fileUrl: '#builtin-diet-guide-sheet',
    fileType: 'text/html',
    uploadedBy: 'قسم التغذية الرياضية',
    createdAt: '2026-11-02',
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
  trainerPayouts: TrainerPayoutTransaction[];
  workoutLogs: WorkoutLogEntry[];
  chatMessages: ChatMessageItem[];
  tenants: TenantSaaSItem[];
  customWorkouts: CustomWorkoutVideoItem[];
  customRecipes: CustomNutritionRecipeItem[];
  customFiles: CustomClubFileItem[];
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
    id?: string;
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
  ) => Promise<{ success: boolean; role?: UserRoleKey; tenant?: TenantSaaSItem; message?: string }>;
  loginWithGymCode: (
    gymSecretCode: string,
  ) => Promise<{ success: boolean; role?: UserRoleKey; tenant?: TenantSaaSItem; message?: string }>;
  requestMemberOtp: (identifier: string) => Promise<{
    success: boolean;
    message?: string;
    targetInfo?: {
      memberName: string;
      memberCode: string;
      maskedPhone: string;
      maskedEmail: string;
    };
    simulatedOtp?: string;
  }>;
  verifyMemberOtp: (
    identifier: string,
    otpCode: string,
  ) => Promise<{ success: boolean; role?: UserRoleKey; message?: string }>;
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
  }) => MemberItem;
  updateMember: (memberId: string, updates: Partial<MemberItem>) => void;
  deleteMember: (memberId: string) => void;
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
  updatePlan: (planId: string, updates: Partial<PlanItem>) => void;
  deletePlan: (planId: string) => void;
  addPosProduct: (product: Omit<PosProductItem, 'id'>) => PosProductItem;
  updatePosProduct: (productId: string, updates: Partial<PosProductItem>) => void;
  deletePosProduct: (productId: string) => void;
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
  addStaffMember: (data: {
    nameEn: string;
    nameAr: string;
    role: StaffMemberItem['role'];
    specialtyEn: string;
    specialtyAr: string;
    branchId: string;
    phone: string;
    whatsappNumber?: string;
    shiftEn: string;
    shiftAr: string;
    baseSalaryEgp?: number;
    commissionRatePercent?: number;
    ptSessionRateEgp?: number;
    bioAr?: string;
    bioEn?: string;
    avatarUrl?: string;
  }) => StaffMemberItem;
  updateStaffMember: (id: string, updates: Partial<StaffMemberItem>) => void;
  deleteStaffMember: (id: string) => void;
  recordTrainerPayout: (payout: {
    trainerId: string;
    amountEgp: number;
    payoutType: TrainerPayoutTransaction['payoutType'];
    note: string;
    trainerNameAr?: string;
    trainerNameEn?: string;
  }) => void;
  assignMemberTrainer: (memberId: string, trainerId: string) => void;
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
  deleteTenant: (tenantId: string) => void;
  updateTenantBranding: (
    tenantId: string,
    changes: { logoUrl?: string; primaryColor?: string },
  ) => void;
  addCustomWorkout: (
    workout: Omit<CustomWorkoutVideoItem, 'id' | 'createdAt'>,
  ) => CustomWorkoutVideoItem;
  updateCustomWorkout: (
    workoutId: string,
    updates: Partial<CustomWorkoutVideoItem>,
  ) => void;
  deleteCustomWorkout: (workoutId: string) => void;
  addCustomRecipe: (
    recipe: Omit<CustomNutritionRecipeItem, 'id' | 'createdAt' | 'kcal'>,
  ) => CustomNutritionRecipeItem;
  updateCustomRecipe: (
    recipeId: string,
    updates: Partial<CustomNutritionRecipeItem>,
  ) => void;
  deleteCustomRecipe: (recipeId: string) => void;
  addCustomFile: (
    file: Omit<CustomClubFileItem, 'id' | 'createdAt'>,
  ) => CustomClubFileItem;
  deleteCustomFile: (fileId: string) => void;
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
  const [staff, setStaff] = useState<StaffMemberItem[]>(INITIAL_STAFF);
  const [trainerPayouts, setTrainerPayouts] = useState<TrainerPayoutTransaction[]>(INITIAL_TRAINER_PAYOUTS);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogEntry[]>(INITIAL_WORKOUT_LOGS);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>(INITIAL_CHAT);
  const [tenants, setTenants] = useState<TenantSaaSItem[]>(INITIAL_TENANTS);
  const [customWorkouts, setCustomWorkouts] = useState<CustomWorkoutVideoItem[]>(INITIAL_CUSTOM_WORKOUTS);
  const [customRecipes, setCustomRecipes] = useState<CustomNutritionRecipeItem[]>(INITIAL_CUSTOM_RECIPES);
  const [customFiles, setCustomFiles] = useState<CustomClubFileItem[]>(INITIAL_CUSTOM_FILES);
  const tenantsHydrated = useRef(false);
  const customContentHydrated = useRef(false);

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(INITIAL_AUDITS);
  const [impersonatedTenant, setImpersonatedTenantState] = useState<string | null>(null);
  const [brandAccentHex, setBrandAccentHex] = useState<string>('#D4AF37');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication & Custom Tenant Branding State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    email: string;
    name: string;
    role: UserRoleKey;
    tenantSlug?: string;
    logoUrl?: string;
    primaryColor?: string;
  } | null>(null);

  const activeTenantSlug = currentUser?.tenantSlug || impersonatedTenant || 'titanfit-egypt';

  const activeTenantCustom =
    tenants.find((t) => t.slug === (currentUser?.tenantSlug || impersonatedTenant)) ?? null;

  // Hydrate & persist Gym Owner Custom Content per isolated Tenant Slug in localStorage
  useEffect(() => {
    customContentHydrated.current = false;
    try {
      const tenantStorageKey = `titanfit.customContent.v1.${activeTenantSlug}`;
      const raw =
        window.localStorage.getItem(tenantStorageKey) ||
        (activeTenantSlug === 'titanfit-egypt'
          ? window.localStorage.getItem('titanfit.customContent.v1')
          : null);
      if (raw) {
        const parsed = JSON.parse(raw);
        setCustomWorkouts(
          Array.isArray(parsed.customWorkouts) && parsed.customWorkouts.length > 0
            ? parsed.customWorkouts
            : INITIAL_CUSTOM_WORKOUTS,
        );
        setCustomRecipes(
          Array.isArray(parsed.customRecipes) && parsed.customRecipes.length > 0
            ? parsed.customRecipes
            : INITIAL_CUSTOM_RECIPES,
        );
        setCustomFiles(
          Array.isArray(parsed.customFiles) && parsed.customFiles.length > 0
            ? parsed.customFiles
            : INITIAL_CUSTOM_FILES,
        );
      } else {
        setCustomWorkouts(INITIAL_CUSTOM_WORKOUTS);
        setCustomRecipes(INITIAL_CUSTOM_RECIPES);
        setCustomFiles(INITIAL_CUSTOM_FILES);
      }
    } catch {
      /* ignore */
    }
    customContentHydrated.current = true;
  }, [activeTenantSlug]);

  useEffect(() => {
    if (!customContentHydrated.current) return;
    try {
      const payload = JSON.stringify({ customWorkouts, customRecipes, customFiles });
      window.localStorage.setItem(`titanfit.customContent.v1.${activeTenantSlug}`, payload);
      if (activeTenantSlug === 'titanfit-egypt') {
        window.localStorage.setItem('titanfit.customContent.v1', payload);
      }
    } catch {
      /* ignore quota errors */
    }
  }, [customWorkouts, customRecipes, customFiles, activeTenantSlug]);

  // Hydrate & persist created gym tenants so newly created gym accounts work across refreshes
  useEffect(() => {
    try {
      window.localStorage.removeItem('titanfit.tenants.v1');
      window.localStorage.removeItem('titanfit.auth.token');
      window.localStorage.removeItem('titanfit.auth.user');
      const savedTenantsRaw = window.localStorage.getItem('titanfit.customTenants.v2');
      if (savedTenantsRaw) {
        const parsed = JSON.parse(savedTenantsRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTenants((prev) => {
            const combined = [...parsed];
            for (const def of prev) {
              if (!combined.some((t: any) => t.slug === def.slug)) {
                combined.push(def);
              }
            }
            return combined;
          });
          for (const t of parsed) {
            if (t?.slug) {
              apiPushSyncAction({
                tenantSlug: t.slug,
                action: 'REGISTER_TENANT',
                payload: t,
              }).catch(() => {});
            }
          }
        }
      }
    } catch {
      /* ignore */
    }
    tenantsHydrated.current = true;

    apiGetMe()
      .then((res) => {
        if (res.success && res.user) {
          setIsAuthenticated(true);
          setCurrentUser({
            id: res.user.id || 'usr-sess',
            email: res.user.email || 'user@titanfit.eg',
            name: res.user.name || 'TitanFit User',
            role: (res.user.role as UserRoleKey) || 'GYM_OWNER',
            tenantSlug: res.user.tenantSlug || 'titanfit-egypt',
            logoUrl: res.user.logoUrl || '/brand/logo.png',
            primaryColor: res.user.primaryColor || '#059669',
          });
          setActiveRole((res.user.role as UserRoleKey) || 'GYM_OWNER');
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!tenantsHydrated.current) return;
    try {
      window.localStorage.setItem('titanfit.customTenants.v2', JSON.stringify(tenants));
    } catch {
      /* ignore */
    }
  }, [tenants]);

  // Real-Time Multi-Device & Multi-Tenant Isolated Sync Layer
  useEffect(() => {
    const tenantSlug = activeTenantSlug;

    // 1. Fetch initial remote state for this isolated tenant partition
    apiFetchSyncState(tenantSlug)
      .then((res) => {
        if (res && res.success && res.data) {
          if (Array.isArray(res.data.registeredTenants) && res.data.registeredTenants.length > 0) {
            setTenants((prev) => {
              const combined = [...prev];
              for (const rt of res.data.registeredTenants) {
                if (!combined.some((t) => t.slug === rt.slug)) {
                  combined.unshift({
                    id: rt.id || `ten-${rt.slug}`,
                    slug: rt.slug,
                    nameEn: rt.nameEn || rt.slug,
                    nameAr: rt.nameAr || rt.nameEn || rt.slug,
                    ownerEmail: rt.ownerEmail,
                    authVerifier: rt.authVerifier,
                    gymSecretCode: rt.gymSecretCode,
                    logoUrl: rt.logoUrl || '/brand/logo.png',
                    primaryColor: rt.primaryColor || '#059669',
                    planTier: rt.planTier || 'PRO',
                    status: rt.status || 'ACTIVE',
                    branchesCount: 1,
                    activeMembersCount: 25,
                    mrrEgp: 420000,
                    cityEn: 'Cairo, Egypt',
                    cityAr: 'القاهرة، مصر',
                  });
                }
              }
              return combined;
            });
          }
          if (Array.isArray(res.data.members) && res.data.members.length > 0) {
            setMembers((prev) => {
              const combined = [...res.data.members];
              for (const p of prev) {
                if (!combined.some((m: any) => m.id === p.id || m.code === p.code)) {
                  combined.push(p);
                }
              }
              return combined;
            });
          }
          if (Array.isArray(res.data.plans) && res.data.plans.length > 0) {
            setPlans((prev) => {
              const combined = [...res.data.plans];
              for (const p of prev) {
                if (!combined.some((pl: any) => pl.id === p.id)) {
                  combined.push(p);
                }
              }
              return combined;
            });
          }
          if (Array.isArray(res.data.customWorkouts) && res.data.customWorkouts.length > 0) {
            setCustomWorkouts((prev) => {
              const combined = [...res.data.customWorkouts];
              for (const cw of prev) {
                if (!combined.some((item: any) => item.id === cw.id)) {
                  combined.push(cw);
                }
              }
              return combined;
            });
          }
          if (Array.isArray(res.data.customRecipes) && res.data.customRecipes.length > 0) {
            setCustomRecipes((prev) => {
              const combined = [...res.data.customRecipes];
              for (const cr of prev) {
                if (!combined.some((item: any) => item.id === cr.id)) {
                  combined.push(cr);
                }
              }
              return combined;
            });
          }
          if (Array.isArray(res.data.customFiles) && res.data.customFiles.length > 0) {
            setCustomFiles((prev) => {
              const combined = [...res.data.customFiles];
              for (const cf of prev) {
                if (!combined.some((item: any) => item.id === cf.id)) {
                  combined.push(cf);
                }
              }
              return combined;
            });
          }
          if (res.data.customBranding && Object.keys(res.data.customBranding).length > 0) {
            setTenants((prev) =>
              prev.map((t) =>
                t.slug === tenantSlug
                  ? { ...t, ...res.data.customBranding }
                  : t
              )
            );
          }
        }
      })
      .catch(() => {});

    // 2. Cross-tab Broadcast Channel listener scoped to tenant
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('titanfit_realtime_sync');
        channel.onmessage = (event) => {
          const { action, payload } = event.data || {};
          if (action === 'ADD_MEMBER' && payload) {
            setMembers((prev) => {
              if (prev.some((m) => m.id === payload.id || m.code === payload.code)) return prev;
              return [payload, ...prev];
            });
          } else if (action === 'ADD_PLAN' && payload) {
            setPlans((prev) => {
              if (prev.some((p) => p.id === payload.id)) return prev;
              return [payload, ...prev];
            });
          } else if (action === 'RECORD_CHECKIN' && payload) {
            setMembers((prev) =>
              prev.map((m) =>
                m.id === payload.memberId || m.code === payload.memberCode
                  ? { ...m, checkInsCount: (m.checkInsCount || 0) + 1, lastCheckIn: 'Just now' }
                  : m
              )
            );
          }
        };
      }
    } catch {
      /* ignore */
    }

    return () => {
      channel?.close();
    };
  }, [activeTenantSlug]);

  const login: PlatformStoreContextValue['login'] = async (email, password, gymSecretCode) => {
    const trimmed = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();
    const cleanCode = (gymSecretCode || '').trim().toUpperCase();

    // 1. Check if identifier or gymSecretCode matches any tenant in our state
    let matchedTen: TenantSaaSItem | undefined;
    if (cleanCode) {
      matchedTen = tenants.find(
        (t) =>
          (t.gymSecretCode && t.gymSecretCode.toUpperCase() === cleanCode) ||
          t.slug.toUpperCase() === cleanCode,
      );
    } else if (
      trimmed &&
      trimmed !== 'superadmin@titanfit.eg' &&
      trimmed !== 'superadmin' &&
      trimmed !== 'admin@titanfit.eg'
    ) {
      matchedTen = tenants.find(
        (t) =>
          t.ownerEmail.toLowerCase() === trimmed ||
          t.slug.toLowerCase() === trimmed ||
          t.nameEn.toLowerCase() === trimmed ||
          t.nameAr.toLowerCase() === trimmed,
      );
      if (matchedTen && matchedTen.authVerifier && cleanPass && matchedTen.authVerifier !== cleanPass) {
        return {
          success: false,
          message:
            locale === 'ar'
              ? 'كلمة المرور غير صحيحة لحساب هذا النادي. يرجى التأكد من كلمة المرور.'
              : 'Incorrect password for this gym account.',
        };
      }
    }

    // 2. Check if identifier matches any registered Member in our state
    const matchedMem =
      !cleanCode && !matchedTen && trimmed
        ? members.find(
            (m) =>
              m.code.toLowerCase() === trimmed ||
              m.email.toLowerCase() === trimmed ||
              m.phone === (email || '').trim(),
          )
        : undefined;

    if (matchedMem && matchedMem.tempPassword && cleanPass && matchedMem.tempPassword !== cleanPass) {
      return {
        success: false,
        message:
          locale === 'ar'
            ? 'كلمة مرور المتدرب غير صحيحة. يرجى التأكد من الباسورد المؤقت المستخرج لك.'
            : 'Incorrect member password.',
      };
    }

    try {
      const res = await apiLogin({
        identifier: trimmed,
        password: cleanPass,
        gymSecretCode,
        tenantSlug: matchedTen?.slug || activeTenantCustom?.slug,
        matchedTenant: matchedTen
          ? {
              id: matchedTen.id,
              slug: matchedTen.slug,
              nameEn: matchedTen.nameEn,
              nameAr: matchedTen.nameAr,
              ownerEmail: matchedTen.ownerEmail,
              logoUrl: matchedTen.logoUrl,
              primaryColor: matchedTen.primaryColor,
            }
          : undefined,
        matchedMember: matchedMem
          ? {
              id: matchedMem.id,
              code: matchedMem.code,
              email: matchedMem.email,
              fullNameEn: matchedMem.fullNameEn,
              fullNameAr: matchedMem.fullNameAr,
              tenantSlug: activeTenantSlug,
            }
          : undefined,
      });

      if (res.success && res.user) {
        const role = (res.user.role as UserRoleKey) || 'GYM_OWNER';
        setIsAuthenticated(true);
        setCurrentUser({
          id: res.user.id,
          email: res.user.email,
          name: res.user.name,
          role,
          tenantSlug: res.user.tenantSlug,
          logoUrl: res.user.logoUrl || '/brand/logo.png',
          primaryColor: res.user.primaryColor || '#059669',
        });
        setActiveRole(role);
        setActiveSection(
          role === 'SUPER_ADMIN'
            ? 'SUPER_ADMIN'
            : role === 'MEMBER'
              ? 'MEMBER_PWA'
              : 'OVERVIEW',
        );
        if (res.user.primaryColor) setBrandAccentHex(res.user.primaryColor);
        appendAudit('USER_LOGIN', `User logged in: ${res.user.email} (${role})`);
        showToast(
          locale === 'ar'
            ? `مرحباً بك، ${res.user.name}!`
            : `Welcome back, ${res.user.name}!`,
        );
        return { success: true, role, tenant: res.tenant };
      }

      return {
        success: false,
        message:
          res.message ||
          (locale === 'ar'
            ? 'بيانات تسجيل الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.'
            : 'Invalid login credentials. Please verify your email and password.'),
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Login failed',
      };
    }
  };

  const loginWithGymCode: PlatformStoreContextValue['loginWithGymCode'] = async (code) => {
    return login('', '', code);
  };

  const requestMemberOtp: PlatformStoreContextValue['requestMemberOtp'] = async (identifier) => {
    const trimmed = (identifier || '').trim();
    const cleanPhone = trimmed.replace(/[\s\-\(\)]/g, '');
    const matchedMem = members.find(
      (m) =>
        m.phone.replace(/[\s\-\(\)]/g, '') === cleanPhone ||
        (cleanPhone.startsWith('01') && m.phone.replace(/[\s\-\(\)]/g, '').endsWith(cleanPhone)) ||
        m.email.toLowerCase() === trimmed.toLowerCase() ||
        m.code.toLowerCase() === trimmed.toLowerCase(),
    );

    const res = await apiRequestOtp(
      trimmed,
      matchedMem
        ? {
            id: matchedMem.id,
            code: matchedMem.code,
            fullNameEn: matchedMem.fullNameEn,
            fullNameAr: matchedMem.fullNameAr,
            phone: matchedMem.phone,
            email: matchedMem.email,
            tenantSlug: activeTenantSlug,
          }
        : undefined,
    );

    if (res.success && res.simulatedOtp) {
      showToast(
        locale === 'ar'
          ? `📲 تم إرسال الرمز: ${res.simulatedOtp} (نسخة تجريبية / محاكاة OTP)`
          : `📲 OTP Sent: ${res.simulatedOtp}`,
      );
    }

    return res;
  };

  const verifyMemberOtp: PlatformStoreContextValue['verifyMemberOtp'] = async (
    identifier,
    otpCode,
  ) => {
    const res = await apiVerifyOtp(identifier, otpCode);
    if (res.success && res.user) {
      const role: UserRoleKey = 'MEMBER';
      setIsAuthenticated(true);
      setCurrentUser({
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        role,
        tenantSlug: res.user.tenantSlug || activeTenantSlug,
        logoUrl: res.user.logoUrl || '/brand/logo.png',
        primaryColor: res.user.primaryColor || '#059669',
      });
      setActiveRole(role);
      setActiveSection('MEMBER_PWA');
      appendAudit('MEMBER_OTP_LOGIN', `Member logged in via OTP: ${res.user.email} (${res.user.name})`);
      showToast(
        locale === 'ar'
          ? `مرحباً بك يا كابتن ${res.user.name} في تطبيقك الذكي!`
          : `Welcome ${res.user.name} to your fitness app!`,
      );
      return { success: true, role };
    }
    return {
      success: false,
      message: res.message || (locale === 'ar' ? 'رمز OTP غير صحيح' : 'Invalid OTP code'),
    };
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
    const tempPassword = `TF@${Math.floor(1000 + Math.random() * 9000)}`;
    const newMember: MemberItem = {
      id: `mem-${Date.now()}`,
      code,
      tempPassword,
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
    const tenantSlug = currentUser?.tenantSlug || 'titanfit-cairo';
    apiPushSyncAction({ tenantSlug, action: 'ADD_MEMBER', payload: newMember }).catch(() => {});
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        new BroadcastChannel('titanfit_realtime_sync').postMessage({ action: 'ADD_MEMBER', payload: newMember });
      }
    } catch {}
    showToast(
      locale === 'ar'
        ? `تم تسجيل العضو ${newMember.fullNameAr} بنجاح برقم ${code}`
        : `Member ${newMember.fullNameEn} registered with ID ${code}`,
    );
    return newMember;
  };

  const updateMember: PlatformStoreContextValue['updateMember'] = (memberId, updates) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, ...updates } : m)),
    );
    appendAudit('MEMBER_UPDATED', `Member ${memberId} updated`);
    const tenantSlug = currentUser?.tenantSlug || 'titanfit-cairo';
    apiPushSyncAction({ tenantSlug, action: 'UPDATE_MEMBER', payload: { memberId, updates } }).catch(() => {});
    showToast(locale === 'ar' ? 'تم تحديث بيانات العضو بنجاح' : 'Member updated successfully');
  };

  const deleteMember: PlatformStoreContextValue['deleteMember'] = (memberId) => {
    const target = members.find((m) => m.id === memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    appendAudit('MEMBER_DELETED', `Deleted member ${target?.code || memberId}`);
    const tenantSlug = currentUser?.tenantSlug || 'titanfit-cairo';
    apiPushSyncAction({ tenantSlug, action: 'DELETE_MEMBER', payload: { memberId } }).catch(() => {});
    showToast(
      locale === 'ar'
        ? `تم حذف العضو ${target?.fullNameAr || ''} بنجاح`
        : `Member ${target?.fullNameEn || ''} deleted successfully`,
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
    const tenantSlug = currentUser?.tenantSlug || 'titanfit-cairo';
    apiPushSyncAction({ tenantSlug, action: 'ADD_PLAN', payload: newPlan }).catch(() => {});
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        new BroadcastChannel('titanfit_realtime_sync').postMessage({ action: 'ADD_PLAN', payload: newPlan });
      }
    } catch {}
    showToast(
      locale === 'ar'
        ? `تمت إضافة باقة الاشتراك "${newPlan.nameAr}" بنجاح`
        : `Created subscription plan "${newPlan.nameEn}"`,
    );
  };

  const updatePlan: PlatformStoreContextValue['updatePlan'] = (planId, updates) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, ...updates } : p)),
    );
    appendAudit('SUBSCRIPTION_PLAN_UPDATED', `Plan ${planId} updated`);
    const tenantSlug = currentUser?.tenantSlug || 'titanfit-cairo';
    apiPushSyncAction({ tenantSlug, action: 'UPDATE_PLAN', payload: { planId, updates } }).catch(() => {});
    showToast(locale === 'ar' ? 'تم تحديث باقة الاشتراك بنجاح' : 'Plan updated successfully');
  };

  const deletePlan: PlatformStoreContextValue['deletePlan'] = (planId) => {
    const target = plans.find((p) => p.id === planId);
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    appendAudit('SUBSCRIPTION_PLAN_DELETED', `Plan ${target?.code || planId} deleted`);
    const tenantSlug = currentUser?.tenantSlug || 'titanfit-cairo';
    apiPushSyncAction({ tenantSlug, action: 'DELETE_PLAN', payload: { planId } }).catch(() => {});
    showToast(
      locale === 'ar'
        ? `تم حذف باقة "${target?.nameAr || ''}" بنجاح`
        : `Plan "${target?.nameEn || ''}" deleted successfully`,
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
      const tenantSlug = currentUser?.tenantSlug || 'titanfit-cairo';
      apiPushSyncAction({
        tenantSlug,
        action: 'RECORD_CHECKIN',
        payload: { memberId: member.id, memberCode: member.code },
      }).catch(() => {});
      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          new BroadcastChannel('titanfit_realtime_sync').postMessage({
            action: 'RECORD_CHECKIN',
            payload: { memberId: member.id, memberCode: member.code },
          });
        }
      } catch {}
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

  const addPosProduct: PlatformStoreContextValue['addPosProduct'] = (product) => {
    const newProd: PosProductItem = {
      id: `pos-${Date.now()}`,
      ...product,
    };
    setPosProducts((prev) => [newProd, ...prev]);
    appendAudit('POS_PRODUCT_CREATED', `${newProd.sku} (${newProd.nameEn})`);
    showToast(
      locale === 'ar'
        ? `تمت إضافة منتج "${newProd.nameAr}" إلى المخزون بنجاح`
        : `Added product "${newProd.nameEn}" to inventory`,
    );
    return newProd;
  };

  const updatePosProduct: PlatformStoreContextValue['updatePosProduct'] = (productId, updates) => {
    setPosProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)),
    );
    appendAudit('POS_PRODUCT_UPDATED', `Product ${productId} updated`);
    showToast(locale === 'ar' ? 'تم تحديث بيانات المنتج والمخزون' : 'Product updated successfully');
  };

  const deletePosProduct: PlatformStoreContextValue['deletePosProduct'] = (productId) => {
    const target = posProducts.find((p) => p.id === productId);
    setPosProducts((prev) => prev.filter((p) => p.id !== productId));
    appendAudit('POS_PRODUCT_DELETED', `Deleted product ${target?.nameEn || productId}`);
    showToast(
      locale === 'ar'
        ? `تم حذف المنتج "${target?.nameAr || ''}" من المخزون`
        : `Deleted product "${target?.nameEn || ''}"`,
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

  const addStaffMember: PlatformStoreContextValue['addStaffMember'] = (data) => {
    const id = `stf-${Date.now()}`;
    const newStaff: StaffMemberItem = {
      id,
      ...data,
      activeClients: 0,
      monthlyRevenueEgp: 0,
      totalPayoutsEgp: 0,
      rating: 5.0,
      baseSalaryEgp: data.baseSalaryEgp ?? 10000,
      ptSessionRateEgp: data.ptSessionRateEgp ?? 400,
      commissionRatePercent: data.commissionRatePercent ?? 30,
    };
    setStaff((prev) => [newStaff, ...prev]);
    appendAudit('STAFF_MEMBER_CREATED', `${newStaff.nameEn} (${newStaff.role})`);
    showToast(
      locale === 'ar'
        ? `تمت إضافة الكابتن / الموظف "${newStaff.nameAr}" بنجاح!`
        : `Added staff member "${newStaff.nameEn}"!`,
    );
    return newStaff;
  };

  const updateStaffMember: PlatformStoreContextValue['updateStaffMember'] = (id, updates) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    appendAudit('STAFF_MEMBER_UPDATED', `Staff ${id}`);
    showToast(locale === 'ar' ? 'تم تحديث بيانات الكابتن بنجاح' : 'Staff details updated');
  };

  const deleteStaffMember: PlatformStoreContextValue['deleteStaffMember'] = (id) => {
    const target = staff.find((s) => s.id === id);
    setStaff((prev) => prev.filter((s) => s.id !== id));
    appendAudit('STAFF_MEMBER_DELETED', `Deleted staff ${target?.nameEn || id}`);
    showToast(
      locale === 'ar'
        ? `تم حذف المدرب "${target?.nameAr || ''}" بنجاح من النظام`
        : `Deleted staff member "${target?.nameEn || ''}"`,
    );
  };

  const recordTrainerPayout: PlatformStoreContextValue['recordTrainerPayout'] = (payout) => {
    const target = staff.find((s) => s.id === payout.trainerId);
    const newTx: TrainerPayoutTransaction = {
      id: `pay-${Date.now()}`,
      trainerId: payout.trainerId,
      trainerNameAr: target?.nameAr || payout.trainerNameAr || 'كابتن النادي',
      trainerNameEn: target?.nameEn || payout.trainerNameEn || 'Gym Coach',
      amountEgp: payout.amountEgp,
      payoutType: payout.payoutType,
      date: new Date().toISOString().slice(0, 10),
      note: payout.note,
    };
    setTrainerPayouts((prev) => [newTx, ...prev]);
    setStaff((prev) =>
      prev.map((s) =>
        s.id === payout.trainerId
          ? { ...s, totalPayoutsEgp: (s.totalPayoutsEgp || 0) + payout.amountEgp }
          : s,
      ),
    );
    appendAudit(
      'TRAINER_PAYOUT_RECORDED',
      `${newTx.trainerNameEn}: ${newTx.amountEgp} EGP (${newTx.payoutType})`,
    );
    showToast(
      locale === 'ar'
        ? `تم صرف مستحقات بقيمة ${payout.amountEgp.toLocaleString()} ج.م للكابتن ${newTx.trainerNameAr}`
        : `Recorded payout of ${payout.amountEgp.toLocaleString()} EGP for ${newTx.trainerNameEn}`,
    );
  };

  const assignMemberTrainer: PlatformStoreContextValue['assignMemberTrainer'] = (memberId, trainerId) => {
    const trainer = staff.find((s) => s.id === trainerId);
    if (!trainer) return;
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              assignedTrainerId: trainer.id,
              assignedTrainerAr: trainer.nameAr,
              assignedTrainerEn: trainer.nameEn,
            }
          : m,
      ),
    );
    appendAudit('MEMBER_TRAINER_ASSIGNED', `Member ${memberId} assigned to Coach ${trainer.nameEn}`);
    showToast(
      locale === 'ar'
        ? `تم تعيين الكابتن ${trainer.nameAr} كمدربك الشخصي بنجاح 🏋️‍♂️`
        : `Assigned Coach ${trainer.nameEn} as personal trainer!`,
    );
  };

  const sendChatMessage = (text: string, senderRole: 'TRAINER' | 'MEMBER' = 'MEMBER') => {
    if (!text.trim()) return;
    const currentMember = members[0];
    const assignedCoach = staff.find((s) => s.id === currentMember?.assignedTrainerId) || staff[0];
    const coachNameAr = assignedCoach ? assignedCoach.nameAr : 'كابتن عمر حسن';
    const coachNameEn = assignedCoach ? assignedCoach.nameEn : 'Coach Omar Hassan';

    const newMsg: ChatMessageItem = {
      id: `msg-${Date.now()}`,
      senderRole,
      senderNameEn: senderRole === 'TRAINER' ? coachNameEn : (currentMember?.fullNameEn || 'Youssef El-Masry'),
      senderNameAr: senderRole === 'TRAINER' ? coachNameAr : (currentMember?.fullNameAr || 'يوسف المصري'),
      textEn: text,
      textAr: text,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      memberId: currentMember?.id,
      trainerId: assignedCoach?.id,
    };
    setChatMessages((prev) => [...prev, newMsg]);

    // If sent by member, simulate an intelligent coach auto-reply after 1.2s
    if (senderRole === 'MEMBER') {
      setTimeout(() => {
        let replyAr = `عاش يا ${currentMember?.fullNameAr || 'بطل'}! بتابع تمرينك ونظامك الغذائي أولاً بأول. حافظ على شرب المياه والراحة بين المجموعات.`;
        let replyEn = `Great work! I am monitoring your progress closely. Keep up your hydration and recovery!`;

        if (text.includes('وزن') || text.includes('سكوات') || text.includes('بنش') || text.includes('ديدليفت') || text.includes('تمرين') || text.includes('حمل')) {
          replyAr = `عاش يا وحش! ركز دايماً على الإيقاع المنضبط (٣ ثوانٍ نزول وتحكم كامل)، وهنزود الوزن تدريجياً الحصة الجاية بدون التضحية بالأداء السليم.`;
          replyEn = `Awesome effort! Focus on controlled tempo and full range of motion. We will progressively overload next session safely!`;
        } else if (text.includes('أكل') || text.includes('دايت') || text.includes('بروتين') || text.includes('سعرات') || text.includes('وجبة') || text.includes('جوع')) {
          replyAr = `ممتاز جداً! خليك ملتزم بهدف البروتين واشرب كوب ماء كبير قبل الوجبة. لو حسيت بجوع بدّل الكارب بسلطة ورقية أو ١٠٠ جم جبن قريش.`;
          replyEn = `Spot on! Hit your protein goal and drink plenty of water. If you feel hungry, snack on cottage cheese or fresh greens.`;
        } else if (text.includes('إصابة') || text.includes('وجع') || text.includes('ألم') || text.includes('كتف') || text.includes('ركبة')) {
          replyAr = `سلامتك يا بطل! وقف أي ضغط مباشر على المفصل مؤقتاً، واعمل كمادات باردة خفيفة مع إطالات ديناميكية وهنفحصها سوا في الجيم قبل التمرين.`;
          replyEn = `Take care! Halt direct axial load, apply light ice compresses, and we will assess mobility together before your next session.`;
        }

        const coachReply: ChatMessageItem = {
          id: `msg-${Date.now() + 1}`,
          senderRole: 'TRAINER',
          senderNameEn: coachNameEn,
          senderNameAr: coachNameAr,
          textEn: replyEn,
          textAr: replyAr,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          memberId: currentMember?.id,
          trainerId: assignedCoach?.id,
        };
        setChatMessages((prev) => [...prev, coachReply]);
      }, 1200);
    }
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
    const secretCode = gymSecretCodeCustom?.trim().toUpperCase() || `${cleanPrefix}-JOIN`;

    const newTen: TenantSaaSItem = {
      id: `ten-${Date.now()}`,
      slug,
      nameEn,
      nameAr: nameAr || nameEn,
      ownerEmail,
      authVerifier: password?.trim() || undefined,
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
    apiPushSyncAction({
      tenantSlug: slug,
      action: 'REGISTER_TENANT',
      payload: newTen,
    }).catch(() => {});
    appendAudit('SAAS_TENANT_PROVISIONED', `${slug} (${planTier}) with gym code ${secretCode}`);
    showToast(
      locale === 'ar'
        ? `🎉 تم إنشاء حساب النادي "${newTen.nameAr}" بنجاح! كود المتدربين: ${newTen.gymSecretCode}`
        : `🎉 Created tenant "${newTen.nameEn}"! Gym Code: ${newTen.gymSecretCode}`,
    );
    return newTen;
  };

  const updateTenantBranding: PlatformStoreContextValue['updateTenantBranding'] = (tenantId, changes) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === tenantId
          ? {
              ...t,
              ...(changes.logoUrl !== undefined ? { logoUrl: changes.logoUrl } : {}),
              ...(changes.primaryColor !== undefined ? { primaryColor: changes.primaryColor } : {}),
            }
          : t,
      ),
    );
    appendAudit('SAAS_TENANT_BRANDING_UPDATED', tenantId);
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

  const deleteTenant: PlatformStoreContextValue['deleteTenant'] = (tenantId) => {
    const target = tenants.find((t) => t.id === tenantId);
    setTenants((prev) => prev.filter((t) => t.id !== tenantId));
    apiPushSyncAction({
      tenantSlug: target?.slug || 'titanfit-egypt',
      action: 'DELETE_TENANT',
      payload: { tenantId, slug: target?.slug },
    }).catch(() => {});
    appendAudit('SAAS_TENANT_DELETED', `Tenant ${target?.slug || tenantId} removed`);
    showToast(
      locale === 'ar'
        ? `تم حذف حساب النادي "${target?.nameAr || ''}" بنجاح`
        : `Gym tenant "${target?.nameEn || ''}" removed successfully`,
    );
  };

  const addCustomWorkout: PlatformStoreContextValue['addCustomWorkout'] = (workout) => {
    const newItem: CustomWorkoutVideoItem = {
      ...workout,
      id: `cw-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setCustomWorkouts((prev) => [newItem, ...prev]);
    apiPushSyncAction({
      tenantSlug: currentUser?.tenantSlug || 'titanfit-cairo',
      action: 'ADD_CUSTOM_WORKOUT',
      payload: newItem,
    });
    appendAudit('CUSTOM_WORKOUT_ADDED', newItem.titleEn || newItem.titleAr);
    showToast(
      locale === 'ar'
        ? `🎬 تمت إضافة فيديو التمرين "${newItem.titleAr}" إلى مكتبة الجيم والمتدربين!`
        : `🎬 Workout video "${newItem.titleEn}" published to hub!`,
    );
    return newItem;
  };

  const updateCustomWorkout: PlatformStoreContextValue['updateCustomWorkout'] = (workoutId, updates) => {
    setCustomWorkouts((prev) =>
      prev.map((w) => (w.id === workoutId ? { ...w, ...updates } : w)),
    );
    apiPushSyncAction({
      tenantSlug: currentUser?.tenantSlug || 'titanfit-cairo',
      action: 'UPDATE_CUSTOM_WORKOUT',
      payload: { id: workoutId, updates },
    });
    appendAudit('CUSTOM_WORKOUT_UPDATED', workoutId);
    showToast(
      locale === 'ar'
        ? 'تم تحديث بيانات التمرين والفيديو بنجاح'
        : 'Workout video updated successfully',
    );
  };

  const deleteCustomWorkout: PlatformStoreContextValue['deleteCustomWorkout'] = (workoutId) => {
    const target = customWorkouts.find((w) => w.id === workoutId);
    setCustomWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    apiPushSyncAction({
      tenantSlug: currentUser?.tenantSlug || 'titanfit-cairo',
      action: 'DELETE_CUSTOM_WORKOUT',
      payload: { id: workoutId },
    });
    appendAudit('CUSTOM_WORKOUT_DELETED', target?.titleEn || workoutId);
    showToast(
      locale === 'ar'
        ? `تم حذف التمرين "${target?.titleAr || ''}"`
        : `Deleted workout "${target?.titleEn || ''}"`,
    );
  };

  const addCustomRecipe: PlatformStoreContextValue['addCustomRecipe'] = (recipe) => {
    // Unified macro calorie equation: 4*P + 4*C + 9*F
    const kcal = Math.round(recipe.proteinG * 4 + recipe.carbsG * 4 + recipe.fatsG * 9);
    const newItem: CustomNutritionRecipeItem = {
      ...recipe,
      kcal,
      id: `cr-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setCustomRecipes((prev) => [newItem, ...prev]);
    apiPushSyncAction({
      tenantSlug: currentUser?.tenantSlug || 'titanfit-cairo',
      action: 'ADD_CUSTOM_RECIPE',
      payload: newItem,
    });
    appendAudit('CUSTOM_RECIPE_ADDED', newItem.titleEn || newItem.titleAr);
    showToast(
      locale === 'ar'
        ? `🥗 تمت إضافة الوصفة الغذائية "${newItem.titleAr}" (~${kcal} سعرة) للمتدربين!`
        : `🥗 Added nutrition recipe "${newItem.titleEn}" (~${kcal} kcal)!`,
    );
    return newItem;
  };

  const updateCustomRecipe: PlatformStoreContextValue['updateCustomRecipe'] = (recipeId, updates) => {
    setCustomRecipes((prev) =>
      prev.map((r) => {
        if (r.id !== recipeId) return r;
        const merged = { ...r, ...updates };
        merged.kcal = Math.round(merged.proteinG * 4 + merged.carbsG * 4 + merged.fatsG * 9);
        return merged;
      }),
    );
    apiPushSyncAction({
      tenantSlug: currentUser?.tenantSlug || 'titanfit-cairo',
      action: 'UPDATE_CUSTOM_RECIPE',
      payload: { id: recipeId, updates },
    });
    showToast(
      locale === 'ar' ? 'تم تحديث الوصفة الغذائية وحساب السعرات' : 'Recipe updated successfully',
    );
  };

  const deleteCustomRecipe: PlatformStoreContextValue['deleteCustomRecipe'] = (recipeId) => {
    const target = customRecipes.find((r) => r.id === recipeId);
    setCustomRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    apiPushSyncAction({
      tenantSlug: currentUser?.tenantSlug || 'titanfit-cairo',
      action: 'DELETE_CUSTOM_RECIPE',
      payload: { id: recipeId },
    });
    showToast(
      locale === 'ar'
        ? `تم حذف الوصفة "${target?.titleAr || ''}"`
        : `Deleted recipe "${target?.titleEn || ''}"`,
    );
  };

  const addCustomFile: PlatformStoreContextValue['addCustomFile'] = (file) => {
    const newItem: CustomClubFileItem = {
      ...file,
      id: `cf-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setCustomFiles((prev) => [newItem, ...prev]);
    apiPushSyncAction({
      tenantSlug: currentUser?.tenantSlug || 'titanfit-cairo',
      action: 'ADD_CUSTOM_FILE',
      payload: newItem,
    });
    appendAudit('CUSTOM_FILE_UPLOADED', newItem.fileName);
    showToast(
      locale === 'ar'
        ? `📄 تم رفع الملف "${newItem.titleAr}" وإتاحته لتحميل المتدربين!`
        : `📄 File "${newItem.titleEn}" uploaded for members!`,
    );
    return newItem;
  };

  const deleteCustomFile: PlatformStoreContextValue['deleteCustomFile'] = (fileId) => {
    const target = customFiles.find((f) => f.id === fileId);
    setCustomFiles((prev) => prev.filter((f) => f.id !== fileId));
    apiPushSyncAction({
      tenantSlug: currentUser?.tenantSlug || 'titanfit-cairo',
      action: 'DELETE_CUSTOM_FILE',
      payload: { id: fileId },
    });
    showToast(
      locale === 'ar'
        ? `تم حذف الملف "${target?.titleAr || ''}"`
        : `Deleted file "${target?.titleEn || ''}"`,
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
        trainerPayouts,
        workoutLogs,
        chatMessages,
        tenants,
        customWorkouts,
        customRecipes,
        customFiles,
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
        requestMemberOtp,
        verifyMemberOtp,
        logout,
        addMember,
        updateMember,
        deleteMember,
        toggleMemberFreeze,
        createInvoicePayment,
        refundInvoice,
        createPlan,
        updatePlan,
        deletePlan,
        addPosProduct,
        updatePosProduct,
        deletePosProduct,
        createClassSession,
        cancelAndPromoteWaitlist,
        bookMemberIntoClass,
        simulateGateScan,
        completePosCheckout,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        recordTrainerPayout,
        assignMemberTrainer,
        logWorkoutSet,
        sendChatMessage,
        addTenant,
        toggleTenantStatus,
        deleteTenant,
        updateTenantBranding,
        addCustomWorkout,
        updateCustomWorkout,
        deleteCustomWorkout,
        addCustomRecipe,
        updateCustomRecipe,
        deleteCustomRecipe,
        addCustomFile,
        deleteCustomFile,
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
