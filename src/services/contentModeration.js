import axios from 'axios';
import { Filter } from 'bad-words';
import FormData from 'form-data';
import turkishBadWords from '../../turkish-badwords.js';
import { config } from '../config/index.js';
import { moderateTextWithGemini } from './geminiModeration.js';

const filter = new Filter();
filter.addWords(...turkishBadWords);

const MAX_RETRIES = 2;
const TIMEOUT = 5000;

export const analyzeSightEngineResponse = (moderationResult) => {
  const issues = [];

  if (moderationResult.nudity) {
    const nudityScore = 1 - (moderationResult.nudity.none || 0);
    if (nudityScore > 0.15) {
      const details = [];
      if (moderationResult.nudity.sexual_activity > 0.5) details.push('sexual activity');
      if (moderationResult.nudity.sexual_display > 0.5) details.push('sexual display');
      if (moderationResult.nudity.erotica > 0.5) details.push('erotic content');
      issues.push(`Inappropriate content detected: ${details.join(', ')}`);
    }
  }

  if (moderationResult.weapon) {
    const weaponClasses = moderationResult.weapon.classes;
    const detectedWeapons = Object.entries(weaponClasses)
      .filter(([_, prob]) => prob > 0.3)
      .map(([type]) => type);
    if (detectedWeapons.length > 0) {
      issues.push(`Weapons detected: ${detectedWeapons.join(', ')}`);
    }
  }

  ['offensive', 'gore', 'violence', 'recreational_drug'].forEach((category) => {
    if (moderationResult[category]?.prob > 0.3) {
      const classes = moderationResult[category].classes;
      if (classes) {
        const detected = Object.entries(classes)
          .filter(([_, prob]) => prob > 0.3)
          .map(([type]) => type);
        if (detected.length > 0) {
          issues.push(`${category.charAt(0).toUpperCase() + category.slice(1)} content detected: ${detected.join(', ')}`);
        }
      }
    }
  });

  if (moderationResult.text) {
    const textIssues = [
      ...moderationResult.text.profanity,
      ...moderationResult.text.extremism,
      ...moderationResult.text.weapon,
      ...moderationResult.text.violence,
      ...moderationResult.text.drug,
    ].filter(Boolean);

    if (textIssues.length > 0) {
      issues.push(`Problematic text content detected: ${textIssues.join(', ')}`);
    }
  }

  return issues;
};

export const checkImage = async (image) => {
  const formData = new FormData();

  formData.append('media', image.buffer, {
    filename: image.originalname,
    contentType: image.mimetype,
  });

  formData.append(
    'models',
    'nudity-2.1,weapon,recreational_drug,medical,offensive-2.0,scam,text-content,face-attributes,gore-2.0,text,qr-content,tobacco,violence,self-harm,money,gambling'
  );
  formData.append('api_user', config.sightengine.user);
  formData.append('api_secret', config.sightengine.secret);

  const response = await axios.post('https://api.sightengine.com/1.0/check.json', formData, { headers: { ...formData.getHeaders() } });

  return analyzeSightEngineResponse(response.data);
};

export const checkLink = async (link) => {
  const response = await axios.post(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${config.google.safeBrowsingKey}`, {
    client: { clientId: config.google.appName, clientVersion: '1.0' },
    threatInfo: {
      threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url: link }],
    },
  });

  return response.data?.matches ? 'The provided link is flagged as malicious or unsafe.' : null;
};

export const moderateContent = async (text) => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const geminiResult = await Promise.race([
        moderateTextWithGemini(text),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini timeout')), TIMEOUT)),
      ]);

      if (geminiResult) return geminiResult;
      break;
    } catch (error) {
      console.warn(`Gemini attempt ${i + 1} failed:`, error.message);
      if (i === MAX_RETRIES - 1) {
        console.warn('Falling back to basic filter');
      }
    }
  }

  return filter.isProfane(text) ? 'Inappropriate or threatening language detected in the description.' : null;
};
