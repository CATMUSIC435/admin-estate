"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FileText, RefreshCw, Plus, Pencil, Trash2, X, Save, AlertTriangle, ExternalLink } from "lucide-react";
import { useToast } from "../../components/ui/Toast";

const API_URL = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:3001";
const GQL_URL = process.env.NEXT_PUBLIC_NEST_GRAPHQL_URL || "http://localhost:3001/graphql";

// ==================== MODAL COMPONENT ====================
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
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
function FormInput({ label, value, onChange, type = "text", placeholder = "", required = false, isTextarea = false }: any) {
  return (
    <div className="mb-4">
      <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {isTextarea ? (
        <textarea
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={5}
          className="w-full bg-black/50 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
        />
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-black/50 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
        />
      )}
    </div>
  );
}

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = `query {
        blogs { id title slug description img_url date content author }
      }`;
      const response = await fetch(GQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        cache: "no-store"
      });
      if (!response.ok) throw new Error("Không thể kết nối NestJS Backend");
      const json = await response.json();
      if (json.errors) throw new Error(json.errors[0].message);
      setBlogs(json.data.blogs || []);
    } catch (err: any) {
      setError(err.message || "Lỗi tải GraphQL");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = () => {
    setModalMode("create");
    setEditForm({
        date: new Date().toISOString().split('T')[0]
    });
    setModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setModalMode("edit");
    setEditForm({ ...item });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    try {
      await fetch(`${API_URL}/api/blogs/${id}`, { method: "DELETE" });
      toast("Đã xóa bài viết", "success");
      fetchData();
    } catch (err: any) {
      toast("Lỗi xóa: " + err.message, "error");
    }
  };

  const handleSave = async () => {
    if (!editForm.title || !editForm.slug) {
        toast("Vui lòng điền các trường bắt buộc (Tiêu đề, Slug).", "error");
        return;
    }
    setSaving(true);
    try {
      const method = modalMode === "create" ? "POST" : "PUT";
      const url = modalMode === "create" ? `${API_URL}/api/blogs` : `${API_URL}/api/blogs/${editForm.id}`;
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setModalOpen(false);
      toast(modalMode === "create" ? "Tạo bài viết thành công" : "Cập nhật thành công", "success");
      fetchData();
    } catch (err: any) {
      toast("Lỗi lưu: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 overflow-y-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản Lý Blog</h1>
          <p className="text-white/50 text-sm">Viết & Chỉnh sửa Nội dung Tin tức chuẩn SEO (CMS Nội bộ)</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="bg-white/5 text-white/70 hover:text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-white/10 transition-colors">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Tải Lại
          </button>
          <button onClick={handleCreate} className="bg-[#D4AF37] text-black font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:scale-105 transition-transform">
            <Plus size={16} /> Viết Bài Mới
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-4">
          <AlertTriangle size={32} />
          <div>
            <h3 className="font-bold text-lg mb-1">Mất Kết Nối NestJS Server</h3>
            <p className="text-sm opacity-80">{error}. Vui lòng kiểm tra server backend đang chạy ở cổng 3001.</p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <RefreshCw size={48} className="text-white/20 animate-spin mb-4" />
          <p className="text-white/50">Đang tải danh sách bài viết...</p>
        </div>
      ) : (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex-1">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <FileText className="text-[#D4AF37]" size={24} />
            Danh Sách Bài Viết
            <span className="text-white/30 font-normal text-sm ml-auto">{blogs.length} bài</span>
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-white/40 border-b border-white/5 uppercase text-xs">
                <tr>
                    <th className="pb-3 pl-2">Tiêu Đề</th>
                    <th className="pb-3">URL (Slug)</th>
                    <th className="pb-3">Ngày Đăng</th>
                    <th className="pb-3 w-24 text-right pr-4">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {blogs.map((b: any) => (
                  <tr key={b.id} className="hover:bg-white/5 group">
                    <td className="py-3 pl-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/50 border border-white/10 shrink-0">
                                {b.img_url ? (
                                    <img src={b.img_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <FileText className="w-5 h-5 m-auto mt-2.5 text-white/20" />
                                )}
                            </div>
                            <div>
                                <p className="text-white font-medium line-clamp-1">{b.title}</p>
                                <p className="text-white/40 text-[10px] uppercase">{b.author || 'G-Estate Admin'}</p>
                            </div>
                        </div>
                    </td>
                    <td className="py-3 text-white/50 font-mono text-xs">{b.slug}</td>
                    <td className="py-3 text-white/60">{b.date || '---'}</td>
                    <td className="py-3 pr-2">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`/vi/blog/${b.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-[#D4AF37]" title="Xem thử">
                            <ExternalLink size={16} />
                        </a>
                        <button onClick={() => handleEdit(b)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-blue-400" title="Chỉnh sửa">
                            <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(b.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/50 hover:text-red-400" title="Xóa">
                            <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {blogs.length === 0 && (
              <div className="text-center py-16 text-white/30">
                <FileText size={48} className="mx-auto mb-4 opacity-30" />
                <p>Chưa có bài viết nào. Nhấn <b className="text-[#D4AF37]">Viết Bài Mới</b> để bắt đầu.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CRUD MODAL */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === "create" ? "Viết Bài Mới" : "Chỉnh Sửa Bài Viết"}>
        <FormInput label="Tiêu đề bài viết" value={editForm.title} onChange={(v: string) => setEditForm({ ...editForm, title: v })} required placeholder="Nhập tiêu đề..." />
        <div className="grid grid-cols-2 gap-3">
            <FormInput label="Đường dẫn (Slug)" value={editForm.slug} onChange={(v: string) => setEditForm({ ...editForm, slug: v })} required placeholder="url-friendly-slug" />
            <FormInput label="Ngày đăng" value={editForm.date} onChange={(v: string) => setEditForm({ ...editForm, date: v })} type="date" />
        </div>
        <div className="grid grid-cols-2 gap-3">
            <FormInput label="Tác giả" value={editForm.author} onChange={(v: string) => setEditForm({ ...editForm, author: v })} placeholder="G-Estate Admin" />
            <FormInput label="Ảnh Thumbnail (URL)" value={editForm.img_url} onChange={(v: string) => setEditForm({ ...editForm, img_url: v })} placeholder="https://..." />
        </div>
        <FormInput label="Mô tả ngắn (Description - Chuẩn SEO)" value={editForm.description} onChange={(v: string) => setEditForm({ ...editForm, description: v })} isTextarea placeholder="Viết một đoạn tóm tắt bài viết..." />
        <FormInput label="Nội dung bài viết (Content HTML/Markdown)" value={editForm.content} onChange={(v: string) => setEditForm({ ...editForm, content: v })} isTextarea placeholder="Nhập nội dung bài viết..." />
        
        <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
          <button onClick={() => setModalOpen(false)} className="flex-1 bg-white/5 text-white/70 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors">Hủy</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#D4AF37] text-black font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50">
            <Save size={16} /> {saving ? "Đang lưu..." : "Lưu Bài Viết"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
