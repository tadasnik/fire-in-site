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

  projectId: import.meta.env.VITEPROJECTID,

  storageBucket: import.meta.env.VITESTORAGEBUCKET,

  messagingSenderId: import.meta.env.VITEMESSAGINGSENDERID,

  appId: import.meta.env.VITEAPPID,

  measurementId: import.meta.env.VITEMEASUREMENTID

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
