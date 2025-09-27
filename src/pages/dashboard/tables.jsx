import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Dialog, // Modal için
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input, // Form için
} from "@material-tailwind/react";
// Toast bildirimleri için gerekli kütüphaneler
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Örnek araç verisi (Sizin 'authorsTableData' yerine kullanıldı)
// Gerçek projede bu veriyi API'dan çekiyor olmalısınız.
const initialVehiclesData = [
  { id: 1, plaka: "34 ABC 123", driver: "Ahmet Yılmaz", contact: "555-1234" },
  { id: 2, plaka: "06 XYZ 456", driver: "Mehmet Öztürk", contact: "555-5678" },
  { id: 3, plaka: "42 TGS 789", driver: "Ayşe Demir", contact: "555-9012" },
];

const generateId = () => Date.now();

export function Tables() {
  const [vehiclesData, setVehiclesData] = useState(initialVehiclesData);
  const [openModal, setOpenModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null); // Düzenlenen aracı tutar
  
  // Form inputları için state'ler
  const [plakaInput, setPlakaInput] = useState("");
  const [driverInput, setDriverInput] = useState("");

  const handleOpenModal = () => setOpenModal((cur) => !cur);

  // ------------------------------------
  // İşlem Fonksiyonları
  // ------------------------------------

  // "Araç Ekle" butonuna basıldığında
  const handleNewVehicleClick = () => {
    setEditingVehicle(null); // Ekleme modu
    setPlakaInput("");
    setDriverInput("");
    handleOpenModal();
  };

  // "Düzenle" linkine basıldığında
  const handleEditVehicleClick = (vehicleObj) => {
    setEditingVehicle(vehicleObj); // Düzenleme modu
    setPlakaInput(vehicleObj.plaka);
    setDriverInput(vehicleObj.driver);
    handleOpenModal();
  };

  // Formu kaydetme/gönderme işlemi
  const handleSubmit = () => {
    if (!plakaInput.trim() || !driverInput.trim()) {
      toast.error("Plaka ve Şoför alanı boş bırakılamaz!", { position: "top-right" });
      return;
    }

    if (editingVehicle) {
      // DÜZENLEME İŞLEMİ
      const updatedVehicles = vehiclesData.map(v => 
        v.id === editingVehicle.id ? { ...v, plaka: plakaInput, driver: driverInput } : v
      );
      setVehiclesData(updatedVehicles);
      
      // Başarı Toast Bildirimi
      toast.success(`'${plakaInput}' plakalı araç bilgileri düzenlendi!`, {
        position: "top-right",
      });
    } else {
      // EKLEME İŞLEMİ
      const newVehicle = { id: generateId(), plaka: plakaInput, driver: driverInput };
      setVehiclesData([...vehiclesData, newVehicle]);
      
      // Başarı Toast Bildirimi
      toast.success(`'${plakaInput}' plakalı yeni araç eklendi!`, {
        position: "top-right",
      });
    }

    handleOpenModal();
  };

  // Silme Onayı Toast'ı
  const handleDeleteVehicle = (id, plaka) => {
    toast.warn(
      <div className="flex flex-col">
        <p className="text-sm">
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

  // Silme Onaylandıktan Sonraki İşlem
  const confirmDelete = (id, plaka) => {
    toast.dismiss(); 
    setVehiclesData(vehiclesData.filter(v => v.id !== id));
    toast.error(`${plaka} plakalı araç başarıyla silindi.`, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  // ------------------------------------
  // JSX Render Bölümü
  // ------------------------------------
  return (
    // 'max-w-screen-2xl' sınıfını burada da kullanıyoruz
    <div className="mx-auto my-12 flex max-w-screen-2xl flex-col gap-12"> 
      
      <ToastContainer />

      <Card>
        {/* Başlık ve Ekle butonu */}
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-4 p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            Araçlar
          </Typography>
          <Button 
            size="sm" 
            className="bg-green-700 text-white hover:bg-green-800"
            onClick={handleNewVehicleClick} // Ekleme Modal'ını açar
          >
            Araç Ekle
          </Button>
        </CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[500px] table-auto">
            <thead>
              <tr>
                {["Araç Plakası", "Şoför", "İşlem"].map((el) => (
                  <th
                    key={el}
                    className={`border-b border-blue-gray-50 py-3 px-5 ${
                      el === "İşlem" ? "text-right" : "text-left"
                    }`}
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* authorsTableData yerine kendi state'imizi kullandık */}
              {vehiclesData.map((vehicleObj, key) => {
                const className = `py-3 px-5 ${
                  key === vehiclesData.length - 1 ? "" : "border-b border-blue-gray-50"
                }`;

                return (
                  <tr key={vehicleObj.id}>
                    {/* Araç Plaka */}
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        {vehicleObj.plaka}
                      </Typography>
                    </td>

                    {/* Şoför */}
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {vehicleObj.driver}
                      </Typography>
                    </td>

                    {/* İŞLEM LİNKLERİ (Güzergahlar sayfasındaki gibi sade linkler) */}
                    <td className={`${className} text-right`}>
                      <div className="flex justify-end items-center gap-4">
                        
                        {/* DÜZENLE LİNKİ */}
                        <Typography
                          as="a"
                          href="#"
                          variant="small"
                          color="blue"
                          className="font-semibold uppercase text-xs cursor-pointer hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            handleEditVehicleClick(vehicleObj); // Düzenleme Modal'ını açar
                          }}
                        >
                          Düzenle
                        </Typography>

                        {/* SİL LİNKİ */}
                        <Typography
                          as="a"
                          href="#"
                          variant="small"
                          color="red"
                          className="font-semibold uppercase text-xs cursor-pointer hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteVehicle(vehicleObj.id, vehicleObj.plaka); // Silme Onayı Toast'ını açar
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

      {/* ------------------------------------ */}
      {/* EKLEME / DÜZENLEME MODAL'I */}
      {/* ------------------------------------ */}
      <Dialog open={openModal} handler={handleOpenModal} size="sm">
        <DialogHeader>
          {editingVehicle ? "Aracı Düzenle" : "Yeni Araç Ekle"}
        </DialogHeader>
        <DialogBody divider>
          <div className="flex flex-col gap-4">
            <Input
              label="Araç Plakası"
              value={plakaInput}
              onChange={(e) => setPlakaInput(e.target.value.toUpperCase())}
              required
            />
            <Input
              label="Şoför Adı Soyadı"
              value={driverInput}
              onChange={(e) => setDriverInput(e.target.value)}
              required
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleOpenModal}
            className="mr-1"
          >
            <span>İptal</span>
          </Button>
          <Button variant="gradient" color="green" onClick={handleSubmit}>
            <span>{editingVehicle ? "Kaydet" : "Ekle"}</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Tables;