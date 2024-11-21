import CryptoJS from "crypto-js";
import axios from "axios";
import axiosInstance from "./axiosInstance";
import { QueryClient } from "@tanstack/react-query";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// Retrieve encrypted sessionData from localStorage and decrypt it
export const getSessionData = () => {
  const encryptedData = localStorage.getItem("sessionData");
  if (!encryptedData) return null;
  try {
    return decryptData(encryptedData);
  } catch (error) {
    console.error("Error decrypting session data:", error);
    return null;
  }
};

// Set sessionData to localStorage after encrypting it
export const setSessionData = (newSessionData) => {
  const encryptedData = encryptData(newSessionData);
  localStorage.setItem("sessionData", encryptedData);
};

// Clear sessionData from localStorage
export const clearSessionData = () => {
  localStorage.removeItem("sessionData");
};

// Get accessToken
export const getAccessToken = () => {
  const sessionData = getSessionData();
  return sessionData.accessToken || null;
};

// Set accessToken
export const setAccessToken = (accessToken) => {
  const sessionData = getSessionData();
  const newSessionData = {
    ...sessionData,
    accessToken,
  };
  setSessionData(newSessionData);
};

// logoutUser
export const logoutUser = async () => {
  const sessionData = getSessionData();
  if (!sessionData) {
    clearSessionData(); // Clear storage just in case
    return;
  }

  try {
    const response = await axiosInstance.post(
      `${import.meta.env.VITE_API_BASE_URL}/users/logout`,
      { email: sessionData.email }
    );
    console.log("Logout response:", response?.data?.message);
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.clear(); // Ensure session data is cleared
  }
};

export const queryClient = new QueryClient();
