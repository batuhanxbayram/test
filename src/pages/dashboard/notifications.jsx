import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Button,
} from "@material-tailwind/react";
import apiClient from "../../api/axiosConfig.js"; // apiClient yolunu projenize göre güncelleyin
import { AddRouteModal } from "@/widgets/layout/AddRouteModal.jsx"; // 1. Yeni modal'ı import et

export function Notifications() {
  const [routes, setRoutes] = useState([]);
  // 2. Modal'ın görünürlüğünü kontrol etmek için state ekle
  const [openAddModal, setOpenAddModal] = useState(false);

  // Modal'ı açıp kapatan fonksiyon
  const handleOpenAddModal = () => setOpenAddModal(!openAddModal);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await apiClient.get("/admin/routes");
        setRoutes(response.data);
      } catch (error) {
        console.error("Güzergahları çekerken hata oluştu:", error);
      }
    };
    fetchRoutes();
  }, []);

  const handleDelete = async (routeId) => {
    if (window.confirm("Bu güzergahı silmek istediğinizden emin misiniz?")) {
      try {
        await apiClient.delete(`/admin/routes/${routeId}`);
        setRoutes(routes.filter((route) => route.id !== routeId));
        alert("Güzergah başarıyla silindi.");
      } catch (error) {
        console.error("Güzergah silinirken hata oluştu:", error);
      }
    }
  };

  // 3. Yeni güzergah eklendiğinde listeyi güncelleyen callback fonksiyonu
  const handleRouteAdded = (newRoute) => {
    setRoutes(prevRoutes => [...prevRoutes, newRoute]);
  };

  // Düzenleme fonksiyonunu şimdilik placeholder olarak bırakıyoruz.
  // Bunun için de ayrı bir "EditRouteModal" bileşeni oluşturulabilir.
  const handleEditRoute = (route) => {
    alert(`Düzenleme işlemi için "${route.routeName}" seçildi. (Modal eklenecek)`);
  };

  return (
      <>
        {/* 4. Modal bileşenini sayfaya ekle ve proplarını ver */}
        <AddRouteModal
            open={openAddModal}
            handleOpen={handleOpenAddModal}
            onRouteAdded={handleRouteAdded}
        />

        <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
          <Card>
            <CardHeader
                variant="gradient"
                color="gray"
                className="mb-4 p-6 flex justify-between items-center"
            >
              <Typography variant="h6" color="white">
                Güzergahlar
              </Typography>
              {/* 5. Butonun onClick olayını modal'ı açacak şekilde güncelle */}
              <Button
                  size="sm"
                  className="bg-green-700 text-white hover:bg-green-800"
                  onClick={handleOpenAddModal}
              >
                Güzergah Ekle
              </Button>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[400px] table-auto">
                <thead>
                <tr>
                  {["Güzergah", "İşlem"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                        <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                          {el}
                        </Typography>
                      </th>
                  ))}
                </tr>
                </thead>
                <tbody>
                {routes.map((route) => (
                    <tr key={route.id}>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          {route.routeName}
                        </Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50 text-right space-x-1">
                        <Button size="sm" variant="text" color="blue" onClick={() => handleEditRoute(route)}>
                          Düzenle
                        </Button>
                        <Button size="sm" variant="text" color="red" onClick={() => handleDelete(route.id)}>
                          Sil
                        </Button>
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

export default Notifications;