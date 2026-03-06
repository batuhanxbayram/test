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
    const [selectedUserId, setSelectedUserId] = useState(""); // opsiyonel
    const [formData, setFormData] = useState({
        licensePlate: "",
        phoneNumber: "",
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
            // Artık tüm kullanıcılar gelebilir (multi-vehicle için)
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
        // Select'te temizle/boş bırak için value undefined gelebilir
        setSelectedUserId(value || "");
    };

    const clearForm = () => {
        setFormData({ licensePlate: "", phoneNumber: "" });
        setSelectedUserId("");
        setError("");
    };

    const handleClose = () => handleOpen();

    const handleSubmit = async () => {
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

        try {
            const payload = {
                licensePlate: formData.licensePlate.trim().replace(/\s+/g, ""),
                phoneNumber: formData.phoneNumber?.trim() || null,
                appUserId: selectedUserId ? selectedUserId : null, // artık opsiyonel
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
                    <Typography color="red" variant="small">
                        {error}
                    </Typography>
                )}

                <Input
                    label="Plaka *"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleChange}
                />

                <Select
                    label="Kullanıcı Seçiniz (Opsiyonel)"
                    name="appUserId"
                    onChange={handleSelectChange}
                    value={selectedUserId}
                >
                    <Option value="">Atama Yapma</Option>
                    {users.map((user) => (
                        <Option key={user.id} value={String(user.id)}>
                            {user.fullName}
                        </Option>
                    ))}
                </Select>

                <Input
                    label="Telefon Numarası (Opsiyonel)"
                    name="phoneNumber"
                    value={formData.phoneNumber}
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