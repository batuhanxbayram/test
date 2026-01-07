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
            setError("Sıra verileri yüklenirken bir hata oluştu.");
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
            alert("İşlem başarısız oldu.");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Spinner className="h-12 w-12" /></div>;
    }

    if (error) {
        return <Typography color="red" className="mt-12 text-center text-sm">{error}</Typography>;
    }

    return (
        <div className="mt-4 px-2">
            {/* Sütunlar arası gap-4 yapıldı ve yükseklik ayarlandı */}
            <div className="flex flex-col md:flex-row gap-4 pb-4 md:h-[calc(100vh-120px)] md:overflow-x-auto md:overflow-y-hidden">
                {routesWithQueues.map(route => (
                    // md:w-64 ile sütunları daralttık (yan yana daha çok sütun sığar)
                    <div key={route.routeId} className="w-full md:w-64 flex-shrink-0">
                        <Card className="flex flex-col h-full shadow-md border border-blue-gray-100 bg-white">
                            {/* Siyah başlık bandını m-2 p-2 ile incelttik */}
                            <CardHeader
                                variant="gradient"
                                color="gray"
                                className="m-2 p-2 flex items-center justify-between rounded-md flex-shrink-0"
                            >
                                <div className="flex-1 overflow-hidden">
                                    <Typography className="text-xs font-bold text-white truncate" title={route.routeName}>
                                        {route.routeName}
                                    </Typography>
                                    <Typography className="text-[10px] text-white opacity-80 leading-tight">
                                        {route.queuedVehicles.length} Araç
                                    </Typography>
                                </div>
                                {userRole === 'admin' && (
                                    <div className="ml-2 flex-shrink-0">
                                        <Button
                                            size="sm"
                                            variant="filled"
                                            className="flex items-center gap-1 p-1 px-2 bg-blue-gray-700 hover:bg-blue-gray-800"
                                            onClick={() => handleNextVehicle(route.routeId)}
                                            disabled={route.queuedVehicles.length < 2}
                                        >
                                            <ForwardIcon className="h-3 w-3 text-white" />
                                            <span className="text-[10px] lowercase first-letter:uppercase">İlerle</span>
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>

                            {/* İçerik kısmındaki padding'i azalttık ve gap-1 yaptık */}
                            <CardBody className="p-2 pt-0 flex-grow overflow-y-auto flex flex-col gap-1">
                                {route.queuedVehicles.length > 0 ? (
                                    route.queuedVehicles.map((vehicle, index) => (
                                        <VehicleQueueCard key={vehicle.id} vehicle={vehicle} index={index} />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-blue-gray-300 opacity-60">
                                        <InformationCircleIcon className="w-8 h-8 mb-1" />
                                        <Typography className="text-[10px] font-semibold">
                                            Sırada Araç Yok
                                        </Typography>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;