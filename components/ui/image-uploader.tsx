"use client";

import React, { useRef, useState } from "react";
import { ImagePlus, Loader2, X, UploadCloud } from "lucide-react";
import { uploadImage } from "@/lib/storage";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  label?: string;
  validateFile?: (file: File) => Promise<boolean>;
}

export function ImageUploader({ value, onChange, disabled, label = "Upload Gambar", validateFile }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");
    setIsUploading(true);

    if (validateFile) {
      try {
        const isValid = await validateFile(file);
        if (!isValid) {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
      } catch (err: any) {
        setErrorMsg(err.message || "File tidak valid.");
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }

    try {
      const url = await uploadImage(file, value);
      onChange(url);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengunggah gambar.");
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-stone-200 aspect-[21/9] bg-stone-50 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={value} 
            alt="Uploaded image" 
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={disabled || isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-stone-900 px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-2"
            >
              <ImagePlus className="w-4 h-4" />
              Ganti
            </button>
            <button
              type="button"
              disabled={disabled || isUploading}
              onClick={handleRemove}
              className="bg-rose-500 text-white p-2 rounded-xl text-sm font-bold shadow-md hover:scale-105 hover:bg-rose-600 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="w-full relative flex flex-col items-center justify-center py-10 px-6 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100 hover:border-indigo-400 transition-colors group cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
        >
          {isUploading ? (
            <div className="flex flex-col items-center text-indigo-600">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <span className="text-sm font-bold">Mengunggah...</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-stone-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <span className="text-sm font-bold text-stone-700 mb-1">{label}</span>
              <span className="text-xs font-medium text-stone-500">
                Klik atau seret file ke sini (JPG, PNG, WEBP max 2MB)
              </span>
            </>
          )}
        </button>
      )}

      {errorMsg && (
        <p className="text-xs font-bold text-rose-500 bg-rose-50 p-2 rounded-lg inline-block">
          {errorMsg}
        </p>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />
    </div>
  );
}
