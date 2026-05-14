import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, Download, Upload, FileText, Database, Trash2, ShieldCheck,
  FileBadge, AlertCircle, X, Dog, Fish, Leaf, LogOut, BookOpen,
  BarChart3, Users, Clock, ChevronRight, Filter, Plus, Edit2,
  Eye, TrendingUp, CheckCircle2, Grid3X3, List, Bell, Settings,
  Microscope, Globe, Menu, FileSearch, Bookmark, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- TYPES ---
interface CustomUser {
  uid: string; name: string; nip?: string; role: string;
  email?: string; unit?: string;
}
interface Document {
  id: number; title: string; author: string; tag: string; type: string;
  url?: string; date: string; size?: string; abstract?: string;
  year?: number; views?: number; downloads?: number; createdAt?: string;
}
interface Stats {
  total: number; byTag: { tag: string; count: number }[];
  byType: { type: string; count: number }[]; users: number;
  recent: Document[]; topViewed: Document[];
}

const CATEGORIES = [
  { id: 'hewan', label: 'Karantina Hewan', icon: Dog, tag: 'Karantina Hewan', color: '#0d6efd', bg: '#e7f0ff' },
  { id: 'ikan', label: 'Karantina Ikan', icon: Fish, tag: 'Karantina Ikan', color: '#0dcaf0', bg: '#e0f8fd' },
  { id: 'tumbuhan', label: 'Karantina Tumbuhan', icon: Leaf, tag: 'Karantina Tumbuhan', color: '#198754', bg: '#e8f5ee' },
];

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  'Karantina Hewan': { color: '#1a5fb4', bg: '#e7f0ff' },
  'Karantina Ikan': { color: '#0077a8', bg: '#e0f8fd' },
  'Karantina Tumbuhan': { color: '#1a6a3d', bg: '#e8f5ee' },
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<CustomUser | null>(null);
  const [role, setRole] = useState('public');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isHome, setIsHome] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeView, setActiveView] = useState<'library' | 'admin' | 'users'>('library');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/documents');
      setDocuments(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      setStats(await res.json());
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('buttmkhit_session');
    if (saved) {
      const u = JSON.parse(saved);
      setCurrentUser(u);
      setRole(u.role);
    }
  }, []);

  const featuredDocs = useMemo(() => [...documents].sort(() => 0.5 - Math.random()).slice(0, 4), [documents]);

  const filteredDocs = useMemo(() => documents.filter(doc => {
    const matchSearch = !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.abstract || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === 'all' || CATEGORIES.find(c => c.id === activeCategory)?.tag === doc.tag;
    return matchSearch && matchCat;
  }), [documents, searchQuery, activeCategory]);

  const handleLogin = (user: CustomUser) => {
    setCurrentUser(user);
    setRole(user.role);
    localStorage.setItem('buttmkhit_session', JSON.stringify(user));
    setShowAuthModal(false);
    setIsHome(false);
    setActiveView('library');
    showNotification(`Selamat datang, ${user.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('buttmkhit_session');
    setCurrentUser(null);
    setRole('public');
    setIsHome(true);
    setActiveCategory('all');
    setSearchQuery('');
    showNotification('Berhasil keluar.', 'success');
  };

  const navigate = (cat: string) => {
    setActiveCategory(cat);
    setIsHome(false);
    setActiveView('library');
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f9', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: '#1a2332' }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            style={{
              position: 'fixed', top: 24, left: '50%', zIndex: 9999,
              background: notification.type === 'success' ? '#1a6a3d' : '#c0392b',
              color: '#fff', padding: '12px 24px', borderRadius: 12, fontSize: 14,
              fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP NAV */}
      <nav style={{ background: '#0d1f2d', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => { setIsHome(true); setSearchQuery(''); setActiveCategory('all'); }}>
            <img src="https://karantinaindonesia.go.id/profile/logo-barantin.png" style={{ height: 36, width: 'auto' }} alt="Logo" />
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#fff', fontSize: 16, lineHeight: 1.2 }}>BUTTMKHIT</div>
              <div style={{ color: '#7fa5c0', fontSize: 11, fontWeight: 500 }}>e-Library</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
            {[
              { id: 'all', label: 'Beranda' },
              ...CATEGORIES.map(c => ({ id: c.id, label: c.label })),
            ].map(item => (
              <button key={item.id} onClick={() => item.id === 'all' ? (setIsHome(true), setActiveCategory('all'), setSearchQuery('')) : navigate(item.id)}
                style={{
                  background: (!isHome && activeCategory === item.id) || (isHome && item.id === 'all') ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: (!isHome && activeCategory === item.id) || (isHome && item.id === 'all') ? '#fff' : '#7fa5c0',
                  border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >{item.label}</button>
            ))}
            {role === 'admin' && (
              <button onClick={() => { setActiveView('admin'); setIsHome(false); }}
                style={{ background: activeView === 'admin' ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#f0c040', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ⚙ Admin
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: '#1e4a70', borderRadius: 20, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{currentUser.name.split(' ')[0]}</span>
                  {role === 'admin' && <span style={{ background: '#f0c040', color: '#1a2332', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6 }}>ADMIN</span>}
                </div>
                <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#f87171', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                  <LogOut size={14} /> Keluar
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Masuk
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      {isHome && (
        <div style={{ background: 'linear-gradient(135deg, #0d1f2d 0%, #1a3a5c 60%, #0e4a3a 100%)', padding: '72px 24px 56px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
              <Microscope size={14} style={{ color: '#7fc8a5' }} />
              <span style={{ color: '#7fc8a5', fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>REPOSITORY ILMIAH KARANTINA INDONESIA</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px,5vw,48px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: '0 0 16px' }}>
              Pusat Referensi Ilmiah<br /><span style={{ color: '#7fc8a5' }}>Karantina Indonesia</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, marginBottom: 36, lineHeight: 1.7 }}>
              Repository eksklusif hasil Uji Terap Teknik dan Metode Karantina Hewan, Ikan, dan Tumbuhan untuk peningkatan standar pelayanan teknis.
            </p>

            {/* Search Bar */}
            <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
              <Search size={20} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Cari judul, penulis, atau kata kunci..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); if (e.target.value.trim()) { setIsHome(false); setActiveView('library'); } }}
                onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) { setIsHome(false); setActiveView('library'); } }}
                style={{ width: '100%', padding: '16px 16px 16px 52px', borderRadius: 12, border: 'none', fontSize: 15, background: '#fff', boxSizing: 'border-box', outline: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); }} style={{ position: 'absolute', right: 56, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <X size={16} />
                </button>
              )}
              <button onClick={() => { if (searchQuery.trim()) { setIsHome(false); setActiveView('library'); } }}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: '#2563eb', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: '#fff' }}>
                <Search size={18} />
              </button>
            </div>

            {/* Stats Row */}
            {stats && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 40 }}>
                {[
                  { label: 'Dokumen', value: stats.total },
                  { label: 'Pengguna Terdaftar', value: stats.users },
                  { label: 'Kategori', value: 3 },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ color: '#7fc8a5', fontSize: 28, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CATEGORY PILLS */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5eaf0', position: 'sticky', top: 64, zIndex: 90 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 4, overflowX: 'auto', alignItems: 'center', height: 52 }}>
          <button onClick={() => { setIsHome(true); setActiveCategory('all'); setSearchQuery(''); }}
            style={{ whiteSpace: 'nowrap', background: isHome && activeCategory === 'all' ? '#0d1f2d' : 'transparent', color: isHome && activeCategory === 'all' ? '#fff' : '#64748b', border: '1px solid', borderColor: isHome && activeCategory === 'all' ? '#0d1f2d' : '#e2e8f0', borderRadius: 20, padding: '5px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
            Semua
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => navigate(cat.id)}
              style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, background: !isHome && activeCategory === cat.id ? cat.bg : 'transparent', color: !isHome && activeCategory === cat.id ? cat.color : '#64748b', border: '1px solid', borderColor: !isHome && activeCategory === cat.id ? cat.color + '40' : '#e2e8f0', borderRadius: 20, padding: '5px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
              <cat.icon size={14} />
              {cat.label}
            </button>
          ))}
          {!isHome && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              <button onClick={() => setViewMode('grid')} style={{ background: viewMode === 'grid' ? '#e8f0fe' : 'transparent', border: '1px solid', borderColor: viewMode === 'grid' ? '#2563eb40' : '#e2e8f0', color: viewMode === 'grid' ? '#2563eb' : '#94a3b8', borderRadius: 8, padding: '5px 8px', cursor: 'pointer' }}><Grid3X3 size={15} /></button>
              <button onClick={() => setViewMode('list')} style={{ background: viewMode === 'list' ? '#e8f0fe' : 'transparent', border: '1px solid', borderColor: viewMode === 'list' ? '#2563eb40' : '#e2e8f0', color: viewMode === 'list' ? '#2563eb' : '#94a3b8', borderRadius: 8, padding: '5px 8px', cursor: 'pointer' }}><List size={15} /></button>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        {isHome ? (
          <HomeView docs={featuredDocs} stats={stats} onLogin={() => setShowAuthModal(true)} role={role} onNavigate={navigate} loading={loading} />
        ) : activeView === 'admin' && role === 'admin' ? (
          <AdminDashboard documents={documents} stats={stats} refresh={() => { fetchDocuments(); fetchStats(); }} showNotification={showNotification} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 32 }}>
            <div>
              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
                    {searchQuery ? `Hasil: "${searchQuery}"` : activeCategory === 'all' ? 'Semua Dokumen' : CATEGORIES.find(c => c.id === activeCategory)?.label}
                  </h2>
                  <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>{filteredDocs.length} dokumen ditemukan</p>
                </div>
              </div>
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px,1fr))' : '1fr', gap: 16 }}>
                  {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : filteredDocs.length === 0 ? (
                <EmptyState query={searchQuery} />
              ) : viewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 16 }}>
                  {filteredDocs.map(doc => <DocumentCard key={doc.id} doc={doc} role={role} onLoginRequest={() => setShowAuthModal(true)} showNotification={showNotification} />)}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filteredDocs.map(doc => <DocumentListItem key={doc.id} doc={doc} role={role} onLoginRequest={() => setShowAuthModal(true)} />)}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside>
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5eaf0', padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={16} style={{ color: '#f59e0b' }} /> Paling Banyak Dilihat
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(stats?.topViewed || documents.slice(0,5)).map((d, i) => (
                    <div key={d.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: i < 3 ? '#f59e0b' : '#cbd5e1', minWidth: 24, lineHeight: 1 }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, margin: 0, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{d.title}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{d.author?.split(' ').slice(0, 3).join(' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #1a3a5c, #0e4a3a)', borderRadius: 16, padding: 20, color: '#fff' }}>
                <BookOpen size={24} style={{ marginBottom: 12 }} />
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px' }}>Akses Penuh</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '0 0 16px', lineHeight: 1.6 }}>
                  {role === 'public' ? 'Login untuk mengunduh dokumen dan mengakses arsip lengkap.' : 'Anda memiliki akses penuh ke semua dokumen.'}
                </p>
                {role === 'public' && (
                  <button onClick={() => setShowAuthModal(true)} style={{ background: '#fff', color: '#1a3a5c', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                    Masuk Sekarang
                  </button>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ background: '#0d1f2d', color: 'rgba(255,255,255,0.5)', padding: '32px 24px', marginTop: 48, textAlign: 'center', fontSize: 13 }}>
        <img src="https://karantinaindonesia.go.id/profile/logo-barantin.png" style={{ height: 32, marginBottom: 12, opacity: 0.6 }} alt="Logo" />
        <p style={{ margin: '0 0 4px' }}>BUTTMKHIT e-Library — Balai Uji Terap Teknik dan Metode Karantina Hewan, Ikan, dan Tumbuhan</p>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>© {new Date().getFullYear()} Badan Karantina Indonesia. All rights reserved.</p>
      </footer>

      {/* AUTH MODAL */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleLogin} />
    </div>
  );
}

// ===================== HOME VIEW =====================
function HomeView({ docs, stats, onLogin, role, onNavigate, loading }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 32 }}>
      <div>
        {/* Category Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => onNavigate(cat.id)}
              style={{ background: '#fff', border: '1px solid #e5eaf0', borderRadius: 16, padding: 20, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 44, height: 44, background: cat.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <cat.icon size={22} style={{ color: cat.color }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a2332', marginBottom: 2 }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  {stats?.byTag?.find((t: any) => t.tag === cat.tag)?.count || 0} dokumen
                </div>
              </div>
              <ChevronRight size={16} style={{ color: cat.color, marginTop: 4 }} />
            </button>
          ))}
        </div>

        {/* Featured Docs */}
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>📚 Dokumen Pilihan</h2>
          {role === 'public' && (
            <button onClick={onLogin} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Login untuk akses penuh →
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 16 }}>
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 16 }}>
            {docs.map((doc: Document) => (
              <DocumentCard key={doc.id} doc={doc} role={role} onLoginRequest={onLogin} />
            ))}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside>
        {stats && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5eaf0', padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={16} style={{ color: '#2563eb' }} /> Statistik Repositori
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <StatRow label="Total Dokumen" value={stats.total} color="#2563eb" />
              <StatRow label="Pengguna Aktif" value={stats.users} color="#198754" />
              <StatRow label="Laporan Uji Terap" value={stats.byType?.find((t: any) => t.type === 'Laporan Uji Terap')?.count || 0} color="#f59e0b" />
              <StatRow label="Jurnal Ilmiah" value={stats.byType?.find((t: any) => t.type === 'Jurnal')?.count || 0} color="#7c3aed" />
            </div>
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5eaf0', padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} style={{ color: '#64748b' }} /> Terbaru Ditambahkan
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(stats?.recent || []).map((d: Document) => (
              <div key={d.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: TAG_COLORS[d.tag]?.bg || '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={14} style={{ color: TAG_COLORS[d.tag]?.color || '#64748b' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, margin: 0, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{d.title}</p>
                  <p style={{ fontSize: 10, color: '#94a3b8', margin: '2px 0 0' }}>{d.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

// ===================== DOCUMENT CARD =====================
function DocumentCard({ doc, role, onLoginRequest, showNotification }: any) {
  const tagColor = TAG_COLORS[doc.tag] || { color: '#64748b', bg: '#f1f5f9' };
  const restricted = role === 'public';

  const handleDownload = async () => {
    if (restricted) { onLoginRequest(); return; }
    if (!doc.url) return;
    await fetch(`/api/documents/${doc.id}/track`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'download' }) });
    window.open(doc.url, '_blank');
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      style={{ background: '#fff', border: '1px solid #e5eaf0', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', height: '100%', cursor: 'default', position: 'relative', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ background: tagColor.bg, borderRadius: 10, padding: '8px 10px' }}>
          <FileText size={20} style={{ color: tagColor.color }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, background: tagColor.bg, color: tagColor.color, borderRadius: 6, padding: '3px 8px' }}>{doc.tag}</span>
          <span style={{ fontSize: 10, color: '#94a3b8', background: '#f8fafc', borderRadius: 6, padding: '3px 8px' }}>{doc.type}</span>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h4 style={{ fontWeight: 700, fontSize: 14, margin: '0 0 6px', lineHeight: 1.5, color: '#1a2332', display: '-webkit-box', overflow: 'hidden', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {doc.title}
        </h4>
        <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px' }}>{doc.author}</p>
        {doc.abstract && (
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.6, display: '-webkit-box', overflow: 'hidden', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {doc.abstract}
          </p>
        )}
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 16, paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#94a3b8' }}>
          <span>{doc.year || doc.date?.split('-')[0]}</span>
          {doc.size && <span>• {doc.size}</span>}
          {doc.views !== undefined && <span>• {doc.views} view</span>}
        </div>
        <button
          onClick={handleDownload}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
            background: restricted ? '#f1f5f9' : doc.url ? '#e8f0fe' : '#f1f5f9',
            color: restricted ? '#64748b' : doc.url ? '#2563eb' : '#94a3b8',
            border: 'none', borderRadius: 8, padding: '6px 12px', cursor: restricted || !doc.url ? 'pointer' : 'pointer'
          }}
        >
          {restricted ? <><ShieldCheck size={12} /> Login</> : doc.url ? <><Download size={12} /> Unduh</> : 'Tidak ada file'}
        </button>
      </div>
    </motion.div>
  );
}

function DocumentListItem({ doc, role, onLoginRequest }: any) {
  const tagColor = TAG_COLORS[doc.tag] || { color: '#64748b', bg: '#f1f5f9' };
  const restricted = role === 'public';
  return (
    <div style={{ background: '#fff', border: '1px solid #e5eaf0', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ background: tagColor.bg, borderRadius: 10, padding: 10, flexShrink: 0 }}>
        <FileText size={20} style={{ color: tagColor.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h4 style={{ fontWeight: 600, fontSize: 14, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</h4>
          <span style={{ fontSize: 10, fontWeight: 700, background: tagColor.bg, color: tagColor.color, borderRadius: 4, padding: '2px 6px', flexShrink: 0 }}>{doc.type}</span>
        </div>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{doc.author} • {doc.year || doc.date?.split('-')[0]} {doc.size && `• ${doc.size}`}</p>
      </div>
      <button
        onClick={() => { if (restricted) { onLoginRequest(); return; } if (doc.url) window.open(doc.url, '_blank'); }}
        style={{ background: restricted ? '#f1f5f9' : doc.url ? '#2563eb' : '#f1f5f9', color: restricted ? '#64748b' : doc.url ? '#fff' : '#94a3b8', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <Download size={14} /> {restricted ? 'Login' : doc.url ? 'Unduh' : 'N/A'}
      </button>
    </div>
  );
}

// ===================== ADMIN DASHBOARD =====================
function AdminDashboard({ documents, stats, refresh, showNotification }: any) {
  const [activeTab, setActiveTab] = useState<'docs' | 'upload' | 'users'>('docs');
  const [users, setUsers] = useState<any[]>([]);
  const [editDoc, setEditDoc] = useState<Document | null>(null);

  useEffect(() => {
    if (activeTab === 'users') fetch('/api/users').then(r => r.json()).then(setUsers);
  }, [activeTab]);

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Hapus dokumen "${title}"?`)) return;
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (res.ok) { refresh(); showNotification('Dokumen berhasil dihapus.'); }
  };

  const handleDeleteUser = async (nip: string, name: string) => {
    if (!window.confirm(`Hapus pengguna "${name}"?`)) return;
    const res = await fetch(`/api/users/${nip}`, { method: 'DELETE' });
    if (res.ok) { fetch('/api/users').then(r => r.json()).then(setUsers); showNotification('Pengguna berhasil dihapus.'); }
  };

  const tabs = [
    { id: 'upload', label: 'Tambah Dokumen', icon: Plus },
    { id: 'docs', label: `Kelola Dokumen (${documents.length})`, icon: Database },
    { id: 'users', label: 'Kelola Pengguna', icon: Users },
  ];

  return (
    <div>
      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Dokumen', value: stats.total, color: '#2563eb', icon: FileText },
            { label: 'Jurnal', value: stats.byType?.find((t: any) => t.type === 'Jurnal')?.count || 0, color: '#7c3aed', icon: Globe },
            { label: 'Laporan Uji Terap', value: stats.byType?.find((t: any) => t.type === 'Laporan Uji Terap')?.count || 0, color: '#f59e0b', icon: Microscope },
            { label: 'Pengguna', value: stats.users, color: '#198754', icon: Users },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #e5eaf0', borderRadius: 16, padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{s.label}</span>
                <div style={{ background: s.color + '15', borderRadius: 8, padding: '6px' }}>
                  <s.icon size={16} style={{ color: s.color }} />
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5eaf0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5eaf0', background: '#f8fafc' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: activeTab === tab.id ? '#fff' : 'transparent', color: activeTab === tab.id ? '#2563eb' : '#64748b', borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent', transition: 'all 0.2s' }}>
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 24 }}>
          {activeTab === 'upload' && <UploadForm refresh={refresh} showNotification={showNotification} />}
          {activeTab === 'docs' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Dokumen', 'Tag', 'Tipe', 'Tahun', 'View', 'Aksi'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc: Document) => (
                    <tr key={doc.id} style={{ borderTop: '1px solid #f1f5f9' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{doc.author}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, background: TAG_COLORS[doc.tag]?.bg, color: TAG_COLORS[doc.tag]?.color, padding: '3px 8px', borderRadius: 6 }}>{doc.tag}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{doc.type}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{doc.year || '-'}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{doc.views || 0}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {doc.url && (
                            <button onClick={() => window.open(doc.url, '_blank')} style={{ background: '#e8f0fe', color: '#2563eb', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', fontSize: 11 }}>
                              <Eye size={13} />
                            </button>
                          )}
                          <button onClick={() => handleDelete(doc.id, doc.title)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', fontSize: 11 }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'users' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Pengguna', 'NIP', 'Role', 'Terdaftar', 'Aksi'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.nip} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.role === 'admin' ? '#fef3c7' : '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: u.role === 'admin' ? '#d97706' : '#2563eb' }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{u.email || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontFamily: 'monospace' }}>{u.nip}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, background: u.role === 'admin' ? '#fef3c7' : '#e8f0fe', color: u.role === 'admin' ? '#d97706' : '#2563eb', padding: '3px 10px', borderRadius: 20 }}>{u.role.toUpperCase()}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 12 }}>{u.createdAt?.split('T')[0] || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {u.nip !== 'admin' && (
                          <button onClick={() => handleDeleteUser(u.nip, u.name)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer' }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadForm({ refresh, showNotification }: any) {
  const [form, setForm] = useState({ title: '', author: '', tag: CATEGORIES[0].tag, type: 'Laporan Uji Terap', abstract: '', year: new Date().getFullYear().toString() });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let url = null, size = null;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!upRes.ok) throw new Error('Upload gagal');
        const upData = await upRes.json();
        url = upData.url; size = upData.size;
      }
      const res = await fetch('/api/documents', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, url, size, date: new Date().toISOString().split('T')[0], year: parseInt(form.year) })
      });
      if (res.ok) {
        setForm({ title: '', author: '', tag: CATEGORIES[0].tag, type: 'Laporan Uji Terap', abstract: '', year: new Date().getFullYear().toString() });
        setFile(null);
        refresh();
        showNotification('Dokumen berhasil ditambahkan!');
      }
    } catch (err: any) {
      showNotification(err.message || 'Gagal mengunggah.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, children: React.ReactNode) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      {children}
    </div>
  );

  const inputStyle = { width: '100%', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {field('Judul Dokumen *', <input required style={{ ...inputStyle, gridColumn: '1/-1' }} placeholder="Judul lengkap dokumen" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />)}
        {field('Penulis / Instansi *', <input required style={inputStyle} placeholder="Nama penulis" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />)}
        {field('Tahun', <input type="number" style={inputStyle} value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} min={2000} max={2030} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {field('Tag Karantina *', (
          <select style={{ ...inputStyle, appearance: 'none' as const }} value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })}>
            {CATEGORIES.map(c => <option key={c.id} value={c.tag}>{c.label}</option>)}
          </select>
        ))}
        {field('Jenis Dokumen', (
          <select style={{ ...inputStyle, appearance: 'none' as const }} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option>Laporan Uji Terap</option>
            <option>Jurnal</option>
          </select>
        ))}
      </div>
      {field('Abstrak / Deskripsi',
        <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} placeholder="Ringkasan singkat dokumen..." value={form.abstract} onChange={e => setForm({ ...form, abstract: e.target.value })} />
      )}
      <div style={{ marginTop: 16, marginBottom: 24 }}>
        {field('File PDF (Opsional)',
          <div style={{ border: '2px dashed #e2e8f0', borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer', position: 'relative' }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === 'application/pdf') setFile(f); }}>
            <input type="file" accept=".pdf" onChange={e => e.target.files && setFile(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
            {file ? (
              <div style={{ color: '#2563eb', fontWeight: 600, fontSize: 14 }}>📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: 13 }}>
                <Upload size={24} style={{ marginBottom: 8, color: '#cbd5e1' }} />
                <div>Drag & drop atau klik untuk pilih file PDF</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>Maksimal 50MB</div>
              </div>
            )}
          </div>
        )}
      </div>
      <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#94a3b8' : '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {loading ? <><div style={{ width: 18, height: 18, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Mengunggah...</> : <><Plus size={18} /> Tambah ke Repositori</>}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}

// ===================== AUTH MODAL =====================
function AuthModal({ isOpen, onClose, onSuccess }: any) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ nip: '', name: '', password: '', confirmPassword: '', email: '', unit: '', captchaInput: '' });
  const [captcha, setCaptcha] = useState({ q: '', a: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const genCaptcha = () => {
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    const ops = [{ q: `${a} + ${b}`, a: a + b }, { q: `${a * b}`, a: a * b }, { q: `${a + b} - ${b}`, a: a }];
    const op = ops[0];
    setCaptcha({ q: `${a} + ${b} = ?`, a: a + b });
  };

  useEffect(() => { if (isRegister) genCaptcha(); }, [isRegister]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (isRegister) {
      if (form.password !== form.confirmPassword) { setError('Password tidak cocok.'); return; }
      if (parseInt(form.captchaInput) !== captcha.a) { setError('Jawaban captcha salah.'); genCaptcha(); return; }
    }
    setLoading(true);
    try {
      const res = await fetch(isRegister ? '/api/register' : '/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        if (isRegister) { setSuccess(data.message); setIsRegister(false); setForm({ nip: '', name: '', password: '', confirmPassword: '', email: '', unit: '', captchaInput: '' }); }
        else onSuccess(data.user);
      } else {
        setError(data.message || 'Operasi gagal.'); if (isRegister) genCaptcha();
      }
    } catch { setError('Terjadi kesalahan sistem.'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(13,31,45,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ background: 'linear-gradient(135deg, #0d1f2d, #1a3a5c)', padding: '28px 28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontWeight: 700, fontSize: 20 }}>
              {isRegister ? 'Daftar Akun' : 'Masuk ke e-Library'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>BUTTMKHIT Repository</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 8, padding: 8, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ padding: 28 }}>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={14} />{error}</div>}
          {success && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={14} />{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {isRegister && <AuthInput label="Nama Lengkap" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Masukkan nama" required />}
              <AuthInput label="NIP / Username" value={form.nip} onChange={v => setForm({ ...form, nip: v })} placeholder="NIP atau username" required />
              {isRegister && <AuthInput label="Email (opsional)" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="email@domain.com" />}
              {isRegister && <AuthInput label="Unit Kerja (opsional)" value={form.unit} onChange={v => setForm({ ...form, unit: v })} placeholder="Nama unit/bagian" />}
              <AuthInput label={isRegister ? 'Buat Password (min. 6 karakter)' : 'Password'} type="password" value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder="Password" required />
              {isRegister && <AuthInput label="Konfirmasi Password" type="password" value={form.confirmPassword} onChange={v => setForm({ ...form, confirmPassword: v })} placeholder="Ulangi password" required />}
              {isRegister && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const }}>Verifikasi Captcha</span>
                    <span style={{ background: '#0d1f2d', color: '#7fc8a5', fontWeight: 800, padding: '4px 12px', borderRadius: 8, fontSize: 15 }}>{captcha.q}</span>
                  </div>
                  <input type="number" required value={form.captchaInput} onChange={e => setForm({ ...form, captchaInput: e.target.value })} placeholder="Jawaban..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, textAlign: 'center', fontWeight: 700, outline: 'none', boxSizing: 'border-box' as const }} />
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 20, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Memproses...' : isRegister ? 'Daftar Sekarang' : 'Masuk'}
            </button>
          </form>

          <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
            style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 16, background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>
            {isRegister ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar di sini'}
          </button>

          {!isRegister && (
            <div style={{ marginTop: 16, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
              Akses admin: <strong style={{ color: '#64748b' }}>admin</strong> / <strong style={{ color: '#64748b' }}>admin</strong>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function AuthInput({ label, type = 'text', value, onChange, placeholder, required }: any) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, background: '#f8fafc' }} />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e5eaf0' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, background: '#f1f5f9', borderRadius: 10 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 12, background: '#f1f5f9', borderRadius: 6, marginBottom: 8 }} />
          <div style={{ height: 12, background: '#f1f5f9', borderRadius: 6, width: '60%' }} />
        </div>
      </div>
      <div style={{ height: 14, background: '#f1f5f9', borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 14, background: '#f1f5f9', borderRadius: 6, width: '80%', marginBottom: 8 }} />
      <div style={{ height: 12, background: '#f1f5f9', borderRadius: 6, width: '40%' }} />
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
      <FileSearch size={56} style={{ marginBottom: 16, opacity: 0.3 }} />
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#64748b', margin: '0 0 8px' }}>Tidak ada dokumen</h3>
      <p style={{ margin: 0 }}>{query ? `Tidak ditemukan hasil untuk "${query}".` : 'Belum ada dokumen dalam kategori ini.'}</p>
    </div>
  );
}
