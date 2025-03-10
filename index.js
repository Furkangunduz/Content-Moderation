import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import multer from 'multer';
import { checkImage, checkLink, moderateContent } from './src/services/contentModeration.js';

// Load environment variables
dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/api/moderate', upload.single('image'), async (req, res) => {
  const { description, link } = req.body;
  const image = req.file;

  let issues = {
    bad_language: null,
    malicious_link: null,
    nudity_or_threat_image: null,
  };

  try {
    if (description) {
      issues.bad_language = await moderateContent(description);
    }
    if (link) {
      issues.malicious_link = await checkLink(link);
    }
    if (image) {
      const imageIssues = await checkImage(image);
      if (imageIssues.length > 0) {
        issues.nudity_or_threat_image = imageIssues.join(' | ');
      }
    }

    const hasIssues = Object.values(issues).some((issue) => issue !== null);

    if (hasIssues) {
      return res.status(400).json({
        message: 'Content contains issues. Please review.',
        issues,
      });
    }

    res.status(200).json({
      message: 'Content is safe and approved.',
      issues: null,
    });
  } catch (err) {
    console.error('Moderation Error:', err.message);
    res.status(500).json({
      error: 'Internal moderation service error.',
      details: err.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
