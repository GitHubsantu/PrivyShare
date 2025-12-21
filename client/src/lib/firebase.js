// Created by DevOps
// GitHub: https://github.com/githubsantu

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB2_ixxwtqPX1NOZyHfJK3tcZ54YqbL69c",
  authDomain: "privyshare-adbbe.firebaseapp.com",
  projectId: "privyshare-adbbe",
  appId: "1:232441450321:web:eb65ddfc7811e4ec2bcd70",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
