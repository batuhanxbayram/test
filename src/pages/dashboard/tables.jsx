import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Tooltip
} from "@material-tailwind/react";
import {
  ExclamationTriangleIcon,
  ArchiveBoxXMarkIcon,
  EyeSlashIcon
} from "@heroicons/react/24/solid";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import apiClient from "../../api/axiosConfig.js";
import { AddVehicleModal } from "@/widgets/layout/AddVehicleModal";
import { EditVehicleModal } from "@/widgets/layout/EditVehicleModal";

// --- YARDIMCI FONKSİYON ---
const toTitleCase = (str) => {
  if (!str) return "";
  return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
};

export function Tables() {
  const [vehicles, setVehicles] = useState([]);
  const [idleVehicles, setIdleVehicles] = useState([]);

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

  // --- VERİ ÇEKME ---
  const fetchVehicles = async () => {
    try {
      const response = await apiClient.get("/admin/vehicles");
      setVehicles(response.data);
    } catch (error) {
      console.error("Hata:", error);
      toast.error("Araç listesi yüklenemedi.");
    }
  };

  const fetchIdleVehicles = async () => {
    try {
      // Backend endpoint'i (Varsayılan 7 gün)
      const response = await apiClient.get("/admin/vehicles/idle-warnings?days=0");
      setIdleVehicles(response.data);
    } catch (error) {
      console.error("Uyarı verisi çekilemedi:", error);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchIdleVehicles();
  }, []);

  const handleDataChange = (message) => {
    fetchVehicles();
    fetchIdleVehicles();
    if(message) toast.success(message, { position: "top-right", autoClose: 3000 });
  };

  // --- AKSİYONLAR (UYARI TABLOSU) ---
  const handleSetPassive = async (vehicle) => {
    try {
      await apiClient.patch(`/admin/vehicles/${vehicle.id}/set-active`, { isActive: false });
      toast.info(`${vehicle.licensePlate} pasife alındı.`);
      setIdleVehicles(prev => prev.filter(v => v.id !== vehicle.id));
      fetchVehicles();
    } catch (error) {
      toast.error("İşlem başarısız.");
    }
  };

  const handleIgnoreWarning = (vehicleId) => {
    setIdleVehicles(prev => prev.filter(v => v.id !== vehicleId));
    toast.success("Uyarı listeden kaldırıldı.", { autoClose: 1000 });
  };

  // --- SİLME (ANA TABLO) ---
  const handleDeleteToast = (id, plaka) => {
    toast.warn(
        <div className="flex flex-col">
          <p className="text-sm font-bold">**{plaka}** silinsin mi?</p>
          <div className="flex justify-end gap-2 mt-2">
            <Button size="sm" color="red" onClick={() => confirmDelete(id, plaka)} className="py-1 px-2">Evet</Button>
            <Button size="sm" variant="text" color="white" onClick={() => toast.dismiss()} className="py-1 px-2">Hayır</Button>
          </div>
        </div>,
        { position: "top-center", autoClose: false, closeOnClick: false }
    );
  };

  const confirmDelete = async (id, plaka) => {
    toast.dismiss();
    try {
      await apiClient.delete(`/admin/vehicles/${id}`);
      handleDataChange(`${plaka} silindi.`);
    } catch (error) {
      toast.error("Silme işlemi başarısız.");
    }
  };

  return (
      <>
        <ToastContainer />

        <AddVehicleModal
            open={addModalOpen}
            handleOpen={handleOpenAddModal}
            onVehicleAdded={() => handleDataChange()}
        />
        <EditVehicleModal
            open={editModalOpen}
            handleOpen={handleCloseEditModal}
            onVehicleUpdated={() => handleDataChange()}
            vehicleToEdit={currentVehicle}
        />

        <div className="mt-12 mb-8 flex flex-col gap-12">

          {/* ==========================
              1. ANA ARAÇ TABLOSU
             ========================== */}
          <Card>
            <CardHeader variant="gradient" color="gray" className="mb-4 p-6 flex justify-between items-center">
              <Typography variant="h6" color="white">Araç Listesi</Typography>
              <Button size="sm" color="white" variant="text" className="flex items-center gap-2 border border-white/20 hover:bg-white/10" onClick={handleOpenAddModal}>
                + Yeni Ekle
              </Button>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                <tr>
                  {["Plaka", "Şoför Adı", "Telefon", "Durum", "İşlem"].map((el) => (
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
                      <tr key={vehicle.id} className="hover:bg-blue-gray-50/50 transition-colors">
                        <td className={className}>
                          <Typography className="text-sm font-semibold text-blue-gray-600">{vehicle.licensePlate}</Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500">{toTitleCase(vehicle.driverName)}</Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500">{vehicle.phoneNumber || "-"}</Typography>
                        </td>
                        <td className={className}>
                          <Chip
                              variant="ghost"
                              size="sm"
                              value={vehicle.isActive ? "Aktif" : "Pasif"}
                              color={vehicle.isActive ? "green" : "blue-gray"}
                              className="w-max font-bold"
                          />
                        </td>
                        <td className={`${className} text-right`}>
                          <div className="flex justify-end items-center gap-2">
                            <Button size="sm" variant="text" color="blue" onClick={() => handleOpenEditModal(vehicle)}>Düzenle</Button>
                            <Button size="sm" variant="text" color="red" onClick={() => handleDeleteToast(vehicle.id, vehicle.licensePlate)}>Sil</Button>
                          </div>
                        </td>
                      </tr>
                  );
                })}
                {vehicles.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500">Kayıtlı araç yok.</td></tr>}
                </tbody>
              </table>
            </CardBody>
          </Card>

          {/* ==========================
              2. UYARI TABLOSU (ARTIK ANA TABLO İLE AYNI STİLDE)
              - Header: Gray (Aynı)
              - Gövde: Beyaz/Gri (Aynı)
             ========================== */}
          {idleVehicles.length > 0 && (
              <Card>
                {/* Header Rengi 'orange' yerine 'gray' yapıldı */}
                <CardHeader variant="gradient" color="gray" className="mb-4 p-6 flex items-center gap-4">
                  {/* İkon hala var ama uyumlu duruyor */}
                  <ExclamationTriangleIcon className="h-6 w-6 text-white opacity-80" />
                  <div>
                    <Typography variant="h6" color="white">Hareketsiz Araçlar</Typography>
                    <Typography variant="small" color="white" className="opacity-70 font-normal">
                      Son 7 gündür işlem görmeyen (sırası değişmeyen) araçlar.
                    </Typography>
                  </div>
                </CardHeader>

                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                  <table className="w-full min-w-[640px] table-auto">
                    <thead>
                    <tr>
                      {["Plaka", "Şoför Adı", "Telefon", "Aksiyon"].map((el) => (
                          // Border rengi ana tabloyla eşitlendi: border-blue-gray-50
                          <th key={el} className={`border-b border-blue-gray-50 py-3 px-5 text-left ${el === "Aksiyon" ? "text-right" : ""}`}>
                            <Typography variant="small" className="font-bold uppercase text-blue-gray-400">{el}</Typography>
                          </th>
                      ))}
                    </tr>
                    </thead>
                    <tbody>
                    {idleVehicles.map((vehicle, key) => {
                      // Border rengi ana tabloyla eşitlendi
                      const className = `py-3 px-5 ${key === idleVehicles.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                      return (
                          // Hover efekti ana tabloyla eşitlendi
                          <tr key={`idle-${vehicle.id}`} className="hover:bg-blue-gray-50/50 transition-colors">
                            <td className={className}>
                              <div className="flex items-center gap-2">
                                <Typography className="text-sm font-semibold text-blue-gray-600">{vehicle.licensePlate}</Typography>
                              </div>
                            </td>
                            <td className={className}>
                              <Typography className="text-xs font-normal text-blue-gray-500">{toTitleCase(vehicle.driverName)}</Typography>
                            </td>
                            <td className={className}>
                              <Typography className="text-xs font-normal text-blue-gray-500">{vehicle.phoneNumber || "-"}</Typography>
                            </td>

                            <td className={`${className} text-right`}>
                              <div className="flex justify-end items-center gap-2">

                                <Tooltip content="Aracı Pasife Al">
                                  <Button
                                      size="sm"
                                      color="red"
                                      variant="text"
                                      className="flex items-center gap-2"
                                      onClick={() => handleSetPassive(vehicle)}
                                  >
                                    <ArchiveBoxXMarkIcon className="h-4 w-4" /> Pasife Al
                                  </Button>
                                </Tooltip>

                                <Tooltip content="Uyarıyı Listeden Kaldır">
                                  <Button
                                      size="sm"
                                      variant="text"
                                      color="blue-gray"
                                      className="flex items-center gap-2"
                                      onClick={() => handleIgnoreWarning(vehicle.id)}
                                  >
                                    <EyeSlashIcon className="h-4 w-4" /> Gizle
                                  </Button>
                                </Tooltip>

                              </div>
                            </td>
                          </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </CardBody>
              </Card>
          )}

        </div>
      </>
  );
}

export default Tables;