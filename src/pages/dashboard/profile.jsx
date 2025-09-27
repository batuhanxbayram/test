import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Typography, Button } from "@material-tailwind/react";
// TOAST ENTEGRASYONU
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

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

  // Düzenleme modalını açan fonksiyon
  const handleOpenEditModal = (user) => {
    setCurrentUser(user);
    setOpenEditModal(true);
  };
  // Düzenleme modalını kapatan fonksiyon
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
      // Hata durumunda Toast bildirimi
      setError("Kullanıcı verileri yüklenirken bir hata oluştu.");
      toast.error("Kullanıcılar yüklenirken bir sorun oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Ekleme, silme veya güncelleme sonrası listeyi yeniden çek
  const handleDataChange = (message) => {
    fetchUsers();
    // Silme işleminden gelen mesajı Toast ile göster
    if(message) {
        toast.error(message, { position: "top-right", autoClose: 3000 });
    }
  };

  // ------------------------------------
  // YENİ TOAST SİLME İŞLEMLERİ
  // ------------------------------------
  const handleDeleteToast = (userId, userName) => {
    // window.confirm yerine Toast Onayı kullanıyoruz
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
      }
    );
  };
  
  const confirmDelete = async (userId, userName) => {
    toast.dismiss(); // Onay Toast'ını kapat

    try {
      await apiClient.delete(`/Users/${userId}`);
      
      // Başarı Toast'ı ve ardından veriyi yenile
      handleDataChange(`'${userName}' adlı kullanıcı başarıyla silindi.`);

    } catch (err) {
      console.error("Kullanıcı silinirken hata oluştu:", err);
      toast.error("Kullanıcı silinirken bir hata oluştu.");
    }
  };

  // Loading ve Error durumları değişmedi
  if (loading) return <div className="mt-12 text-center"><Typography>Kullanıcılar Yükleniyor...</Typography></div>;
  if (error) return <div className="mt-12 text-center"><Typography color="red">{error}</Typography></div>;

  return (
      <>
        {/* Toast Container'ı ekledik */}
        <ToastContainer />

        <AddUserModal open={openAddModal} handleOpen={handleCloseAddModal} onUserAdded={fetchUsers} />
        <EditUserModal open={openEditModal} handleOpen={handleCloseEditModal} userToEdit={currentUser} onUserUpdated={fetchUsers} />

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
                        <Typography className="text-xs font-normal text-blue-gray-500">{user.licensePlate}</Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography className="text-xs font-normal text-blue-gray-500">{user.phoneNumber}</Typography>
                      </td>
                      {/* İŞLEM LİNKLERİ (Sade Görünüm) */}
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
                              handleDeleteToast(user.id, user.fullName); // Toast onayını bağladık
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