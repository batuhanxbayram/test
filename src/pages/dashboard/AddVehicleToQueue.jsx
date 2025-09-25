// src/AddVehicleToQueue.jsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export function AddVehicleToQueue() {
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bu sayfa için de tüm güzergahları ve tüm araçları çekiyoruz
  useEffect(() => {
    // Tüm güzergahları çekme
    fetch("/api/routes")
      .then(res => res.json())
      .then(data => setRoutes(data))
      .catch(err => console.error("Güzergahlar çekilemedi:", err));

    // Tüm araçları çekme (boşta olanlar dahil)
    fetch("/api/vehicles")
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(err => console.error("Araçlar çekilemedi:", err));

    setLoading(false);
  }, []);

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
  };

  const handleAddVehicle = (vehicleId) => {
    if (!selectedRoute) {
      alert("Lütfen bir güzergah seçin.");
      return;
    }
    
    // API'ye araç ekleme isteği gönderir
    // Bu isteğe routeId ve vehicleId bilgilerini gönderiyoruz
    fetch(`/api/routes/${selectedRoute.id}/add-vehicle/${vehicleId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Eğer API'nız body bekliyorsa buraya `{ routeId: selectedRoute.id, vehicleId: vehicleId }` gibi bir JSON nesnesi ekleyebilirsiniz.
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Araç eklenirken hata oluştu.");
        }
        return response.json();
      })
      .then(newQueueItem => {
        alert(`Araç başarıyla ${selectedRoute.routeName} güzergahına eklendi!`);
        // Eğer seçilen güzergahı güncel tutmak isterseniz
        // selectedRoute.RouteVehicleQueues'ı güncelleyebilirsiniz.
      })
      .catch(error => {
        console.error("API hatası:", error);
        alert("Araç eklenirken bir hata oluştu.");
      });
  };

  if (loading) {
    return <p>Yükleniyor...</p>;
  }

  return (
    <div className="mt-12 p-4">
      <h1 className="text-2xl font-bold mb-6">Sıraya Araç Ekle</h1>
      <div className="flex">
        {/* Sol Kısım: Güzergahlar */}
        <div className="w-1/2 p-4 border-r border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Güzergah Seçin</h2>
          {routes.map((route) => (
            <div
              key={route.id}
              className={`bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer hover:bg-gray-100 ${
                selectedRoute && selectedRoute.id === route.id ? "border-2 border-blue-500" : ""
              }`}
              onClick={() => handleRouteSelect(route)}
            >
              <h3 className="text-lg font-medium">{route.routeName}</h3>
            </div>
          ))}
        </div>

        {/* Sağ Kısım: Araç Listesi */}
        <div className="w-1/2 p-4">
          <h2 className="text-xl font-semibold mb-4">Eklenecek Araçlar</h2>
          {selectedRoute ? (
            <div>
              <h3 className="text-lg font-bold mb-4">
                Seçilen Güzergah: {selectedRoute.routeName}
              </h3>
              <ul className="list-disc pl-5">
                {vehicles.map((vehicle) => (
                  <li key={vehicle.id} className="mb-2 flex justify-between items-center">
                    <span>{vehicle.licensePlate}</span>
                    <button
                      onClick={() => handleAddVehicle(vehicle.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors"
                    >
                      Ekle
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500">Lütfen soldaki listeden bir güzergah seçin.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddVehicleToQueue;