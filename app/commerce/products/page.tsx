"use client";
import React, { useState, useEffect } from "react";
import { Package, RefreshCw, ExternalLink, Search, Tag, Plus } from "lucide-react";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000";
const MEDUSA_ADMIN_URL = process.env.NEXT_PUBLIC_MEDUSA_ADMIN_URL || "https://admin-shop.alizedanang.net";
const MEDUSA_API_URL = "/api/medusa";

interface Product {
  id: string;
  title: string;
  handle: string;
  status: string;
  description: string | null;
  variants: { id: string; title: string; prices: { amount: number; currency_code: string }[] }[];
  categories: { id: string; name: string }[];
  created_at: string;
}

const STATUS_COLOR: Record<string, string> = {
  published: "text-green-400 bg-green-400/10 border-green-400/30",
  draft: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  rejected: "text-red-400 bg-red-400/10 border-red-400/30",
};

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);

  const getToken = async () => {
    if (authToken) return authToken;
    const res = await fetch(`${MEDUSA_API_URL}/auth/user/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@alize-danang.com", password: "AlizeDaNang2026!" }),
    });
    const data = await res.json();
    setAuthToken(data.token);
    return data.token;
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch(`${MEDUSA_API_URL}/admin/products?limit=100&fields=*variants,*categories,*variants.prices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Lỗi kết nối Medusa. Hãy chạy: npx medusa develop");
      const { products: data } = await res.json();
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Sản Phẩm & Gói Dịch Vụ</h1>
          <p className="text-white/50 text-sm">Nội thất · Trang trí · Gói tư vấn · Dịch vụ sửa chữa</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchProducts} className="bg-white/5 text-white/70 hover:text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-white/10">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <a
            href={`${MEDUSA_ADMIN_URL}/products/create`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#D4AF37] text-black font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus size={16} /> Thêm Sản Phẩm
          </a>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 flex items-center gap-2 mb-6 max-w-md">
        <Search size={16} className="text-white/40" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="bg-transparent outline-none text-sm text-white flex-1"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-2xl mb-6 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Notice to use Medusa Admin for full management */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 text-sm">
        <ExternalLink size={16} className="text-blue-400 flex-shrink-0" />
        <span className="text-white/60">
          Để quản lý sản phẩm đầy đủ (ảnh, inventory, pricing), dùng{" "}
          <a href={`${MEDUSA_ADMIN_URL}/products`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            Medusa Admin Panel
          </a>
        </span>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-3 w-3/4" />
              <div className="h-3 bg-white/5 rounded mb-2 w-full" />
              <div className="h-3 bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(product => {
            const lowestPrice = product.variants
              ?.flatMap(v => v.prices || [])
              .filter(p => p.currency_code === "vnd")
              .map(p => p.amount)
              .sort((a, b) => a - b)[0];

            return (
              <div key={product.id} className="bg-[#111] border border-white/5 hover:border-[#D4AF37]/30 rounded-2xl p-5 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-semibold text-sm leading-tight flex-1 mr-2">
                    {product.title}
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_COLOR[product.status] || STATUS_COLOR.draft}`}>
                    {product.status === "published" ? "Đang bán" : "Nháp"}
                  </span>
                </div>

                {product.description && (
                  <p className="text-white/40 text-xs mb-3 line-clamp-2">{product.description}</p>
                )}

                {/* Categories */}
                {product.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.categories.map(cat => (
                      <span key={cat.id} className="text-[10px] bg-white/5 text-white/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Tag size={8} />{cat.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Variants & Price */}
                <div className="border-t border-white/5 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-xs">
                      {product.variants?.length || 0} biến thể
                    </span>
                    {lowestPrice && (
                      <span className="text-[#D4AF37] font-semibold text-sm">
                        {formatPrice(lowestPrice)}
                      </span>
                    )}
                  </div>
                  {product.variants?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {product.variants.slice(0, 3).map(v => (
                        <span key={v.id} className="text-[10px] bg-white/5 text-white/50 px-2 py-0.5 rounded">
                          {v.title}
                        </span>
                      ))}
                      {product.variants.length > 3 && (
                        <span className="text-[10px] text-white/30">+{product.variants.length - 3} nữa</span>
                      )}
                    </div>
                  )}
                </div>

                <a
                  href={`${MEDUSA_ADMIN_URL}/products/${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-[#D4AF37]/50 text-xs transition-all opacity-0 group-hover:opacity-100"
                >
                  <ExternalLink size={12} /> Chỉnh sửa trong Medusa
                </a>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && !error && (
        <div className="text-center py-20 text-white/30">
          <Package size={48} className="mx-auto mb-4 opacity-20" />
          <p className="mb-2">Chưa có sản phẩm nào</p>
          <p className="text-xs">Chạy seed script hoặc thêm sản phẩm từ Medusa Admin</p>
          <a href={`${MEDUSA_ADMIN_URL}/products/create`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-[#D4AF37] text-sm hover:underline">
            <Plus size={14} /> Thêm sản phẩm đầu tiên
          </a>
        </div>
      )}
    </div>
  );
}
