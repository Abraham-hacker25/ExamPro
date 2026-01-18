
import { Subject, MockExam, User, PaymentProof, PaymentSettings, StudyNote, Question } from '../types';

/**
 * BACK4APP REAL-TIME CLOUD CONFIGURATION
 * Using the hex key provided: 1718ba2cb62b5f786d8b658a4aa83530c859c408
 */
const PARSE_ID = '1718ba2cb62b5f786d8b658a4aa83530c859c408';
const PARSE_REST_KEY = '1718ba2cb62b5f786d8b658a4aa83530c859c408';
const BASE_URL = 'https://parseapi.back4app.com/classes';

const headers = {
  'X-Parse-Application-Id': PARSE_ID,
  'X-Parse-REST-API-Key': PARSE_REST_KEY,
  'Content-Type': 'application/json'
};

const defaultSubjects: Subject[] = [
  { id: 'maths', name: 'Mathematics', icon: '📐', color: 'bg-blue-100 text-blue-600' },
  { id: 'english', name: 'English Language', icon: '📚', color: 'bg-purple-100 text-purple-600' },
  { id: 'physics', name: 'Physics', icon: '⚛️', color: 'bg-orange-100 text-orange-600' },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: 'bg-green-100 text-green-600' },
  { id: 'biology', name: 'Biology', icon: '🧬', color: 'bg-red-100 text-red-600' },
];

const defaultSettings: PaymentSettings = {
  bank: 'FCMB',
  accountNumber: '1043861839',
  accountName: 'Abraham Blessing Michael',
};

/**
 * Maps Parse objectId to our internal id for consistency.
 */
const mapFromParse = (item: any) => ({
  ...item,
  id: item.objectId
});

export const cloudService = {
  // SETTINGS
  getSettings: async (): Promise<PaymentSettings> => {
    try {
      const res = await fetch(`${BASE_URL}/Settings`, { headers });
      const data = await res.json();
      return data.results && data.results.length > 0 ? mapFromParse(data.results[0]) : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  },
  updateSettings: async (settings: PaymentSettings) => {
    // Check if settings object already exists to update
    const res = await fetch(`${BASE_URL}/Settings`, { headers });
    const data = await res.json();
    const existing = data.results && data.results[0];
    
    const method = existing ? 'PUT' : 'POST';
    const url = existing ? `${BASE_URL}/Settings/${existing.objectId}` : `${BASE_URL}/Settings`;
    
    await fetch(url, {
      method,
      headers,
      body: JSON.stringify(settings)
    });
  },

  // SUBJECTS
  getSubjects: async (): Promise<Subject[]> => {
    try {
      const res = await fetch(`${BASE_URL}/Subjects`, { headers });
      const data = await res.json();
      return data.results && data.results.length > 0 ? data.results.map(mapFromParse) : defaultSubjects;
    } catch (e) {
      return defaultSubjects;
    }
  },

  // QUESTIONS
  getQuestions: async (subjectId?: string): Promise<Question[]> => {
    let url = `${BASE_URL}/Questions`;
    if (subjectId) {
      url += `?where=${encodeURIComponent(JSON.stringify({ subjectId }))}`;
    }
    const res = await fetch(url, { headers });
    const data = await res.json();
    return (data.results || []).map(mapFromParse);
  },
  saveQuestion: async (q: Question) => {
    const isUpdate = !!q.id && !q.id.startsWith('q_'); // Check if it's a real Parse ID
    const url = isUpdate ? `${BASE_URL}/Questions/${q.id}` : `${BASE_URL}/Questions`;
    const method = isUpdate ? 'PUT' : 'POST';
    
    await fetch(url, {
      method,
      headers,
      body: JSON.stringify(q)
    });
  },

  // NOTES
  getNotes: async (subjectId?: string): Promise<StudyNote[]> => {
    let url = `${BASE_URL}/Notes`;
    if (subjectId) {
      url += `?where=${encodeURIComponent(JSON.stringify({ subjectId }))}`;
    }
    const res = await fetch(url, { headers });
    const data = await res.json();
    return (data.results || []).map(mapFromParse);
  },
  saveNote: async (note: StudyNote) => {
    const isUpdate = !!note.id && !note.id.startsWith('n_');
    const url = isUpdate ? `${BASE_URL}/Notes/${note.id}` : `${BASE_URL}/Notes`;
    const method = isUpdate ? 'PUT' : 'POST';
    
    await fetch(url, {
      method,
      headers,
      body: JSON.stringify(note)
    });
  },

  // EXAMS
  getExams: async (): Promise<MockExam[]> => {
    const res = await fetch(`${BASE_URL}/Exams`, { headers });
    const data = await res.json();
    return (data.results || []).map(mapFromParse);
  },
  addExam: async (exam: MockExam) => {
    await fetch(`${BASE_URL}/Exams`, {
      method: 'POST',
      headers,
      body: JSON.stringify(exam)
    });
  },

  // PAYMENTS
  getPayments: async (): Promise<PaymentProof[]> => {
    const res = await fetch(`${BASE_URL}/Payments`, { headers });
    const data = await res.json();
    return (data.results || []).map(mapFromParse);
  },
  submitPayment: async (payment: PaymentProof) => {
    await fetch(`${BASE_URL}/Payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payment)
    });
  },
  updatePaymentStatus: async (paymentId: string, status: 'APPROVED' | 'REJECTED') => {
    // 1. Update Payment Status
    await fetch(`${BASE_URL}/Payments/${paymentId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status })
    });

    if (status === 'APPROVED') {
      // 2. Fetch User associated with payment
      const pRes = await fetch(`${BASE_URL}/Payments/${paymentId}`, { headers });
      const payment = await pRes.json();
      
      // 3. Update User to Premium
      const uRes = await fetch(`${BASE_URL}/Users?where=${encodeURIComponent(JSON.stringify({ email: payment.userEmail }))}`, { headers });
      const uData = await uRes.json();
      if (uData.results && uData.results[0]) {
        await fetch(`${BASE_URL}/Users/${uData.results[0].objectId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ isPremium: true })
        });
      }
    }
  },

  // USERS
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${BASE_URL}/Users`, { headers });
    const data = await res.json();
    return (data.results || []).map(mapFromParse);
  },
  saveUser: async (user: User) => {
    const emailQuery = encodeURIComponent(JSON.stringify({ email: user.email }));
    const checkRes = await fetch(`${BASE_URL}/Users?where=${emailQuery}`, { headers });
    const checkData = await checkRes.json();
    
    const existing = checkData.results && checkData.results[0];
    const url = existing ? `${BASE_URL}/Users/${existing.objectId}` : `${BASE_URL}/Users`;
    const method = existing ? 'PUT' : 'POST';
    
    await fetch(url, {
      method,
      headers,
      body: JSON.stringify(user)
    });
  },
  getUser: async (email: string): Promise<User | undefined> => {
    const query = encodeURIComponent(JSON.stringify({ email }));
    const res = await fetch(`${BASE_URL}/Users?where=${query}`, { headers });
    const data = await res.json();
    return data.results && data.results[0] ? mapFromParse(data.results[0]) : undefined;
  }
};
