import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Typography, Button } from "@material-tailwind/react";
// TOAST ENTEGRASYONU
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import apiClient from "../../api/axiosConfig.js";
import { AddVehicleModal } from "@/widgets/layout/AddVehicleModal";
import { EditVehicleModal } from "@/widgets/layout/EditVehicleModal";

// --- YENİ YARDIMCI FONKSİYON ---
// Gelen string'i "İsim Soyisim" formatına (Title Case) çevirir.
// Örn: "ali bayram" -> "Ali Bayram"
// Örn: "ALİ BAYRAM" -> "Ali Bayram"
const toTitleCase = (str) => {
  if (!str) return ""; // Boş, null veya undefined ise boş string döndür
  return str
      .toLowerCase() // Önce tüm harfleri küçült (örn: "ALI" -> "ali")
      .split(' ')    // Kelimelere ayır (örn: ["ali", "bayram"])
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Her kelimenin ilk harfini büyüt (örn: ["Ali", "Bayram"])
      .join(' ');   // Tekrar birleştir (örn: "Ali Bayram")
};
// ---------------------------------


export function Tables() {
  const [vehicles, setVehicles] = useState([]);

  // Modal State'leri
  const [addModalOpen, setAddModalOpen] = useState(false);
  const handleOpenAddModal = () => setAddModalOpen(!addModalOpen);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);

  const handleOpenEditModal = (vehicle) => {
    setCurrentVehicle(vehicle);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setCurrentVehicle(null);
  }

  // Araç listesini API'den çeken ana fonksiyon
  const fetchVehicles = async () => {
    try {
      const response = await apiClient.get("/admin/vehicles");
      setVehicles(response.data);
    } catch (error) {
      console.error("Araçlar çekilirken bir hata oluştu:", error);
      // Hata durumunda Toast bildirimi
      toast.error("Araçlar yüklenirken bir sorun oluştu.");
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Ekleme, silme veya güncelleme sonrası listeyi yeniden çekmek için
  // Silme işlemi için mesajı alıp Toast gösterecek
  const handleDataChange = (message) => {
    fetchVehicles();
    if(message) {
      toast.error(message, { position: "top-right", autoClose: 3000 });
    }
  };

  // ------------------------------------
  // YENİ TOAST SİLME İŞLEMLERİ
  // ------------------------------------
  const handleDeleteToast = (id, plaka) => {
    // window.confirm yerine Toast Onayı kullanıyoruz
    toast.warn(
        <div className="flex flex-col">
          <p className="text-sm font-bold">
            **{plaka}** plakalı aracı silmek istediğinize emin misiniz?
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <Button
                size="sm"
                color="red"
                onClick={() => confirmDelete(id, plaka)}
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

  const confirmDelete = async (id, plaka) => {
    toast.dismiss(); // Onay Toast'ını kapat

    try {
      await apiClient.delete(`/admin/vehicles/${id}`);

      // Başarı Toast'ı ve ardından veriyi yenile
      handleDataChange(`${plaka} plakalı araç başarıyla silindi.`);

    } catch (error) {
      console.error("Araç silinirken hata oluştu:", error);
      // Hata durumunda Toast bildirimi
      toast.error("Araç silinirken bir hata oluştu.");
    }
  };

  return (
      <>
        {/* Toast Container'ı ekledik */}
        <ToastContainer />

        {/* Modal Bileşenleri (Güncellenmiş onVehicleAdded prop'u) */}
        <AddVehicleModal
            open={addModalOpen}
            handleOpen={handleOpenAddModal}
            onVehicleAdded={fetchVehicles} // Modal kendi toast'ını gösterecek
        />

        <EditVehicleModal
            open={editModalOpen}
            handleOpen={handleCloseEditModal}
            onVehicleUpdated={fetchVehicles} // Modal kendi toast'ını gösterecek
            vehicleToEdit={currentVehicle}
        />

        <div className="mt-12 mb-8 flex flex-col gap-12">
          <Card>
            <CardHeader variant="gradient" color="gray" className="mb-4 p-6 flex justify-between items-center">
              <Typography variant="h6" color="white">Araçlar</Typography>
              <Button size="sm" className="bg-green-700 text-white" onClick={handleOpenAddModal}>Araç Ekle</Button>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                <tr>
                  {["Plaka", "Şoför Adı", "Telefon", "İşlem"].map((el) => (
                      <th key={el} className={`border-b border-blue-gray-50 py-3 px-5 text-left ${el === "İşlem" ? "text-right" : ""}`}>
                        <Typography variant="small" className="font-bold uppercase text-blue-gray-400">{el}</Typography>
                      </th>
                  ))}
                </tr>
                </thead>
                <tbody>
                {vehicles.map((vehicle, key) => {
                  const className = `py-3 px-5 ${key === vehicles.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                  return (
                      <tr key={vehicle.id}>
                        <td className={className}>
                          <Typography className="text-sm font-semibold text-blue-gray-600">{vehicle.licensePlate}</Typography>
                        </td>
                        <td className={className}>

                          {/* --- DEĞİŞİKLİK BURADA --- */}
                          {/* Veriyi 'toTitleCase' fonksiyonundan geçiriyoruz */}
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {toTitleCase(vehicle.driverName)}
                          </Typography>

                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500">{vehicle.phoneNumber || "-"}</Typography>
                        </td>
                        {/* İŞLEM LİNKLERİ (Sade Görünüm) */}
                        <td className={`${className} text-right`}>
                          <div className="flex justify-end items-center gap-4">
                            <Typography
                                as="a"
                                href="#"
                                variant="small"
                                color="blue"
                                className="font-semibold uppercase text-xs cursor-pointer hover:underline"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleOpenEditModal(vehicle);
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
                                  handleDeleteToast(vehicle.id, vehicle.licensePlate); // Toast onayını bağladık
                                }}
                            >
                              Sil
                            </Typography>
                          </div>
                        </td>
                      </tr>
                  );
                })}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      </>
  );
}

export default Tables;