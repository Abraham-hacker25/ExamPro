export type ExamType = 'WAEC' | 'JAMB' | 'NECO';
export type StudentClass = 'SS1' | 'SS2' | 'SS3';
export type UserRole = 'STUDENT' | 'ADMIN';
export type ThemeMode = 'light' | 'dark';

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Question {
  id: string;
  subjectId: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface NoteChunk {
  title: string;
  content: string;
}

export interface StudyNote {
  id: string;
  subjectId: string;
  topic: string;
  chunks: NoteChunk[];
  studentClass: StudentClass;
}

export interface MockExam {
  id: string;
  title: string;
  subjects: string[];
  durationMinutes: number;
  questionCount: number;
  fee: number;
  isPremium: boolean;
}

export interface PaymentSettings {
  bank: string;
  accountNumber: string;
  accountName: string;
}

export interface PaymentProof {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  type: 'PREMIUM' | 'MOCK_EXAM';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
  planId?: string;
  proofUrl?: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  class?: StudentClass;
  targetExam?: ExamType;
  role: UserRole;
  isPremium: boolean;
  progress: Record<string, number>;
  registeredSubjects: string[]; 
  avatarUrl?: string;
  theme?: ThemeMode;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
}