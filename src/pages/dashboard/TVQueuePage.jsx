import React, { useState, useEffect } from "react";
import apiClient from "../../api/axiosConfig"; 

const TVQueuePage = () => {
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // 1. GERÇEK VERİ ÇEKME FONKSİYONU
  const fetchData = async () => {
    try {
      const routesRes = await apiClient.get("/admin/routes");
      const routes = routesRes.data;

      if (!routes || routes.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      const fullData = await Promise.all(
        routes.map(async (route) => {
          try {
            const queueRes = await apiClient.get(`/routes/${route.id}/queue`);
            return {
              routeName: route.routeName,
              vehicles: queueRes.data.map((v) => ({ plate: v.licensePlate })),
            };
          } catch (err) {
            return { routeName: route.routeName, vehicles: [] };
          }
        })
      );

      setData(fullData);
    } catch (err) {
      console.error("Veri çekme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const dataTimer = setInterval(fetchData, 30000); // 30 saniyede bir veri yenileme
    const clockTimer = setInterval(() => setTime(new Date()), 1000);
    return () => { clearInterval(dataTimer); clearInterval(clockTimer); };
  }, []);

  // 🔄 AKILLI SAYFA DEĞİŞTİRME (Döngüsel Geçiş)
  useEffect(() => {
    if (data.length > 3) {
      const slideTimer = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          // Bir sonraki 3'lü gruba geç ama toplam sayıya göre mod al (başa döner)
          return (prevIndex + 3) % data.length;
        });
      }, 60000); // Her 60 saniyede bir sayfa değişir
      return () => clearInterval(slideTimer);
    } else {
      setCurrentIndex(0);
    }
  }, [data.length]);

  // 🛡️ MATEMATİKSEL SİHİR: Ekranı her zaman 3 güzergahla dolu tutar
  const getVisibleRoutes = () => {
    if (data.length === 0) return [];
    if (data.length <= 3) return data;

    // Dairesel seçim: Liste bitse bile başa dönerek 3 slotu tamamlar
    return [
      data[currentIndex % data.length],
      data[(currentIndex + 1) % data.length],
      data[(currentIndex + 2) % data.length]
    ];
  };

  const currentRoutes = getVisibleRoutes();

  if (loading && data.length === 0) {
    return (
      <div className="h-screen w-screen bg-[#F1F5F9] flex items-center justify-center">
        <span className="text-slate-400 font-bold animate-pulse uppercase tracking-widest">Sistem Hazırlanıyor...</span>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#F1F5F9] text-slate-900 overflow-hidden flex flex-col p-0.5 font-sans">
      
      {/* ÜST PANEL */}
      <div className="flex justify-between items-center px-4 py-1 bg-white shadow-sm border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-[#1E293B] text-white px-2 rounded font-black italic text-xs shadow-sm">75</div>
          <h1 className="text-sm font-black text-[#1E293B] uppercase tracking-tighter italic">CANLI ARAÇ TAKİP SİSTEMİ</h1>
        </div>
        <div className="flex items-center gap-6">
           <span className="text-[10px] font-black text-green-700 bg-green-100 px-3 py-0.5 rounded-full shadow-inner animate-pulse">
             SİSTEM AKTİF
           </span>
           <div className="text-2xl font-mono font-black text-[#1E293B] tracking-tighter">
             {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
           </div>
        </div>
      </div>

      {/* ANA GÜZERGAH ALANI (Her zaman 3 Sütun Dolu) */}
      <div className="grid grid-cols-3 gap-1 flex-grow overflow-hidden p-1 text-center">
        {currentRoutes.map((route, idx) => (
          <div key={`${currentIndex}-${idx}`} className="flex flex-col bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden h-full transition-all">
            
            {/* Güzergah Başlığı */}
            <div className="bg-[#1E293B] py-2 shrink-0 border-b-2 border-blue-500 shadow-md">
              <h2 className="text-[13px] font-black text-white uppercase tracking-widest leading-none">
                {route.routeName}
              </h2>
              <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{route.vehicles.length} ARAÇ SIRADA</p>
            </div>

            {/* 3 İÇ SÜTUNLU PLAKA MATRİSİ */}
            <div className="p-0.5 grid grid-cols-3 gap-x-0.5 h-full overflow-hidden">
              {[0, 1, 2].map((colIndex) => (
                <div key={colIndex} className="flex flex-col h-full border-r border-slate-100 last:border-0">
                  {Array.from({ length: 34 }).map((_, rowIndex) => {
                    const vehicleIndex = colIndex * 34 + rowIndex;
                    const vehicle = route.vehicles && route.vehicles[vehicleIndex];
                    
                    if (vehicleIndex >= 100) return null;

                    return (
                      <div 
                        key={vehicleIndex} 
                        className={`flex items-center gap-1 px-1 transition-all flex-grow ${vehicle ? "bg-slate-50 border-b border-slate-100" : "opacity-5"}`}
                        style={{ height: 'calc(100% / 34)' }}
                      >
                        <span className="text-[9px] font-bold text-slate-400 w-4 text-right shrink-0">
                          {vehicleIndex + 1}
                        </span>
                        <span className={`font-mono text-[13px] truncate tracking-tighter leading-none ${vehicle ? "font-black text-slate-900" : "font-normal text-slate-200"}`}>
                          {vehicle ? vehicle.plate : "-"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TVQueuePage;