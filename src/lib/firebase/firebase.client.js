// Import the functions you need from the SDKs you need

import { getApp, getApps, deleteApp, initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, inMemoryPersistence } from "firebase/auth"

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: import.meta.env.VITE_APIKEY,

  authDomain: import.meta.env.VITEAUTHDOMAIN,

  projectId: "uk-behaveplus",

  storageBucket: "uk-behaveplus.appspot.com",

  messagingSenderId: "408912685094",

  appId: "1:408912685094:web:4ba75bbfc7bfdb69cf1ee7",

  measurementId: "G-BPSBFFNVNN"

};


// Initialize Firebase

let firebaseApp;
if (!getApps.length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp()
  deleteApp(firebaseApp)
  firebaseApp = initializeApp(firebaseConfig);
}

export const auth = getAuth(firebaseApp)
