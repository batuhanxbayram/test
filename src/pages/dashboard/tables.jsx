import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";

import apiClient from "../../api/axiosConfig.js";

export function Tables() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {

    const fetchVehicles = async () => {
      try {

        const response = await apiClient.get("/admin/vehicles");


        setVehicles(response.data);
      } catch (error) {
        console.error("Araçları çekerken bir hata oluştu:", error);

      }
    };

    fetchVehicles();
  }, []);


  const handleDelete = async (id) => {
    if (window.confirm("Bu aracı silmek istediğinizden emin misiniz?")) {
      try {

        await apiClient.delete(`/admin/vehicles/${id}`);

        setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
        alert("Araç başarıyla silindi.");

      } catch (error) {
        console.error("Araç silinirken hata:", error);
        alert("Araç silinirken bir hata oluştu.");
      }
    }
  };

  const handleEdit = (vehicle) => {
    console.log("Düzenlenecek Araç:", vehicle);
    alert(`Düzenleme işlemi için ID: ${vehicle.id}`);
  };

  const handleAdd = () => {
    console.log("Araç Ekle butonuna tıklandı.");
  };


  return (
      <div className="mt-12 mb-8 flex flex-col gap-12">
        <Card>
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
                onClick={handleAdd}
            >
              Araç Ekle
            </Button>
          </CardHeader>

          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
              <tr>
                {["Plaka", "Şoför Adı", "Telefon", "İşlem"].map((el) => (
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
              {vehicles.map((vehicle, key) => {
                const className = `py-3 px-5 ${
                    key === vehicles.length - 1 ? "" : "border-b border-blue-gray-50"
                }`;

                return (
                    <tr key={vehicle.id}>
                      <td className={className}>
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          {vehicle.licensePlate}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {vehicle.driverName || vehicle.userFullName || "-"}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {vehicle.phoneNumber || "-"}
                        </Typography>
                      </td>
                      <td className={`${className} text-right space-x-1`}>
                        <Button
                            size="sm"
                            variant="text"
                            color="blue"
                            className="normal-case py-1 px-3"
                            onClick={() => handleEdit(vehicle)}
                        >
                          Düzenle
                        </Button>
                        <Button
                            size="sm"
                            variant="text"
                            color="red"
                            className="normal-case py-1 px-3"
                            onClick={() => handleDelete(vehicle.id)}
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

export default Tables;