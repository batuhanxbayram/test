import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Typography,
} from "@material-tailwind/react";
// TOAST ENTEGRASYONU
import { toast } from 'react-toastify'; 
import apiClient from "../../api/axiosConfig.js";

export function AddUserModal({ open, handleOpen, onUserAdded }) {
    const [formData, setFormData] = useState({
        fullName: "",
        userName: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");

    const clearForm = () => {
        setFormData({ fullName: "", userName: "", password: "", confirmPassword: "" });
        setError("");
    };

    const handleClose = () => {
        clearForm();
        handleOpen();
    };

    const handleSubmit = async () => {
        // Form Kontrolleri (Frontend tarafı)
        if (!formData.fullName || !formData.userName || !formData.password || !formData.confirmPassword) {
            const msg = "Tüm zorunlu alanları (Ad, Kullanıcı Adı, Şifre) doldurunuz.";
            setError(msg);
            toast.error(msg);
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            const msg = "Şifreler birbiriyle eşleşmiyor.";
            setError(msg);
            toast.error(msg);
            return;
        }

        try {
            // BACKEND'E GÖNDERİLECEK PAYLOAD
            const payload = {
                fullName: formData.fullName,
                userName: formData.userName,
                password: formData.password,
                // HATA ÇÖZÜMÜ: API'ın beklediği ConfirmPassword alanını ekliyoruz
                confirmPassword: formData.confirmPassword 
            };

            await apiClient.post("/Users", payload);
            
            // Başarı TOAST'ı göster
            toast.success(`'${formData.fullName}' adlı kullanıcı başarıyla eklendi!`, { position: "top-right" });

            onUserAdded();
            handleClose();
        } catch (err) {
            console.error("Kullanıcı eklenirken hata:", err.response || err);
            
            // Backend'den gelen spesifik hata mesajını çek ve TOAST ile göster
            const apiError = err.response?.data?.message || err.response?.data?.error || "Kullanıcı eklenirken beklenmedik bir hata oluştu.";
            setError(apiError);
            toast.error(apiError);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Kullanıcı yazmaya başlayınca local hatayı temizle
        setError(""); 
    };

    return (
        <Dialog open={open} handler={handleClose}>
            <DialogHeader>Yeni Kullanıcı Ekle</DialogHeader>
            <DialogBody divider className="flex flex-col gap-4">
                {error && <Typography color="red" variant="small">{error}</Typography>}
                
                <Input 
                    label="Tam Ad *" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange} 
                />
                
                <Input 
                    label="Kullanıcı Adı *" 
                    name="userName" 
                    value={formData.userName} 
                    onChange={handleChange} 
                />
                
                <Input 
                    label="Şifre *" 
                    name="password" 
                    type="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                />
                
                <Input 
                    label="Şifre Tekrar *" 
                    name="confirmPassword" 
                    type="password" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                />
                
            </DialogBody>
            <DialogFooter>
                <Button variant="text" color="red" onClick={handleClose} className="mr-1">
                    <span>İptal</span>
                </Button>
                <Button variant="gradient" color="green" onClick={handleSubmit}>
                    <span>Kaydet</span>
                </Button>
            </DialogFooter>
        </Dialog>
    );
}