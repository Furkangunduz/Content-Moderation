import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  sightengine: {
    user: process.env.SIGHTENGINE_USER,
    secret: process.env.SIGHTENGINE_SECRET,
  },
  google: {
    safeBrowsingKey: process.env.GOOGLE_SAFE_BROWSING_API_KEY,
    appName: process.env.APP_NAME,
  },
  paths: {
    images: path.join(process.cwd(), 'images'),
    requests: path.join(process.cwd(), 'requests'),
  },
};
