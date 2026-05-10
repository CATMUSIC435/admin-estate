"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Building, Pencil, Trash2, Save, AlertTriangle } from "lucide-react";
import { ProjectModel } from "../../../types";
import { PageHeader } from "../../../components/ui/PageHeader";
import { DataTable } from "../../../components/ui/DataTable";
import { Modal } from "../../../components/ui/Modal";
import { FormInput } from "../../../components/ui/Input";
import { useToast } from "../../../components/ui/Toast";

const API_URL = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:3001";
const GQL_URL = process.env.NEXT_PUBLIC_NEST_GRAPHQL_URL || "http://localhost:3001/graphql";

export default function ProjectsPage() {
  const [data, setData] = useState<ProjectModel[]>([]);
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
      const query = `query { projects { id name slug } }`;
      const response = await fetch(GQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        cache: "no-store"
      });
      if (!response.ok) throw new Error("Chưa bật NestJS Server ở Port 3001");
      const json = await response.json();
      if (json.errors) throw new Error(json.errors[0].message);
      setData(json.data.projects || []);
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

  const handleEdit = (item: ProjectModel) => {
    setModalMode("edit");
    setEditForm({ ...item });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      await fetch(`${API_URL}/api/projects/${id}`, { method: "DELETE" });
      toast("Đã xóa Dự án", "success");
      fetchData();
    } catch (err: any) {
      toast("Lỗi xóa: " + err.message, "error");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = modalMode === "create" ? "POST" : "PUT";
      const url = modalMode === "create" ? `${API_URL}/api/projects` : `${API_URL}/api/projects/${editForm.id}`;
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setModalOpen(false);
      toast(modalMode === "create" ? "Thêm dự án thành công" : "Cập nhật thành công", "success");
      fetchData();
    } catch (err: any) {
      toast("Lỗi lưu: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: "Tên Dự Án", render: (p: ProjectModel) => <span className="text-white font-medium">{p.name}</span> },
    { header: "Slug", render: (p: ProjectModel) => <span className="text-white/50 font-mono text-xs">{p.slug}</span> },
    { 
      header: "Thao Tác", 
      className: "text-right w-24",
      render: (p: ProjectModel) => (
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
        title="Quản Lý Dự Án" 
        description="Thêm, sửa, xóa các Dự án Bất Động Sản (Vincom, Sun Group...)" 
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
        <DataTable data={data} columns={columns} keyExtractor={(p) => p.id} emptyIcon={Building} />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === "create" ? "Thêm Dự Án" : "Sửa Dự Án"}>
        <FormInput label="Tên dự án" value={editForm.name} onChange={(v) => setEditForm({ ...editForm, name: v })} required />
        <FormInput label="Slug" value={editForm.slug} onChange={(v) => setEditForm({ ...editForm, slug: v })} required />
        <FormInput label="Tiêu đề Hero" value={editForm.hero_title} onChange={(v) => setEditForm({ ...editForm, hero_title: v })} />
        <FormInput label="Mô tả Hero" value={editForm.hero_desc} onChange={(v) => setEditForm({ ...editForm, hero_desc: v })} isTextarea />
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
