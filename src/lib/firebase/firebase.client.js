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

const fuelModelsRef = ref(storage, "fuelModels")
const fuelImagesRef = ref(storage, "fuel_images")

export async function getFuelModelsUrls(fuelModel) {
  console.log('getting fuel model file names', fuelModel)
  let fileNames = []
  const listRef = ref(fuelModelsRef, fuelModel)
  listAll(listRef)
    .then((result) => {
      let promises = []
      result.items.forEach((imageRef) => {
        promises.push(getDownloadURL(imageRef))
      })
      return Promise.all(promises)
    }).then((urls) => {
      urls.forEach((url) => {
        fileNames.push({ src: url })
      })
    }).catch((error) => {
      console.error("Error listing files:", error); // Uh-oh, an error occurred!
    })
  // .then(async (res) => {
  //   const { items } = res;
  //   const urls = await Promise.all(
  //     items.map((item) => getDownloadURL(item))
  //   );
  //
  //   // Array of download URLs of all files in that folder
  //   console.log(urls);
  //   return urls;
  // })
  // .catch((error) => {
  // Uh-oh, an error occurred!

  // });
  console.log('Complete fileNames', fileNames)
  return fileNames;
}


export async function getFuelModelsFileNames(fuelModel) {
  console.log('getting fuel model file names', fuelModel)
  let fileNames = []
  try {
    const listRef = ref(fuelModelsRef, fuelModel)
    const res = await listAll(listRef);
    fileNames = res.items.map(itemRef => itemRef.name);

  } catch (error) {
    console.error("Error listing files:", error);
  }
  console.log('fileNames', fileNames)
  return fileNames;
}

export async function getFuelModelsImages(fuelModel, fNames) {
  let files = {}
  const listRef = ref(fuelModelsRef, fuelModel)
  fNames.forEach((fName) => {
    const imageUrl = getFuelImage(listRef, fName)
    files[fName.split('.')[0]] = imageUrl
  })
  return files
}


// res.items.forEach(async (itemRef) => {
//   const imageObj = {}
//   const imageUrl = await getDownloadURL(ref(storage, itemRef.fullPath))
//   imageObj['src'] = imageUrl
//   imageObj['alt'] = itemRef.name
//   images.push(imageObj)
//   console.log('imageObj', imageObj)
// })

// fileNames = res.items.map(itemRef => itemRef.name);
// fileNames = res.items;

//   } catch (error) {
//   console.error("Error listing files:", error);
// }
// console.log('fileNames', images)
// return images;
// }


export async function getFuelsFileNames() {
  let fileNames = [];
  try {
    const res = await listAll(fuelImagesRef)
    fileNames = res.items.map(itemRef => itemRef.name);
  } catch (error) {
    console.error("Error listing files:", error);
  }
  return fileNames;
};

export async function getFuelModelImages(fuel, fNames) {
  let imageUrls = []
  const listRef = ref(fuelModelsRef, fuel)
  console.log('listRef', listRef)
  fNames.forEach((fName) => {
    const imageUrl = getFuelImage(listRef, fName)
    console.log('imageUrl', imageUrl)
    imageUrls.push({ 'src': imageUrl, 'alt': 'test' })
  })
  return imageUrls
}

// listAll(listRef).then((res) => {
//   console.log('res', res)
//   res.items.forEach(async (itemRef) => {
//     console.log(itemRef.fullPath)
//     const imageUrl = await getDownloadURL(ref(storage, itemRef.fullPath))
//     imageUrls.push(imageUrl)
//   });
// }).catch((error) => {
//   console.error("Error listing files:", error);
//   // Uh-oh, an error occurred!
// });
// console.log('imageUrls', imageUrls)
// return imageUrls
// }

export async function getFuelsImages(fileNames) {
  let files = {}
  const fuelImagesRef = ref(storage, "fuel_images")
  fileNames.forEach((fName) => {
    const imageUrl = getFuelImage(fuelImagesRef, fName)
    files[fName.split('.')[0]] = imageUrl
  })
  return files
}


export async function getFuelImage(fileRef, fileName) {
  // console.log("Calling firebase store :", fileName)
  let imageUrl = ""
  try {
    imageUrl = await getDownloadURL(ref(fileRef, fileName));
  } catch (error) {
    console.error("Error fetching image URL:", error);
  }
  return imageUrl
}
