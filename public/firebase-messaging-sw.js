importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAL8d_7x502a6hEL5zZYxViaXfYtj7bCrM",
  authDomain: "coach360-913f9.firebaseapp.com",
  projectId: "coach360-913f9",
  storageBucket: "coach360-913f9.firebasestorage.app",
  messagingSenderId: "611325903924",
  appId: "1:611325903924:web:1090911d4f757e6ee0b661"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: icon || '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
  });
});
