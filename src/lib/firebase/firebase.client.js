// Import the functions you need from the SDKs you need

import { getApp, getApps, deleteApp, initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, inMemoryPersistence } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage, getDownloadURL, ref, listAll } from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: import.meta.env.VITE_APIKEY,

  authDomain: import.meta.env.VITE_AUTH_DOMAIN,

  projectId: import.meta.env.VITE_PROJECT_ID,

  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,

  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,

  appId: import.meta.env.VITE_APP_ID,

  measurementId: import.meta.env.VITE_MEASUREMENT_ID,

  storageBucket: import.meta.env.VITE_STORAGE_BUCKET

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
export const db = getFirestore(firebaseApp)
export const storage = getStorage()
export const fuelImagesRef = ref(storage, "fuel_images")

export async function getFuelsFileNames() {
  let fileNames = [];
  try {
    const listRef = ref(fuelImagesRef);
    const res = await listAll(listRef);
    fileNames = res.items.map(itemRef => itemRef.name);
  } catch (error) {
    console.error("Error listing files:", error);
  }
  return fileNames;
};

export async function getFuelsImages(fileNames) {
  let files = {}
  fileNames.forEach((fName) => {
    console.log('getting image url', fName)
    const imageUrl = getFuelImage(fName)
    files[fName.split('.')[0]] = imageUrl
  })
  return files
}


export async function getFuelImage(fileName) {
  console.log("Calling firebase store :", fileName)
  let imageUrl = ""
  try {
    imageUrl = await getDownloadURL(ref(fuelImagesRef, fileName));
  } catch (error) {
    console.error("Error fetching image URL:", error);
  }
  return imageUrl
}
