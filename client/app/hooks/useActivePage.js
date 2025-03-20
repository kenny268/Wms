'use client';
// src/hooks/useActivePage.js
import { useState } from "react";
export const useActivePage = () => {
  const [activePage, setActivePage] = useState("inventory");
  return { activePage, setActivePage };
};