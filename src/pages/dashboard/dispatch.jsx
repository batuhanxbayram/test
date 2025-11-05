import React, { useState, useEffect } from "react";
import {
    Typography,
    Card,
    Spinner,
    Button,
    CardHeader,
    CardBody
} from "@material-tailwind/react";
import { InformationCircleIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import apiClient from "../../api/axiosConfig.js";
import { toast } from 'react-toastify';

// Her bir araç için oluşturulacak kart bileşeni
function DispatchVehicleCard({ vehicle, index, onSendToEnd }) {
    const isFirstThree = index < 3;
    const cardBgColor = isFirstThree ? "bg-green-100" : "bg-blue-gray-50/70";
    const textColor = isFirstThree ? "text-green-900" : "text-blue-gray-700";
    const borderColor = isFirstThree ? "border-green-300" : "border-transparent";

    return (
        <div className={`p-1.5 rounded-md ${cardBgColor} shadow-sm flex items-center justify-between border ${borderColor}`}>
            <div className="flex items-center gap-2">
                <Typography className={`font-bold text-md ${textColor}`}>#{index + 1}</Typography>
                <Typography variant="small" className="font-bold text-blue-gray-800 leading-tight">
                    {vehicle.licensePlate}
                </Typography>
            </div>
            <Button size="sm" variant="gradient" color="blue-gray" onClick={onSendToEnd} className="flex-shrink-0 flex items-center gap-2">
                <PaperAirplaneIcon className="h-4 w-4" />
                Gönder
            </Button>
        </div>
    );
}

// Yeni Sayfa Bileşeni
export function DispatchPage() {
    const [routesWithQueues, setRoutesWithQueues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // TÜM FONKSİYONLAR BİLEŞENİN İÇİNDE
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
    }, []);

    const handleSendToEnd = async (routeId, vehicleId, licensePlate) => {
        if (window.confirm(`'${licensePlate}' plakalı aracı sıranın sonuna göndermek istediğinizden emin misiniz?`)) {
            try {
                await apiClient.post(`/routes/${routeId}/queue/move-to-end`, { vehicleId });
                toast.info(`'${licensePlate}' plakalı araç sıranın sonuna gönderildi.`);
                fetchAllQueues();
            } catch (error) {
                console.error("Araç sona gönderilirken hata:", error);
                toast.error("İşlem sırasında bir hata oluştu.");
            }
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
                {routesWithQueues.map(route => (
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
                                        {route.queuedVehicles.length} Araç
                                    </Typography>
                                </div>
                            </CardHeader>
                            <CardBody className="p-4 pt-0 flex-grow overflow-y-auto">
                                {route.queuedVehicles.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {route.queuedVehicles.map((vehicle, index) => (
                                            <DispatchVehicleCard
                                                key={vehicle.id}
                                                vehicle={vehicle}
                                                index={index}
                                                onSendToEnd={() => handleSendToEnd(route.routeId, vehicle.id, vehicle.licensePlate)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-blue-gray-400">
                                        <InformationCircleIcon className="w-12 h-12 mb-2" />
                                        <Typography variant="small" className="font-semibold">
                                            Sırada Araç Yok !
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

export default DispatchPage;