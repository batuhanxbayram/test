import React, { useState, useEffect } from "react";
import apiClient from "../../api/axiosConfig"; 

const TVQueuePage = () => {
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

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
    const dataTimer = setInterval(fetchData, 30000);
    const clockTimer = setInterval(() => setTime(new Date()), 1000);
    return () => { clearInterval(dataTimer); clearInterval(clockTimer); };
  }, []);

  useEffect(() => {
    if (data.length > 3) {
      const slideTimer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 3) % data.length);
      }, 60000);
      return () => clearInterval(slideTimer);
    } else {
      setCurrentIndex(0);
    }
  }, [data.length]);

  const getVisibleRoutes = () => {
    if (data.length === 0) return [];
    if (data.length <= 3) return data;
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
        <span className="text-slate-400 font-bold animate-pulse">SİSTEM YÜKLENİYOR...</span>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#E2E8F0] text-[#334155] overflow-hidden flex flex-col p-2 font-sans">
      
      {/* ÜST PANEL - KÜÇÜK VE ŞIK */}
      <div className="flex justify-between items-center px-6 py-2 bg-[#475569] rounded-xl mb-2 shadow-md shrink-0 border-b-2 border-[#334155]">
        <div className="flex items-center gap-4">
          <div className="bg-[#64748B] text-white w-9 h-9 flex items-center justify-center rounded-lg font-black text-lg shadow-inner border border-white/10">
            75
          </div>
          <h1 className="text-sm font-black tracking-widest text-white uppercase antialiased">ARAÇ TAKİP SİSTEMİ</h1>
        </div>
        
        <div className="flex items-center gap-6 text-white text-right">
           <div className="flex flex-col leading-none">
             <span className="text-[16px] font-mono font-black tracking-tighter">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
             <span className="text-[9px] font-bold text-[#BDB2A7] mt-1 uppercase tracking-widest">
               {time.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
             </span>
           </div>
        </div>
      </div>

      {/* ANA GÜZERGAH ALANI */}
      <div className="grid grid-cols-3 gap-3 flex-grow overflow-hidden">
        {currentRoutes.map((route, idx) => (
          <div key={`${currentIndex}-${idx}`} className="flex flex-col bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden h-full">
            
            {/* Güzergah Başlığı */}
            <div className="bg-slate-50 p-3 shrink-0 flex justify-between items-center border-b border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="bg-[#00BFA5] w-2 h-4 rounded-full"></div>
                <h2 className="text-sm font-extrabold text-[#1E293B] uppercase tracking-tight antialiased">
                  {route.routeName}
                </h2>
              </div>
              <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100 uppercase">
                {route.vehicles.length} ARAÇ
              </span>
            </div>

            {/* PLAKA LİSTESİ - MODERN YAZI STİLİ */}
            <div className="p-2 grid grid-cols-3 gap-x-2 h-full overflow-hidden bg-[#FDFCFB]">
              {[0, 1, 2].map((colIndex) => (
                <div key={colIndex} className="flex flex-col h-full space-y-0.5">
                  {Array.from({ length: 34 }).map((_, rowIndex) => {
                    const vehicleIndex = colIndex * 34 + rowIndex;
                    const vehicle = route.vehicles && route.vehicles[vehicleIndex];
                    if (vehicleIndex >= 100) return null;

                    return (
                      <div 
                        key={vehicleIndex} 
                        className={`flex items-center gap-2 px-2 transition-all duration-300 ${vehicle ? "bg-[#F1F5F9] rounded border border-slate-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.05)]" : "border-b border-transparent"}`}
                        style={{ height: 'calc(100% / 34.5)' }}
                      >
                        {/* Sıra Numarası - Sabit ve Net */}
                        <span className="text-[9px] font-black text-slate-400 w-4 text-right shrink-0 font-mono tracking-tighter">
                          {String(vehicleIndex + 1).padStart(2, '0')}
                        </span>
                        
                        {/* PLAKA - GÜÇLENDİRİLMİŞ STİL */}
                        <span className={`font-mono text-[13px] truncate leading-none antialiased ${vehicle ? "font-black text-[#1E293B] tracking-wider uppercase drop-shadow-sm" : "invisible"}`}>
                          {vehicle ? vehicle.plate : ""}
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

      {/* ALT BİLGİ */}
      <div className="mt-2 flex justify-between items-center px-4 py-1">
        <div className="flex gap-1.5">
          {[...Array(Math.ceil(data.length / 3))].map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${Math.floor(currentIndex/3) === i ? 'w-10 bg-[#00BFA5]' : 'w-2 bg-slate-300'}`}></div>
          ))}
        </div>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Canlı Sevkiyat Verisi</span>
      </div>
    </div>
  );
};

export default TVQueuePage;