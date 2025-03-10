import axios from 'axios';
import chalk from 'chalk';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:3000/api/moderate';

const testCases = {
  descriptions: [
    {
      content: 'This is a clean description',
      expectation: 'pass',
      name: 'Clean text',
    },
    {
      content: 'This content contains profanity: fuck',
      expectation: 'fail',
      name: 'English profanity',
    },
    {
      content: 'This content contains Turkish profanity: amk',
      expectation: 'fail',
      name: 'Turkish profanity',
    },
    {
      content: 'I will attack you and hurt you badly',
      expectation: 'fail',
      name: 'Threatening content',
    },
  ],
  links: [
    {
      content: 'https://example.com',
      expectation: 'pass',
      name: 'Safe link',
    },
    {
      content: 'http://malware.testing.google.test/testing/malware/',
      expectation: 'fail',
      name: 'Malicious link',
    },
  ],
  images: [],
  //   {
  //     source: '../test/test-images/safe-image.jpg',
  //     type: 'local',
  //     expectation: 'pass',
  //     name: 'Safe local image',
  //   },
  //   {
  //     source: '../test/test-images/nudity.jpg',
  //     type: 'local',
  //     expectation: 'fail',
  //     name: 'Inappropriate local image',
  //   },
  //   {
  //     source: 'https://example.com/safe-image.jpg',
  //     type: 'url',
  //     expectation: 'pass',
  //     name: 'Safe image URL',
  //   },
  //   {
  //     source: 'https://example.com/inappropriate-image.jpg',
  //     type: 'url',
  //     expectation: 'fail',
  //     name: 'Inappropriate image URL',
  //   },
  // ],
};

class ContentTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: 0,
    };
  }

  async downloadImage(url) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(response.data, 'binary');
    } catch (error) {
      console.log(chalk.yellow(`Warning: Could not download image from ${url}`));
      return null;
    }
  }

  async testContent(description, link, image = null) {
    try {
      const form = new FormData();
      form.append('description', description);
      form.append('link', link);

      const payload = {
        description,
        link,
        image: image
          ? {
              type: image.type,
              source: image.source,
            }
          : null,
      };

      if (image) {
        if (image.type === 'local') {
          const fullPath = path.join(__dirname, image.source);
          if (fs.existsSync(fullPath)) {
            form.append('image', fs.createReadStream(fullPath));
          } else {
            console.log(chalk.yellow(`Warning: Image not found at ${fullPath}`));
            if (!image.required) {
              console.log(chalk.yellow('Continuing test without image...'));
            } else {
              return {
                error: 'Image file not found',
                status: 'error',
                payload,
              };
            }
          }
        } else if (image.type === 'url') {
          const imageBuffer = await this.downloadImage(image.source);
          if (imageBuffer) {
            form.append('image', imageBuffer, { filename: 'image.jpg' });
          } else if (image.required) {
            return {
              error: 'Failed to download image',
              status: 'error',
              payload,
            };
          }
        }
      }

      try {
        const response = await axios.post(API_URL, form, {
          headers: form.getHeaders(),
        });
        return { ...response, payload };
      } catch (error) {
        if (error.response) {
          return { ...error.response, payload };
        }
        return {
          error: error.message || 'API request failed',
          status: 'error',
          data: { message: error.message },
          payload,
        };
      }
    } catch (error) {
      return {
        error: error.message || 'Test execution failed',
        status: 'error',
        data: { message: error.message },
        payload: { description, link, image },
      };
    }
  }

  printResult(testName, expected, actual) {
    if (!actual || actual.status === 'error') {
      console.log(chalk.red(`✗ ${testName} (Error: ${actual?.error || 'Unknown error'})`));
      if (actual?.payload) {
        console.log(chalk.gray('  Payload:'));
        console.log(chalk.gray(`  ${JSON.stringify(actual.payload, null, 2)}`));
      }
      this.results.errors++;
      return;
    }

    if (!actual.status) {
      console.log(chalk.red(`✗ ${testName} (Error: API not responding)`));
      if (actual.payload) {
        console.log(chalk.gray('  Payload:'));
        console.log(chalk.gray(`  ${JSON.stringify(actual.payload, null, 2)}`));
      }
      this.results.errors++;
      return;
    }

    const passed = (expected === 'pass' && actual.status === 200) || (expected === 'fail' && actual.status === 400);

    if (passed) {
      console.log(chalk.green(`✓ ${testName}`));
      this.results.passed++;
    } else {
      console.log(chalk.red(`✗ ${testName}`));
      console.log(chalk.gray(`  Expected: ${expected}`));
      console.log(chalk.gray(`  Response: ${JSON.stringify(actual.data, null, 2)}`));
      console.log(chalk.gray('  Payload:'));
      console.log(chalk.gray(`  ${JSON.stringify(actual.payload, null, 2)}`));
      this.results.failed++;
    }
  }

  async runTests() {
    try {
      await axios.get(API_URL.replace('/moderate', '/health'));
    } catch (error) {
      console.log(chalk.red('\n⚠️  Error: API server is not running'));
      console.log(chalk.yellow('Please start the API server first with: npm start\n'));
      return;
    }

    for (const test of testCases?.descriptions) {
      const response = await this.testContent(test.content, 'https://example.com', {
        type: 'local',
        source: '../test/test-images/safe-image.jpg',
        required: false,
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      this.printResult(test.name, test.expectation, response);
    }

    console.log(chalk.blue('\n=== Testing Links ==='));
    for (const test of testCases?.links) {
      const response = await this.testContent('Clean description', test.content, {
        type: 'local',
        source: '../test/test-images/safe-image.jpg',
        required: false,
      });
      this.printResult(test.name, test.expectation, response);
    }

    console.log(chalk.blue('\n=== Testing Images ==='));
    for (const test of testCases?.images) {
      const response = await this.testContent('Clean description', 'https://example.com', { ...test, required: true });
      this.printResult(test.name, test.expectation, response);
    }

    this.printSummary();
  }

  printSummary() {
    console.log(chalk.blue('\n=== Test Summary ==='));
    console.log(chalk.green(`Passed: ${this.results.passed}`));
    console.log(chalk.red(`Failed: ${this.results.failed}`));
    console.log(chalk.yellow(`Errors: ${this.results.errors}`));
  }

  addTestCase(type, testCase) {
    if (testCases[type]) {
      testCases[type].push(testCase);
    } else {
      console.log(chalk.red(`Invalid test type: ${type}`));
    }
  }
}

export default ContentTester;
