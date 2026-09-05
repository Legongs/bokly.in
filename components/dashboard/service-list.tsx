"use client";

import React, { useState } from "react";
import { Trash2, Edit3, Clock, DollarSign, PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Service } from "@/types/database.types";
import { ServiceForm } from "./service-form";
import { deleteService } from "@/lib/actions/service.actions";
import type { BusinessDictionary } from "@/lib/business-dictionary";

function formatCurrency(amount: number) {
 return new Intl.NumberFormat("id-ID", {
 style: "currency",
 currency: "IDR",
 minimumFractionDigits: 0,
 }).format(amount);
}

interface ServiceListProps {
 services: Service[];
 dictionary: BusinessDictionary;
}

export function ServiceList({ services, dictionary }: ServiceListProps) {
 const [editingService, setEditingService] = useState<Service | null>(null);
 const [isAdding, setIsAdding] = useState(false);
 const [deletingId, setDeletingId] = useState<string | null>(null);

 const handleDelete = async (id: string) => {
 if (!confirm("Beneran mau hapus layanan ini?")) return;
 setDeletingId(id);
 await deleteService(id);
 setDeletingId(null);
 };

 return (
 <div className="space-y-6">
 {/* Tombol Tambah */}
 {!isAdding && !editingService && (
 <div className="flex justify-end">
 <Button 
 onClick={() => setIsAdding(true)} 
 className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 h-11 shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all"
 >
 <PlusCircle className="w-5 h-5 mr-2" />
 Tambah {dictionary.serviceLabel} Baru
 </Button>
 </div>
 )}

 {/* Form Area */}
 {isAdding && (
 <ServiceForm 
 onSuccess={() => setIsAdding(false)} 
 onCancel={() => setIsAdding(false)} 
 dictionary={dictionary}
 />
 )}
 
 {editingService && (
 <ServiceForm 
 initialData={editingService} 
 onSuccess={() => setEditingService(null)} 
 onCancel={() => setEditingService(null)} 
 dictionary={dictionary}
 />
 )}

 {/* List Layanan */}
 {!isAdding && !editingService && (
 <>
 {services.length === 0 ? (
 <div className="py-12 px-6 rounded-[2rem] border border-stone-100 bg-stone-50/50 text-center shadow-sm">
 <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-stone-100 rotate-3 transition-transform hover:rotate-0">
 <Clock className="w-8 h-8 text-stone-300" />
 </div>
 <h3 className="text-lg font-bold text-stone-800 mb-1">{dictionary.emptyStateTitle}</h3>
 <p className="text-sm text-stone-500 max-w-xs mx-auto">
 {dictionary.emptyStateDesc}
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 {services.map((svc) => (
 <Card key={svc.id} className="rounded-[1.5rem] border-none shadow-md shadow-stone-200/50 overflow-hidden group bg-white p-0 sm:p-0">
 <CardContent className="p-0">
 <div className="p-4 border-b border-stone-100 ">
 <h3 className="font-bold text-stone-900 line-clamp-1">{svc.name}</h3>
 <div className="flex items-center gap-3 mt-2 text-xs font-medium text-stone-500">
 <span className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-md">
 <Clock className="w-3.5 h-3.5" />
 {svc.duration_minutes} Menit
 </span>
 <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
 <span className="text-xs font-extrabold mr-0.5">Rp</span>
 {formatCurrency(svc.price).replace("Rp", "").trim()}
 </span>
 </div>
 </div>
 <div className="px-4 py-3 bg-stone-50 flex items-center justify-between text-xs">
 <div>
 <span className="text-stone-400 block mb-0.5">Wajib Bayar DP</span>
 <span className="font-bold text-stone-700 ">
 {svc.dp_amount > 0 ? formatCurrency(svc.dp_amount) : "Gratis / Bayar Nanti"}
 </span>
 </div>
 <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
 <Button
 variant="outline"
 size="icon"
 className="w-9 h-9 rounded-full border-none shadow-sm hover:bg-stone-100 hover:text-stone-900 bg-white"
 onClick={() => setEditingService(svc)}
 disabled={deletingId === svc.id}
 >
 <Edit3 className="w-4 h-4 text-stone-600" />
 </Button>
 <Button
 variant="outline"
 size="icon"
 className="w-9 h-9 rounded-full border-none shadow-sm bg-white hover:bg-rose-50 hover:text-rose-600"
 onClick={() => handleDelete(svc.id)}
 disabled={deletingId === svc.id}
 >
 <Trash2 className="w-4 h-4" />
 </Button>
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 )}
 </>
 )}
 </div>
 );
}
