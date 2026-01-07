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
        // 1. İstemci Tarafı Validasyonları
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
            const payload = {
                fullName: formData.fullName,
                userName: formData.userName,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            };

            await apiClient.post("/Users", payload);

            toast.success(`'${formData.fullName}' adlı kullanıcı başarıyla eklendi!`, { position: "top-right" });

            onUserAdded();
            handleClose();
        } catch (err) {
            console.error("Kullanıcı eklenirken hata:", err.response || err);

            let errorMessage = "Kullanıcı eklenirken beklenmedik bir hata oluştu.";

            // Backend'den yanıt döndü mü?
            if (err.response) {
                // ÖZEL DURUM: 409 Conflict (Çakışma / Kayıtlı Kullanıcı)
                if (err.response.status === 409) {
                    // Backend'den özel mesaj geliyorsa onu al, gelmiyorsa standart mesajı göster.
                    errorMessage = err.response.data?.message || err.response.data?.Message || `'${formData.userName}' kullanıcı adı zaten sistemde kayıtlı. Lütfen farklı bir kullanıcı adı deneyin.`;
                }
                // Diğer Hatalar (400 BadRequest vb.)
                else {
                    errorMessage = err.response.data?.message || err.response.data?.error || errorMessage;
                }
            } else {
                // Sunucuya hiç ulaşılamadıysa
                errorMessage = "Sunucu ile bağlantı kurulamadı. Lütfen internetinizi kontrol edin.";
            }

            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Kullanıcı tekrar yazmaya başlayınca hata mesajını temizle
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