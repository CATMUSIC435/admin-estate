"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Home, Pencil, Trash2, Save, AlertTriangle } from "lucide-react";
import { PropertyModel } from "../../../types";
import { PageHeader } from "../../../components/ui/PageHeader";
import { DataTable } from "../../../components/ui/DataTable";
import { Modal } from "../../../components/ui/Modal";
import { FormInput } from "../../../components/ui/Input";
import { useToast } from "../../../components/ui/Toast";

const API_URL = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:3001";
const GQL_URL = process.env.NEXT_PUBLIC_NEST_GRAPHQL_URL || "http://localhost:3001/graphql";

export default function PropertiesPage() {
  const [data, setData] = useState<PropertyModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = `query { properties { id name location transaction_type price } }`;
      const response = await fetch(GQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        cache: "no-store"
      });
      if (!response.ok) throw new Error("Chưa bật NestJS Server ở Port 3001");
      const json = await response.json();
      if (json.errors) throw new Error(json.errors[0].message);
      setData(json.data.properties || []);
    } catch (err: any) {
      setError(err.message || "Lỗi tải GraphQL");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = () => {
    setModalMode("create");
    setEditForm({});
    setModalOpen(true);
  };

  const handleEdit = (item: PropertyModel) => {
    setModalMode("edit");
    setEditForm({ ...item });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      await fetch(`${API_URL}/api/properties/${id}`, { method: "DELETE" });
      toast("Đã xóa Bất động sản", "success");
      fetchData();
    } catch (err: any) {
      toast("Lỗi xóa: " + err.message, "error");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = modalMode === "create" ? "POST" : "PUT";
      const url = modalMode === "create" ? `${API_URL}/api/properties` : `${API_URL}/api/properties/${editForm.id}`;
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setModalOpen(false);
      toast(modalMode === "create" ? "Thêm mới thành công" : "Cập nhật thành công", "success");
      fetchData();
    } catch (err: any) {
      toast("Lỗi lưu: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: "Tên BĐS", render: (p: PropertyModel) => <span className="text-white font-medium">{p.name}</span> },
    { header: "Khu Vực", render: (p: PropertyModel) => <span className="text-white/70">{p.location || '—'}</span> },
    { header: "Giá", render: (p: PropertyModel) => <span className="text-[#D4AF37] font-semibold">{p.price || '—'}</span> },
    { header: "Loại Giao Dịch", render: (p: PropertyModel) => <span className="text-white/50 text-xs">{p.transaction_type}</span> },
    { 
      header: "Thao Tác", 
      className: "text-right w-24",
      render: (p: PropertyModel) => (
        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => handleEdit(p)} className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-[#D4AF37]"><Pencil size={20} /></button>
          <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-white/50 hover:text-red-400"><Trash2 size={20} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="h-full flex flex-col p-4 md:p-8 overflow-y-auto">
      <PageHeader 
        title="Quản Lý Sản Phẩm BĐS" 
        description="Quản lý danh sách Căn hộ, Biệt thự, Đất nền..." 
        onRefresh={fetchData}
        isLoading={loading}
        onCreate={handleCreate}
      />

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-4">
          <AlertTriangle size={32} />
          <div>
            <h3 className="font-bold text-lg mb-1">Mất Kết Nối NestJS Server</h3>
            <p className="text-sm opacity-80">{error}.</p>
          </div>
        </div>
      ) : (
        <DataTable data={data} columns={columns} keyExtractor={(p) => p.id} emptyIcon={Home} />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === "create" ? "Thêm BĐS Mới" : "Sửa Thông Tin BĐS"} maxWidth="2xl">
        <FormInput label="Tên BĐS" value={editForm.name} onChange={(v) => setEditForm({ ...editForm, name: v })} required />
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="Loại giao dịch" value={editForm.transaction_type} onChange={(v) => setEditForm({ ...editForm, transaction_type: v })} placeholder="sale / rent" />
          <FormInput label="Danh mục" value={editForm.property_category} onChange={(v) => setEditForm({ ...editForm, property_category: v })} placeholder="apartments / villas" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="Giá hiển thị" value={editForm.price} onChange={(v) => setEditForm({ ...editForm, price: v })} placeholder="12 Tỷ" />
          <FormInput label="Giá (số)" value={editForm.price_num} onChange={(v) => setEditForm({ ...editForm, price_num: Number(v) })} type="number" />
        </div>
        <FormInput label="Khu vực" value={editForm.location} onChange={(v) => setEditForm({ ...editForm, location: v })} />
        <div className="grid grid-cols-3 gap-3">
          <FormInput label="Diện tích" value={editForm.area} onChange={(v) => setEditForm({ ...editForm, area: v })} placeholder="150m2" />
          <FormInput label="Phòng ngủ" value={editForm.beds} onChange={(v) => setEditForm({ ...editForm, beds: Number(v) })} type="number" />
          <FormInput label="Phòng tắm" value={editForm.baths} onChange={(v) => setEditForm({ ...editForm, baths: Number(v) })} type="number" />
        </div>
        <FormInput label="Mô tả" value={editForm.description} onChange={(v) => setEditForm({ ...editForm, description: v })} isTextarea />
        {editForm.description && (
          <div className="mt-2 mb-4 p-3 bg-black/50 border border-white/10 rounded-lg max-h-40 overflow-y-auto">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-semibold">Xem trước nội dung HTML:</p>
            <div className="text-sm text-white/70 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: editForm.description }} />
          </div>
        )}
        <FormInput label="Ảnh đại diện (URL)" value={editForm.img_url} onChange={(v) => setEditForm({ ...editForm, img_url: v })} />
        
        <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
          <button onClick={() => setModalOpen(false)} className="flex-1 bg-white/5 text-white/70 py-2.5 rounded-lg text-sm hover:bg-white/10">Hủy</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#D4AF37] text-black font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={16} /> {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
