
const fs = require('fs');
const path = require('path');
const https = require('https');

const fontsDir = path.join(__dirname, '../public/fonts');

// Create fonts directory if it doesn't exist
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// Font URLs
const fonts = [
  {
    url: 'https://github.com/google/fonts/raw/main/ofl/amiri/Amiri-Regular.ttf',
    filename: 'Amiri-Regular.ttf'
  },
  {
    url: 'https://github.com/google/fonts/raw/main/ofl/amiri/Amiri-Bold.ttf',
    filename: 'Amiri-Bold.ttf'
  }
];

// Download function
const downloadFont = (url, filename) => {
  const filePath = path.join(fontsDir, filename);
  
  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`${filename} already exists, skipping download.`);
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${filename}...`);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename} successfully.`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if download failed
      console.error(`Error downloading ${filename}:`, err.message);
      reject(err);
    });
  });
};

// Download all fonts
Promise.all(fonts.map(font => downloadFont(font.url, font.filename)))
  .then(() => console.log('All fonts downloaded successfully.'))
  .catch(err => console.error('Error downloading fonts:', err));
