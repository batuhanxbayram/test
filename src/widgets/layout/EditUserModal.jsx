import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, Input, Typography } from "@material-tailwind/react";
import apiClient from "../../api/axiosConfig.js";
import { toast } from 'react-toastify';

export function EditUserModal({ open, handleOpen, userToEdit, onUserUpdated }) {
    // 1. State'e diğer alanları da ekledik
    const [formData, setFormData] = useState({
        fullName: "",
        userName: "",
        licensePlate: "", // Yeni
        phoneNumber: "",  // Yeni
        password: "",
        confirmPassword: ""
    });

    const notifyError = (msg) => {
        toast.error(msg, {
            className: "border-l-4 border-red-500 bg-white shadow-xl rounded-lg",
            bodyClassName: "text-blue-gray-800 font-medium text-sm",
            icon: "❌"
        });
    };

    // 2. useEffect ile gelen verilerin Hepsini dolduruyoruz
    useEffect(() => {
        if (userToEdit) {
            setFormData({
                fullName: userToEdit.fullName || "",
                userName: userToEdit.userName || "",
                licensePlate: userToEdit.licensePlate || "", // Varsa doldur, yoksa boş
                phoneNumber: userToEdit.phoneNumber || "",   // Varsa doldur, yoksa boş
                password: "",
                confirmPassword: ""
            });
        }
    }, [userToEdit]);

    const handleSubmit = async () => {
        // Şifre kontrolü
        if (formData.password || formData.confirmPassword) {
            if (formData.password !== formData.confirmPassword) {
                notifyError("Şifreler uyuşmuyor!");
                return;
            }
            if (formData.password.length < 6) {
                notifyError("Şifre en az 6 karakter olmalıdır.");
                return;
            }
        }

        // 3. Payload hazırlığı (Backend'in beklediği tam yapı)
        const payload = {
            id: userToEdit.id, // ID göndermek her zaman güvenlidir
            fullName: formData.fullName,
            userName: userToEdit.userName,
            licensePlate: formData.licensePlate, // Diğer verileri de koruyoruz
            phoneNumber: formData.phoneNumber
        };

        // Eğer şifre doluysa pakete ekle (Boşsa hiç gönderme)
        if (formData.password && formData.password.trim() !== "") {
            payload.password = formData.password;
        }

        try {
            await apiClient.put(`/Users/${userToEdit.id}`, payload);

            toast.success("Kullanıcı başarıyla güncellendi!"); // Başarı mesajı ekledik
            onUserUpdated();
            handleOpen();
        } catch (err) {
            console.error(err);
            // Backend validasyon hatalarını yakalamak için detaylı kontrol
            const backendMsg = err.response?.data?.title || err.response?.data?.message || "Güncelleme başarısız.";
            notifyError(backendMsg);
        }
    };

    return (
        <Dialog open={open} handler={handleOpen} size="sm" className="rounded-xl border border-blue-gray-50 shadow-2xl">
            <DialogHeader className="text-blue-gray-900 font-bold px-6 pt-6 uppercase tracking-wider text-sm">
                Kullanıcı Düzenle
            </DialogHeader>
            <DialogBody divider className="flex flex-col gap-6 py-8 px-6 overflow-y-auto max-h-[60vh]"> {/* Scroll eklendi */}

                {/* Ad Soyad */}
                <div className="flex flex-col gap-1">
                    <Input
                        label="Ad Soyad"
                        name="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        size="lg"
                    />
                </div>

                {/* Kullanıcı Adı */}
                <div className="flex flex-col gap-1 opacity-70">
                    <Input
                        label="Kullanıcı Adı"
                        value={formData.userName}
                        disabled
                        className="!bg-blue-gray-50/50 cursor-not-allowed"
                        size="lg"
                    />
                </div>

                {/* --- YENİ ALANLAR (Profilde gözüken ama düzenlenemeyenler eklendi) --- */}
                <div className="flex gap-4">
                    <Input
                        label="Plaka"
                        value={formData.licensePlate}
                        onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                        size="lg"
                    />
                    <Input
                        label="Telefon"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        size="lg"
                    />
                </div>
                {/* ------------------------------------------------------------------ */}

                {/* Şifre Bölümü */}
                <div className="bg-blue-gray-50/30 p-4 rounded-xl border border-dashed border-blue-gray-200 flex flex-col gap-4">
                    <Typography variant="small" className="font-bold text-blue-gray-600 flex items-center gap-2">
                        <span>🔐</span> Şifre Değiştir
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