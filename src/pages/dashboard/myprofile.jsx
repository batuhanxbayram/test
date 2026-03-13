import React, { useState, useEffect } from "react";
import {
    Card, CardHeader, CardBody, Typography, Button, Input, Chip
} from "@material-tailwind/react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import apiClient from "../../api/axiosConfig.js";

export function MyProfile() {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        password: "",
        confirmPassword: "",
    });
    const [saving, setSaving] = useState(false);

    const getUserIdFromToken = () => {
        const token = localStorage.getItem("authToken");
        if (!token) return null;
        try {
            const decoded = jwtDecode(token);
            return (
                decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
                || decoded.sub
                || decoded.nameid
            );
        } catch {
            return null;
        }
    };

    const fetchMyInfo = async () => {
        const userId = getUserIdFromToken();
        if (!userId) return;
        try {
            const res = await apiClient.get("/Users");
            const me = res.data.find(u => u.id === userId);
            setUserInfo(me || null);
        } catch {
            toast.error("Bilgiler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyInfo();
    }, []);

    const handlePasswordChange = async () => {
        if (!passwords.currentPassword || !passwords.password || !passwords.confirmPassword) {
            toast.error("Lütfen tüm şifre alanlarını doldurun.");
            return;
        }
        if (passwords.password !== passwords.confirmPassword) {
            toast.error("Yeni şifreler eşleşmiyor.");
            return;
        }
        if (passwords.password.length < 6) {
            toast.error("Şifre en az 6 karakter olmalıdır.");
            return;
        }

        setSaving(true);
        try {
            await apiClient.post("/Users/change-my-password", {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.password,
                confirmNewPassword: passwords.confirmPassword,
            });
            toast.success("Şifre başarıyla güncellendi!");
            setPasswords({ currentPassword: "", password: "", confirmPassword: "" });
        } catch (e) {
            toast.error(e.response?.data?.message || "Şifre güncellenemedi.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="mt-12 flex justify-center">
                <Typography>Yükleniyor...</Typography>
            </div>
        );
    }

    if (!userInfo) {
        return (
            <div className="mt-12 flex justify-center">
                <Typography color="red">Kullanıcı bilgisi alınamadı.</Typography>
            </div>
        );
    }

    return (
        <div className="mt-12 mb-8 flex flex-col gap-8 max-w-2xl mx-auto">

            {/* Kişisel Bilgiler */}
            <Card>
                <CardHeader variant="gradient" color="gray" className="mb-4 p-6 flex items-center gap-4">
                    <UserCircleIcon className="h-8 w-8 text-white opacity-80" />
                    <Typography variant="h6" color="white">Kişisel Bilgilerim</Typography>
                </CardHeader>
                <CardBody className="flex flex-col gap-6 px-6 pb-6">

                    <div className="flex flex-col gap-1">
                        <Typography variant="small" className="font-semibold text-blue-gray-400 uppercase text-xs tracking-wide">
                            Ad Soyad
                        </Typography>
                        <Typography variant="h6" className="text-blue-gray-800">
                            {userInfo.fullName || "-"}
                        </Typography>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Typography variant="small" className="font-semibold text-blue-gray-400 uppercase text-xs tracking-wide">
                            Kullanıcı Adı
                        </Typography>
                        <Typography className="text-blue-gray-700">
                            {userInfo.userName || "-"}
                        </Typography>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Typography variant="small" className="font-semibold text-blue-gray-400 uppercase text-xs tracking-wide">
                            Telefon Numarası
                        </Typography>
                        <Typography className="text-blue-gray-700">
                            {userInfo.phoneNumber || "-"}
                        </Typography>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Typography variant="small" className="font-semibold text-blue-gray-400 uppercase text-xs tracking-wide">
                            Araç Plakası
                        </Typography>
                        {userInfo.licensePlate && userInfo.licensePlate !== "-" ? (
                            <Chip
                                variant="ghost"
                                color="blue"
                                value={userInfo.licensePlate}
                                className="w-max font-bold text-sm"
                            />
                        ) : (
                            <Typography className="text-blue-gray-400 italic text-sm">
                                Atanmış araç yok
                            </Typography>
                        )}
                    </div>

                </CardBody>
            </Card>

            {/* Şifre Değiştir */}
            <Card>
                <CardHeader variant="gradient" color="gray" className="mb-4 p-6">
                    <Typography variant="h6" color="white">Şifre Değiştir</Typography>
                </CardHeader>
                <CardBody className="flex flex-col gap-5 px-6 pb-6">

                    <Input
                        label="Mevcut Şifre"
                        type="password"
                        value={passwords.currentPassword}
                        onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                        autoComplete="current-password"
                    />
                    <Input
                        label="Yeni Şifre"
                        type="password"
                        value={passwords.password}
                        onChange={e => setPasswords(p => ({ ...p, password: e.target.value }))}
                        autoComplete="new-password"
                    />
                    <Input
                        label="Yeni Şifre Tekrar"
                        type="password"
                        value={passwords.confirmPassword}
                        onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                        autoComplete="new-password"
                    />

                    <Button
                        variant="gradient"
                        color="gray"
                        onClick={handlePasswordChange}
                        disabled={saving}
                        className="mt-2"
                    >
                        {saving ? "Kaydediliyor..." : "Şifreyi Güncelle"}
                    </Button>

                </CardBody>
            </Card>

        </div>
    );
}

export default MyProfile;