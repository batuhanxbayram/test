import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, Input, Typography } from "@material-tailwind/react";
import apiClient from "../../api/axiosConfig.js";
import { toast } from 'react-toastify';

export function EditUserModal({ open, handleOpen, userToEdit, onUserUpdated }) {
    const [formData, setFormData] = useState({ fullName: "", userName: "", password: "", confirmPassword: "" });

    // ✨ Estetik Hata Bildirimi
    const notifyError = (msg) => {
        toast.error(msg, {
            className: "border-l-4 border-red-500 bg-white shadow-xl rounded-lg",
            bodyClassName: "text-blue-gray-800 font-medium text-sm",
            icon: "❌"
        });
    };

    useEffect(() => {
        if (userToEdit) {
            setFormData({ 
                fullName: userToEdit.fullName || "", 
                userName: userToEdit.userName || "", 
                password: "", 
                confirmPassword: "" 
            });
        }
    }, [userToEdit]);

    const handleSubmit = async () => {
        // Form Kontrolü
        if (formData.password && formData.password !== formData.confirmPassword) {
            notifyError("Şifreler uyuşmuyor, lütfen kontrol edin!");
            return;
        }

        const payload = { fullName: formData.fullName };
        if (formData.password) payload.password = formData.password;

        try {
            await apiClient.put(`/Users/${userToEdit.id}`, payload);
            
            // Başarı mesajı Profile.jsx içindeki onUserUpdated propu üzerinden tetiklenir ✨
            onUserUpdated(); 
            handleOpen();
        } catch (err) {
            const backendMsg = err.response?.data?.message || "Güncelleme sırasında bir sorun oluştu.";
            notifyError(backendMsg);
        }
    };

    return (
        <Dialog open={open} handler={handleOpen} size="sm" className="rounded-xl border border-blue-gray-50 shadow-2xl">
            <DialogHeader className="text-blue-gray-900 font-bold px-6 pt-6 uppercase tracking-wider text-sm">
                Kullanıcı Düzenle
            </DialogHeader>
            <DialogBody divider className="flex flex-col gap-6 py-8 px-6">
                <div className="flex flex-col gap-1">
                    <Typography variant="small" color="blue-gray" className="font-semibold ml-1">Tam Ad</Typography>
                    <Input 
                        label="Ad Soyad" 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                        size="lg"
                    />
                </div>

                <div className="flex flex-col gap-1 opacity-70">
                    <Typography variant="small" color="blue-gray" className="font-semibold ml-1 text-xs">Kullanıcı Adı (Değiştirilemez)</Typography>
                    <Input 
                        label="Kullanıcı Adı" 
                        value={formData.userName} 
                        disabled 
                        className="!bg-blue-gray-50/50 cursor-not-allowed" 
                        size="lg"
                    />
                </div>

                <div className="bg-blue-gray-50/30 p-4 rounded-xl border border-dashed border-blue-gray-200 flex flex-col gap-4">
                    <Typography variant="small" className="font-bold text-blue-gray-600 flex items-center gap-2">
                        <span>🔐</span> Şifre İşlemleri
                    </Typography>
                    <Typography variant="small" className="text-[10px] text-blue-gray-400 -mt-3 italic">
                        Şifreyi değiştirmeyecekseniz alanları boş bırakınız.
                    </Typography>
                    
                    <Input 
                        label="Yeni Şifre" 
                        type="password" 
                        name="password" 
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        size="lg"
                    />
                    <Input 
                        label="Yeni Şifre Tekrar" 
                        type="password" 
                        name="confirmPassword" 
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                        size="lg"
                    />
                </div>
            </DialogBody>
            <DialogFooter className="gap-3 px-6 pb-6">
                <Button variant="text" color="red" onClick={handleOpen} className="normal-case font-bold py-2">
                    İptal
                </Button>
                <Button variant="gradient" color="blue" onClick={handleSubmit} className="normal-case font-bold shadow-blue-500/20 py-2">
                    Güncelle
                </Button>
            </DialogFooter>
        </Dialog>
    );
}