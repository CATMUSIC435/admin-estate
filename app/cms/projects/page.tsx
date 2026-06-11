"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Building, Pencil, Trash2, Save, AlertTriangle, Plus, Eye, EyeOff,
  Star, MapPin, Image, Video, Users, ChevronDown, ChevronRight, X,
} from "lucide-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { DataTable } from "../../../components/ui/DataTable";
import { Modal } from "../../../components/ui/Modal";
import { FormInput } from "../../../components/ui/Input";
import { useToast } from "../../../components/ui/Toast";

const API_URL = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:3001";
const GQL_URL = process.env.NEXT_PUBLIC_NEST_GRAPHQL_URL || "http://localhost:3001/graphql";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  coming_soon:   { label: "Sắp Ra Mắt", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  open_for_sale: { label: "Đang Mở Bán", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  sold_out:      { label: "Đã Bán Hết", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  handed_over:   { label: "Đã Bàn Giao", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  suspended:     { label: "Tạm Dừng", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const TYPE_LABELS: Record<string, string> = {
  can_ho: "Căn Hộ", biet_thu: "Biệt Thự", shophouse: "Shophouse",
  condotel: "Condotel", dat_nen: "Đất Nền", resort: "Resort", van_phong: "Văn Phòng",
};

// ── TABS TRONG MODAL ──────────────────────────────────────────────────
const FORM_TABS = [
  { id: "basic",      label: "Cơ Bản",       icon: Building },
  { id: "location",   label: "Vị Trí",        icon: MapPin },
  { id: "sections",   label: "Nội Dung",      icon: ChevronRight },
  { id: "amenities",  label: "Tiện Ích",      icon: Star },
  { id: "floorplans", label: "Mặt Bằng",      icon: Image },
  { id: "services",   label: "Dịch Vụ",       icon: Users },
  { id: "gallery",    label: "Gallery",       icon: Image },
  { id: "media",      label: "Media",         icon: Video },
  { id: "publish",    label: "Xuất Bản",      icon: Eye },
];

const DEFAULT_FORM = {
  name: "", name_en: "", brand_name: "", slug: "", tagline: "", tagline_en: "",
  status: "coming_soon", type: "can_ho", segment: "luxury",
  price_from: "", price_to: "", price_display: "", price_per_m2: "", price_unit: "VND/căn",
  location_id: "", address: "", street: "", ward: "", district: "", city: "",
  lat: "", lng: "",
  developer: "", developer_logo: "", developer_website: "",
  designer: "", interior_designer: "", constructor_company: "",
  management_company: "", distributor: "",
  total_area_m2: "", build_density_pct: "", park_area_m2: "",
  total_towers: "", total_floors: "", total_basement: "",
  total_units: "", total_shophouses: "", total_penthouses: "", parking_capacity: "",
  certificate: "", ownership_type: "freehold", license_no: "",
  handover_date: "", start_date: "", completion_date: "",
  thumbnail_img: "", thumbnail_video: "", cover_image: "",
  is_published: false, is_featured: false, is_new_badge: true, sort_order: 0,
  landing_page_url: "", landing_url_active: false,
  amenities: [] as any[],
  floorplans: [] as any[],
  services: [] as any[],
  gallery_categories: [] as any[],
  media: [] as any[],
};

// ── SECTION JSON EDITOR ───────────────────────────────────────────────
function JsonEditor({ label, value, onChange }: { label: string; value: any; onChange: (v: any) => void }) {
  const [text, setText] = useState(() => value ? JSON.stringify(value, null, 2) : "{}");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // sync khi value thay đổi từ ngoài (ví dụ load project mới)
  React.useEffect(() => {
    setText(value ? JSON.stringify(value, null, 2) : "{}");
    setError("");
  }, [JSON.stringify(value)]);

  const handleChange = (v: string) => {
    setText(v);
    try { onChange(JSON.parse(v)); setError(""); }
    catch (e: any) { setError("JSON không hợp lệ — kiểm tra dấu ngoặc, dấu phẩy"); }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);
      setText(formatted);
      onChange(parsed);
      setError("");
    } catch { setError("Không thể format — JSON đang lỗi cú pháp"); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-white/50 uppercase tracking-widest">{label}</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleFormat}
            className="text-[10px] text-[#D4AF37]/70 border border-[#D4AF37]/20 px-2 py-0.5 rounded hover:bg-[#D4AF37]/10 transition-colors"
          >
            Format
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="text-[10px] text-white/40 border border-white/10 px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        rows={10}
        spellCheck={false}
        className={`w-full bg-[#0A0A0A] border rounded-xl p-3 text-white/80 text-xs font-mono focus:outline-none resize-y transition-colors ${error ? "border-red-500/40 focus:border-red-500/60" : "border-white/10 focus:border-[#D4AF37]/50"}`}
      />
      <div className="flex items-center justify-between mt-1">
        {error
          ? <p className="text-red-400 text-[10px] flex items-center gap-1">⚠ {error}</p>
          : <p className="text-white/20 text-[10px]">✓ JSON hợp lệ</p>
        }
        <span className="text-white/20 text-[10px]">{text.length} ký tự</span>
      </div>
    </div>
  );
}

// ── ARRAY EDITOR (Amenities, Floorplans, Services) ────────────────────
function ArrayEditor({ label, items, onChange, fields }: { label: string; items: any[]; onChange: (v: any[]) => void; fields: { key: string; label: string; type?: string }[] }) {
  const addItem = () => {
    const newItem: any = { id: `new-${Date.now()}` };
    fields.forEach(f => { newItem[f.key] = ""; });
    onChange([...items, newItem]);
  };
  const removeItem = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, key: string, val: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [key]: val };
    onChange(updated);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white/70">{label} ({items.length})</h4>
        <button onClick={addItem} className="flex items-center gap-1 text-[#D4AF37] text-xs border border-[#D4AF37]/30 px-3 py-1 rounded-lg hover:bg-[#D4AF37]/10">
          <Plus size={12} /> Thêm
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={item.id || i} className="bg-white/5 border border-white/10 rounded-xl p-4 relative">
            <button onClick={() => removeItem(i)} className="absolute top-3 right-3 text-red-400/50 hover:text-red-400"><X size={14} /></button>
            <div className="grid grid-cols-2 gap-3">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea value={item[f.key] || ""} onChange={(e) => updateItem(i, f.key, e.target.value)} rows={2} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#D4AF37]/50 resize-none" />
                  ) : (
                    <input type={f.type || "text"} value={item[f.key] || ""} onChange={(e) => updateItem(i, f.key, e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#D4AF37]/50" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-white/30 text-sm text-center py-4 border border-dashed border-white/10 rounded-xl">Chưa có dữ liệu. Nhấn "Thêm" để bắt đầu.</p>}
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editForm, setEditForm] = useState<any>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const setField = (key: string, val: any) => setEditForm((f: any) => ({ ...f, [key]: val }));

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const query = `query {
        projects {
          id name slug status type is_published is_featured
          price_display thumbnail_img developer
          location { name }
        }
      }`;
      const res = await fetch(GQL_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }), cache: "no-store" });
      if (!res.ok) throw new Error("Chưa bật NestJS Server ở Port 3001");
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0].message);
      setData(json.data.projects || []);
    } catch (err: any) { setError(err.message || "Lỗi tải GraphQL"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = () => { setModalMode("create"); setEditForm(DEFAULT_FORM); setActiveTab("basic"); setModalOpen(true); };
  const handleEdit = async (item: any) => {
    setModalMode("edit"); setActiveTab("basic");
    try {
      const res = await fetch(`${API_URL}/api/projects/${item.slug}`);
      const full = await res.json();
      setEditForm({ ...DEFAULT_FORM, ...full,
        amenities: full.amenities || [], floorplans: full.floorplans || [],
        services: full.services || [], gallery_categories: full.gallery_categories || [], media: full.media || [],
      });
    } catch { setEditForm({ ...DEFAULT_FORM, ...item }); }
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa dự án này?")) return;
    try {
      await fetch(`${API_URL}/api/projects/${id}`, { method: "DELETE" });
      toast("Đã xóa Dự án", "success"); fetchData();
    } catch (err: any) { toast("Lỗi: " + err.message, "error"); }
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.slug) { toast("Vui lòng nhập Tên và Slug", "error"); return; }
    setSaving(true);
    try {
      const method = modalMode === "create" ? "POST" : "PUT";
      const url = modalMode === "create" ? `${API_URL}/api/projects` : `${API_URL}/api/projects/${editForm.id}`;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setModalOpen(false);
      toast(modalMode === "create" ? "Tạo dự án thành công!" : "Cập nhật thành công!", "success");
      fetchData();
    } catch (err: any) { toast("Lỗi lưu: " + err.message, "error"); }
    finally { setSaving(false); }
  };

  const columns = [
    {
      header: "Dự Án",
      render: (p: any) => (
        <div className="flex items-center gap-3">
          {p.thumbnail_img && <img src={p.thumbnail_img} className="w-12 h-8 object-cover rounded" alt={p.name} />}
          <div>
            <div className="text-white font-medium">{p.name}</div>
            <div className="text-white/40 text-xs font-mono">{p.slug}</div>
          </div>
        </div>
      )
    },
    { header: "Trạng Thái", render: (p: any) => {
      const s = STATUS_LABELS[p.status] || { label: p.status, color: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
      return <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full border ${s.color}`}>{s.label}</span>;
    }},
    { header: "Loại", render: (p: any) => <span className="text-white/60 text-xs">{TYPE_LABELS[p.type] || p.type}</span> },
    { header: "Chủ ĐT", render: (p: any) => <span className="text-white/50 text-xs">{p.developer || "—"}</span> },
    { header: "Giá", render: (p: any) => <span className="text-[#D4AF37] text-xs font-medium">{p.price_display || "Liên hệ"}</span> },
    { header: "Xuất bản", render: (p: any) => (
      <div className="flex gap-2">
        {p.is_published ? <Eye size={14} className="text-green-400" /> : <EyeOff size={14} className="text-white/20" />}
        {p.is_featured && <Star size={14} className="text-yellow-400" />}
      </div>
    )},
    { header: "Thao Tác", className: "text-right w-24",
      render: (p: any) => (
        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => handleEdit(p)} className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-[#D4AF37]"><Pencil size={18} /></button>
          <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-white/50 hover:text-red-400"><Trash2 size={18} /></button>
        </div>
      )
    },
  ];

  return (
    <div className="h-full flex flex-col p-4 md:p-8 overflow-y-auto">
      <PageHeader title="Quản Lý Dự Án" description={`${data.length} dự án trong hệ thống`} onRefresh={fetchData} isLoading={loading} onCreate={handleCreate} />

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-4">
          <AlertTriangle size={32} />
          <div><h3 className="font-bold text-lg mb-1">Mất Kết Nối NestJS</h3><p className="text-sm opacity-80">{error}</p></div>
        </div>
      ) : (
        <DataTable data={data} columns={columns} keyExtractor={(p) => p.id} emptyIcon={Building} />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === "create" ? "Thêm Dự Án Mới" : `Sửa: ${editForm.name}`} maxWidth="4xl">
        {/* Tab Navigation */}
        <div className="flex gap-1 flex-wrap mb-6 pb-4 border-b border-white/10">
          {FORM_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id ? "bg-[#D4AF37] text-black" : "text-white/50 hover:bg-white/10 hover:text-white"}`}>
              <tab.icon size={12} />{tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: CƠ BẢN ── */}
        {activeTab === "basic" && (
          <div className="space-y-0">
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Tên Dự Án *" value={editForm.name} onChange={(v) => { setField("name", v); setField("slug", v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")); }} required />
              <FormInput label="Tên EN" value={editForm.name_en} onChange={(v) => setField("name_en", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Slug (URL) *" value={editForm.slug} onChange={(v) => setField("slug", v)} required />
              <FormInput label="Tên Thương Hiệu" value={editForm.brand_name} onChange={(v) => setField("brand_name", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Tagline VI" value={editForm.tagline} onChange={(v) => setField("tagline", v)} />
              <FormInput label="Tagline EN" value={editForm.tagline_en} onChange={(v) => setField("tagline_en", v)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">Trạng Thái *</label>
                <select value={editForm.status} onChange={(e) => setField("status", e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50">
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">Loại Hình *</label>
                <select value={editForm.type} onChange={(e) => setField("type", e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50">
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">Phân Khúc</label>
                <select value={editForm.segment} onChange={(e) => setField("segment", e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50">
                  <option value="luxury">Hạng Sang</option>
                  <option value="premium">Cao Cấp</option>
                  <option value="mid_end">Trung Cao Cấp</option>
                  <option value="affordable">Bình Dân</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormInput label="Giá Từ (VND)" value={editForm.price_from} onChange={(v) => setField("price_from", Number(v))} type="number" />
              <FormInput label="Giá Đến (VND)" value={editForm.price_to} onChange={(v) => setField("price_to", Number(v))} type="number" />
              <FormInput label="Hiển Thị Giá" value={editForm.price_display} onChange={(v) => setField("price_display", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Chủ Đầu Tư" value={editForm.developer} onChange={(v) => setField("developer", v)} />
              <FormInput label="Website CĐT" value={editForm.developer_website} onChange={(v) => setField("developer_website", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Đơn Vị TK" value={editForm.designer} onChange={(v) => setField("designer", v)} />
              <FormInput label="Đơn Vị Thi Công" value={editForm.constructor_company} onChange={(v) => setField("constructor_company", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Quản Lý Vận Hành" value={editForm.management_company} onChange={(v) => setField("management_company", v)} />
              <FormInput label="Đơn Vị Phân Phối" value={editForm.distributor} onChange={(v) => setField("distributor", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Pháp Lý" value={editForm.certificate} onChange={(v) => setField("certificate", v)} />
              <FormInput label="Ngày Bàn Giao" value={editForm.handover_date} onChange={(v) => setField("handover_date", v)} type="date" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormInput label="Tổng Tầng" value={editForm.total_floors} onChange={(v) => setField("total_floors", Number(v))} type="number" />
              <FormInput label="Tổng Căn" value={editForm.total_units} onChange={(v) => setField("total_units", Number(v))} type="number" />
              <FormInput label="Mật Độ XD (%)" value={editForm.build_density_pct} onChange={(v) => setField("build_density_pct", Number(v))} type="number" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormInput label="Ảnh Card (thumbnail_img)" value={editForm.thumbnail_img} onChange={(v) => setField("thumbnail_img", v)} />
              <FormInput label="Video Hover (.mp4)" value={editForm.thumbnail_video} onChange={(v) => setField("thumbnail_video", v)} />
              <FormInput label="Ảnh Cover OG" value={editForm.cover_image} onChange={(v) => setField("cover_image", v)} />
            </div>
          </div>
        )}

        {/* ── TAB: VỊ TRÍ ── */}
        {activeTab === "location" && (
          <div className="space-y-0">
            <FormInput label="Địa Chỉ Đầy Đủ" value={editForm.address} onChange={(v) => setField("address", v)} />
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Đường Phố" value={editForm.street} onChange={(v) => setField("street", v)} />
              <FormInput label="Phường/Xã" value={editForm.ward} onChange={(v) => setField("ward", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Quận/Huyện" value={editForm.district} onChange={(v) => setField("district", v)} />
              <FormInput label="Thành Phố" value={editForm.city} onChange={(v) => setField("city", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Vĩ Độ (lat)" value={editForm.lat} onChange={(v) => setField("lat", Number(v))} type="number" />
              <FormInput label="Kinh Độ (lng)" value={editForm.lng} onChange={(v) => setField("lng", Number(v))} type="number" />
            </div>
            <FormInput label="Location ID (loc-da-nang)" value={editForm.location_id} onChange={(v) => setField("location_id", v)} />
          </div>
        )}

        {/* ── TAB: NỘI DUNG SECTIONS ── */}
        {activeTab === "sections" && (
          <div>
            <p className="text-white/40 text-xs mb-4">Chỉnh sửa JSON cho từng section. Xem tài liệu để biết cấu trúc.</p>
            <JsonEditor label="Hero Section (hero_data)" value={editForm.hero_data} onChange={(v) => setField("hero_data", v)} />
            <JsonEditor label="Overview (overview_data)" value={editForm.overview_data} onChange={(v) => setField("overview_data", v)} />
            <JsonEditor label="Values (values_data)" value={editForm.values_data} onChange={(v) => setField("values_data", v)} />
            <JsonEditor label="Location Section (location_data)" value={editForm.location_data} onChange={(v) => setField("location_data", v)} />
            <JsonEditor label="Architecture (architecture_data)" value={editForm.architecture_data} onChange={(v) => setField("architecture_data", v)} />
            <JsonEditor label="Contact (contact_data)" value={editForm.contact_data} onChange={(v) => setField("contact_data", v)} />
            <JsonEditor label="SEO (seo_data)" value={editForm.seo_data} onChange={(v) => setField("seo_data", v)} />
          </div>
        )}

        {/* ── TAB: TIỆN ÍCH ── */}
        {activeTab === "amenities" && (
          <ArrayEditor
            label="Tiện Ích" items={editForm.amenities} onChange={(v) => setField("amenities", v)}
            fields={[
              { key: "category_tag", label: "Phân Nhóm (Tầng Thượng / Nội Khu / Tầng Thấp)" },
              { key: "title", label: "Tên Tiện Ích *" },
              { key: "description", label: "Mô Tả", type: "textarea" },
              { key: "image_url", label: "URL Ảnh (4/3)" },
              { key: "highlight_stat", label: "Số Liệu Nổi Bật" },
              { key: "sort_order", label: "Thứ Tự", type: "number" },
            ]}
          />
        )}

        {/* ── TAB: MẶT BẰNG ── */}
        {activeTab === "floorplans" && (
          <ArrayEditor
            label="Loại Căn" items={editForm.floorplans} onChange={(v) => setField("floorplans", v)}
            fields={[
              { key: "tab_name", label: "Tên Tab (VD: Classic 1PN) *" },
              { key: "space_name", label: "Tên Không Gian (VD: The Classic Space)" },
              { key: "area_m2", label: "Diện Tích (m²)", type: "number" },
              { key: "area_display", label: "Hiển Thị DT (57.8 m²)" },
              { key: "beds", label: "Số PN", type: "number" },
              { key: "baths", label: "Số PT", type: "number" },
              { key: "price_display", label: "Giá Hiển Thị (Từ 3.2 Tỷ)" },
              { key: "status", label: "Trạng Thái (open/sold_out)" },
              { key: "availability", label: "Số Căn Còn Lại", type: "number" },
              { key: "description", label: "Mô Tả", type: "textarea" },
              { key: "spec_left_label", label: "Label Trái (PHÒNG NGỦ)" },
              { key: "spec_left_value", label: "Value Trái (2)" },
              { key: "spec_right_label", label: "Label Phải (DIỆN TÍCH)" },
              { key: "spec_right_value", label: "Value Phải (95.4m²)" },
              { key: "image_url", label: "Ảnh Mặt Bằng 2D (PNG)" },
              { key: "tour_3d_url", label: "Matterport VR360 URL" },
              { key: "sort_order", label: "Thứ Tự", type: "number" },
            ]}
          />
        )}

        {/* ── TAB: DỊCH VỤ ── */}
        {activeTab === "services" && (
          <ArrayEditor
            label="Dịch Vụ" items={editForm.services} onChange={(v) => setField("services", v)}
            fields={[
              { key: "icon_type", label: "Icon Type (1=Concierge 2=Security 3=F&B 4=Spa 5=Valet)", type: "number" },
              { key: "title", label: "Tên Dịch Vụ *" },
              { key: "description", label: "Mô Tả", type: "textarea" },
              { key: "sort_order", label: "Thứ Tự", type: "number" },
            ]}
          />
        )}

        {/* ── TAB: GALLERY ── */}
        {activeTab === "gallery" && (
          <div>
            <p className="text-white/40 text-xs mb-4">Gallery gồm 3 categories, mỗi category chứa nhiều ảnh.</p>
            <JsonEditor label="Gallery Categories (gallery_categories)" value={editForm.gallery_categories} onChange={(v) => setField("gallery_categories", v)} />
            <JsonEditor label="Gallery Header (gallery_header)" value={editForm.gallery_header} onChange={(v) => setField("gallery_header", v)} />
          </div>
        )}

        {/* ── TAB: MEDIA ── */}
        {activeTab === "media" && (
          <ArrayEditor
            label="Video & VR Tour" items={editForm.media} onChange={(v) => setField("media", v)}
            fields={[
              { key: "type", label: "Loại (promo_video/drone_video/vr360/walkthrough_3d)" },
              { key: "title", label: "Tiêu Đề" },
              { key: "url", label: "URL (YouTube/Matterport) *" },
              { key: "embed_url", label: "Embed URL" },
              { key: "thumbnail_url", label: "Thumbnail URL" },
              { key: "duration_seconds", label: "Độ Dài (giây)", type: "number" },
              { key: "sort_order", label: "Thứ Tự", type: "number" },
            ]}
          />
        )}

        {/* ── TAB: XUẤT BẢN ── */}
        {activeTab === "publish" && (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              {[
                { key: "is_published", label: "Xuất Bản", desc: "Hiển thị dự án trên website", icon: Eye },
                { key: "is_featured", label: "Nổi Bật", desc: "Hiện ở trang chủ (HomeFeaturedProjects)", icon: Star },
                { key: "is_new_badge", label: "Badge MỚI", desc: "Hiển thị badge 'Mới' trên card", icon: Plus },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <item.icon size={16} className="text-white/50" />
                    <div>
                      <div className="text-white text-sm font-medium">{item.label}</div>
                      <div className="text-white/40 text-xs">{item.desc}</div>
                    </div>
                  </div>
                  <button onClick={() => setField(item.key, !editForm[item.key])}
                    className={`w-12 h-6 rounded-full transition-colors ${editForm[item.key] ? "bg-[#D4AF37]" : "bg-white/10"}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform m-0.5 ${editForm[item.key] ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
              ))}
            </div>

            <FormInput label="Thứ Tự Sắp Xếp" value={editForm.sort_order} onChange={(v) => setField("sort_order", Number(v))} type="number" />

            {/* ── LANDING PAGE REDIRECT ── */}
            <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-amber-400 text-sm font-semibold mb-1">Landing Page Riêng</div>
                  <div className="text-white/50 text-xs leading-relaxed">
                    Nếu bật, người dùng truy cập <code className="bg-white/10 px-1 py-0.5 rounded">/projects/{editForm.slug || "[slug]"}</code> sẽ bị chuyển hướng tới URL bên dưới. Trang landing mặc định sẽ không hiển thị.
                  </div>
                </div>
              </div>

              <FormInput
                label="Landing Page URL"
                value={editForm.landing_page_url}
                onChange={(v) => setField("landing_page_url", v)}
                placeholder="https://alizedanang.net/vi/landing/alize"
              />

              <div className="flex items-center justify-between py-3 border-t border-white/10">
                <div>
                  <div className="text-white text-sm font-medium">Kích Hoạt Redirect</div>
                  <div className="text-white/40 text-xs">
                    {editForm.landing_url_active
                      ? <span className="text-amber-400 font-medium">⚠️ ĐANG REDIRECT — Trang mặc định bị ẩn</span>
                      : "Tắt — trang mặc định vẫn hiển thị"
                    }
                  </div>
                </div>
                <button
                  onClick={() => setField("landing_url_active", !editForm.landing_url_active)}
                  disabled={!editForm.landing_page_url}
                  className={`w-12 h-6 rounded-full transition-colors disabled:opacity-30 ${editForm.landing_url_active ? "bg-amber-500" : "bg-white/10"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform m-0.5 ${editForm.landing_url_active ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SAVE/CANCEL ── */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-white/10 sticky bottom-0 bg-[#0D0D0D]">
          <button onClick={() => setModalOpen(false)} className="flex-1 bg-white/5 text-white/70 py-3 rounded-xl text-sm hover:bg-white/10">Hủy</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#D4AF37] text-black font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#D4AF37]/90">
            <Save size={16} /> {saving ? "Đang lưu..." : "Lưu Dự Án"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
