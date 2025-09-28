import React, { useState, useEffect } from "react";
import {
    Button, Dialog, DialogHeader, DialogBody, DialogFooter, Input, Typography,
} from "@material-tailwind/react";
import apiClient from "../../api/axiosConfig.js";
import { toast } from 'react-toastify'; // alert yerine toast kullanmak daha modern bir yaklaşım

export function EditUserModal({ open, handleOpen, userToEdit, onUserUpdated }) {
    const [formData, setFormData] = useState({
        fullName: "",
        userName: "", // userName'i formda tutmaya devam ediyoruz, sadece göstermek için.
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                fullName: userToEdit.fullName || "",
                userName: userToEdit.userName || "",
                password: "",
                confirmPassword: "",
            });
            setError("");
        }
    }, [userToEdit]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleClose = () => {
        setError("");
        handleOpen();
    };

    const handleSubmit = async () => {
        if (formData.password && formData.password !== formData.confirmPassword) {
            setError("Girilen şifreler uyuşmuyor.");
            return;
        }

        // DEĞİŞİKLİK: Payload'dan 'userName' kaldırıldı.
        const payload = {
            fullName: formData.fullName,
        };

        if (formData.password) {
            payload.password = formData.password;
        }

        try {
            await apiClient.put(`/Users/${userToEdit.id}`, payload);
            toast.success("Kullanıcı başarıyla güncellendi!");
            onUserUpdated();
            handleClose();
        } catch (err) {
            console.error("Kullanıcı güncellenirken hata:", err);
            const errorMessage = err.response?.data?.title || err.response?.data || "Bir hata oluştu.";
            toast.error(errorMessage); // alert yerine toast
            setError(errorMessage);
        }
    };

    return (
        <Dialog open={open} handler={handleClose}>
            <DialogHeader>Kullanıcıyı Düzenle: {userToEdit?.fullName}</DialogHeader>
            <DialogBody divider className="flex flex-col gap-4">
                {error && <Typography color="red" variant="small">{error}</Typography>}
                <Input
                    label="Tam Ad *"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                />
                <Input
                    label="Kullanıcı Adı (Değiştirilemez)"
                    name="userName"
                    value={formData.userName}
                    // DEĞİŞİKLİK: Kullanıcı adının değiştirilmesini engellemek için 'disabled' eklendi.
                    disabled
                />
                <hr />
                <Typography variant="small" color="blue-gray" className="-mb-3">
                    Şifreyi Değiştirmek İstemiyorsanız Boş Bırakın
                </Typography>
                <Input
                    label="Yeni Şifre"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    // DEĞİŞİKLİK: Tarayıcının otomatik tamamlama yapmasını engellemek için 'autoComplete' kaldırıldı.
                />
                <Input
                    label="Yeni Şifre Tekrar"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    // DEĞİŞİKLİK: Tarayıcının otomatik tamamlama yapmasını engellemek için 'autoComplete' kaldırıldı.
                />
            </DialogBody>
            <DialogFooter>
                <Button variant="text" color="red" onClick={handleClose} className="mr-1">
                    <span>İptal</span>
                </Button>
                <Button variant="gradient" color="green" onClick={handleSubmit}>
                    <span>Güncelle</span>
                </Button>
            </DialogFooter>
        </Dialog>
    );
}