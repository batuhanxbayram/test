import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Typography, Button } from "@material-tailwind/react";

import { ToastContainer, toast } from 'react-toastify';


import apiClient from "../../api/axiosConfig.js";
import { AddUserModal } from "@/widgets/layout/AddUserModal";
import { EditUserModal } from "@/widgets/layout/EditUserModal";

export function Profile() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State'leri
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const handleOpenAddModal = () => setOpenAddModal(true);
    const handleCloseAddModal = () => setOpenAddModal(false);

    const handleOpenEditModal = (user) => {
        setCurrentUser(user);
        setOpenEditModal(true);
    };

    const handleCloseEditModal = () => {
        setCurrentUser(null);
        setOpenEditModal(false);
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get("/Users");
            setUsers(response.data);
            setError(null);
        } catch (err) {
            setError("Kullanıcı verileri yüklenirken bir hata oluştu.");
            console.error(err);
            // Hata mesajını sessizce konsola yazabilir veya toast ile gösterebiliriz
            // toast.error("Veriler yüklenirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // --- MERKEZİ VERİ VE MESAJ YÖNETİMİ ---
    const handleDataChange = (message) => {
        // 1. Listeyi yenile
        fetchUsers();

        // 2. Mesaj varsa Toast göster
        if(message) {
            toast.success(message, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
            });
        }
    };

    // --- MODAL CALLBACK'LERİ (DÜZELTİLEN KISIM) ---

    // Ekleme işlemi bitince bu çalışacak
    const onUserAddedCallback = () => {
        handleDataChange("Kullanıcı başarıyla eklendi.");
    };

    // Güncelleme işlemi bitince bu çalışacak
    const onUserUpdatedCallback = () => {
        handleDataChange("Kullanıcı bilgileri başarıyla güncellendi.");
    };


    // --- SİLME İŞLEMLERİ ---
    const handleDeleteToast = (userId, userName) => {
        toast.warn(
            <div className="flex flex-col">
                <p className="text-sm font-bold">
                    **{userName}** adlı kullanıcıyı silmek istediğinizden emin misiniz?
                </p>
                <div className="flex justify-end gap-2 mt-2">
                    <Button
                        size="sm"
                        color="red"
                        onClick={() => confirmDelete(userId, userName)}
                        className="text-[10px] py-1 px-2"
                    >
                        Evet, Sil
                    </Button>
                    <Button
                        size="sm"
                        variant="outlined"
                        color="white"
                        onClick={() => toast.dismiss()}
                        className="text-[10px] py-1 px-2"
                    >
                        Hayır
                    </Button>
                </div>
            </div>,
            {
                position: "top-center",
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                style: { zIndex: 999999 }
            }
        );
    };

    const confirmDelete = async (userId, userName) => {
        toast.dismiss();

        try {
            await apiClient.delete(`/Users/${userId}`);
            // Silme başarılı olduğunda handleDataChange çağırılır
            handleDataChange(`'${userName}' adlı kullanıcı başarıyla silindi.`);
        } catch (err) {
            console.error("Kullanıcı silinirken hata:", err);
            toast.error("Kullanıcı silinirken bir hata oluştu.");
        }
    };

    if (loading) return <div className="mt-12 text-center"><Typography>Kullanıcılar Yükleniyor...</Typography></div>;
    if (error) return <div className="mt-12 text-center"><Typography color="red">{error}</Typography></div>;

    return (
        <>
            {/* Toast Container En Üstte */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                style={{ zIndex: 99999 }}
            />

            {/* DÜZELTME:
            Modallara artık direkt fetchUsers değil,
            mesaj tetikleyen wrapper fonksiyonları gönderiyoruz.
        */}
            <AddUserModal
                open={openAddModal}
                handleOpen={handleCloseAddModal}
                onUserAdded={onUserAddedCallback}
            />

            <EditUserModal
                open={openEditModal}
                handleOpen={handleCloseEditModal}
                userToEdit={currentUser}
                onUserUpdated={onUserUpdatedCallback}
            />

            <div className="mt-12 mb-8 flex flex-col gap-12">
                <Card>
                    <CardHeader variant="gradient" color="gray" className="mb-4 p-6 flex justify-between items-center">
                        <Typography variant="h6" color="white">Kullanıcılar</Typography>
                        <Button size="sm" className="bg-green-700 text-white hover:bg-green-800" onClick={handleOpenAddModal}>
                            Kullanıcı Ekle
                        </Button>
                    </CardHeader>
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                            <tr>
                                {["Tam Ad", "Plaka", "Telefon", "İşlem"].map((el) => (
                                    <th key={el} className={`border-b border-blue-gray-50 py-3 px-5 text-left ${el === "İşlem" ? "text-right" : ""}`}>
                                        <Typography variant="small" className="font-bold uppercase text-blue-gray-400">{el}</Typography>
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="py-3 px-5 border-b border-blue-gray-50">
                                        <Typography className="text-sm font-semibold text-blue-gray-600">{user.fullName}</Typography>
                                    </td>
                                    <td className="py-3 px-5 border-b border-blue-gray-50">
                                        <Typography className="text-xs font-normal text-blue-gray-500">{user.licensePlate || "-"}</Typography>
                                    </td>
                                    <td className="py-3 px-5 border-b border-blue-gray-50">
                                        <Typography className="text-xs font-normal text-blue-gray-500">{user.phoneNumber || "-"}</Typography>
                                    </td>
                                    <td className="py-3 px-5 border-b border-blue-gray-50 text-right">
                                        <div className="flex justify-end items-center gap-4">
                                            <Typography
                                                as="a"
                                                href="#"
                                                variant="small"
                                                color="blue"
                                                className="font-semibold uppercase text-xs cursor-pointer hover:underline"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleOpenEditModal(user);
                                                }}
                                            >
                                                Düzenle
                                            </Typography>

                                            <Typography
                                                as="a"
                                                href="#"
                                                variant="small"
                                                color="red"
                                                className="font-semibold uppercase text-xs cursor-pointer hover:underline"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleDeleteToast(user.id, user.fullName);
                                                }}
                                            >
                                                Sil
                                            </Typography>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}

export default Profile;