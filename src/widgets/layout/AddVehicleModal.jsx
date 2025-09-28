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
// TOAST ENTEGRASYONU
import { toast } from 'react-toastify'; 
import apiClient from "../../api/axiosConfig.js";

// TÜRKİYE PLAKA FORMATI REGEX KURALI: 2 Rakam + Boşluk(Ops.) + 1-3 Büyük Harf + Boşluk(Ops.) + 1-4 Rakam
const TURKISH_PLATE_REGEX = /^(\d{2})\s*([A-Z]{1,3})\s*(\d{1,4})$/;


export function AddVehicleModal({ open, handleOpen, onVehicleAdded }) {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        licensePlate: "",
        driverName: "",
        phoneNumber: "",
        appUserId: "",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            // ... (Kullanıcıları çekme kodu)
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
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Plaka girişini her zaman büyük harfe dönüştür
        const newValue = name === 'licensePlate' ? value.toUpperCase() : value;

        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSelectChange = (value) => {
        setFormData(prev => ({ ...prev, appUserId: value }));
    };

    const clearForm = () => {
        setFormData({ licensePlate: "", driverName: "", phoneNumber: "", appUserId: "" });
        setError("");
    };

    const handleClose = () => {
        clearForm();
        handleOpen();
    }

    const handleSubmit = async () => {
        // Zorunlu alan kontrolü
        if (!formData.licensePlate || !formData.appUserId) {
            const msg = "Plaka ve Kullanıcı alanları zorunludur.";
            setError(msg);
            toast.error(msg); 
            return;
        }

        // 🎯 YENİ PLAKA FORMATI KONTROLÜ
        // Plakayı boşlukları temizleyerek kontrol et
        const cleanedPlate = formData.licensePlate.trim().replace(/\s/g, ''); 
        
        if (!TURKISH_PLATE_REGEX.test(formData.licensePlate.trim())) {
            const msg = "Plaka formatı uygun değil.";
            setError(msg);
            toast.error(msg);
            return;
        }
        
        try {
            // API'a göndermeden önce plakadaki gereksiz boşlukları temizleyebiliriz.
            const payload = { 
                ...formData,
                licensePlate: formData.licensePlate.trim().replace(/\s+/g, '') // Birden fazla boşluğu tek boşluğa veya hiç boşluğa dönüştürme
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
                
                {/* Plaka girişi: Artık her harf büyük yazılıyor */}
                <Input 
                    label="Plaka *" 
                    name="licensePlate" 
                    value={formData.licensePlate} 
                    onChange={handleChange} 
                />
                
                <Select label="Kullanıcı Seçiniz *" name="appUserId" onChange={handleSelectChange} value={formData.appUserId}>
                    {users.length > 0 ? (
                        users.map(user => <Option key={user.id} value={user.id}>{user.fullName}</Option>)
                    ) : ( <Option disabled>Atanabilir kullanıcı bulunamadı</Option> )}
                </Select>
                <Input label="Şoför Adı (Opsiyonel)" name="driverName" value={formData.driverName} onChange={handleChange} />
                <Input label="Telefon Numarası (Opsiyonel)" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
            </DialogBody>
            <DialogFooter>
                <Button variant="text" color="red" onClick={handleClose} className="mr-1"><span>İptal</span></Button>
                <Button variant="gradient" color="green" onClick={handleSubmit}><span>Kaydet</span></Button>
            </DialogFooter>
        </Dialog>
    );
}