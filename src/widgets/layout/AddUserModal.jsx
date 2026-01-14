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
import { toast } from 'react-toastify'; // Sadece hatalar için kullanacağız
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
        // 1. İstemci Tarafı Validasyonları
        if (!formData.fullName || !formData.userName || !formData.password || !formData.confirmPassword) {
            const msg = "Tüm zorunlu alanları doldurunuz.";
            setError(msg);
            toast.error(msg); // Hata mesajları kalabilir
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            const msg = "Şifreler birbiriyle eşleşmiyor.";
            setError(msg);
            toast.error(msg);
            return;
        }

        try {
            const payload = {
                fullName: formData.fullName,
                userName: formData.userName,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            };

            await apiClient.post("/Users", payload);

            // --- DÜZELTME BURADA ---
            // Buradaki toast.success satırını SİLDİK.
            // Çünkü onUserAdded() fonksiyonu, Profile.jsx içindeki mesajı zaten tetikliyor.

            onUserAdded(); // Bu satır Profile.jsx'e "İşlem tamam, mesajı göster ve listeyi yenile" der.
            handleClose();

        } catch (err) {
            console.error("Kullanıcı eklenirken hata:", err.response || err);
            let errorMessage = "Kullanıcı eklenirken hata oluştu.";

            if (err.response) {
                if (err.response.status === 409) {
                    errorMessage = err.response.data?.message || `'${formData.userName}' zaten kayıtlı.`;
                } else {
                    errorMessage = err.response.data?.message || errorMessage;
                }
            } else {
                errorMessage = "Sunucu ile bağlantı kurulamadı.";
            }

            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                    autoComplete="off"
                />
                <Input
                    label="Kullanıcı Adı *"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    autoComplete="off"
                />
                <Input
                    label="Şifre *"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                />
                <Input
                    label="Şifre Tekrar *"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
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