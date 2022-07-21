import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

if (!getApps().length) {
  const app = initializeApp({
    apiKey: 'AIzaSyCNLXbIoLEyxDypw-Lvt2AYfBrcy0YpflE',
    authDomain: 'auth.leancoffee.in',
    projectId: 'leancoffee-in',
    storageBucket: 'leancoffee-in.appspot.com',
    messagingSenderId: '257473372431',
    appId: '1:257473372431:web:cdfaedebcd6a879dc8de7a',
    measurementId: 'G-FT4WSSPJQC'
  })
  getAnalytics(app)
}

export const firebaseApp = getApp()
