"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import AlertModal from "@/components/AlertModal";

// กำหนดหน้าตาของคำสั่ง showAlert
interface AlertContextType {
  showAlert: (
    title: string,
    message: string,
    type?: "success" | "error" | "info",
    onOk?: () => void
  ) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error" | "info">("info");
  const [onOk, setOnOk] = useState<() => void>(() => () => {});

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info",
    onOk: () => void = () => {}
  ) => {
    setTitle(title);
    setMessage(message);
    setType(type);
    setOnOk(() => onOk); // เก็บฟังก์ชันไว้เรียกตอนกดตกลง
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onOk) onOk(); // เรียกฟังก์ชัน callback (ถ้ามี)
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {/* แปะ Modal ไว้ตรงนี้ทีเดียว ใช้ได้ทั้งแอป */}
      <AlertModal
        isOpen={isOpen}
        title={title}
        message={message}
        type={type}
        onClose={handleClose}
      />
    </AlertContext.Provider>
  );
}

// สร้าง Hook เพื่อให้เรียกใช้ง่ายๆ
export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}