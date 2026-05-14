import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import multer from 'multer';
import fs from 'fs';
import cors from 'cors';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('database.sqlite');
const PORT = 3000;

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'buttmkhit_salt_2025').digest('hex');
}

db.exec(`
  PRAGMA journal_mode=WAL;
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    tag TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Jurnal',
    url TEXT,
    date TEXT NOT NULL,
    size TEXT,
    abstract TEXT,
    year INTEGER,
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS profiles (
    nip TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    password TEXT NOT NULL,
    email TEXT,
    unit TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastLogin DATETIME
  );
  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_nip TEXT,
    action TEXT NOT NULL,
    doc_id INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const docCols = db.prepare("PRAGMA table_info(documents)").all() as any[];
const colNames = docCols.map((c: any) => c.name);
if (!colNames.includes('abstract')) db.exec("ALTER TABLE documents ADD COLUMN abstract TEXT");
if (!colNames.includes('year')) db.exec("ALTER TABLE documents ADD COLUMN year INTEGER");
if (!colNames.includes('views')) db.exec("ALTER TABLE documents ADD COLUMN views INTEGER DEFAULT 0");
if (!colNames.includes('downloads')) db.exec("ALTER TABLE documents ADD COLUMN downloads INTEGER DEFAULT 0");

const profCols = db.prepare("PRAGMA table_info(profiles)").all() as any[];
const profColNames = profCols.map((c: any) => c.name);
if (!profColNames.includes('email')) db.exec("ALTER TABLE profiles ADD COLUMN email TEXT");
if (!profColNames.includes('unit')) db.exec("ALTER TABLE profiles ADD COLUMN unit TEXT");
if (!profColNames.includes('lastLogin')) db.exec("ALTER TABLE profiles ADD COLUMN lastLogin DATETIME");

const adminCheck = db.prepare('SELECT nip FROM profiles WHERE nip = ?').get('admin');
if (!adminCheck) {
  db.prepare('INSERT INTO profiles (nip, name, role, password) VALUES (?, ?, ?, ?)').run('admin', 'Administrator', 'admin', hashPassword('admin'));
  db.prepare('INSERT INTO profiles (nip, name, role, password) VALUES (?, ?, ?, ?)').run('humas', 'Humas BUTTMKHIT', 'admin', hashPassword('humas_buttmkhit'));
}

const docCount = (db.prepare('SELECT COUNT(*) as count FROM documents').get() as any).count;
if (docCount === 0) {
  const sampleDocs = [
    { title: 'Uji Terap Deteksi Penyakit Jembrana pada Sapi Bali dengan Metode RT-PCR', author: 'Balai Uji Terap Teknik dan Metode Karantina Hewan', tag: 'Karantina Hewan', type: 'Laporan Uji Terap', date: '2024-03-15', size: '2.4 MB', abstract: 'Penelitian ini mengembangkan metode RT-PCR untuk deteksi cepat penyakit Jembrana pada sapi Bali sebagai komoditas ekspor strategis.', year: 2024 },
    { title: 'Metode Perlakuan Panas terhadap Serangga Hama Kayu pada Produk Furnitur Ekspor', author: 'Balai Uji Terap Teknik dan Metode Karantina Tumbuhan', tag: 'Karantina Tumbuhan', type: 'Laporan Uji Terap', date: '2024-01-20', size: '3.1 MB', abstract: 'Validasi perlakuan panas sebagai alternatif fumigasi metil bromida untuk produk kayu olahan ekspor ke pasar Uni Eropa.', year: 2024 },
    { title: 'Identifikasi Molekuler Ektoparasit pada Ikan Koi Impor dari Jepang', author: 'Balai Uji Terap Teknik dan Metode Karantina Ikan', tag: 'Karantina Ikan', type: 'Laporan Uji Terap', date: '2023-11-08', size: '1.8 MB', abstract: 'Kajian metode identifikasi molekuler Gyrodactylus dan Dactylogyrus pada ikan hias koi dengan pendekatan multiplex PCR.', year: 2023 },
    { title: 'Global Biosecurity Policy Framework for Agricultural Trade: A Review', author: 'FAO & IPPC Secretariat', tag: 'Karantina Tumbuhan', type: 'Jurnal', date: '2024-06-01', size: '5.2 MB', abstract: 'A comprehensive review of international biosecurity frameworks governing agricultural trade, with implications for developing nations.', year: 2024 },
    { title: 'Pengembangan Rapid Test Kit ELISA untuk Deteksi Avian Influenza H5N1', author: 'Tim Peneliti BUSKIPM', tag: 'Karantina Hewan', type: 'Jurnal', date: '2023-09-12', size: '4.7 MB', abstract: 'Pengembangan dan validasi kit diagnostik berbasis ELISA kompetitif untuk deteksi antibodi H5N1 pada unggas air.', year: 2023 },
    { title: 'Perlakuan Fumigasi Metil Bromida terhadap Hama Bubuk Kayu Kering pada Mebel Rotan', author: 'Lab Perlakuan Karantina Tumbuhan - BUTTMKHIT', tag: 'Karantina Tumbuhan', type: 'Laporan Uji Terap', date: '2024-02-28', size: '2.9 MB', abstract: 'Optimasi dosis dan waktu paparan metil bromida untuk eradikasi Lyctus brunneus pada produk rotan ekspor ke Australia.', year: 2024 },
  ];
  const ins = db.prepare('INSERT INTO documents (title, author, tag, type, url, date, size, abstract, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const d of sampleDocs) ins.run(d.title, d.author, d.tag, d.type, null, d.date, d.size, d.abstract, d.year);
}

const app = express();
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public/uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'));
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.get('/api/documents', (req, res) => {
  const { tag, type, q, limit } = req.query as any;
  let query = 'SELECT * FROM documents WHERE 1=1';
  const params: any[] = [];
  if (tag && tag !== 'all') { query += ' AND tag = ?'; params.push(tag); }
  if (type && type !== 'all') { query += ' AND type = ?'; params.push(type); }
  if (q) { query += ' AND (title LIKE ? OR author LIKE ? OR abstract LIKE ?)'; const s = `%${q}%`; params.push(s, s, s); }
  query += ' ORDER BY createdAt DESC';
  if (limit) { query += ' LIMIT ?'; params.push(parseInt(limit)); }
  res.json(db.prepare(query).all(...params));
});

app.get('/api/stats', (req, res) => {
  const total = (db.prepare('SELECT COUNT(*) as count FROM documents').get() as any).count;
  const byTag = db.prepare('SELECT tag, COUNT(*) as count FROM documents GROUP BY tag').all();
  const byType = db.prepare('SELECT type, COUNT(*) as count FROM documents GROUP BY type').all();
  const users = (db.prepare("SELECT COUNT(*) as count FROM profiles WHERE role = 'user'").get() as any).count;
  const recent = db.prepare('SELECT * FROM documents ORDER BY createdAt DESC LIMIT 5').all();
  const topViewed = db.prepare('SELECT * FROM documents ORDER BY views DESC LIMIT 5').all();
  res.json({ total, byTag, byType, users, recent, topViewed });
});

app.post('/api/documents', (req, res) => {
  const { title, author, tag, type, url, date, size, abstract, year } = req.body;
  if (!title || !author || !tag) return res.status(400).json({ message: 'Title, author, tag required' });
  const info = db.prepare('INSERT INTO documents (title, author, tag, type, url, date, size, abstract, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(title, author, tag, type || 'Jurnal', url || null, date || new Date().toISOString().split('T')[0], size || null, abstract || null, year || new Date().getFullYear());
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/documents/:id', (req, res) => {
  const { title, author, tag, type, url, date, size, abstract, year } = req.body;
  db.prepare('UPDATE documents SET title=?, author=?, tag=?, type=?, url=?, date=?, size=?, abstract=?, year=?, updatedAt=CURRENT_TIMESTAMP WHERE id=?').run(title, author, tag, type, url, date, size, abstract, year, req.params.id);
  res.json({ success: true });
});

app.delete('/api/documents/:id', (req, res) => {
  const doc = db.prepare('SELECT url FROM documents WHERE id = ?').get(req.params.id) as any;
  if (doc?.url) { const fp = path.join(__dirname, 'public', doc.url); if (fs.existsSync(fp)) fs.unlinkSync(fp); }
  db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.patch('/api/documents/:id/track', (req, res) => {
  const { action } = req.body;
  if (action === 'view') db.prepare('UPDATE documents SET views = views + 1 WHERE id = ?').run(req.params.id);
  if (action === 'download') db.prepare('UPDATE documents SET downloads = downloads + 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.post('/api/login', (req, res) => {
  const { nip, password } = req.body;
  const hashedPw = hashPassword(password);
  let user = db.prepare('SELECT * FROM profiles WHERE nip = ? AND password = ?').get(nip, hashedPw) as any;
  if (!user) {
    user = db.prepare('SELECT * FROM profiles WHERE nip = ? AND password = ?').get(nip, password) as any;
    if (user) db.prepare('UPDATE profiles SET password = ? WHERE nip = ?').run(hashedPw, nip);
  }
  if (user) {
    db.prepare('UPDATE profiles SET lastLogin = CURRENT_TIMESTAMP WHERE nip = ?').run(nip);
    res.json({ success: true, user: { uid: user.nip, name: user.name, role: user.role, nip: user.nip, email: user.email, unit: user.unit } });
  } else {
    res.status(401).json({ success: false, message: 'NIP atau password tidak valid.' });
  }
});

app.post('/api/register', (req, res) => {
  const { nip, name, password, email, unit } = req.body;
  if (!nip || !name || !password) return res.status(400).json({ message: 'NIP, nama, dan password wajib diisi.' });
  if (password.length < 6) return res.status(400).json({ message: 'Password minimal 6 karakter.' });
  try {
    const existing = db.prepare('SELECT nip FROM profiles WHERE nip = ?').get(nip);
    if (existing) return res.status(400).json({ success: false, message: 'NIP sudah terdaftar.' });
    db.prepare('INSERT INTO profiles (nip, name, role, password, email, unit) VALUES (?, ?, ?, ?, ?, ?)').run(nip, name, 'user', hashPassword(password), email || null, unit || null);
    res.json({ success: true, message: 'Pendaftaran berhasil! Silakan login.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Gagal mendaftar: ' + err.message });
  }
});

app.get('/api/users', (req, res) => {
  res.json(db.prepare('SELECT nip, name, role, email, unit, createdAt, lastLogin FROM profiles ORDER BY createdAt DESC').all());
});

app.delete('/api/users/:nip', (req, res) => {
  if (req.params.nip === 'admin') return res.status(403).json({ message: 'Cannot delete admin' });
  db.prepare('DELETE FROM profiles WHERE nip = ?').run(req.params.nip);
  res.json({ success: true });
});

app.post('/api/upload', upload.single('file'), (req: any, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}`, size: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB` });
});

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ BUTTMKHIT e-Library running at http://localhost:${PORT}`);
    console.log(`👤 Admin: nip=admin, password=admin`);
  });
}
start();
