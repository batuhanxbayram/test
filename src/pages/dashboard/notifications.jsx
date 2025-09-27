import React, { useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
} from "@material-tailwind/react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Örnek güzergah verisi
const initialRoutesData = [
  { id: 1, route: "İstanbul - Ankara" },
  { id: 2, route: "İzmir - Antalya" },
  { id: 3, route: "Bursa - Eskişehir" },
];

const generateId = () => Date.now();

export function Notifications() {
  const [routesData, setRoutesData] = useState(initialRoutesData);
  const [openModal, setOpenModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [routeInput, setRouteInput] = useState("");

  const handleOpenModal = () => setOpenModal((cur) => !cur);

  // ------------------------------------
  // İşlem Fonksiyonları (Önceki kodla aynı, sadece buton tetikleyicileri değişti)
  // ------------------------------------

  const handleNewRouteClick = () => {
    setEditingRoute(null);
    setRouteInput("");
    handleOpenModal();
  };

  const handleEditRouteClick = (routeObj) => {
    setEditingRoute(routeObj);
    setRouteInput(routeObj.route);
    handleOpenModal();
  };

  const handleSubmit = () => {
    if (!routeInput.trim()) {
      toast.error("Güzergah adı boş bırakılamaz!", { position: "top-right" });
      return;
    }

    if (editingRoute) {
      // DÜZENLEME İŞLEMİ
      const updatedRoutes = routesData.map(r => 
        r.id === editingRoute.id ? { ...r, route: routeInput } : r
      );
      setRoutesData(updatedRoutes);
      
      // Başarı Toast Bildirimi
      toast.success(`Güzergah bilgileri başarıyla düzenlendi!`, {
        position: "top-right",
      });
    } else {
      // EKLEME İŞLEMİ
      const newRoute = { id: generateId(), route: routeInput };
      setRoutesData([...routesData, newRoute]);
      
      // Başarı Toast Bildirimi
      toast.success(`'${routeInput}' güzergahı başarıyla eklendi!`, {
        position: "top-right",
      });
    }

    handleOpenModal();
  };

  const handleDeleteRoute = (id, routeName) => {
    toast.warn(
      <div className="flex flex-col">
        <p className="text-sm">
          **{routeName}** güzergahını silmek istediğinize emin misiniz?
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <Button 
            size="sm"
            color="red" 
            onClick={() => confirmDelete(id, routeName)}
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

  const confirmDelete = (id, routeName) => {
    toast.dismiss(); 
    setRoutesData(routesData.filter(route => route.id !== id));
    toast.error(`${routeName} güzergahı başarıyla silindi.`, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  // ------------------------------------
  // JSX Render Bölümü
  // ------------------------------------
  return (
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
      
      <ToastContainer />

      <Card>
        {/* Başlık ve Ekle butonu */}
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-4 p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            Güzergahlar
          </Typography>
          <Button 
            size="sm" 
            className="bg-green-700 text-white hover:bg-green-800"
            onClick={handleNewRouteClick}
          >
            Güzergah Ekle
          </Button>
        </CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {/* Güzergah Tablosu */}
          <table className="w-full min-w-[400px] table-auto">
            <thead>
              <tr>
                {["Güzergah", "İşlem"].map((el) => (
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
              {routesData.map((routeObj, key) => {
                const className = `py-3 px-5 ${
                  key === routesData.length - 1 ? "" : "border-b border-blue-gray-50"
                }`;

                return (
                  <tr key={routeObj.id}>
                    {/* Güzergah Adı */}
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        {routeObj.route}
                      </Typography>
                    </td>

                    {/* İŞLEM LİNKLERİ (Görseldeki gibi) */}
                    <td className={`${className} text-right`}>
                      <div className="flex justify-end items-center gap-4">
                        
                        {/* DÜZENLE LİNKİ */}
                        <Typography
                          as="a" // a etiketi gibi davranması için
                          href="#"
                          variant="small"
                          color="blue" // Mavi renk
                          className="font-semibold uppercase text-xs cursor-pointer hover:underline"
                          onClick={(e) => {
                            e.preventDefault(); // Sayfanın yukarı kaymasını engelle
                            handleEditRouteClick(routeObj);
                          }}
                        >
                          Düzenle
                        </Typography>

                        {/* SİL LİNKİ */}
                        <Typography
                          as="a" // a etiketi gibi davranması için
                          href="#"
                          variant="small"
                          color="red" // Kırmızı renk
                          className="font-semibold uppercase text-xs cursor-pointer hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteRoute(routeObj.id, routeObj.route);
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

      {/* EKLEME / DÜZENLEME MODAL'I (Aynı kaldı) */}
      <Dialog open={openModal} handler={handleOpenModal} size="xs">
        <DialogHeader>
          {editingRoute ? "Güzergahı Düzenle" : "Yeni Güzergah Ekle"}
        </DialogHeader>
        <DialogBody divider>
          <div className="flex flex-col gap-4">
            <Typography variant="small">
              Güzergah Adı (Örn: İstanbul - Ankara)
            </Typography>
            <Input
              label="Güzergah"
              value={routeInput}
              onChange={(e) => setRouteInput(e.target.value)}
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
            <span>{editingRoute ? "Kaydet" : "Ekle"}</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Notifications;