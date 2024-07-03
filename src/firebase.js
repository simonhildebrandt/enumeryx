import { useState, useEffect } from 'react';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import {
  getAuth,
  sendSignInLinkToEmail,
  connectAuthEmulator,
  onAuthStateChanged,
  signOut,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";

import {
  getFirestore,
  // initializeFirestore,
  // persistentLocalCache,
  collection,
  query,
  where,
  or,
  and,
  onSnapshot,
  connectFirestoreEmulator,
  addDoc,
  setDoc,
  // getDoc,
  updateDoc,
  // deleteDoc,
  doc,
  Query,
  // writeBatch
} from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbhROlqqq061XBwwL7qSoqtg-_0hha4e0",
  authDomain: "enumeryx.firebaseapp.com",
  projectId: "enumeryx",
  storageBucket: "enumeryx.appspot.com",
  messagingSenderId: "1074270941966",
  appId: "1:1074270941966:web:b2c207a2ab96e54f7f5d5f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const debug = !!'DEBUG';

if (debug) {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, 'localhost', 8080);
}

function withUser() {
  const [user, setUser] = useState(null);
  const [loginData, setLoginData] = useState(null);

  useEffect(_ => {
    handleSigninLink()
    .then(result => {
      console.log({result})
      if (result) {
        window.location.href = window.location.origin;
      }
    })
  }, []);

  useEffect(_ => {
    const unsub = onAuthStateChanged(auth, userData => {
      if (userData) {
        // const uid = user.uid;
        console.log("We got a user!", userData);
        setUser(userData);
      } else {
        console.log("We're userless")
        setUser(false);
      }
    });

    return unsub;
  }, [])

  return {user, loginData};
}

async function handleSigninLink() {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    console.log("signin link!")

    const url = new URL(window.location.href);
    const next = url.searchParams.get('next') || '/';

    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      // User opened the link on a different device. To prevent session fixation
      // attacks, ask the user to provide the associated email again. For example:
      email = window.prompt('Please provide your email for confirmation');
    }

    return signInWithEmailLink(auth, email, window.location.href)
    .then(async (result) => {
      // Clear email from storage.
      window.localStorage.removeItem('emailForSignIn');
      console.log("logged in!", result);

      await setupUser(result.user);

      return true;
    })
    .catch((error) => {
      // Some error occurred, you can inspect the code: error.code
      // Common errors could be invalid email and invalid or expired OTPs.
      console.error("failed login", error)
    });
  } else {
    console.log("not sign in link")
  }
}

async function getUserData(uid) {
  return getDoc(doc(db, `users/${uid}`)).then(d => d?.data());
}

function sendSignInLink(email) {
  const actionCodeSettings = {
    url: window.location.origin,
    handleCodeInApp: true
  };

  sendSignInLinkToEmail(auth, email, actionCodeSettings)
  .then(() => {
    console.log("sent!")
    window.localStorage.setItem('emailForSignIn', email);
  })
  .catch(err => console.error(err))
}

async function logout() {
  return signOut(auth);
}

function setupUser({uid, email}) {
  return setDoc(doc(db, 'users', uid), { email })
  .then(res => console.log('created!', res))
}

function addRecord(path, data) {
  console.log({path, data})
  return addDoc(collection(db, path), data)
}

export const objectFromDocs = snapshot => {
  const hash = {};
  snapshot.docs.map(doc => hash[doc.id] = doc.data());
  return hash;
}

function useFirestoreDocument(path) {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, path), snapshot => {
      setData(snapshot.data());
      setLoaded(true);
    });

    return () => { unsub() };
  }, [path]);

  return { data, loaded };
}

function useFirestoreCollection(pathOrQuery, clauses = null) {
  const [data, setData] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let query;

    if (pathOrQuery instanceof Query) {
      query = pathOrQuery;
    } else {
      col = collection(db, pathOrQuery);

      query = query(
        col,
        ...(clauses ? clauses.map(clause => where(...clause)) : [])
      );
    }

    const unsub = onSnapshot(query, querySnapshot => {
      setData(objectFromDocs(querySnapshot));
      setLoaded(true);
    });

    return () => { unsub() };
  }, [pathOrQuery]);

  return { data, loaded };
}

function setQuery(user) {
  return query(
    collection(db, 'sets'),
    and(
      where('deletedAt', '==', null),
      or(
        where('creator', '==', user.uid),
        and(
          where('org', '==', user.email.split('@')[1]),
          where('shared', '==', true),
        )
      )
    )
  )
}

function updateRecord(path, data) {
  updateDoc(doc(db, path), data);
}

export {
  withUser,
  getUserData,
  sendSignInLink,
  logout,
  addRecord,
  useFirestoreCollection,
  where,
  useFirestoreDocument,
  updateRecord,
  setQuery,
}
