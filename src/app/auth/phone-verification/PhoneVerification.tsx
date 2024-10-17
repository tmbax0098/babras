"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./PhoneVerification.module.css";

const baseURL = "http://localhost:3001";

export default function PhoneVerification() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // اضافه کردن فیلد ایمیل
  const [address, setAddress] = useState(""); // اضافه کردن فیلد آدرس
  const [fullname, setFullname] = useState(""); // اضافه کردن فیلد نام کامل
  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeConfirmed, setIsCodeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendPhone = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseURL}/auth/verify-phone`, {
        phone,
        email,
        address,
        fullname,
      });
      console.log("Server response:", response.data);
      setIsCodeSent(true);
      setError("");
    } catch (err) {
      console.error("Error sending verification code:", err);
      setError("Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseURL}/auth/confirm-code`, {
        phone,
        code,
      });
      console.log("Full response:", response.data);
      if (response.data.accessToken) {
        console.log("User role:", response.data.user.role);
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("phone", phone);

        // ذخیره اطلاعات اضافی کاربر
        localStorage.setItem("email", response.data.user.email || "");
        localStorage.setItem("address", response.data.user.address || "");
        localStorage.setItem("fullname", response.data.user.fullname || "");
        // ذخیره role کاربر
        localStorage.setItem("role", response.data.user.role || "user");
        setIsCodeConfirmed(true);
        setError("");
      } else {
        setError("Invalid code or failed to login");
      }
    } catch  {
      setError("Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCodeConfirmed) {
      window.location.href = "/account"; // هدایت به صفحه حساب کاربری بعد از تایید
    }
  }, [isCodeConfirmed]);

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.header}>Phone Verification</h1>
        {error && <div className={styles.errorMessage}>{error}</div>}
        {!isCodeSent ? (
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.input}
            />
            <div className={styles.optionalLabel}>Optional</div>
            <input
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
            <div className={styles.optionalLabel}>Optional</div>
            <input
              type="text"
              placeholder="Enter your address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={styles.input}
            />
            <div className={styles.optionalLabel}>Optional</div>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className={styles.input}
            />
            <button
              onClick={sendPhone}
              className={styles.button}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Code"}
            </button>
          </div>
        ) : (
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Enter verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={styles.input}
            />
            <button
              onClick={verifyCode}
              className={styles.button}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        )}
        {isCodeConfirmed && (
          <div className={styles.successMessage}>
            Code confirmed! You are logged in.
          </div>
        )}
      </div>
    </div>
  );
}
