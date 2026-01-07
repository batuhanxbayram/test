import React, { useState, useEffect } from "react";
import { Typography, Card, Spinner, Button, CardHeader, CardBody } from "@material-tailwind/react";
import { ForwardIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import apiClient from "../../api/axiosConfig.js";
import { useMaterialTailwindController } from "@/context";
import { VehicleQueueCard } from "@/widgets/layout/VehicleQueueCard";

export function Home() {
    const [controller] = useMaterialTailwindController();
    const { userRole } = controller;

    const [routesWithQueues, setRoutesWithQueues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllQueues = async () => {
        try {
            const response = await apiClient.get("/queues/all");
            setRoutesWithQueues(response.data);
        } catch (err) {
            setError("Sıra verileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.");
            console.error(err);
        } finally {
            if (loading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllQueues();
        const interval = setInterval(fetchAllQueues, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleNextVehicle = async (routeId) => {
        try {
            await apiClient.post(`/admin/vehicles/${routeId}/move-first-to-end`);
            await fetchAllQueues();
        } catch (error) {
            console.error("Sıra ilerletilirken hata:", error);
            alert(error.response?.data?.message || "İşlem başarısız oldu.");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Spinner className="h-16 w-16" /></div>;
    }

    if (error) {
        return <Typography color="red" className="mt-12 text-center">{error}</Typography>;
    }

    return (
        <div className="mt-6 md:mt-12">
            <div className="flex flex-col md:flex-row gap-6 pb-4 md:h-[calc(100vh-80px)] md:overflow-x-auto md:overflow-y-hidden">
                {routesWithQueues.map(route => {

                    // --- DEĞİŞİKLİK BURADA BAŞLIYOR ---
                    // Her turda önce sadece AKTİF araçları filtreleyip bir değişkene atıyoruz.
                    // Artık aşağıdaki tüm UI elemanları bu 'activeVehicles' listesini kullanacak.
                    const activeVehicles = route.queuedVehicles.filter(vehicle => vehicle.isActive);
                    // -----------------------------------

                    return (
                        <div key={route.routeId} className="w-full md:w-80 flex-shrink-0">
                            <Card className="flex flex-col h-full shadow-lg border border-gray-200 bg-white">
                                <CardHeader
                                    variant="gradient"
                                    color="gray"
                                    className="m-4 p-4 flex items-center justify-between rounded-lg flex-shrink-0"
                                >
                                    <div className="flex-1 overflow-hidden">
                                        <Typography variant="h6" color="white" className="truncate" title={route.routeName}>
                                            {route.routeName}
                                        </Typography>
                                        <Typography variant="small" color="white" className="opacity-80">
                                            {/* Burada da sadece aktif araç sayısını gösteriyoruz */}
                                            {activeVehicles.length} Araç
                                        </Typography>
                                    </div>
                                    {userRole === 'admin' && (
                                        <div className="ml-4 flex-shrink-0">
                                            <Button
                                                size="sm"
                                                className="flex items-center gap-2"
                                                onClick={() => handleNextVehicle(route.routeId)}
                                                // Eğer aktif araç sayısı 2'den azsa ilerlet butonu pasif olsun
                                                disabled={activeVehicles.length < 2}
                                            >
                                                <ForwardIcon className="h-4 w-4" />
                                                İlerle
                                            </Button>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardBody className="p-4 pt-0 flex-grow overflow-y-auto">
                                    {/* Listeleme için filtrelenmiş listeyi (activeVehicles) kullanıyoruz */}
                                    {activeVehicles.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            {activeVehicles.map((vehicle, index) => (
                                                <VehicleQueueCard key={vehicle.id} vehicle={vehicle} index={index} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-blue-gray-400">
                                            <InformationCircleIcon className="w-12 h-12 mb-2" />
                                            <Typography variant="small" className="font-semibold">
                                                Sırada Aktif Araç Yok
                                            </Typography>
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