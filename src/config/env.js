import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 4000),
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRES || "7d",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || '*',


  //  agora keys
  AGORA_APP_ID: process.env.AGORA_APP_ID,
  AGORA_APP_CERTIFICATE: process.env.AGORA_APP_CERTIFICATE,

  // MSG91 OTP credentials
MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY,
MSG91_TEMPLATE_ID: process.env.MSG91_TEMPLATE_ID,
MSG91_SENDER_ID: process.env.MSG91_SENDER_ID,
MSG91_ROUTE: process.env.MSG91_ROUTE,
MSG91_COUNTRY: process.env.MSG91_COUNTRY,


};


