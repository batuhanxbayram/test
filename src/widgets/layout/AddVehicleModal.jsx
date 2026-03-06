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
import { toast } from "react-toastify";
import apiClient from "../../api/axiosConfig.js";

const TURKISH_PLATE_REGEX = /^(\d{2})\s*([A-Z]{1,3})\s*(\d{1,4})$/;

export function AddVehicleModal({ open, handleOpen, onVehicleAdded }) {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [formData, setFormData] = useState({
        licensePlate: "",
        phoneNumber: "",
        driverName: "", // Şemaya eklendi
    });
    const [error, setError] = useState("");

    const extractApiError = (err, fallback) => {
        const data = err?.response?.data;
        if (!data) return fallback;
        if (typeof data === "string") return data;
        return data.message || data.error || data.title || fallback;
    };

    useEffect(() => {
        if (open) {
            apiClient
                .get("/Users/without-vehicle")
                .then((response) => {
                    setUsers(response.data || []);
                    setError("");
                })
                .catch((err) => {
                    console.error("Kullanıcılar çekilirken hata:", err);
                    const msg = extractApiError(err, "Kullanıcı listesi yüklenemedi.");
                    setError(msg);
                    toast.error(msg);
                });
        } else {
            clearForm();
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === "licensePlate" ? value.toUpperCase() : value;
        setFormData((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleSelectChange = (value) => {
        setSelectedUserId(value || "");
    };

    const clearForm = () => {
        setFormData({ licensePlate: "", phoneNumber: "", driverName: "" }); // Formu sıfırlama güncellendi
        setSelectedUserId("");
        setError("");
    };

    const handleClose = () => handleOpen();

    const handleSubmit = async () => {
        // Validasyonlar
        if (!formData.licensePlate?.trim()) {
            const msg = "Plaka alanı zorunludur.";
            setError(msg);
            toast.error(msg);
            return;
        }

        if (!TURKISH_PLATE_REGEX.test(formData.licensePlate.trim())) {
            const msg = "Plaka formatı uygun değil. Örn: 34 ABC 123";
            setError(msg);
            toast.error(msg);
            return;
        }

        if (!formData.driverName?.trim()) {
            const msg = "Sürücü adı alanı zorunludur.";
            setError(msg);
            toast.error(msg);
            return;
        }

        try {
            // Sunucunun beklediği Şema Yapısı
            const payload = {
                appUserId: selectedUserId || null,
                licensePlate: formData.licensePlate.trim().replace(/\s+/g, ""), // Boşlukları temizler
                driverName: formData.driverName.trim(), // Yeni eklendi
                phoneNumber: formData.phoneNumber?.trim() || null,
            };

            await apiClient.post("/admin/vehicles", payload);

            toast.success(`'${formData.licensePlate}' plakalı araç başarıyla eklendi!`);
            onVehicleAdded?.();
            handleClose();
        } catch (err) {
            console.error("Araç eklenirken hata:", err?.response || err);
            const apiError = extractApiError(err, "Araç eklenirken hata oluştu.");
            setError(apiError);
            toast.error(apiError);
        }
    };

    return (
        <Dialog open={open} handler={handleClose}>
            <DialogHeader>Yeni Araç Ekle</DialogHeader>
            <DialogBody divider className="flex flex-col gap-4">
                {error && (
                    <Typography color="red" variant="small" className="font-medium">
                        {error}
                    </Typography>
                )}

                <Input
                    label="Plaka *"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    placeholder="34 ABC 123"
                />

                <Input
                    label="Sürücü Adı *"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleChange}
                />

                <Input
                    label="Telefon Numarası (Opsiyonel)"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                />

                <Select
                    label="Kullanıcı Ataması (Opsiyonel)"
                    value={selectedUserId}
                    onChange={handleSelectChange}
                >
                    <Option value="">Atama Yapma</Option>
                    {users.map((user) => (
                        <Option key={user.id} value={user.id}>
                            {user.fullName}
                        </Option>
                    ))}
                </Select>
            </DialogBody>

            <DialogFooter>
                <Button variant="text" color="red" onClick={handleClose} className="mr-1">
                    İptal
                </Button>
                <Button variant="gradient" color="green" onClick={handleSubmit}>
                    Kaydet
                </Button>
            </DialogFooter>
        </Dialog>
    );
}