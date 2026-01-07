import React, { useState, useEffect } from "react";
import {
    Button, Dialog, DialogHeader, DialogBody, DialogFooter, Input, Checkbox, Typography
} from "@material-tailwind/react";
import apiClient from "../../api/axiosConfig.js";

export function EditVehicleModal({ open, handleOpen, onVehicleUpdated, vehicleToEdit }) {
    const [formData, setFormData] = useState({
        licensePlate: "",
        driverName: "", // --- DEĞİŞİKLİK --- Bu state kalıyor, sadece disabled input'u doldurmak için.
        phoneNumber: "",
        isActive: true,
    });
    const [error, setError] = useState("");

    // Bu useEffect, modal'a düzenlenecek araç bilgisi geldiğinde formu doldurur.
    useEffect(() => {
        if (vehicleToEdit) {
            setFormData({
                licensePlate: vehicleToEdit.licensePlate || "",
                driverName: vehicleToEdit.driverName || "", // 'driverName'i state'e atıyoruz (API'den geliyor)
                phoneNumber: vehicleToEdit.phoneNumber || "",
                isActive: vehicleToEdit.isActive,
            });
        } else {
            setFormData({ licensePlate: "", driverName: "", phoneNumber: "", isActive: true });
            setError("");
        }
    }, [vehicleToEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.licensePlate) {
            setError("Plaka alanı zorunludur.");
            return;
        }
        if (!vehicleToEdit) return;

        try {
            // --- DEĞİŞİKLİK ---
            // API'ye gönderilecek payload'u manuel oluşturuyoruz.
            // 'driverName' bu payload'a dahil edilmiyor.
            const payload = {
                licensePlate: formData.licensePlate,
                phoneNumber: formData.phoneNumber,
                isActive: formData.isActive
            };

            await apiClient.put(`/admin/vehicles/${vehicleToEdit.id}`, payload);

            alert("Araç başarıyla güncellendi!"); // Bunu da toast'a çevirebilirsiniz
            onVehicleUpdated();
            handleOpen();
        } catch (err) {
            console.error("Araç güncellenirken hata:", err);
            setError(err.response?.data || "Güncelleme sırasında bir hata oluştu.");
        }
    };

    return (
        <Dialog open={open} handler={handleOpen}>
            <DialogHeader>Araç Düzenle</DialogHeader>
            <DialogBody divider className="flex flex-col gap-4">
                {error && <Typography color="red" variant="small">{error}</Typography>}
                <Input label="Plaka *" name="licensePlate" value={formData.licensePlate} onChange={handleChange} />

                {/* --- DEĞİŞİKLİK --- */}
                {/* Şoför Adı alanı artık 'disabled' (değiştirilemez) */}
                <Input label="Şoför Adı" name="driverName" value={formData.driverName} disabled />

                <Input label="Telefon Numarası" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                <Checkbox label="Aktif" name="isActive" checked={formData.isActive} onChange={handleChange} />
            </DialogBody>
            <DialogFooter>
                <Button variant="text" color="red" onClick={handleOpen} className="mr-1"><span>İptal</span></Button>
                <Button variant="gradient" color="green" onClick={handleSubmit}><span>Güncelle</span></Button>
            </DialogFooter>
        </Dialog>
    );
}