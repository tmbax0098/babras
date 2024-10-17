"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/context/AuthContext";
import SignInModal from "@/components/SignInModal";

// تعریف schema برای اعتبارسنجی فرم
const validationSchema = yup.object().shape({
  address: yup.string().required("Address is required"),
});

// تعریف نوع دقیق داده‌هایی که از فرم دریافت می‌کنیم
interface FormData {
  address: string;
}

const CheckoutPage: React.FC = () => {
  const { cart, removeItem, updateItem } = useCart();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    email: "",
    userId: "",
  });

  const [openModal, setOpenModal] = useState(false); // حالت مودال

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
  });

  // بررسی وضعیت ورود و تنظیم اطلاعات کاربر
  useEffect(() => {
    if (isAuthenticated) {
      const storedName = localStorage.getItem("fullname");
      const storedPhone = localStorage.getItem("phone");
      const storedEmail = localStorage.getItem("email"); // اضافه کردن ایمیل
      const storedAddress = localStorage.getItem("address");
      const userId = localStorage.getItem("userId");

      setUserData({
        name: storedName || "",
        phone: storedPhone || "",
        email: storedEmail || "", // ایمیل کاربر
        userId: userId || "",
      });

      if (storedAddress) {
        setValue("address", storedAddress);
      }
    }
  }, [isAuthenticated, setValue]);

  // ذخیره اطلاعات کاربر جدید در دیتابیس
  const saveUserDataToServer = async () => {
    try {
      const userUpdateData = {
        userId: userData.userId,
        name: userData.name,
        phone: userData.phone,
        address: localStorage.getItem("address"),
      };

      const response = await fetch("/api/users/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userUpdateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update user data");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  // مدیریت دکمه Place Order
  const handlePlaceOrder = async (data: FormData) => {
    if (!isAuthenticated) {
      setOpenModal(true);
      return;
    }

    if (cart.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!userData.name || !userData.phone) {
      alert("Please complete all required fields.");
      return;
    }

    // ذخیره اطلاعات کاربر جدید در صورت نیاز
    await saveUserDataToServer();

    try {
      const orderData = {
        userId: userData.userId,
        items: cart.items,
        totalPrice: cart.items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        ),
        name: userData.name,
        address: data.address,
        phone: userData.phone,
        status: "Pending",
      };

      console.log("Order data being sent to API:", orderData);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        router.push("/confirmation");
      } else {
        console.error("Failed to place order");
        alert("There was an error placing your order. Please try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      {/* مودال ورود */}
      <SignInModal
        open={openModal}
        onClose={() => setOpenModal(false)} // امکان بستن مودال
      />

      <form onSubmit={handleSubmit(handlePlaceOrder)}>
        <Box sx={{ marginBottom: "20px" }}>
          <TextField
            fullWidth
            label="Name"
            value={userData.name || ""}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            sx={{ marginBottom: "10px" }}
          />
          <TextField
            fullWidth
            label="Email"
            value={userData.email || ""}
            onChange={(e) =>
              setUserData({ ...userData, email: e.target.value })
            }
            sx={{ marginBottom: "10px" }}
          />
          <Controller
            name="address"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Address"
                error={!!errors.address}
                helperText={errors.address ? errors.address.message : ""}
                sx={{ marginBottom: "10px" }}
              />
            )}
          />
          <TextField
            fullWidth
            label="Phone"
            value={userData.phone || ""}
            InputProps={{
              readOnly: isAuthenticated,
            }}
            sx={{ marginBottom: "20px" }}
          />
        </Box>

        <Typography variant="h5" gutterBottom>
          Order Summary
        </Typography>
        {cart.items.length === 0 ? (
          <Typography variant="h6">Your cart is currently empty.</Typography>
        ) : (
          <>
            <List>
              {cart.items.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <ListItemText
                    primary={`${item.name} - $${item.price} x ${item.quantity}`}
                    secondary={`Size: ${item.size || "N/A"}, Color: ${
                      item.color || "N/A"
                    }`}
                  />

                  <Box>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      sx={{ marginRight: "10px" }}
                    >
                      +
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() =>
                        updateItem(
                          item.id,
                          item.quantity > 1 ? item.quantity - 1 : 1
                        )
                      }
                      sx={{ marginRight: "10px" }}
                    >
                      -
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>

            <Box sx={{ marginTop: "20px", textAlign: "center" }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                sx={{ padding: "10px 20px" }}
              >
                Place Order
              </Button>
              <Link href="/cart" passHref>
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={{ marginLeft: "10px", padding: "10px 20px" }}
                >
                  Back to Cart
                </Button>
              </Link>
            </Box>
          </>
        )}
      </form>
    </Box>
  );
};

export default CheckoutPage;
