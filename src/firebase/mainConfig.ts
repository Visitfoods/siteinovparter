// Importar as funções necessárias do SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase com valores padrão seguros
const mainFirebaseConfig = {
    apiKey: "AIzaSyAQ5lYdq6NsEocX86K6gn2GrOowW9gJ68A",
    authDomain: "inovpartner-23bc8.firebaseapp.com",
    projectId: "inovpartner-23bc8",
    storageBucket: "inovpartner-23bc8.firebasestorage.app",
    messagingSenderId: "925375393395",
    appId: "1:925375393395:web:942aa96a96d9e338268406"
};

// Inicializar Firebase para a página principal
const mainApp = initializeApp(mainFirebaseConfig, 'main-app');

// Inicializar Firestore para a página principal
const mainDb = getFirestore(mainApp);

export { mainDb };