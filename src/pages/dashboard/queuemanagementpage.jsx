import React, { useState, useEffect, useMemo } from "react";
import {
    Typography,
    Card,
    CardHeader,
    CardBody,
    Button,
    Select,
    Option,
    List,
    ListItem,
} from "@material-tailwind/react";
import apiClient from "@/api/axiosConfig";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export function QueueManagementPage() {
    const [routes, setRoutes] = useState([]);
    const [allVehicles, setAllVehicles] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [queuedVehicles, setQueuedVehicles] = useState([]);
    const [vehicleToAdd, setVehicleToAdd] = useState("");
    const [loadingQueue, setLoadingQueue] = useState(false);


    const HUB_URL = "https://75ymkt.com/hubs/queue";

    const fetchBaseData = async () => {
        try {
            const [routesRes, vehiclesRes] = await Promise.all([
                apiClient.get("/admin/routes"),
                apiClient.get("/admin/vehicles"),
            ]);
            setRoutes(routesRes.data);
            setAllVehicles(vehiclesRes.data);
        } catch (error) {
            console.error("Veri hatası:", error);
        }
    };

    const fetchQueueData = async () => {
        if (!selectedRoute) return;
        setLoadingQueue(true);
        try {
            const response = await apiClient.get(`/routes/${selectedRoute.id}/queue`);
            setQueuedVehicles(response.data);
        } catch (error) {
            setQueuedVehicles([]);
        } finally {
            setLoadingQueue(false);
        }
    };

    useEffect(() => {
        fetchBaseData();
        const connection = new HubConnectionBuilder()
            .withUrl(HUB_URL)
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        connection.start()
            .then(() => {
                console.log("🟢 Admin Paneli: SignalR Bağlandı!");
                connection.on("ReceiveQueueUpdate", () => {
                    console.log("🔔 Veri güncelleme sinyali alındı.");
                    fetchBaseData();
                });
            })
            .catch(err => console.error("🔴 Bağlantı Hatası:", err));

        return () => connection.stop();
    }, []);

    useEffect(() => {
        fetchQueueData();
        setVehicleToAdd("");
    }, [selectedRoute]);

    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl(HUB_URL)
            .withAutomaticReconnect()
            .build();

        connection.start().then(() => {
            connection.on("ReceiveQueueUpdate", () => {
                if (selectedRoute) {
                    apiClient.get(`/routes/${selectedRoute.id}/queue`)
                        .then(res => setQueuedVehicles(res.data))
                        .catch(() => {});
                }
                fetchBaseData();
            });
        });

        return () => connection.stop();
    }, [selectedRoute]);

    const handleAddVehicleToQueue = async () => {
        if (!vehicleToAdd || !selectedRoute) return;
        try {
            await apiClient.post(`/routes/${selectedRoute.id}/queue`, { vehicleId: vehicleToAdd });
            setVehicleToAdd("");
        } catch (error) {
            alert(error.response?.data || "Hata.");
        }
    };

    const handleRemoveVehicleFromQueue = async (vehicleId) => {
        if (window.confirm("Emin misiniz?")) {
            try {
                await apiClient.delete(`/routes/${selectedRoute.id}/queue/${vehicleId}`);
            } catch (error) {
                alert("Hata.");
            }
        }
    };

    // --- DÜZELTME YAPILAN KISIM ---
    const availableVehicles = useMemo(() => {
        const queuedIds = new Set(queuedVehicles.map((v) => v.id));

        // Sadece (Kuyrukta Olmayan) VE (Aktif Olan) araçları getir
        return allVehicles.filter((v) => !queuedIds.has(v.id) && v.isActive);

    }, [allVehicles, queuedVehicles]);
    // -----------------------------

    const selectKey = selectedRoute
        ? `select-${selectedRoute.id}-${availableVehicles.length}`
        : "empty";

    return (
        <div className="mt-12 mb-8">
            <Card>
                <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
                    <Typography variant="h6" color="white">Güzergah Sıra Yönetimi</Typography>
                </CardHeader>
                <CardBody className="p-6 flex flex-col lg:flex-row gap-8">
                    {/* SOL PANEL */}
                    <div className="lg:w-1/3">
                        <Typography variant="h6" color="blue-gray" className="mb-4">Güzergah Seçin</Typography>
                        <Card className="w-full border">
                            <List>
                                {routes.map((route) => (
                                    <ListItem
                                        key={route.id}
                                        onClick={() => setSelectedRoute(route)}
                                        selected={selectedRoute?.id === route.id}
                                    >
                                        {route.routeName}
                                    </ListItem>
                                ))}
                            </List>
                        </Card>
                    </div>

                    {/* SAĞ PANEL */}
                    <div className="lg:w-2/3">
                        {!selectedRoute ? (
                            <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg p-12">
                                <Typography color="blue-gray">Lütfen güzergah seçin</Typography>
                            </div>
                        ) : (
                            <div>
                                <Typography variant="h6" color="blue-gray" className="mb-4">
                                    Sıradaki Araçlar: {selectedRoute.routeName}
                                </Typography>

                                <div className="overflow-x-auto border rounded-lg mb-8">
                                    <table className="w-full min-w-[500px] table-auto">
                                        <thead>
                                        <tr>
                                            {["Sıra", "Plaka", "Şoför", "İşlem"].map((h) => (
                                                <th key={h} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                                    <Typography variant="small" className="font-bold uppercase text-blue-gray-400">{h}</Typography>
                                                </th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {loadingQueue ? (
                                            <tr><td colSpan="4" className="text-center p-4">Yükleniyor...</td></tr>
                                        ) : (
                                            queuedVehicles.map((vehicle, index) => (
                                                <tr key={vehicle.id}>
                                                    <td className="py-3 px-5 border-b font-semibold">#{index + 1}</td>
                                                    <td className="py-3 px-5 border-b">{vehicle.licensePlate}</td>
                                                    <td className="py-3 px-5 border-b">{vehicle.userFullName}</td>
                                                    <td className="py-3 px-5 border-b">
                                                        <Button color="red" size="sm" variant="text" onClick={() => handleRemoveVehicleFromQueue(vehicle.id)}>Çıkar</Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-end gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex-grow">
                                        <Select
                                            key={selectKey}
                                            label="Sıraya Eklenecek Aracı Seçin"
                                            value={vehicleToAdd}
                                            onChange={(val) => setVehicleToAdd(val)}
                                            animate={{ mount: { y: 0 }, unmount: { y: 0 } }}
                                            disabled={availableVehicles.length === 0}
                                        >
                                            {availableVehicles.map((vehicle) => (
                                                <Option key={vehicle.id} value={String(vehicle.id)}>
                                                    {vehicle.licensePlate} ({vehicle.userFullName})
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                    <Button onClick={handleAddVehicleToQueue} disabled={!vehicleToAdd}>
                                        Sıraya Ekle
                                    </Button>
                                </div>
                                {availableVehicles.length === 0 && (
                                    <Typography variant="small" color="gray" className="mt-2 text-center italic">* Eklenecek uygun (aktif) araç bulunamadı.</Typography>
                                )}
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

export default QueueManagementPage;