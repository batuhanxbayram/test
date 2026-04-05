import React, { useState, useEffect } from "react";
import {
    Typography,
    Card,
    Spinner,
    Button,
    CardHeader,
    CardBody,
    Tabs,
    TabsHeader,
    Tab
} from "@material-tailwind/react";
import { ForwardIcon, InformationCircleIcon, TvIcon } from "@heroicons/react/24/solid";
import apiClient from "@/api/axiosConfig";
import { useMaterialTailwindController } from "@/context";
import { VehicleQueueCard } from "@/widgets/layout/VehicleQueueCard";
import { HubConnectionBuilder, LogLevel, HttpTransportType } from "@microsoft/signalr";

export function Home() {
    const [controller] = useMaterialTailwindController();
    const { userRole } = controller;

    const [routesWithQueues, setRoutesWithQueues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const HUB_URL = "https://75ymkt.com/hubs/queue";

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchAllQueues = async () => {
        try {
            const response = await apiClient.get("/queues/all");
            const data = response.data;
            setRoutesWithQueues(data);
            if (data.length > 0 && !activeTab) {
                setActiveTab(data[0].routeId);
            }
        } catch (err) {
            console.error(err);
            if (loading) setError("Veri yüklenemedi.");
        } finally {
            if (loading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllQueues();

        const connection = new HubConnectionBuilder()
            .withUrl(HUB_URL, {
                skipNegotiation: true,
                transport: HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        connection.start()
            .then(() => {
                console.log("🟢 Home: SignalR Bağlandı!");
                connection.on("ReceiveQueueUpdate", () => {
                    fetchAllQueues();
                });
            })
            .catch(err => console.error("🔴 SignalR Hatası:", err));

        return () => connection.stop();
    }, []);

    const handleNextVehicle = async (routeId) => {
        try {
            await apiClient.post(`/admin/vehicles/${routeId}/move-first-to-end`);
        } catch (error) {
            console.error("Hata:", error);
            alert("İşlem başarısız.");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <Spinner className="h-16 w-16" />
        </div>
    );

    if (error) return (
        <Typography color="red" className="mt-12 text-center">{error}</Typography>
    );

    const displayedRoutes = isMobile
        ? routesWithQueues.filter(r => String(r.routeId) === String(activeTab))
        : routesWithQueues;

    return (
        <div className="mt-6 md:mt-12">

            {/* TV Ekranı Butonu */}
            <div className="flex justify-end mb-4">
                <Button
                    size="sm"
                    className="flex items-center gap-2 bg-gray-800 text-white hover:bg-gray-900 normal-case"
                    onClick={() => window.open("/tv/monitor", "_blank")}
                >
                    <TvIcon className="h-4 w-4" />
                    TV Ekranı
                </Button>
            </div>

            {/* Mobil sekme menüsü */}
            {isMobile && routesWithQueues.length > 0 && (
                <div className="mb-6 w-full overflow-x-auto pb-2 scroll-smooth" style={{ WebkitOverflowScrolling: "touch" }}>
                    <Tabs value={activeTab} className="w-max min-w-full">
                        <TabsHeader
                            className="bg-transparent flex-nowrap gap-2"
                            indicatorProps={{
                                className: "bg-gray-900/10 shadow-none !text-gray-900",
                            }}
                        >
                            {routesWithQueues.map(({ routeId, routeName }) => (
                                <Tab
                                    key={routeId}
                                    value={routeId}
                                    onClick={() => setActiveTab(routeId)}
                                    className={`w-max whitespace-nowrap px-5 py-2 shrink-0 ${activeTab === routeId ? "font-bold text-gray-900" : ""}`}
                                >
                                    {routeName}
                                </Tab>
                            ))}
                        </TabsHeader>
                    </Tabs>
                </div>
            )}

            {/* Liste */}
            <div className={`
                flex flex-col gap-6 pb-4
                ${!isMobile ? "md:flex-row md:h-[calc(100vh-80px)] md:overflow-x-auto md:overflow-y-hidden" : ""}
            `}>
                {displayedRoutes.map(route => {
                    const activeVehicles = route.queuedVehicles.filter(v => v.isActive);

                    return (
                        <div key={route.routeId} className="w-full md:w-80 flex-shrink-0 transition-all duration-300">
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
                                                className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100"
                                                onClick={() => handleNextVehicle(route.routeId)}
                                                disabled={activeVehicles.length < 2}
                                            >
                                                <ForwardIcon className="h-4 w-4" /> İlerle
                                            </Button>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardBody className="p-4 pt-0 flex-grow overflow-y-auto max-h-[60vh] md:max-h-full">
                                    {activeVehicles.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            {activeVehicles.map((vehicle, index) => (
                                                <VehicleQueueCard key={vehicle.id} vehicle={vehicle} index={index} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 text-center text-blue-gray-400">
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