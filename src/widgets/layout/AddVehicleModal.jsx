import React, { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Select,
    Option,
    Typography,
} from "@material-tailwind/react";
import { toast } from 'react-toastify';
import apiClient from "../../api/axiosConfig.js";

// TÜRKİYE PLAKA FORMATI REGEX KURALI
const TURKISH_PLATE_REGEX = /^(\d{2})\s*([A-Z]{1,3})\s*(\d{1,4})$/;

export function AddVehicleModal({ open, handleOpen, onVehicleAdded }) {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [formData, setFormData] = useState({
        licensePlate: "",
        phoneNumber: "",
    });

    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            // Modal açıldığında kullanıcıları çek
            apiClient.get("/Users/without-vehicle")
                .then(response => {
                    setUsers(response.data);
                    setError("");
                })
                .catch(err => {
                    console.error("Kullanıcılar çekilirken hata oluştu:", err);
                    const msg = "Atanabilir kullanıcı listesi yüklenemedi.";
                    setError(msg);
                    toast.error(msg);
                });
        } else {
            // Modal kapandığında formu temizle
            clearForm();
        }
    }, [open]);

    // Input (Plaka, Telefon) değişiklikleri için
    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'licensePlate' ? value.toUpperCase() : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    // Select (Kullanıcı) değişikliği için
    const handleSelectChange = (value) => {
        setSelectedUserId(value);
    };

    const clearForm = () => {
        setFormData({ licensePlate: "", phoneNumber: "" });
        setSelectedUserId("");
        setError("");
    };

    const handleClose = () => {
        handleOpen();
    }

    const handleSubmit = async () => {
        if (!formData.licensePlate || !selectedUserId) {
            const msg = "Plaka ve Kullanıcı alanları zorunludur.";
            setError(msg);
            toast.error(msg);
            return;
        }

        if (!TURKISH_PLATE_REGEX.test(formData.licensePlate.trim())) {
            const msg = "Plaka formatı uygun değil.";
            setError(msg);
            toast.error(msg);
            return;
        }

        try {
            const payload = {
                licensePlate: formData.licensePlate.trim().replace(/\s+/g, ''),
                phoneNumber: formData.phoneNumber,
                appUserId: selectedUserId
            };

            await apiClient.post("/admin/vehicles", payload);
            toast.success(`'${formData.licensePlate}' plakalı araç başarıyla eklendi!`, { position: "top-right" });

            onVehicleAdded();
            handleClose();
        } catch (err) {
            console.error("Araç eklenirken hata:", err.response || err);
            const apiError = err.response?.data?.message || err.response?.data?.error || "Araç eklenirken beklenmedik bir hata oluştu.";
            setError(apiError);
            toast.error(apiError);
        }
    };

    return (
        <Dialog open={open} handler={handleClose}>
            <DialogHeader>Yeni Araç Ekle</DialogHeader>
            <DialogBody divider className="flex flex-col gap-4">
                {error && <Typography color="red" variant="small">{error}</Typography>}

                <Input
                    label="Plaka *"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleChange}
                />

                {/* DÜZELTİLEN KISIM: 'selected' prop'u kaldırıldı */}
                <Select
                    label="Kullanıcı Seçiniz *"
                    name="appUserId"
                    onChange={handleSelectChange}
                    value={selectedUserId}
                >
                    {users.length > 0 ? (
                        users.map(user => (
                            // String(user.id) ile veri tipi garantiye alındı
                            <Option key={user.id} value={String(user.id)}>
                                {user.fullName}
                            </Option>
                        ))
                    ) : (
                        <Option disabled>Atanabilir kullanıcı bulunamadı</Option>
                    )}
                </Select>

                <Input
                    label="Telefon Numarası (Opsiyonel)"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                />
            </DialogBody>
            <DialogFooter>
                <Button variant="text" color="red" onClick={handleClose} className="mr-1"><span>İptal</span></Button>
                <Button variant="gradient" color="green" onClick={handleSubmit}><span>Kaydet</span></Button>
            </DialogFooter>
        </Dialog>
    );
}