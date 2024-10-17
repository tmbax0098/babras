import axios from 'axios';

// تابع تولید کد ۴ رقمی
const generateVerificationCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const sendSms = async (phone: string) => {
  const code = generateVerificationCode(); // تولید کد ۴ رقمی
  try {
    // به جای ارسال پیامک، کد را به سرور ارسال می‌کنیم تا در دیتابیس ذخیره شود
    const response = await axios.post('http://localhost:3001/auth/save-code', {
      phone_number: phone, // شماره تلفن کاربر
      code: code, // کد تایید
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data);
    } else {
      console.error('Error:', error);
    }
    throw error;
  }
};
