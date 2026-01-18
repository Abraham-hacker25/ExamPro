
import { Subject, MockExam } from './types';

export const SUBJECTS: Subject[] = [
  { id: 'maths', name: 'Mathematics', icon: '📐', color: 'bg-blue-100 text-blue-600' },
  { id: 'english', name: 'English Language', icon: '📚', color: 'bg-purple-100 text-purple-600' },
  { id: 'physics', name: 'Physics', icon: '⚛️', color: 'bg-orange-100 text-orange-600' },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: 'bg-green-100 text-green-600' },
  { id: 'biology', name: 'Biology', icon: '🧬', color: 'bg-red-100 text-red-600' },
  { id: 'economics', name: 'Economics', icon: '💹', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'govt', name: 'Government', icon: '🏛️', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'lit', name: 'Literature', icon: '🎭', color: 'bg-pink-100 text-pink-600' },
];

export const PAYMENT_DETAILS = {
  bank: 'FCMB',
  accountNumber: '1043861839',
  accountName: 'Abraham Blessing Michael',
};

export const PREMIUM_PLANS = [
  { id: 'monthly', name: 'Monthly Access', price: 1500, duration: 'month' },
  { id: 'term', name: 'Term Access', price: 5000, duration: 'term' },
  { id: 'yearly', name: 'Yearly Access', price: 10000, duration: 'year' },
];

export const ADMIN_CREDENTIALS = {
  email: 'admin@exampro.ng',
  password: 'admin-password-secure'
};
