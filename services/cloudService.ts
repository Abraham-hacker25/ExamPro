import * as ParseModule from 'parse';
import { Subject, MockExam, User, PaymentProof, PaymentSettings, StudyNote, Question } from '../types';

/**
 * BACK4APP CLOUD SERVICE
 * Using official Parse JS SDK for real-time data flow
 */

const Parse: any = (ParseModule as any).default || ParseModule;

const defaultSubjects: Subject[] = [
  { id: 'maths', name: 'Mathematics', icon: '📐', color: 'bg-blue-100 text-blue-600' },
  { id: 'english', name: 'English Language', icon: '📚', color: 'bg-purple-100 text-purple-600' },
  { id: 'physics', name: 'Physics', icon: '⚛️', color: 'bg-orange-100 text-orange-600' },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: 'bg-green-100 text-green-600' },
  { id: 'biology', name: 'Biology', icon: '🧬', color: 'bg-red-100 text-red-600' },
  { id: 'economics', name: 'Economics', icon: '💹', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'govt', name: 'Government', icon: '🏛️', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'lit', name: 'Literature', icon: '🎭', color: 'bg-pink-100 text-pink-600' },
];

const defaultSettings: PaymentSettings = {
  bank: 'FCMB',
  accountNumber: '1043861839',
  accountName: 'Abraham Blessing Michael',
};

// Helper to map Parse Object to our Interface
const mapUser = (obj: any): User => ({
  id: obj.id,
  email: obj.get('email'),
  name: obj.get('name'),
  password: obj.get('password'),
  class: obj.get('class'),
  targetExam: obj.get('targetExam'),
  role: obj.get('role'),
  isPremium: obj.get('isPremium'),
  progress: obj.get('progress') || {},
  registeredSubjects: obj.get('registeredSubjects') || [],
  avatarUrl: obj.get('avatarUrl'),
  theme: obj.get('theme'),
  referralCode: obj.get('referralCode'),
  referredBy: obj.get('referredBy'),
  referralCount: obj.get('referralCount') || 0,
});

const mapPayment = (obj: any): PaymentProof => ({
  id: obj.id,
  userId: obj.get('userId'),
  userName: obj.get('userName'),
  userEmail: obj.get('userEmail'),
  amount: obj.get('amount'),
  type: obj.get('type'),
  status: obj.get('status'),
  timestamp: obj.createdAt?.toISOString() || new Date().toISOString(),
  planId: obj.get('planId'),
});

export const cloudService = {
  // SETTINGS
  getSettings: async (): Promise<PaymentSettings> => {
    try {
      const query = new Parse.Query('Settings');
      const result = await query.first();
      if (result) {
        return {
          bank: result.get('bank'),
          accountNumber: result.get('accountNumber'),
          accountName: result.get('accountName'),
        };
      }
      return defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  },

  updateSettings: async (settings: PaymentSettings) => {
    const query = new Parse.Query('Settings');
    let config = await query.first();
    if (!config) {
      const SettingsClass = Parse.Object.extend('Settings');
      config = new SettingsClass();
    }
    config.set('bank', settings.bank);
    config.set('accountNumber', settings.accountNumber);
    config.set('accountName', settings.accountName);
    await config.save();
  },

  // USERS
  getUsers: async (): Promise<User[]> => {
    try {
      const query = new Parse.Query('Users');
      query.limit(1000);
      const results = await query.find();
      return results.map(mapUser);
    } catch (e) {
      console.error("Cloud Error: Fetching users failed", e);
      return [];
    }
  },

  getUser: async (email: string): Promise<User | undefined> => {
    try {
      const query = new Parse.Query('Users');
      query.equalTo('email', email);
      const result = await query.first();
      return result ? mapUser(result) : undefined;
    } catch (e) {
      return undefined;
    }
  },

  saveUser: async (user: User) => {
    try {
      const query = new Parse.Query('Users');
      query.equalTo('email', user.email);
      let parseUser = await query.first();
      
      const isNew = !parseUser;
      if (isNew) {
        const UserClass = Parse.Object.extend('Users');
        parseUser = new UserClass();
        // Generate referral code for new students
        if (!user.referralCode) {
          user.referralCode = user.name.substring(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
        }
      }

      Object.entries(user).forEach(([key, value]) => {
        if (key !== 'id') parseUser!.set(key, value);
      });

      await parseUser.save();

      // Handle referral counting on NEW user creation
      if (isNew && user.referredBy) {
        const refQuery = new Parse.Query('Users');
        refQuery.equalTo('referralCode', user.referredBy);
        const referrer = await refQuery.first();
        if (referrer) {
          referrer.increment('referralCount');
          await referrer.save();
        }
      }
    } catch (e) {
      console.error("Cloud Error: Save User Failed", e);
      throw e;
    }
  },

  // PAYMENTS
  getPayments: async (): Promise<PaymentProof[]> => {
    try {
      const query = new Parse.Query('Payments');
      query.descending('createdAt');
      query.limit(200);
      const results = await query.find();
      return results.map(mapPayment);
    } catch (e) {
      return [];
    }
  },

  submitPayment: async (payment: PaymentProof) => {
    try {
      const PaymentClass = Parse.Object.extend('Payments');
      const p = new PaymentClass();
      Object.entries(payment).forEach(([key, value]) => {
        if (key !== 'id') p.set(key, value);
      });
      await p.save();
    } catch (e) {
      console.error("Cloud Error: Payment submission failed", e);
      throw e;
    }
  },

  updatePaymentStatus: async (paymentId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const query = new Parse.Query('Payments');
      const payment = await query.get(paymentId);
      payment.set('status', status);
      await payment.save();

      if (status === 'APPROVED') {
        const userEmail = payment.get('userEmail');
        const userQuery = new Parse.Query('Users');
        userQuery.equalTo('email', userEmail);
        const userObj = await userQuery.first();
        if (userObj) {
          userObj.set('isPremium', true);
          await userObj.save();
        }
      }
    } catch (e) {
      console.error("Cloud Error: Update payment failed", e);
      throw e;
    }
  },

  // SUBJECTS & CONTENT
  getSubjects: async (): Promise<Subject[]> => {
    try {
      const query = new Parse.Query('Subjects');
      const results = await query.find();
      if (results.length > 0) {
        return results.map(r => ({ ...r.attributes, id: r.id } as Subject));
      }
      return defaultSubjects;
    } catch (e) {
      return defaultSubjects;
    }
  },

  getExams: async (): Promise<MockExam[]> => {
    try {
      const query = new Parse.Query('Exams');
      const results = await query.find();
      return results.map(r => ({ ...r.attributes, id: r.id } as MockExam));
    } catch (e) {
      return [];
    }
  },

  getNotes: async (): Promise<StudyNote[]> => {
    try {
      const query = new Parse.Query('Notes');
      const results = await query.find();
      return results.map(r => ({ ...r.attributes, id: r.id } as StudyNote));
    } catch (e) {
      return [];
    }
  }
};