import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Button,
} from "@material-tailwind/react";
// Projenizdeki apiClient'ın doğru yolunu belirttiğinizden emin olun
import apiClient from "../../api/axiosConfig.js";

export function Notifications() {
  // 1. Güzergahları tutmak için bir state oluştur
  const [routes, setRoutes] = useState([]);

  // 2. Bileşen yüklendiğinde API'den güzergahları çek
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await apiClient.get("/admin/routes");
        setRoutes(response.data); // Gelen veriyi state'e ata
      } catch (error) {
        console.error("Güzergahları çekerken hata oluştu:", error);
        alert("Güzergahlar yüklenirken bir sorun oluştu.");
      }
    };

    fetchRoutes();
  }, []); // Boş dependency array, fonksiyonun sadece bir kez çalışmasını sağlar

  // 3. Silme işlemi için bir fonksiyon oluştur
  const handleDelete = async (routeId) => {
    if (window.confirm("Bu güzergahı silmek istediğinizden emin misiniz?")) {
      try {
        await apiClient.delete(`/admin/routes/${routeId}`);
        // Arayüzü anında güncellemek için silinen güzergahı state'ten çıkar
        setRoutes(routes.filter((route) => route.id !== routeId));
        alert("Güzergah başarıyla silindi.");
      } catch (error) {
        console.error("Güzergah silinirken hata oluştu:", error);
        alert("Güzergah silinirken bir hata meydana geldi.");
      }
    }
  };

  // 4. Ekleme ve düzenleme için placeholder fonksiyonlar
  // Bu fonksiyonlar ileride modal veya yeni sayfa açarak kullanılabilir.
  const handleAddRoute = () => {
    // Örnek: prompt ile kullanıcıdan veri alıp API'ye POST isteği gönderme
    const routeName = prompt("Yeni güzergah adını giriniz:");
    if (routeName) {
      apiClient.post('/admin/routes', { routeName: routeName })
          .then(response => {
            // Yeni eklenen güzergahı listeye ekleyerek arayüzü güncelle
            setRoutes([...routes, response.data]);
            alert("Güzergah başarıyla eklendi.");
          })
          .catch(error => {
            console.error("Güzergah eklenirken hata:", error);
            alert(`Hata: ${error.response?.data || "İstek başarısız oldu."}`);
          });
    }
  };

  const handleEditRoute = (route) => {
    const newRouteName = prompt("Güzergah adını düzenleyin:", route.routeName);
    if (newRouteName && newRouteName !== route.routeName) {
      // isActive durumunu koruyarak sadece routeName'i güncelle
      const updateData = { routeName: newRouteName, isActive: route.isActive };
      apiClient.put(`/admin/routes/${route.id}`, updateData)
          .then(() => {
            // Arayüzü güncelle
            setRoutes(routes.map(r => r.id === route.id ? { ...r, routeName: newRouteName } : r));
            alert("Güzergah başarıyla güncellendi.");
          })
          .catch(error => {
            console.error("Güzergah güncellenirken hata:", error);
            alert("Güzergah güncellenirken bir hata oluştu.");
          });
    }
  };

  return (
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
            <Button
                size="sm"
                className="bg-green-700 text-white hover:bg-green-800"
                onClick={handleAddRoute}
            >
              Güzergah Ekle
            </Button>
          </CardHeader>

          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
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
              {/* 5. Statik veri yerine state'teki 'routes' dizisini map'le */}
              {routes.map((route, key) => {
                const className = `py-3 px-5 ${
                    key === routes.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                }`;

                return (
                    <tr key={route.id}>
                      {/* Güzergah Adı */}
                      <td className={className}>
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          {route.routeName}
                        </Typography>
                      </td>

                      {/* İşlem butonları */}
                      <td className={`${className} text-right space-x-1`}>
                        <Button
                            size="sm"
                            variant="text"
                            color="blue"
                            className="normal-case py-1 px-3"
                            onClick={() => handleEditRoute(route)}
                        >
                          Düzenle
                        </Button>
                        <Button
                            size="sm"
                            variant="text"
                            color="red"
                            className="normal-case py-1 px-3"
                            onClick={() => handleDelete(route.id)}
                        >
                          Sil
                        </Button>
                      </td>
                    </tr>
                );
              })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
  );
}

export default Notifications;