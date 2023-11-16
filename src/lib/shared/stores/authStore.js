import { async } from "@firebase/util";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateCurrentUser, updateEmail, updatePassword, updateProfile } from "firebase/auth"
import { writable } from "svelte/store";
import { auth } from "$lib/firebase/firebase.client"

export const authStore = writable({
  isLoading: true,
  currentUser: null,
})

export const authHandlers = {
  login: async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
  },
  signup: async (email, password, displayName) => {
    await createUserWithEmailAndPassword(auth, email, password);
    updateProfile(auth.currentUser, { displayName })
  },
  logout: async () => {
    await signOut(auth)
  },

  resetPassword: async (auth, email) => {
    await sendPasswordResetEmail(auth, email)
  },
  updateEmail: async (newEmail) => {
    authStore.update(curr => {
      return {
        ...curr, currentUser: {
          ...curr.currentUser, email: newEmail
        }
      }
    })
    await updateEmail(auth.currentUser, newEmail)
  },
  updatePassword: async (newPassword) => {
    updatePassword(auth.currentUser, newPassword)
  }
}
