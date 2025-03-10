import ContentTester from './content-tester.js';

const tester = new ContentTester();

tester.addTestCase('descriptions', {
  content: 'This text contains offensive content: you piece of sh*t',
  expectation: 'fail',
  name: 'Turkish bad words',
});

tester.addTestCase('descriptions', {
  content: 'Herkes orosbu cocugudur',
  expectation: 'fail',
  name: 'Turkish bad words',
});

tester.addTestCase('descriptions', {
  content: 'Ana Skm',
  expectation: 'fail',
  name: 'Turkish bad words',
});

tester.addTestCase('descriptions', {
  content: 'Oç',
  expectation: 'fail',
  name: 'Turkish bad words',
});

tester.addTestCase('descriptions', {
  content: 'Sikerim',
  expectation: 'fail',
  name: 'Turkish bad words',
});

tester.addTestCase('images', {
  source: 'https://preview.redd.it/driving-naked-is-the-best-v0-uyjteq2chune1.jpeg?auto=webp&s=410f53d8f693817f9531306b5b08d133fb49e662',
  type: 'url',
  expectation: 'fail',
  name: 'Nudity',
});

tester.addTestCase('images', {
  source: 'https://preview.redd.it/the-perfect-naked-body-v0-zaie9mlcgvne1.jpeg?auto=webp&s=5d3d109f2c4d8b7f171a2be98fb8ee0bb4123ad5',
  type: 'url',
  expectation: 'fail',
  name: 'Nudity',
});

tester.addTestCase('images', {
  source:
    'https://preview.redd.it/love-feeling-the-sunshine-on-my-bare-skin-v0-f5fdzwddu9ne1.jpeg?auto=webp&s=8a8dd1b2837fe91e9aa3c4b85821f969dfe87292',
  type: 'url',
  expectation: 'fail',
  name: 'Nudity',
});

tester.addTestCase('images', {
  source:
    'https://preview.redd.it/a-day-at-the-beach-with-my-girls-v0-405t4i2dy2ne1.jpeg?auto=webp&s=10f368719af091343d29a35237c60f006005c8bc',
  type: 'url',
  expectation: 'fail',
  name: 'Nudity',
});

tester.addTestCase('images', {
  source:
    'https://preview.redd.it/picking-wild-blueberries-while-naked-was-so-freeing-v0-nvhceiq07vne1.jpeg?auto=webp&s=57c74b8a571e031eeeaad483dd02eda4543ba729',
  type: 'url',
  expectation: 'fail',
  name: 'Nudity',
});

tester.addTestCase('images', {
  source: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwVRvRNE9dTG6YUVvp9Tild2GjQJZwu9NeJg&s',
  type: 'url',
  expectation: 'pass',
  name: 'Flowers',
});

tester.addTestCase('images', {
  source: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX8hWHmhsWhZGs3T7luD7F0aFLrYv1yJsNiw&s',
  type: 'url',
  expectation: 'pass',
  name: 'Sunshine',
});

tester.addTestCase('images', {
  source: 'https://static.birgun.net/resim/haber/2024/04/15/odtu-senligi-rektorun-yasagina-karsi-ogrenci-dayanismasi.jpg',
  type: 'url',
  expectation: 'pass',
  name: 'Odtü',
});

// tester.addTestCase('links', {
//   content: 'http://malicious-phishing-site.com/fake-login',
//   expectation: 'fail',
//   name: 'Custom suspicious link test',
// });

tester.runTests();
