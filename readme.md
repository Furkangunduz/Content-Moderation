# Content Moderation

Content moderation API service that helps detect and filter inappropriate content, image, links built with Node.js and Express.

## Features

- Content moderation for text inputs,images,and links
- Integration with Google's Generative AI

## Prerequisites

- Node.js 
- Api key and app name from https://developers.google.com/safe-browsing/v4/get-started
- Sightengine keys from https://sightengine.com/signup
- Google AI API key (for advanced content moderation) from https://aistudio.google.com/apikey


## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/content-checker.git
cd content-checker
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

## Usage

1. Start the server:

```bash
npm start
# or
yarn start
```

2. Run tests:

```bash
npm run test:content
# or
yarn test:content
```
