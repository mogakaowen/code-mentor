import CryptoJS from "crypto-js";

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
