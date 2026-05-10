"use client";
import React, { useState, useEffect, useCallback } from "react";
import { MapPin, Pencil, Trash2, Save, AlertTriangle } from "lucide-react";
import { LocationModel } from "../../../types";
import { PageHeader } from "../../../components/ui/PageHeader";
import { DataTable } from "../../../components/ui/DataTable";
import { Modal } from "../../../components/ui/Modal";
import { FormInput } from "../../../components/ui/Input";
import { useToast } from "../../../components/ui/Toast";

const API_URL = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:3001";
const GQL_URL = process.env.NEXT_PUBLIC_NEST_GRAPHQL_URL || "http://localhost:3001/graphql";

export default function LocationsPage() {
  const [data, setData] = useState<LocationModel[]>([]);
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
      const query = `query { locations { id name slug } }`;
      const response = await fetch(GQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        cache: "no-store"
      });
      if (!response.ok) throw new Error("Chưa bật NestJS Server ở Port 3001");
      const json = await response.json();
      if (json.errors) throw new Error(json.errors[0].message);
      setData(json.data.locations || []);
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

  const handleEdit = (item: LocationModel) => {
    setModalMode("edit");
    setEditForm({ ...item });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      await fetch(`${API_URL}/api/locations/${id}`, { method: "DELETE" });
      toast("Đã xóa Khu vực", "success");
      fetchData();
    } catch (err: any) {
      toast("Lỗi xóa: " + err.message, "error");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = modalMode === "create" ? "POST" : "PUT";
      const url = modalMode === "create" ? `${API_URL}/api/locations` : `${API_URL}/api/locations/${editForm.id}`;
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setModalOpen(false);
      toast(modalMode === "create" ? "Thêm khu vực thành công" : "Cập nhật thành công", "success");
      fetchData();
    } catch (err: any) {
      toast("Lỗi lưu: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: "Tên Khu Vực", render: (l: LocationModel) => <span className="text-white font-medium">{l.name}</span> },
    { header: "Slug", render: (l: LocationModel) => <span className="text-white/50 font-mono text-xs">{l.slug}</span> },
    { 
      header: "Thao Tác", 
      className: "text-right w-24",
      render: (l: LocationModel) => (
        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => handleEdit(l)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-[#D4AF37]"><Pencil size={14} /></button>
          <button onClick={() => handleDelete(l.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/50 hover:text-red-400"><Trash2 size={14} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="h-full flex flex-col p-4 md:p-8 overflow-y-auto">
      <PageHeader 
        title="Quản Lý Khu Vực" 
        description="Thêm, sửa, xóa các Quận/Huyện hoặc Khu vực" 
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
        <DataTable data={data} columns={columns} keyExtractor={(l) => l.id} emptyIcon={MapPin} />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === "create" ? "Thêm Khu Vực" : "Sửa Khu Vực"}>
        <FormInput label="Tên khu vực" value={editForm.name} onChange={(v) => setEditForm({ ...editForm, name: v })} required />
        <FormInput label="Slug" value={editForm.slug} onChange={(v) => setEditForm({ ...editForm, slug: v })} required />
        <FormInput label="Ảnh Hero (URL)" value={editForm.hero_image} onChange={(v) => setEditForm({ ...editForm, hero_image: v })} />
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="Vĩ độ (lat)" value={editForm.lat} onChange={(v) => setEditForm({ ...editForm, lat: Number(v) })} type="number" />
          <FormInput label="Kinh độ (lng)" value={editForm.lng} onChange={(v) => setEditForm({ ...editForm, lng: Number(v) })} type="number" />
        </div>
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
