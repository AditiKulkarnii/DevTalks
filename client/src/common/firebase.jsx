import { initializeApp } from "firebase/app";
import {GoogleAuthProvider, getAuth, signInWithPopup} from 'firebase/auth'
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA7i52OUNE15X0NYm_krJT5JjKL9RAQYH4",
    authDomain: "my-blog-b74b4.firebaseapp.com",
    projectId: "my-blog-b74b4",
    storageBucket: "my-blog-b74b4.appspot.com",
    messagingSenderId: "404410680312",
    appId: "1:404410680312:web:fcfe2061c54f50f7fc4c0d",
    measurementId: "G-03YZ2RCGJD"
  };

const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider()

const auth = getAuth()

export const authWithGoogle = async() =>{
    let user = null;
    await signInWithPopup(auth, provider).then((result) =>{
        user = result.user
    }).catch((err)=>
    {
        console.log(err)
    })
    return user;
}