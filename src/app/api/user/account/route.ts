import { NextResponse, NextRequest } from 'next/server';
import axios, { AxiosError } from 'axios';

export async function GET(request: NextRequest) { 
  try {
    // استخراج توکن از هدر درخواست
    const token = request.headers.get('Authorization')?.split(' ')[1]; 
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // ارسال درخواست به API برای دریافت اطلاعات کاربر
    const response = await axios.get('http://localhost:3001/users/account', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // بررسی وضعیت پاسخ API
    if (response.status !== 200) {
      return NextResponse.json({ error: 'Failed to retrieve user data' }, { status: response.status });
    }

    // دریافت داده‌های کاربر از API
    const userData = response.data; 
    return NextResponse.json({
      phone: userData.phone || '',
      email: userData.email || '',
      address: userData.address || '',
      fullname: userData.fullname || '',
    });
  } catch (error) {
    console.error('Error fetching user data:', (error as AxiosError).message);

    // مدیریت خطای axios با جزئیات بیشتر
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
      return NextResponse.json(
        { error: 'Failed to fetch user data', details: error.response.data }, 
        { status: error.response.status }
      );
    } else {
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }
  }
}
