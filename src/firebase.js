import firebase from 'firebase/app';
import "firebase/auth";
import "firebase/database";
import "firebase/storage";



const firebaseConfig = {
    apiKey: "AIzaSyBHQSR_C2hB4tJuMn_EPNiiulhAGyBKKwg",
    authDomain: "react-slack-clone-24be5.firebaseapp.com",
    projectId: "react-slack-clone-24be5",
    storageBucket: "react-slack-clone-24be5.appspot.com",
    messagingSenderId: "888181529765",
    appId: "1:888181529765:web:fef5b6749761d30db9814c",
    measurementId: "G-82LYT3MD76",
    
  };
  
   firebase.initializeApp(firebaseConfig);

  export default firebase;