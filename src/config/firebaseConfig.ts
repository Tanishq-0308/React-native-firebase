import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBxDsjxxPIBxLPyAUlnFeYNiFqidqyYL6s",
    projectId: "fir-authapp-c508e",
    storageBucket: "fir-authapp-c508e.firebasestorage.app",
    messagingSenderId: "93643122313",
    appId: "1:93643122313:android:b833ddb155799425444858"
};

let app;
if(getApps().length ===0){
    app = initializeApp(firebaseConfig);
}else{
    app = getApps()[0];
}

export const auth= getAuth(app);
export default app;
