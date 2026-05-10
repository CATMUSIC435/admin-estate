"use client";
import React from "react";

interface FormInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  isTextarea?: boolean;
  className?: string;
}

export function FormInput({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  placeholder = "", 
  required = false, 
  isTextarea = false,
  className = ""
}: FormInputProps) {
  return (
    <div className={`mb-4 ${className}`}>
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
