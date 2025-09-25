// src/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Home() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Veritabanından güzergah verilerini çeken gerçek API çağrısı
    fetch("/api/routes")
      .then(response => {
        if (!response.ok) {
          throw new Error("Güzergah verileri çekilirken bir hata oluştu.");
        }
        return response.json();
      })
      .then(data => {
        setRoutes(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("API hatası:", error);
        setLoading(false); // Hata durumunda da yükleniyor durumunu sonlandır
      });

    // ÖNEMLİ: Yukarıdaki fetch satırını, kendi .NET Core API'nızdaki
    // güzergahları listeleyen GET endpoint'inin URL'siyle değiştirin.
    // Örnek: "https://localhost:7000/api/routes"
  }, []);

  const handleGoToAddVehicles = (routeId) => {
    navigate(`/add-vehicle/${routeId}`);
  };

  return (
    <div className="mt-12 p-4">
      <h1 className="text-2xl font-bold mb-6">Güzergah Listesi</h1>
      {loading ? (
        <p>Güzergahlar yükleniyor...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.length > 0 ? (
            routes.map((route) => (
              <div key={route.id} className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold">{route.routeName}</h2>
                <button
                  onClick={() => handleGoToAddVehicles(route.id)}
                  className="bg-blue-500 text-white w-10 h-10 flex items-center justify-center rounded-full text-2xl font-bold hover:bg-blue-600 transition-colors"
                  title="Araç Ekle"
                >
                  +
                </button>
              </div>
            ))
          ) : (
            <p>Hiç güzergah bulunamadı.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;