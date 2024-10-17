"use client";

import { useEffect, useReducer } from "react";
import styles from "./AccountSettings.module.css"; // وارد کردن CSS Module

// تعریف نوع داده‌ها
interface UserData {
  phone: string;
  email: string;
  address: string;
  fullname: string;
}

interface Action {
  type: string;
  payload: Partial<UserData>;
}

// وضعیت اولیه
const initialState: UserData = {
  phone: "",
  email: "",
  address: "",
  fullname: "",
};

// تابع کاهش‌دهنده (reducer)
function reducer(state: UserData, action: Action) {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// تابع برای بارگذاری داده‌ها از localStorage
const loadData = (): Partial<UserData> => {
  return {
    phone: localStorage.getItem("phone") || "",
    email: localStorage.getItem("email") || "",
    address: localStorage.getItem("address") || "",
    fullname: localStorage.getItem("fullname") || "",
  };
};

const AccountSettings = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const storedData = loadData();
    dispatch({ type: "SET_DATA", payload: storedData });
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Account Settings</h1>


      <ul className={styles.list}>
        {Object.entries(state).map(([key, value]) => (
          <li className={styles.listItem} key={key}>
            <span className={styles.label}>{`${
              key.charAt(0).toUpperCase() + key.slice(1)
            }:`}</span>{" "}
            {value}
          </li>
        ))}
      </ul>

    </div>
  );
};

export default AccountSettings;
