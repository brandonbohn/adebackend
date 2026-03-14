/* eslint-disable no-console */
require('dotenv').config();

const baseUrl = process.env.SEED_API_BASE_URL || process.env.API_URL || 'https://adebackend.onrender.com';
const frontendUrl = (process.env.FRONTEND_URL || 'https://www.adekiberafoundation.org').replace(/\/$/, '');

function frontendImage(path) {
  return `${frontendUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

const girls = [
  {
    name: 'Mithcell Atieno',
    country: 'Kenya',
    age: '15',
    dream: 'Become a nurse',
    description: 'She loves English and is attending Toi Junior School in grade ten.',
    sentenceInTheirWords: "I'll appreciate any support for ADE.",
    situation: 'Her mother can barely feed her and she is sometimes sent home for lack of school fees.',
    status: 'Available for Sponsorship',
    image: frontendImage('/patience.jpeg')
  },
  {
    name: 'Vivian Atieno',
    country: 'Kenya',
    age: '16',
    dream: 'Become a nurse',
    description: 'She loves English, lives with her mother, and attends Kojongo High School form three.',
    sentenceInTheirWords: 'When I grow up I want to help vulnerable girls.',
    situation: 'She lost her father and her family survives on very limited income.',
    status: 'Available for Sponsorship',
    image: frontendImage('/vivian.jpeg')
  },
  {
    name: 'Cynthia Anyaugo',
    country: 'Kenya',
    age: '14',
    dream: 'Become a professional footballer',
    description: 'Her favorite subject is math and she attends New Hope Initiative Kibera.',
    sentenceInTheirWords: 'I wish to play internationally.',
    situation: 'Lost a parent; sponsorship helps ensure continued education.',
    status: 'Available for Sponsorship',
    image: frontendImage('/Cynthia.jpeg')
  },
  {
    name: 'Cindy Adhiambo',
    country: 'Kenya',
    age: '15',
    dream: 'Become a doctor',
    description: 'She loves playing football and helps her grandmother where she can.',
    sentenceInTheirWords: 'ADE CBO has helped us in so many ways.',
    situation: 'Lives with her grandmother who struggles to provide enough support for the household.',
    status: 'Available for Sponsorship',
    image: frontendImage('/cindy.jpeg')
  }
];

async function run() {
  console.log(`Seeding sponsored girls to: ${baseUrl}`);

  for (const girl of girls) {
    try {
      const response = await fetch(`${baseUrl}/api/sponsored-girls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(girl)
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (_err) {
        data = { raw: text };
      }

      if (!response.ok) {
        console.error(`Failed: ${girl.name} -> ${response.status}`, data);
        continue;
      }

      console.log(`Upserted: ${girl.name} -> ${data?.girl?._id || 'ok'}`);
    } catch (error) {
      console.error(`Error: ${girl.name}`, error?.message || error);
    }
  }

  console.log('Seed complete.');
}

run();
