// src/loaders/firebase.js
import admin from "firebase-admin";
import fs from "fs";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    fs.readFileSync("firebase-service-account.json", "utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("🔥 Firebase Admin initialized");
}

export default admin;
