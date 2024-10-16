import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// __dirname va __filename kabi CommonJS konstruktorlarini olish uchun kerak
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Statik fayllarni xizmat qilish
app.use(express.static(path.join(__dirname, 'dist')));

// Har qanday boshqa marshrutlarni "index.html" ga yuborish
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
