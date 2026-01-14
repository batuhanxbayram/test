import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Typography, Button } from "@material-tailwind/react";
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

import apiClient from "../../api/axiosConfig.js";
import { AddUserModal } from "@/widgets/layout/AddUserModal";
import { EditUserModal } from "@/widgets/layout/EditUserModal";

export function Profile() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/Users");
      setUsers(response.data);
    } catch (err) {
      toast.error("Veriler getirilemedi!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ✨ Estetik ve Modern Bildirim Fonksiyonu
  const notifySuccess = (msg, borderClass = "border-green-500") => {
    toast.success(msg, {
      className: `border-l-4 ${borderClass} bg-white shadow-2xl rounded-lg`,
      bodyClassName: "text-blue-gray-800 font-medium text-sm",
      icon: borderClass === "border-blue-500" ? "📝" : "✅"
    });
  };

  const handleDeleteToast = (userId, userName) => {
    toast(
      <div className="p-1">
        <Typography variant="small" className="font-bold text-blue-gray-900">⚠️ Silme Onayı</Typography>
        <Typography variant="small" className="text-blue-gray-600 mt-1"><strong>{userName}</strong> silinsin mi?</Typography>
        <div className="flex justify-end gap-2 mt-4">
          <Button size="sm" variant="text" color="red" onClick={() => confirmDelete(userId, userName)}>Evet</Button>
          <Button size="sm" variant="filled" color="blue-gray" onClick={() => toast.dismiss()}>Vazgeç</Button>
        </div>
      </div>,
      { position: "top-center", autoClose: false, closeOnClick: false, icon: false }
    );
  };

  const confirmDelete = async (userId, userName) => {
    toast.dismiss();
    try {
      await apiClient.delete(`/Users/${userId}`);
      notifySuccess(`'${userName}' başarıyla silindi.`, "border-red-500");
      fetchUsers();
    } catch (err) {
      toast.error("Silinemedi!");
    }
  };

  return (
    <div className="mt-12 mb-8 px-4">
      <ToastContainer hideProgressBar newestOnTop theme="light" />

      <AddUserModal 
        open={openAddModal} 
        handleOpen={() => setOpenAddModal(false)} 
        onUserAdded={() => { fetchUsers(); notifySuccess("Yeni kullanıcı eklendi!"); }} 
      />

      <EditUserModal 
        open={openEditModal} 
        handleOpen={() => setOpenEditModal(false)} 
        userToEdit={currentUser} 
        onUserUpdated={() => { 
          fetchUsers(); 
          notifySuccess("Kullanıcı başarıyla güncellendi!", "border-blue-500"); 
        }} 
      />

      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader variant="gradient" color="gray" className="mb-4 p-6 flex justify-between items-center shadow-none">
          <Typography variant="h6" color="white">Kullanıcı Listesi</Typography>
          <Button size="sm" color="green" onClick={() => setOpenAddModal(true)}>+ Ekle</Button>
        </CardHeader>
        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Tam Ad", "Kullanıcı Adı", "İşlem"].map((el) => (
                  <th key={el} className="border-b border-blue-gray-50 py-4 px-6 text-left">
                    <Typography variant="small" className="text-[10px] font-bold uppercase text-blue-gray-400">{el}</Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-blue-gray-50/50 transition-colors">
                  <td className="py-3 px-6 border-b border-blue-gray-50"><Typography className="text-sm font-bold text-blue-gray-800">{user.fullName}</Typography></td>
                  <td className="py-3 px-6 border-b border-blue-gray-50"><Typography className="text-xs text-blue-gray-600">{user.userName}</Typography></td>
                  <td className="py-3 px-6 border-b border-blue-gray-50 text-right">
                    <div className="flex justify-end gap-6">
                      <Typography as="button" className="text-[11px] font-bold text-blue-500 uppercase cursor-pointer" onClick={() => { setCurrentUser(user); setOpenEditModal(true); }}>Düzenle</Typography>
                      <Typography as="button" className="text-[11px] font-bold text-red-400 uppercase cursor-pointer" onClick={() => handleDeleteToast(user.id, user.fullName)}>Sil</Typography>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
export default Profile;