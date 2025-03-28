import fetch from 'node-fetch';

const BASE_URL = 'https://match-maker-m9rra21dd-314yushs-projects.vercel.app';
const files = [
    '/frame.html',
    '/frame-image.png',
    '/.well-known/farcaster.json'
];

async function testFiles() {
    for (const file of files) {
        try {
            const response = await fetch(`${BASE_URL}${file}`);
            if (response.ok) {
                console.log(`✅ ${file} is accessible (${response.status})`);
            } else {
                console.log(`❌ ${file} is not accessible (${response.status})`);
            }
        } catch (error) {
            console.log(`❌ Error accessing ${file}:`, error.message);
        }
    }
}

testFiles(); 