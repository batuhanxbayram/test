import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import apiClient from "../../api/axiosConfig.js";
import { AddUserModal } from "@/widgets/layout/AddUserModal";

export function Profile() {
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleOpenModal = () => setOpenModal(!openModal);

  // Veri çekme mantığını yeniden kullanılabilir bir fonksiyon içine aldık
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/Users");
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError("Kullanıcı verileri yüklenirken bir hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Bileşen ilk yüklendiğinde kullanıcıları çek
  useEffect(() => {
    fetchUsers();
  }, []);

  // Yeni kullanıcı eklendiğinde veya silindiğinde listeyi yeniden çek
  const handleDataChange = () => {
    fetchUsers();
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`'${userName}' adlı kullanıcıyı silmek istediğinizden emin misiniz?`)) {
      try {
        await apiClient.delete(`/Users/${userId}`);
        handleDataChange(); // Silme sonrası listeyi yenile
      } catch (err) {
        alert("Kullanıcı silinirken bir hata oluştu.");
        console.error(err);
      }
    }
  };

  if (loading) return <div className="mt-12 text-center"><Typography>Kullanıcılar Yükleniyor...</Typography></div>;
  if (error) return <div className="mt-12 text-center"><Typography color="red">{error}</Typography></div>;

  return (
      <>
        <AddUserModal open={openModal} handleOpen={handleOpenModal} onUserAdded={handleDataChange} />

        <div className="mt-12 mb-8 flex flex-col gap-12">
          <Card>
            <CardHeader variant="gradient" color="gray" className="mb-4 p-6 flex justify-between items-center">
              <Typography variant="h6" color="white">Kullanıcılar</Typography>
              <Button size="sm" className="bg-green-700 text-white hover:bg-green-800" onClick={handleOpenModal}>
                Kullanıcı Ekle
              </Button>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                <tr>
                  {["Tam Ad", "Plaka", "Telefon", "İşlem"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
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
                      <td className="py-3 px-5 border-b border-blue-gray-50 text-right">
                        <Button size="xs" variant="text" color="blue">Düzenle</Button>
                        <Button size="xs" variant="text" color="red" onClick={() => handleDeleteUser(user.id, user.fullName)}>Sil</Button>
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