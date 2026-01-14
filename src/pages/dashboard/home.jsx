import React, { useState, useEffect } from "react";
import { Typography, Card, Spinner, Button, CardHeader, CardBody } from "@material-tailwind/react";
import { ForwardIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import apiClient from "@/api/axiosConfig"; // Yolunu projene göre ayarla
import { useMaterialTailwindController } from "@/context";
import { VehicleQueueCard } from "@/widgets/layout/VehicleQueueCard";

// 1. SignalR Kütüphanesini Çağırıyoruz
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export function Home() {
    const [controller] = useMaterialTailwindController();
    const { userRole } = controller;

    const [routesWithQueues, setRoutesWithQueues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const HUB_URL = "https://localhost:7093/hubs/queue";

    const fetchAllQueues = async () => {
        try {
            const response = await apiClient.get("/queues/all");
            setRoutesWithQueues(response.data);
        } catch (err) {
            console.error(err);
            if (loading) setError("Veri yüklenemedi.");
        } finally {
            if (loading) setLoading(false);
        }
    };

    useEffect(() => {
        // İlk açılışta veriyi çek
        fetchAllQueues();

        // --- SIGNALR BAĞLANTISI ---
        const connection = new HubConnectionBuilder()
            .withUrl(HUB_URL)
            .withAutomaticReconnect() // Bağlantı koparsa (internet giderse) tekrar dene
            .configureLogging(LogLevel.Information)
            .build();

        connection.start()
            .then(() => {
                console.log("🟢 TV Ekranı: SignalR Bağlandı!");

                // Backend'den "ReceiveQueueUpdate" mesajı gelince çalışacak
                connection.on("ReceiveQueueUpdate", () => {
                    console.log("🔔 Güncelleme sinyali geldi! Liste yenileniyor...");
                    fetchAllQueues(); // Verileri sunucudan tekrar iste
                });
            })
            .catch(err => console.error("🔴 SignalR Bağlantı Hatası:", err));

        // Sayfadan çıkınca bağlantıyı kopar
        return () => {
            connection.stop();
        };
        // Not: setInterval artık yok!
    }, []);

    const handleNextVehicle = async (routeId) => {
        try {
            await apiClient.post(`/admin/vehicles/${routeId}/move-first-to-end`);
            // Buradan fetchAllQueues çağırmamıza gerek yok,
            // çünkü Backend işlem bitince SignalR ile "Güncelle" diyecek.
        } catch (error) {
            console.error("Hata:", error);
            alert("İşlem başarısız.");
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Spinner className="h-16 w-16" /></div>;
    if (error) return <Typography color="red" className="mt-12 text-center">{error}</Typography>;

    return (
        <div className="mt-6 md:mt-12">
            <div className="flex flex-col md:flex-row gap-6 pb-4 md:h-[calc(100vh-80px)] md:overflow-x-auto md:overflow-y-hidden">
                {routesWithQueues.map(route => {
                    // Sadece AKTİF olanları göster
                    const activeVehicles = route.queuedVehicles.filter(v => v.isActive);

                    return (
                        <div key={route.routeId} className="w-full md:w-80 flex-shrink-0">
                            <Card className="flex flex-col h-full shadow-lg border border-gray-200 bg-white">
                                <CardHeader variant="gradient" color="gray" className="m-4 p-4 flex items-center justify-between rounded-lg flex-shrink-0">
                                    <div className="flex-1 overflow-hidden">
                                        <Typography variant="h6" color="white" className="truncate" title={route.routeName}>
                                            {route.routeName}
                                        </Typography>
                                        <Typography variant="small" color="white" className="opacity-80">
                                            {activeVehicles.length} Araç
                                        </Typography>
                                    </div>
                                    {userRole === 'admin' && (
                                        <div className="ml-4 flex-shrink-0">
                                            <Button
                                                size="sm"
                                                className="flex items-center gap-2"
                                                onClick={() => handleNextVehicle(route.routeId)}
                                                disabled={activeVehicles.length < 2}
                                            >
                                                <ForwardIcon className="h-4 w-4" /> İlerle
                                            </Button>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardBody className="p-4 pt-0 flex-grow overflow-y-auto">
                                    {activeVehicles.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            {activeVehicles.map((vehicle, index) => (
                                                <VehicleQueueCard key={vehicle.id} vehicle={vehicle} index={index} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-blue-gray-400">
                                            <InformationCircleIcon className="w-12 h-12 mb-2" />
                                            <Typography variant="small" className="font-semibold">Sırada Araç Yok</Typography>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Home;