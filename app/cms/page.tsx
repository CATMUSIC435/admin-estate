"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Database, RefreshCw, AlertTriangle, CheckCircle2, MapPin, Building, Home, FileText, Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { SyncData, PropertyModel, LocationModel, BlogModel, ProjectModel } from "../../types";

const API_URL = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:3001";
const GQL_URL = process.env.NEXT_PUBLIC_NEST_GRAPHQL_URL || "http://localhost:3001/graphql";

// ==================== MODAL COMPONENT ====================
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ==================== INPUT COMPONENT ====================
function FormInput({ label, value, onChange, type = "text", placeholder = "", required = false }: any) {
  return (
    <div className="mb-4">
      <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
      <input
        type={type}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/50 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
      />
    </div>
  );
}

// ==================== TABS ====================
type TabType = "properties" | "blogs" | "locations" | "projects";

export default function CMSPage() {
  const [data, setData] = useState<SyncData>({ locations: [], projects: [], properties: [], blogs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("properties");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = `query {
        locations { id name slug }
        properties { id name location transaction_type price }
        blogs { id title slug }
        projects { id name slug }
      }`;
      const response = await fetch(GQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        cache: "no-store"
      });
      if (!response.ok) throw new Error("Chưa bật NestJS Server ở Port 3001");
      const json = await response.json();
      if (json.errors) throw new Error(json.errors[0].message);
      setData({
        locations: json.data.locations || [],
        properties: json.data.properties || [],
        blogs: json.data.blogs || [],
        projects: json.data.projects || []
      });
    } catch (err: any) {
      setError(err.message || "Lỗi tải GraphQL");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ==================== CRUD HANDLERS ====================
  const getEndpoint = (tab: TabType) => `${API_URL}/api/${tab}`;

  const handleCreate = (tab: TabType) => {
    setActiveTab(tab);
    setModalMode("create");
    setEditForm({});
    setModalOpen(true);
  };

  const handleEdit = (tab: TabType, item: any) => {
    setActiveTab(tab);
    setModalMode("edit");
    setEditForm({ ...item });
    setModalOpen(true);
  };

  const handleDelete = async (tab: TabType, id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      await fetch(`${getEndpoint(tab)}/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err: any) {
      alert("Lỗi xóa: " + err.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const endpoint = getEndpoint(activeTab);
      const method = modalMode === "create" ? "POST" : "PUT";
      const url = modalMode === "create" ? endpoint : `${endpoint}/${editForm.id}`;
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert("Lỗi lưu: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ==================== TAB CONFIG ====================
  const tabs: { key: TabType; label: string; icon: any; count: number }[] = [
    { key: "properties", label: "Properties", icon: Home, count: data.properties.length },
    { key: "blogs", label: "Blogs", icon: FileText, count: data.blogs.length },
    { key: "locations", label: "Locations", icon: MapPin, count: data.locations.length },
    { key: "projects", label: "Projects", icon: Building, count: data.projects.length },
  ];

  // ==================== RENDER FORM FIELDS ====================
  const renderFormFields = () => {
    switch (activeTab) {
      case "properties":
        return (
          <>
            <FormInput label="Tên BĐS" value={editForm.name} onChange={(v: string) => setEditForm({ ...editForm, name: v })} required />
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Loại giao dịch" value={editForm.transaction_type} onChange={(v: string) => setEditForm({ ...editForm, transaction_type: v })} placeholder="sale / rent" />
              <FormInput label="Danh mục" value={editForm.property_category} onChange={(v: string) => setEditForm({ ...editForm, property_category: v })} placeholder="apartments / villas" />
            </div>
            <FormInput label="Giá hiển thị" value={editForm.price} onChange={(v: string) => setEditForm({ ...editForm, price: v })} placeholder="12 Tỷ" />
            <FormInput label="Giá (số)" value={editForm.price_num} onChange={(v: string) => setEditForm({ ...editForm, price_num: Number(v) })} type="number" />
            <FormInput label="Khu vực" value={editForm.location} onChange={(v: string) => setEditForm({ ...editForm, location: v })} />
            <div className="grid grid-cols-3 gap-3">
              <FormInput label="Diện tích" value={editForm.area} onChange={(v: string) => setEditForm({ ...editForm, area: v })} placeholder="150m2" />
              <FormInput label="Phòng ngủ" value={editForm.beds} onChange={(v: string) => setEditForm({ ...editForm, beds: Number(v) })} type="number" />
              <FormInput label="Phòng tắm" value={editForm.baths} onChange={(v: string) => setEditForm({ ...editForm, baths: Number(v) })} type="number" />
            </div>
            <FormInput label="Mô tả" value={editForm.description} onChange={(v: string) => setEditForm({ ...editForm, description: v })} />
            <FormInput label="Ảnh đại diện (URL)" value={editForm.img_url} onChange={(v: string) => setEditForm({ ...editForm, img_url: v })} />
            
            <div className="mt-6 mb-2 border-b border-white/10 pb-2"><h4 className="text-[#D4AF37] font-semibold text-sm">Đặc điểm Bất Động Sản</h4></div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Pháp lý" value={editForm.legal_status} onChange={(v: string) => setEditForm({ ...editForm, legal_status: v })} placeholder="Sổ đỏ / HĐMB" />
              <FormInput label="Nội thất" value={editForm.furniture} onChange={(v: string) => setEditForm({ ...editForm, furniture: v })} placeholder="Đầy đủ / Cơ bản" />
              <FormInput label="Hướng nhà" value={editForm.house_direction} onChange={(v: string) => setEditForm({ ...editForm, house_direction: v })} placeholder="Đông Nam" />
              <FormInput label="Hướng ban công" value={editForm.balcony_direction} onChange={(v: string) => setEditForm({ ...editForm, balcony_direction: v })} />
              <FormInput label="Số tầng" value={editForm.floors} onChange={(v: string) => setEditForm({ ...editForm, floors: Number(v) })} type="number" />
              <FormInput label="Mặt tiền (m)" value={editForm.frontage} onChange={(v: string) => setEditForm({ ...editForm, frontage: Number(v) })} type="number" />
              <FormInput label="Đường vào (m)" value={editForm.entrance_width} onChange={(v: string) => setEditForm({ ...editForm, entrance_width: Number(v) })} type="number" />
            </div>

            <div className="mt-4 mb-2 border-b border-white/10 pb-2"><h4 className="text-[#D4AF37] font-semibold text-sm">Thông tin Môi Giới</h4></div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Tên môi giới" value={editForm.agent_name} onChange={(v: string) => setEditForm({ ...editForm, agent_name: v })} />
              <FormInput label="Số điện thoại" value={editForm.agent_phone} onChange={(v: string) => setEditForm({ ...editForm, agent_phone: v })} />
              <FormInput label="Zalo liên hệ" value={editForm.agent_zalo} onChange={(v: string) => setEditForm({ ...editForm, agent_zalo: v })} />
              <FormInput label="Ảnh đại diện (URL)" value={editForm.agent_avatar} onChange={(v: string) => setEditForm({ ...editForm, agent_avatar: v })} />
            </div>

            <div className="mt-4 mb-2 border-b border-white/10 pb-2"><h4 className="text-[#D4AF37] font-semibold text-sm">Đa phương tiện (Media)</h4></div>
            <FormInput label="Link Video (Youtube/Vimeo)" value={editForm.video_url} onChange={(v: string) => setEditForm({ ...editForm, video_url: v })} />
            <FormInput label="Link 3D Tour / VR" value={editForm.tour_3d_url} onChange={(v: string) => setEditForm({ ...editForm, tour_3d_url: v })} />
            
            <div className="mt-4 mb-2 border-b border-white/10 pb-2"><h4 className="text-[#D4AF37] font-semibold text-sm">Bản Đồ (Tọa độ)</h4></div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Vĩ độ (Lat)" value={editForm.lat} onChange={(v: string) => setEditForm({ ...editForm, lat: Number(v) })} type="number" />
              <FormInput label="Kinh độ (Lng)" value={editForm.lng} onChange={(v: string) => setEditForm({ ...editForm, lng: Number(v) })} type="number" />
            </div>
          </>
        );
      case "blogs":
        return (
          <>
            <FormInput label="Tiêu đề" value={editForm.title} onChange={(v: string) => setEditForm({ ...editForm, title: v })} required />
            <FormInput label="Slug" value={editForm.slug} onChange={(v: string) => setEditForm({ ...editForm, slug: v })} required placeholder="url-friendly-slug" />
            <FormInput label="Ngày" value={editForm.date} onChange={(v: string) => setEditForm({ ...editForm, date: v })} type="date" />
            <FormInput label="Mô tả ngắn" value={editForm.description} onChange={(v: string) => setEditForm({ ...editForm, description: v })} />
            <FormInput label="Ảnh đại diện (URL)" value={editForm.img_url} onChange={(v: string) => setEditForm({ ...editForm, img_url: v })} />
          </>
        );
      case "locations":
        return (
          <>
            <FormInput label="Tên khu vực" value={editForm.name} onChange={(v: string) => setEditForm({ ...editForm, name: v })} required />
            <FormInput label="Slug" value={editForm.slug} onChange={(v: string) => setEditForm({ ...editForm, slug: v })} required />
            <FormInput label="Ảnh Hero (URL)" value={editForm.hero_image} onChange={(v: string) => setEditForm({ ...editForm, hero_image: v })} />
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Vĩ độ (lat)" value={editForm.lat} onChange={(v: string) => setEditForm({ ...editForm, lat: Number(v) })} type="number" />
              <FormInput label="Kinh độ (lng)" value={editForm.lng} onChange={(v: string) => setEditForm({ ...editForm, lng: Number(v) })} type="number" />
            </div>
          </>
        );
      case "projects":
        return (
          <>
            <FormInput label="Tên dự án" value={editForm.name} onChange={(v: string) => setEditForm({ ...editForm, name: v })} required />
            <FormInput label="Slug" value={editForm.slug} onChange={(v: string) => setEditForm({ ...editForm, slug: v })} required />
            <FormInput label="Tiêu đề Hero" value={editForm.hero_title} onChange={(v: string) => setEditForm({ ...editForm, hero_title: v })} />
            <FormInput label="Mô tả Hero" value={editForm.hero_desc} onChange={(v: string) => setEditForm({ ...editForm, hero_desc: v })} />
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Vĩ độ (lat)" value={editForm.lat} onChange={(v: string) => setEditForm({ ...editForm, lat: Number(v) })} type="number" />
              <FormInput label="Kinh độ (lng)" value={editForm.lng} onChange={(v: string) => setEditForm({ ...editForm, lng: Number(v) })} type="number" />
            </div>
          </>
        );
    }
  };

  // ==================== RENDER TABLE ====================
  const renderTable = () => {
    switch (activeTab) {
      case "properties":
        return (
          <table className="w-full text-left text-sm">
            <thead className="text-white/40 border-b border-white/5 uppercase text-xs">
              <tr><th className="pb-3">Tên BĐS</th><th className="pb-3">Khu Vực</th><th className="pb-3">Giá</th><th className="pb-3">Loại</th><th className="pb-3 w-24">Thao Tác</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.properties.map((p: PropertyModel) => (
                <tr key={p.id} className="hover:bg-white/5 group">
                  <td className="py-3 text-white font-medium">{p.name}</td>
                  <td className="py-3 text-white/70">{p.location || '—'}</td>
                  <td className="py-3 text-[#D4AF37]">{p.price || '—'}</td>
                  <td className="py-3 text-white/50 text-xs">{p.transaction_type}</td>
                  <td className="py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit("properties", p)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-[#D4AF37]"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete("properties", p.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/50 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "blogs":
        return (
          <table className="w-full text-left text-sm">
            <thead className="text-white/40 border-b border-white/5 uppercase text-xs">
              <tr><th className="pb-3">Tiêu Đề</th><th className="pb-3">Slug</th><th className="pb-3 w-24">Thao Tác</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.blogs.map((b: BlogModel) => (
                <tr key={b.id} className="hover:bg-white/5 group">
                  <td className="py-3 text-white font-medium">{b.title}</td>
                  <td className="py-3 text-white/50 font-mono text-xs">{b.slug}</td>
                  <td className="py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit("blogs", b)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-[#D4AF37]"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete("blogs", b.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/50 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "locations":
        return (
          <table className="w-full text-left text-sm">
            <thead className="text-white/40 border-b border-white/5 uppercase text-xs">
              <tr><th className="pb-3">Tên Khu Vực</th><th className="pb-3">Slug</th><th className="pb-3 w-24">Thao Tác</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.locations.map((l: LocationModel) => (
                <tr key={l.id} className="hover:bg-white/5 group">
                  <td className="py-3 text-white font-medium">{l.name}</td>
                  <td className="py-3 text-white/50 font-mono text-xs">{l.slug}</td>
                  <td className="py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit("locations", l)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-[#D4AF37]"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete("locations", l.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/50 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "projects":
        return (
          <table className="w-full text-left text-sm">
            <thead className="text-white/40 border-b border-white/5 uppercase text-xs">
              <tr><th className="pb-3">Tên Dự Án</th><th className="pb-3">Slug</th><th className="pb-3 w-24">Thao Tác</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.projects.map((p: ProjectModel) => (
                <tr key={p.id} className="hover:bg-white/5 group">
                  <td className="py-3 text-white font-medium">{p.name}</td>
                  <td className="py-3 text-white/50 font-mono text-xs">{p.slug}</td>
                  <td className="py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit("projects", p)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-[#D4AF37]"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete("projects", p.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/50 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 overflow-y-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản Lý Dữ Liệu (CMS)</h1>
          <p className="text-white/50 text-sm">Thêm · Sửa · Xóa trực tiếp trên Neon PostgreSQL qua NestJS API</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="bg-white/5 text-white/70 hover:text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-white/10 hover:border-white/20 transition-colors">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={() => handleCreate(activeTab)} className="bg-[#D4AF37] text-black font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:scale-105 transition-transform">
            <Plus size={16} /> Thêm Mới
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-4">
          <AlertTriangle size={32} />
          <div>
            <h3 className="font-bold text-lg mb-1">Mất Kết Nối NestJS Server</h3>
            <p className="text-sm opacity-80">{error}. Vui lòng chạy lệnh <code>npm run start:dev</code> ở thư mục backend.</p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <RefreshCw size={48} className="text-white/20 animate-spin mb-4" />
          <p className="text-white/50">Đang tải dữ liệu từ Neon PostgreSQL...</p>
        </div>
      ) : (
        <>
          {/* STAT CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`bg-[#111] border rounded-2xl p-5 relative overflow-hidden text-left transition-all ${activeTab === tab.key ? 'border-[#D4AF37]/50 ring-1 ring-[#D4AF37]/20' : 'border-white/5 hover:border-white/10'}`}
              >
                <tab.icon className="text-[#D4AF37]/20 absolute -right-3 -bottom-3" size={64} />
                <h4 className="text-white/50 mb-1 font-medium text-sm">{tab.label}</h4>
                <p className="text-3xl font-bold text-white">{tab.count}</p>
                <div className="mt-3 text-xs text-green-400 flex items-center gap-1"><CheckCircle2 size={12}/> Online</div>
              </button>
            ))}
          </div>

          {/* DATA TABLE */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex-1">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Database className="text-[#D4AF37]" size={24} />
              Bảng {tabs.find(t => t.key === activeTab)?.label}
              <span className="text-white/30 font-normal text-sm ml-auto">{tabs.find(t => t.key === activeTab)?.count} bản ghi</span>
            </h3>
            <div className="overflow-x-auto">
              {renderTable()}
              {data[activeTab].length === 0 && (
                <div className="text-center py-16 text-white/30">
                  <Database size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Chưa có dữ liệu. Nhấn <b className="text-[#D4AF37]">Thêm Mới</b> để bắt đầu.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* CRUD MODAL */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`${modalMode === "create" ? "Thêm" : "Sửa"} ${tabs.find(t => t.key === activeTab)?.label}`}>
        {renderFormFields()}
        <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
          <button onClick={() => setModalOpen(false)} className="flex-1 bg-white/5 text-white/70 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors">Hủy</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#D4AF37] text-black font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50">
            <Save size={16} /> {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
