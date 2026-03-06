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
import { ForwardIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
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

    // --- YENİ EKLENEN KISIM: MOBİL KONTROLÜ VE SEÇİLİ SEKME ---
    const [activeTab, setActiveTab] = useState(""); // Seçili güzergah ID'si
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const HUB_URL = "https://75ymkt.com/hubs/queue";

    // Ekran boyutunu dinle (Mobil mi Masaüstü mü?)
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

            // Veri ilk geldiğinde, eğer mobildeysek ve hiç sekme seçilmemişse ilkini seç
            if (data.length > 0 && !activeTab) {
                setActiveTab(data[0].routeId); // İlk güzergahı varsayılan yap
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
                console.log("🟢 Home Sayfası: SignalR Bağlandı!");
                connection.on("ReceiveQueueUpdate", () => {
                    console.log("🔔 Güncelleme geldi!");
                    fetchAllQueues();
                });
            })
            .catch(err => console.error("🔴 SignalR Bağlantı Hatası:", err));

        return () => {
            connection.stop();
        };
    }, []);

    const handleNextVehicle = async (routeId) => {
        try {
            await apiClient.post(`/admin/vehicles/${routeId}/move-first-to-end`);
        } catch (error) {
            console.error("Hata:", error);
            alert("İşlem başarısız.");
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Spinner className="h-16 w-16" /></div>;
    if (error) return <Typography color="red" className="mt-12 text-center">{error}</Typography>;

    // --- MOBİL İÇİN FİLTRELEME ---
    // Eğer mobildeysek sadece seçili olanı, değilsek hepsini göster
    const displayedRoutes = isMobile
        ? routesWithQueues.filter(r => String(r.routeId) === String(activeTab))
        : routesWithQueues;

    return (
        <div className="mt-6 md:mt-12">

            {/* --- MOBİL İÇİN SEKME MENÜSÜ --- */}
            {isMobile && routesWithQueues.length > 0 && (
                // 1. DÜZENLEME: Alanı yatayda kaydırılabilir (overflow-x-auto) yapıyoruz. iOS cihazlarda akıcı kaydırma için ek stiller koyduk.
                <div className="mb-6 w-full overflow-x-auto pb-2 scroll-smooth" style={{ WebkitOverflowScrolling: "touch" }}>
                    {/* 2. DÜZENLEME: Tabs genişliğini min-w-full ve w-max yaparak ekrana sıkışmasını engelledik. */}
                    <Tabs value={activeTab} className="w-max min-w-full">
                        <TabsHeader
                            className="bg-transparent flex-nowrap gap-2" // gap-2 ile butonlar arasına hafif boşluk koyduk
                            indicatorProps={{
                                className: "bg-gray-900/10 shadow-none !text-gray-900",
                            }}
                        >
                            {routesWithQueues.map(({ routeId, routeName }) => (
                                <Tab
                                    key={routeId}
                                    value={routeId}
                                    onClick={() => setActiveTab(routeId)}
                                    // 3. DÜZENLEME: whitespace-nowrap yazının alt satıra düşmesini engeller, shrink-0 sekmenin daralmasını engeller.
                                    className={`w-max whitespace-nowrap px-5 py-2 shrink-0 ${activeTab === routeId ? "font-bold text-gray-900" : ""}`}
                                >
                                    {routeName}
                                </Tab>
                            ))}
                        </TabsHeader>
                    </Tabs>
                </div>
            )}

            {/* --- LİSTELEME ALANI --- */}
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