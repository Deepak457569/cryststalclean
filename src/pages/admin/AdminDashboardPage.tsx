import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, FolderTree, Key, 
  Settings, LogOut, Search, Plus, Filter, MessageCircle, 
  CheckCircle2, Clock, AlertTriangle, ChevronRight, Eye, 
  Trash2, Edit, X, RefreshCw, UserCheck, Shield, Loader2, Copy
} from 'lucide-react';
import { 
  Inquiry, Product, Category, AccessCode, OrderStatus, 
  ORDER_STATUS_COLORS 
} from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { adminUser, token, logout, loading: authLoading, setPreviewDrafts } = useAuth();
  const navigate = useNavigate();

  // Helper for authenticated requests
  const authFetch = (url: string, init: RequestInit = {}) => {
    const currentToken = token || localStorage.getItem('cc_token');
    const headers = new Headers(init.headers || {});
    if (currentToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${currentToken}`);
    }
    return fetch(url, { ...init, headers });
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'inquiries' | 'products' | 'categories' | 'codes' | 'settings'>('overview');

  // Stats
  const [stats, setStats] = useState<{
    totalInquiries: number;
    statusCounts: Record<string, number>;
    activeProductsCount: number;
    activeCodesCount: number;
  }>({
    totalInquiries: 0,
    statusCounts: {},
    activeProductsCount: 0,
    activeCodesCount: 0,
  });

  // Data lists
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);

  // Filtering & Search
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modals & Drawers
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [inquiryHistory, setInquiryHistory] = useState<any[]>([]);
  const [newStatusNote, setNewStatusNote] = useState('');
  const [editingAdminNotes, setEditingAdminNotes] = useState('');

  // Product modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [productVariantsInput, setProductVariantsInput] = useState('');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Access code modal
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [newCodeData, setNewCodeData] = useState<{
    code: string;
    client_name: string;
    contact_name: string;
    contact_phone: string;
    max_uses: number;
    expires_at: string;
  }>({
    code: '',
    client_name: '',
    contact_name: '',
    contact_phone: '',
    max_uses: 50,
    expires_at: '',
  });

  // Category modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Loading indicator
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let metaTag = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'robots';
      document.head.appendChild(metaTag);
    }
    metaTag.content = 'noindex, nofollow';

    if (!authLoading && !adminUser) {
      navigate('/admin/login');
    }
  }, [adminUser, authLoading, navigate]);

  const loadAllData = async () => {
    setRefreshing(true);
    try {
      const [statsRes, inqRes, prodRes, catRes, codeRes] = await Promise.all([
        authFetch('/api/admin/stats'),
        authFetch('/api/inquiries'),
        authFetch('/api/products?active_only=0'),
        authFetch('/api/categories'),
        authFetch('/api/access-codes'),
      ]);

      if (statsRes.ok) {
        const s = await statsRes.json();
        const incoming = s?.stats || {};
        setStats({
          totalInquiries: Number(incoming.totalInquiries) || 0,
          statusCounts: incoming.statusCounts || {},
          activeProductsCount: Number(incoming.activeProductsCount ?? incoming.activeProducts) || 0,
          activeCodesCount: Number(incoming.activeCodesCount ?? incoming.activeCodes) || 0,
        });
      }
      if (inqRes.ok) {
        const i = await inqRes.json();
        setInquiries(i.inquiries || []);
      }
      if (prodRes.ok) {
        const p = await prodRes.json();
        setProducts(p.products || []);
      }
      if (catRes.ok) {
        const c = await catRes.json();
        setCategories(c.categories || []);
      }
      if (codeRes.ok) {
        const cd = await codeRes.json();
        setAccessCodes(cd.codes || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (adminUser) {
      loadAllData();
    }
  }, [adminUser]);

  // Open Inquiry Details Modal
  const openInquiryDetails = async (inq: Inquiry) => {
    try {
      const res = await authFetch(`/api/inquiries/${inq.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedInquiry(data.inquiry);
        setInquiryHistory(data.history || []);
        setEditingAdminNotes(data.inquiry.admin_notes || '');
      } else {
        setSelectedInquiry(inq);
        setEditingAdminNotes(inq.admin_notes || '');
      }
    } catch {
      setSelectedInquiry(inq);
    }
  };

  // Update Inquiry Status
  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!selectedInquiry) return;
    try {
      const res = await authFetch(`/api/inquiries/${selectedInquiry.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: newStatusNote.trim() || undefined }),
      });
      if (res.ok) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
        setNewStatusNote('');
        loadAllData();
        // refresh history
        const hRes = await authFetch(`/api/inquiries/${selectedInquiry.id}`);
        if (hRes.ok) {
          const d = await hRes.json();
          setInquiryHistory(d.history || []);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Admin Notes
  const handleSaveAdminNotes = async () => {
    if (!selectedInquiry) return;
    try {
      await authFetch(`/api/inquiries/${selectedInquiry.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: editingAdminNotes }),
      });
      setSelectedInquiry({ ...selectedInquiry, admin_notes: editingAdminNotes });
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Save Product (Create or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const variants = productVariantsInput
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    const payload = {
      ...editingProduct,
      variants,
    };

    try {
      const isEdit = !!editingProduct.id;
      const url = isEdit ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setProductModalOpen(false);
        setEditingProduct(null);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await authFetch(`/api/products/${id}`, { method: 'DELETE' });
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Toggle Publish / Unpublish Product
  const handleTogglePublishProduct = async (product: Product) => {
    const nextStatus = product.is_active ? 0 : 1;
    try {
      const res = await authFetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextStatus }),
      });
      if (res.ok) {
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Direct Image File Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await authFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setEditingProduct({ ...editingProduct, image_url: data.url });
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Image upload failed', err);
      alert('Network error while uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Access Code
  const handleSaveAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCodeData.contact_phone) {
      const cleanPhone = newCodeData.contact_phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        alert('Registered contact mobile number must be exactly 10 digits.');
        return;
      }
    }
    try {
      const res = await authFetch('/api/access-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCodeData),
      });
      if (res.ok) {
        setCodeModalOpen(false);
        setNewCodeData({
          code: '',
          client_name: '',
          contact_name: '',
          contact_phone: '',
          max_uses: 50,
          expires_at: '',
        });
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Revoke Access Code
  const handleRevokeCode = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'revoked' ? 'active' : 'revoked';
    try {
      await authFetch(`/api/access-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Generate random code helper
  const generateRandomCode = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = 'CC-';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    code += '-';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setNewCodeData((prev) => ({ ...prev, code }));
  };

  // Filtered inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const matchSearch =
      !inquirySearch ||
      inq.reference.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.customer_name.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.company_name.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.contact_phone.includes(inquirySearch);

    const matchStatus = !inquiryStatusFilter || inq.status === inquiryStatusFilter;
    return matchSearch && matchStatus;
  });

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !productSearch ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(productSearch.toLowerCase());
    const matchStatus =
      productStatusFilter === 'all'
        ? true
        : productStatusFilter === 'published'
        ? p.is_active === 1
        : p.is_active === 0;
    return matchSearch && matchStatus;
  });

  const statusesList: OrderStatus[] = [
    'New Inquiry',
    'Contacted',
    'Quotation Shared',
    'Awaiting Customer Confirmation',
    'Confirmed',
    'Preparing Order',
    'Ready to Ship',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  const computedStatusCounts = React.useMemo(() => {
    const counts: Record<string, number> = { ...(stats?.statusCounts || {}) };
    for (const inq of inquiries) {
      if (inq?.status && typeof counts[inq.status] !== 'number') {
        counts[inq.status] = (counts[inq.status] || 0) + 1;
      }
    }
    return counts;
  }, [stats?.statusCounts, inquiries]);

  const getStatusCount = (st: string) => {
    return stats?.statusCounts?.[st] ?? computedStatusCounts[st] ?? 0;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-charcoal-800 mx-auto" />
          <p className="text-xs uppercase tracking-wider text-charcoal-700 font-semibold">
            Authenticating CryststalClean Admin Portal...
          </p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-charcoal-950 text-white border-b border-charcoal-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white flex items-center justify-center border border-champagne-500/50 p-0.5 shadow-sm">
              <img
                src="/logo.png"
                alt="CryststalClean Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-serif font-bold tracking-wider text-base block leading-none">
                CRYSTSTALCLEAN
              </span>
              <span className="text-[9px] tracking-widest text-champagne-400 uppercase font-semibold">
                Executive Admin Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={loadAllData}
              disabled={refreshing}
              className="p-2 text-cream-300 hover:text-white rounded-lg hover:bg-charcoal-800 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-cream-300 border-l border-charcoal-800 pl-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{adminUser?.email || 'admin@crystalclean.in'}</span>
            </div>

            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-xs text-cream-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-cream-200 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-charcoal-900 text-white shadow-sm'
                : 'bg-white text-charcoal-800 border border-cream-200 hover:bg-cream-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard Overview
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'inquiries'
                ? 'bg-charcoal-900 text-white shadow-sm'
                : 'bg-white text-charcoal-800 border border-cream-200 hover:bg-cream-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Inquiries &amp; Orders ({inquiries.length})
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'products'
                ? 'bg-charcoal-900 text-white shadow-sm'
                : 'bg-white text-charcoal-800 border border-cream-200 hover:bg-cream-100'
            }`}
          >
            <Package className="w-4 h-4" />
            Product Catalog ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'categories'
                ? 'bg-charcoal-900 text-white shadow-sm'
                : 'bg-white text-charcoal-800 border border-cream-200 hover:bg-cream-100'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Categories ({categories.length})
          </button>

          <button
            onClick={() => setActiveTab('codes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'codes'
                ? 'bg-charcoal-900 text-white shadow-sm'
                : 'bg-white text-charcoal-800 border border-cream-200 hover:bg-cream-100'
            }`}
          >
            <Key className="w-4 h-4" />
            Customer Access Codes ({accessCodes.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'settings'
                ? 'bg-charcoal-900 text-white shadow-sm'
                : 'bg-white text-charcoal-800 border border-cream-200 hover:bg-cream-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Top High-Level Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-charcoal-800">
                  Total Customer Inquiries
                </span>
                <p className="font-serif text-3xl font-bold text-charcoal-900">
                  {stats.totalInquiries}
                </p>
                <p className="text-[11px] text-charcoal-800">Submitted through website</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-blue-700">
                  New Uncontacted Inquiries
                </span>
                <p className="font-serif text-3xl font-bold text-blue-900">
                  {getStatusCount('New Inquiry')}
                </p>
                <p className="text-[11px] text-blue-600">Pending initial response</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-700">
                  Confirmed / In Progress Orders
                </span>
                <p className="font-serif text-3xl font-bold text-emerald-900">
                  {getStatusCount('Confirmed') +
                    getStatusCount('Preparing Order') +
                    getStatusCount('Ready to Ship')}
                </p>
                <p className="text-[11px] text-emerald-600">Manufacturing &amp; packing</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-champagne-700">
                  Active Access Codes
                </span>
                <p className="font-serif text-3xl font-bold text-charcoal-900">
                  {stats.activeCodesCount}
                </p>
                <p className="text-[11px] text-charcoal-800">Verified hotel properties</p>
              </div>
            </div>

            {/* Complete 10-Status Workflow Grid */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-xl text-charcoal-900">
                Order Lifecycle Workflow Statuses
              </h3>
              <p className="text-xs text-charcoal-800">
                Live count of inquiries and orders across every operational stage.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-2">
                {statusesList.map((st) => {
                  const count = getStatusCount(st);
                  const colors = ORDER_STATUS_COLORS[st];
                  return (
                    <div
                      key={st}
                      onClick={() => {
                        setInquiryStatusFilter(st);
                        setActiveTab('inquiries');
                      }}
                      className={`p-4 rounded-xl border ${colors.border} ${colors.bg} cursor-pointer hover:shadow-md transition-all space-y-1`}
                    >
                      <span className={`text-[11px] font-bold block truncate ${colors.text}`}>
                        {st}
                      </span>
                      <p className={`font-serif text-2xl font-bold ${colors.text}`}>
                        {count}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Inquiries Quick Table */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-serif font-bold text-xl text-charcoal-900">
                  Recent Submissions
                </h3>
                <button
                  onClick={() => setActiveTab('inquiries')}
                  className="text-xs font-semibold text-champagne-700 hover:underline"
                >
                  View All &rarr;
                </button>
              </div>

              {inquiries.length === 0 ? (
                <p className="text-xs text-charcoal-800 py-6 text-center">No inquiries recorded yet.</p>
              ) : (
                <div className="divide-y divide-cream-100">
                  {inquiries.slice(0, 5).map((inq) => (
                    <div
                      key={inq.id}
                      onClick={() => openInquiryDetails(inq)}
                      className="py-3 flex items-center justify-between hover:bg-cream-50 px-3 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="font-mono text-xs font-bold text-charcoal-900">
                          {inq.reference}
                        </span>
                        <p className="text-xs text-charcoal-800">
                          {inq.company_name} — {inq.customer_name} ({inq.delivery_city})
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                            ORDER_STATUS_COLORS[inq.status]?.bg || 'bg-gray-100'
                          } ${ORDER_STATUS_COLORS[inq.status]?.text || 'text-gray-800'} ${
                            ORDER_STATUS_COLORS[inq.status]?.border || 'border-gray-200'
                          }`}
                        >
                          {inq.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-charcoal-800" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INQUIRIES & ORDERS */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  placeholder="Search ref, hotel, contact, phone..."
                  className="w-full pl-9 pr-4 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-champagne-500 font-medium"
                />
                <Search className="w-4 h-4 text-charcoal-800 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={inquiryStatusFilter}
                  onChange={(e) => setInquiryStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="">All Statuses ({inquiries.length})</option>
                  {statusesList.map((st) => (
                    <option key={st} value={st}>
                      {st} ({getStatusCount(st)})
                    </option>
                  ))}
                </select>

                {inquiryStatusFilter && (
                  <button
                    onClick={() => setInquiryStatusFilter('')}
                    className="text-xs text-rose-600 font-medium hover:underline"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {/* Inquiries Table */}
            <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream-100 text-charcoal-800 uppercase tracking-wider font-semibold border-b border-cream-200">
                    <tr>
                      <th className="py-3.5 px-4">Inquiry Ref</th>
                      <th className="py-3.5 px-4">Hotel / Company</th>
                      <th className="py-3.5 px-4">Contact Person</th>
                      <th className="py-3.5 px-4">Phone</th>
                      <th className="py-3.5 px-4">City</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {filteredInquiries.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-charcoal-800">
                          No inquiries matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredInquiries.map((inq) => {
                        const colors = ORDER_STATUS_COLORS[inq.status] || {
                          bg: 'bg-gray-100',
                          text: 'text-gray-800',
                          border: 'border-gray-200',
                        };
                        return (
                          <tr
                            key={inq.id}
                            className="hover:bg-cream-50 transition-colors cursor-pointer"
                            onClick={() => openInquiryDetails(inq)}
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-charcoal-900">
                              {inq.reference}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-charcoal-900">
                              {inq.company_name}
                            </td>
                            <td className="py-3.5 px-4 text-charcoal-800">
                              {inq.customer_name}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-charcoal-800">
                              {inq.contact_phone}
                            </td>
                            <td className="py-3.5 px-4 text-charcoal-800">{inq.delivery_city}</td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
                              >
                                {inq.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-charcoal-800">
                              {new Date(inq.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => openInquiryDetails(inq)}
                                className="px-3 py-1 bg-cream-100 hover:bg-cream-200 rounded-lg text-[11px] font-semibold text-charcoal-900"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-cream-200 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search amenities or cleaning supplies..."
                    className="w-full pl-9 pr-4 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-charcoal-800 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-1.5 bg-cream-100 p-1 rounded-xl">
                  <button
                    onClick={() => setProductStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      productStatusFilter === 'all'
                        ? 'bg-charcoal-900 text-white shadow-xs'
                        : 'text-charcoal-700 hover:text-charcoal-950'
                    }`}
                  >
                    All ({products.length})
                  </button>
                  <button
                    onClick={() => setProductStatusFilter('published')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      productStatusFilter === 'published'
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-emerald-800 hover:text-emerald-950'
                    }`}
                  >
                    Published ({products.filter((p) => p.is_active === 1).length})
                  </button>
                  <button
                    onClick={() => setProductStatusFilter('draft')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      productStatusFilter === 'draft'
                        ? 'bg-amber-800 text-white shadow-xs'
                        : 'text-amber-800 hover:text-amber-950'
                    }`}
                  >
                    Drafts ({products.filter((p) => p.is_active === 0).length})
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewDrafts(true);
                    navigate('/products?preview=drafts');
                  }}
                  className="px-4 py-2.5 bg-champagne-100 hover:bg-champagne-200 text-charcoal-900 border border-champagne-300 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
                  title="Review all draft products on the public site layout"
                >
                  <Eye className="w-4 h-4 text-champagne-700" />
                  <span>Preview as Public (Drafts)</span>
                </button>
                <button
                  onClick={() => {
                    setEditingProduct({
                      name: '',
                      category_id: categories[0]?.id || '',
                      description: '',
                      image_url: '/products/placeholder.svg',
                      pack_size: 'To be confirmed',
                      is_active: 1,
                      is_featured: 0,
                      is_customizable: 0,
                    });
                    setProductVariantsInput('Standard Pack');
                    setProductModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm justify-center"
                >
                  <Plus className="w-4 h-4 text-champagne-400" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream-100 text-charcoal-800 uppercase tracking-wider font-semibold border-b border-cream-200">
                    <tr>
                      <th className="py-3.5 px-4">Amenity Product</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Pack Size</th>
                      <th className="py-3.5 px-4">Custom Branding</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Featured</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-cream-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-cream-200 p-1 flex items-center justify-center shrink-0">
                              <img
                                src={p.image_url}
                                alt={p.name}
                                onError={(e) => { (e.target as HTMLImageElement).src = '/products/placeholder.svg'; }}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div>
                              <span className="font-semibold text-charcoal-900 block">{p.name}</span>
                              <span className="text-[11px] text-charcoal-600 line-clamp-1">{p.description}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-charcoal-800">{p.category_name}</td>
                        <td className="py-3.5 px-4 text-charcoal-800">{p.pack_size || 'To be confirmed'}</td>
                        <td className="py-3.5 px-4">
                          {p.is_customizable ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-champagne-100 text-champagne-900 border border-champagne-200">
                              Customizable
                            </span>
                          ) : (
                            <span className="text-charcoal-400 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              p.is_active
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {p.is_active ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {p.is_featured ? (
                            <span className="text-amber-600 font-semibold text-[11px]">★ Featured</span>
                          ) : (
                            <span className="text-charcoal-400 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* Quick Publish / Unpublish Toggle */}
                          <button
                            onClick={() => handleTogglePublishProduct(p)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                              p.is_active
                                ? 'bg-cream-100 hover:bg-amber-50 text-amber-900 border-amber-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                            }`}
                            title={p.is_active ? 'Unpublish from public catalog' : 'Publish to public catalog'}
                          >
                            {p.is_active ? 'Unpublish' : 'Publish'}
                          </button>

                          {/* Preview Product Card */}
                          <button
                            onClick={() => setPreviewProduct(p)}
                            className="p-1.5 hover:bg-cream-200 rounded text-charcoal-800"
                            title="Preview public card"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              let vars: string[] = [];
                              try {
                                vars = JSON.parse(p.variants_json || '[]');
                              } catch {}
                              setEditingProduct(p);
                              setProductVariantsInput(vars.join(', '));
                              setProductModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-cream-200 rounded text-charcoal-800"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 hover:bg-rose-100 rounded text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-cream-200 shadow-sm">
              <h3 className="font-serif font-bold text-lg text-charcoal-900">Hospitality Categories</h3>
              <button
                onClick={() => {
                  setEditingCategory({
                    name: '',
                    slug: '',
                    description: '',
                    image_url: '/products/placeholder.svg',
                    is_active: 1,
                  });
                  setCategoryModalOpen(true);
                }}
                className="px-4 py-2 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-champagne-400" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-cream-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-full h-32 rounded-xl overflow-hidden bg-[#FAF8F5] p-2 flex items-center justify-center border border-cream-200">
                      <img
                        src={cat.image_url || '/products/placeholder.svg'}
                        alt={cat.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/products/placeholder.svg'; }}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h4 className="font-serif font-bold text-base text-charcoal-900">{cat.name}</h4>
                    <p className="text-xs text-charcoal-800 line-clamp-2">{cat.description}</p>
                  </div>

                  <div className="pt-2 border-t border-cream-200 flex justify-between items-center text-xs">
                    <span className="text-[11px] text-charcoal-800 font-mono">slug: {cat.slug}</span>
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setCategoryModalOpen(true);
                      }}
                      className="text-champagne-700 font-semibold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ACCESS CODES MANAGEMENT */}
        {activeTab === 'codes' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-cream-200 shadow-sm">
              <div>
                <h3 className="font-serif font-bold text-lg text-charcoal-900">
                  Customer Access Code Authorization
                </h3>
                <p className="text-xs text-charcoal-800">
                  Issue unique, secure access codes to verified hotels and resorts to allow inquiry submissions.
                </p>
              </div>

              <button
                onClick={() => {
                  generateRandomCode();
                  setCodeModalOpen(true);
                }}
                className="px-4 py-2.5 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4 text-champagne-400" />
                <span>Issue New Access Code</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream-100 text-charcoal-800 uppercase tracking-wider font-semibold border-b border-cream-200">
                    <tr>
                      <th className="py-3.5 px-4">Access Code</th>
                      <th className="py-3.5 px-4">Assigned Client / Hotel</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Usage (Used / Max)</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {accessCodes.map((code) => {
                      const isRevoked = code.status === 'revoked';
                      const isExhausted = code.used_count >= code.max_uses;
                      return (
                        <tr key={code.id} className="hover:bg-cream-50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-sm text-charcoal-900">
                            <div className="flex items-center gap-2">
                              <span className="bg-cream-100 px-2 py-0.5 rounded border border-cream-200">
                                {code.code || '—'}
                              </span>
                              {code.code && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(code.code);
                                    alert(`Copied access code "${code.code}" to clipboard!`);
                                  }}
                                  title="Copy Access Code"
                                  className="p-1 hover:bg-cream-200 rounded text-charcoal-600 hover:text-charcoal-900 transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-charcoal-900">
                            {code.client_name}
                          </td>
                          <td className="py-3.5 px-4 text-charcoal-800">
                            {code.contact_name || '—'} {code.contact_phone ? `(${code.contact_phone})` : ''}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold">
                              {code.used_count} / {code.max_uses}
                            </span>{' '}
                            inquiries
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isRevoked
                                  ? 'bg-rose-50 text-rose-800'
                                  : isExhausted
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {code.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleRevokeCode(code.id, code.status)}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                                isRevoked
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              }`}
                            >
                              {isRevoked ? 'Reactivate' : 'Revoke'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-cream-200 p-8 shadow-sm space-y-6 animate-fade-in max-w-3xl">
            <h3 className="font-serif font-bold text-2xl text-charcoal-900 border-b border-cream-200 pb-3">
              Application &amp; Security Settings
            </h3>

            <div className="space-y-4 text-xs text-charcoal-800">
              <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 space-y-1">
                <span className="font-bold text-charcoal-900 uppercase tracking-wider block">
                  Official Business WhatsApp
                </span>
                <p className="font-mono text-sm font-semibold text-charcoal-950">+91 91499 53610</p>
                <p className="text-[11px] text-charcoal-800">
                  Target for all customer click-to-chat handoffs with pre-encoded requirement references.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 space-y-1">
                <span className="font-bold text-charcoal-900 uppercase tracking-wider block">
                  Administrator Allowlist Policy
                </span>
                <p className="text-[11px] text-charcoal-800 leading-relaxed">
                  Both Email/Password and Google OAuth sign-in enforce strict server-side allowlist verification. Only accounts listed in the server environment variable <code>ADMIN_ALLOWLIST</code> or <code>INITIAL_ADMIN_EMAIL</code> can access this portal.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 space-y-1">
                <span className="font-bold text-charcoal-900 uppercase tracking-wider block">
                  Confidential Trade Pricing Protection
                </span>
                <p className="text-[11px] text-charcoal-800 leading-relaxed">
                  The application is hard-coded to never store, calculate, or expose public prices, discounts, or subtotals. All pricing discussions are held privately between the sales executive and client.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* INQUIRY DETAILS MODAL / DRAWER */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-cream-300 p-6 sm:p-8 overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-5 right-5 p-2 text-charcoal-800 hover:text-charcoal-950 rounded-full hover:bg-cream-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-cream-200 pb-4">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-champagne-700">
                Inquiry Details &amp; Lifecycle Workflow
              </span>
              <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
                <h3 className="font-mono text-2xl font-bold text-charcoal-900">
                  {selectedInquiry.reference}
                </h3>
                <span
                  className={`px-3 py-1 rounded-md text-xs font-bold border ${
                    ORDER_STATUS_COLORS[selectedInquiry.status]?.bg || 'bg-gray-100'
                  } ${ORDER_STATUS_COLORS[selectedInquiry.status]?.text || 'text-gray-800'} ${
                    ORDER_STATUS_COLORS[selectedInquiry.status]?.border || 'border-gray-200'
                  }`}
                >
                  {selectedInquiry.status}
                </span>
              </div>
            </div>

            {/* Customer & Hotel Info Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-cream-50 border border-cream-200 text-xs">
              <div>
                <span className="text-charcoal-800 font-semibold block">Hotel / Company:</span>
                <span className="text-charcoal-900 font-bold text-sm block">{selectedInquiry.company_name}</span>
              </div>
              <div>
                <span className="text-charcoal-800 font-semibold block">Contact Person:</span>
                <span className="text-charcoal-900 font-bold text-sm block">{selectedInquiry.customer_name}</span>
              </div>
              <div>
                <span className="text-charcoal-800 font-semibold block">Phone / WhatsApp:</span>
                <span className="text-charcoal-900 font-mono font-semibold block">{selectedInquiry.contact_phone}</span>
              </div>
              <div>
                <span className="text-charcoal-800 font-semibold block">Delivery City:</span>
                <span className="text-charcoal-900 font-semibold block">{selectedInquiry.delivery_city}</span>
              </div>
              {selectedInquiry.contact_email && (
                <div>
                  <span className="text-charcoal-800 font-semibold block">Email:</span>
                  <span className="text-charcoal-900 block">{selectedInquiry.contact_email}</span>
                </div>
              )}
              {selectedInquiry.expected_date && (
                <div>
                  <span className="text-charcoal-800 font-semibold block">Expected Delivery:</span>
                  <span className="text-charcoal-900 block">{selectedInquiry.expected_date}</span>
                </div>
              )}
            </div>

            {/* Direct WhatsApp Action to Customer */}
            <div>
              <a
                href={`https://wa.me/${selectedInquiry.contact_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hello ${selectedInquiry.customer_name}, following up regarding your CryststalClean hotel amenities inquiry (${selectedInquiry.reference}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-whatsapp-600 hover:bg-whatsapp-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-white stroke-none" />
                <span>Contact Client on WhatsApp ({selectedInquiry.contact_phone})</span>
              </a>
            </div>

            {/* Items Table Snapshot */}
            <div>
              <h4 className="font-serif font-bold text-base text-charcoal-900 mb-2">
                Requested Products ({selectedInquiry.items?.length || 0} items)
              </h4>
              <div className="bg-cream-50 rounded-xl border border-cream-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream-100 text-charcoal-800 uppercase text-[10px] tracking-wider border-b border-cream-200">
                    <tr>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Variant / Size</th>
                      <th className="py-2.5 px-3">Pack Standard</th>
                      <th className="py-2.5 px-3 text-right">Requested Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200">
                    {selectedInquiry.items?.map((it, idx) => (
                      <tr key={it.id || idx}>
                        <td className="py-2.5 px-3 font-semibold text-charcoal-900">
                          {it.product_name_snapshot}
                        </td>
                        <td className="py-2.5 px-3 text-charcoal-800">
                          {it.variant_snapshot || 'Standard'}
                        </td>
                        <td className="py-2.5 px-3 text-charcoal-800">
                          {it.pack_size_snapshot || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-charcoal-900">
                          {it.quantity} units
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Client Notes */}
            {selectedInquiry.notes && (
              <div className="p-3.5 rounded-xl bg-champagne-100/50 border border-champagne-300 text-xs text-charcoal-900">
                <span className="font-bold block uppercase tracking-wider text-[10px] text-champagne-800">
                  Client Notes / Custom Branding:
                </span>
                <p className="mt-1 whitespace-pre-wrap">{selectedInquiry.notes}</p>
              </div>
            )}

            {/* ORDER STATUS WORKFLOW CHANGER (All 10 Statuses) */}
            <div className="p-5 rounded-2xl bg-cream-100 border border-cream-300 space-y-3">
              <h4 className="font-serif font-bold text-sm text-charcoal-900">
                Update Order Lifecycle Status
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {statusesList.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(st)}
                    className={`px-3 py-2 rounded-lg text-[11px] font-bold border transition-all text-center ${
                      selectedInquiry.status === st
                        ? 'bg-charcoal-900 text-white border-charcoal-900 shadow-md scale-95'
                        : 'bg-white text-charcoal-800 border-cream-300 hover:border-charcoal-500'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Private Admin Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider">
                Private Administrative Notes
              </label>
              <textarea
                rows={2}
                value={editingAdminNotes}
                onChange={(e) => setEditingAdminNotes(e.target.value)}
                placeholder="Internal notes regarding price agreed, dispatch schedule, batch number, freight partner..."
                className="w-full px-4 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs focus:outline-none"
              />
              <button
                onClick={handleSaveAdminNotes}
                className="px-4 py-2 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-lg text-xs font-semibold"
              >
                Save Notes
              </button>
            </div>

            {/* Status History Timeline Audit Trail */}
            {inquiryHistory.length > 0 && (
              <div className="pt-2 border-t border-cream-200 space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-charcoal-800 block">
                  Status History &amp; Audit Trail
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {inquiryHistory.map((h, i) => (
                    <div key={i} className="text-xs p-2.5 rounded-lg bg-cream-50 border border-cream-200 flex justify-between">
                      <div>
                        <span className="font-semibold text-charcoal-900">
                          {h.from_status ? `${h.from_status} → ` : ''}{h.to_status}
                        </span>
                        {h.note && <p className="text-[11px] text-charcoal-800 mt-0.5">{h.note}</p>}
                      </div>
                      <div className="text-right text-[11px] text-charcoal-800">
                        <span>{h.changed_by}</span>
                        <span className="block text-[10px] opacity-75">{new Date(h.changed_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRODUCT CREATE / EDIT MODAL */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleSaveProduct}
            className="relative w-full max-w-xl max-h-[90vh] bg-white rounded-3xl p-8 overflow-y-auto shadow-2xl border border-cream-300 space-y-4"
          >
            <button
              type="button"
              onClick={() => setProductModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-charcoal-800 hover:text-charcoal-950"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif font-bold text-xl text-charcoal-900">
              {editingProduct.id ? 'Edit Hospitality Amenity' : 'Create New Amenity'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={editingProduct.name || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase mb-1">
                Category *
              </label>
              <select
                value={editingProduct.category_id || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={editingProduct.description || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase mb-1">
                Image URL *
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  required
                  value={editingProduct.image_url || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
                />
                
                {/* Cloudflare R2 direct image file upload */}
                <div className="bg-cream-100/70 p-3 rounded-xl border border-cream-200">
                  <label className="block text-[11px] font-semibold text-charcoal-800 uppercase mb-1">
                    Or Upload Image to Cloudflare R2
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                      className="text-xs text-charcoal-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-charcoal-900 file:text-white hover:file:bg-charcoal-800 cursor-pointer disabled:opacity-50"
                    />
                    {uploadingImage && (
                      <span className="text-xs text-champagne-700 font-medium animate-pulse">
                        Uploading to R2...
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-charcoal-500 mt-1">
                    Uploads directly to Cloudflare R2 bucket and stores reference URL.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase mb-1">
                Standard Packaging / Unit Pack Size
              </label>
              <input
                type="text"
                placeholder="e.g. 5 L, 20 ml, or 'To be confirmed'"
                value={editingProduct.pack_size || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, pack_size: e.target.value })}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase mb-1">
                Variants / Bottle Sizes (comma separated)
              </label>
              <input
                type="text"
                value={productVariantsInput}
                onChange={(e) => setProductVariantsInput(e.target.value)}
                placeholder="e.g. 5 L Container, 20 ml Bottle, Standard Pack"
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex flex-wrap gap-4 pt-2 border-t border-cream-200">
              <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!editingProduct.is_active}
                  onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked ? 1 : 0 })}
                  className="rounded text-charcoal-900"
                />
                <span>Active (Published on Website)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!editingProduct.is_featured}
                  onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked ? 1 : 0 })}
                  className="rounded text-charcoal-900"
                />
                <span>Feature on Homepage</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!editingProduct.is_customizable}
                  onChange={(e) => setEditingProduct({ ...editingProduct, is_customizable: e.target.checked ? 1 : 0 })}
                  className="rounded text-charcoal-900"
                />
                <span className="text-champagne-800 font-bold">Customizable with your logo</span>
              </label>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-cream-200">
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="px-4 py-2 bg-cream-100 rounded-lg text-xs font-semibold text-charcoal-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PUBLIC PRODUCT CARD PREVIEW MODAL */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-cream-300 space-y-4">
            <button
              type="button"
              onClick={() => setPreviewProduct(null)}
              className="absolute top-5 right-5 p-2 text-charcoal-800 hover:text-charcoal-950"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-between pr-8">
              <span className="text-xs font-semibold text-champagne-700 uppercase tracking-wider">
                Public Card Preview
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  previewProduct.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {previewProduct.is_active ? 'Published' : 'Draft (Unpublished)'}
              </span>
            </div>

            {/* Product Card Container (Exact replica of public view on neutral off-white background) */}
            <div className="bg-[#FAF8F5] border border-cream-300 rounded-2xl overflow-hidden p-4 space-y-3 shadow-xs">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white border border-cream-200 flex items-center justify-center">
                <img
                  src={previewProduct.image_url}
                  alt={previewProduct.name}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/products/placeholder.svg'; }}
                  className="w-full h-full object-contain p-4"
                />
                {previewProduct.is_customizable === 1 && (
                  <span className="absolute top-2 left-2 px-2.5 py-1 bg-champagne-700 text-white text-[10px] font-semibold tracking-wider uppercase rounded-md shadow-sm">
                    Customizable with your logo
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-champagne-700">
                  {previewProduct.category_name}
                </span>
                <h4 className="font-serif font-bold text-lg text-charcoal-900 leading-snug">
                  {previewProduct.name}
                </h4>
                <p className="text-xs text-charcoal-600 line-clamp-2 mt-1">
                  {previewProduct.description}
                </p>
                <div className="mt-3 pt-3 border-t border-cream-200 flex justify-between items-center text-xs">
                  <span className="text-charcoal-600">
                    Standard Pack: <strong className="text-charcoal-900">{previewProduct.pack_size || 'To be confirmed'}</strong>
                  </span>
                  <span className="text-charcoal-500 italic text-[11px]">
                    No public prices displayed
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  const p = previewProduct;
                  setPreviewProduct(null);
                  handleTogglePublishProduct(p);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  previewProduct.is_active
                    ? 'bg-amber-700 text-white hover:bg-amber-800'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800'
                }`}
              >
                {previewProduct.is_active ? 'Unpublish from Catalog' : 'Publish to Catalog'}
              </button>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-charcoal-800 rounded-xl text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCESS CODE CREATE MODAL */}
      {codeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleSaveAccessCode}
            className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-cream-300 space-y-4"
          >
            <button
              type="button"
              onClick={() => setCodeModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-charcoal-800 hover:text-charcoal-950"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif font-bold text-xl text-charcoal-900">
              Generate Customer Access Code
            </h3>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-charcoal-800 uppercase">
                  Access Code String *
                </label>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="text-[11px] text-champagne-700 font-semibold hover:underline"
                >
                  Regenerate Random
                </button>
              </div>
              <input
                type="text"
                required
                value={newCodeData.code}
                onChange={(e) => setNewCodeData({ ...newCodeData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-sm font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase mb-1">
                Client / Hotel / Resort Name *
              </label>
              <input
                type="text"
                required
                value={newCodeData.client_name}
                onChange={(e) => setNewCodeData({ ...newCodeData, client_name: e.target.value })}
                placeholder="e.g. The Oberoi Grand"
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                value={newCodeData.contact_name}
                onChange={(e) => setNewCodeData({ ...newCodeData, contact_name: e.target.value })}
                placeholder="e.g. Vikram Singhania"
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-charcoal-800 uppercase">
                  Registered Contact Phone
                </label>
                <span className="text-[11px] text-charcoal-600 font-mono">
                  {newCodeData.contact_phone ? `${newCodeData.contact_phone.length}/10 digits` : '10 digits'}
                </span>
              </div>
              <input
                type="tel"
                maxLength={10}
                pattern="[0-9]{10}"
                value={newCodeData.contact_phone}
                onChange={(e) => {
                  let cleaned = e.target.value.replace(/\D/g, '');
                  if (cleaned.startsWith('91') && cleaned.length > 10) {
                    cleaned = cleaned.slice(2);
                  } else if (cleaned.startsWith('0') && cleaned.length > 10) {
                    cleaned = cleaned.slice(1);
                  }
                  setNewCodeData({ ...newCodeData, contact_phone: cleaned.slice(0, 10) });
                }}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs font-mono"
              />
              {newCodeData.contact_phone && newCodeData.contact_phone.length !== 10 && (
                <p className="text-[11px] text-amber-700 mt-1">
                  Mobile number must be exactly 10 digits
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal-800 uppercase mb-1">
                  Max Inquiries
                </label>
                <input
                  type="number"
                  min="1"
                  value={newCodeData.max_uses}
                  onChange={(e) => setNewCodeData({ ...newCodeData, max_uses: parseInt(e.target.value) || 50 })}
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800 uppercase mb-1">
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={newCodeData.expires_at}
                  onChange={(e) => setNewCodeData({ ...newCodeData, expires_at: e.target.value })}
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-cream-200">
              <button
                type="button"
                onClick={() => setCodeModalOpen(false)}
                className="px-4 py-2 bg-cream-100 rounded-lg text-xs font-semibold text-charcoal-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-lg text-xs font-semibold"
              >
                Issue Code
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {categoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const isEdit = !!editingCategory.id;
                const url = isEdit ? `/api/categories/${editingCategory.id}` : '/api/categories';
                const method = isEdit ? 'PUT' : 'POST';
                await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(editingCategory),
                });
                setCategoryModalOpen(false);
                loadAllData();
              } catch (err) {
                console.error(err);
              }
            }}
            className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-cream-300 space-y-4"
          >
            <button
              type="button"
              onClick={() => setCategoryModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-charcoal-800 hover:text-charcoal-950"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif font-bold text-xl text-charcoal-900">
              {editingCategory.id ? 'Edit Category' : 'Create Category'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={editingCategory.name || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={editingCategory.description || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={editingCategory.image_url || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-cream-200">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="px-4 py-2 bg-cream-100 rounded-lg text-xs font-semibold text-charcoal-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-lg text-xs font-semibold"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
