// src/pages/dashboard/queuemanagementpage.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
    Typography, Card, CardHeader, CardBody,
    Button, Select, Option, List, ListItem,
} from "@material-tailwind/react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bars3Icon } from "@heroicons/react/24/solid";
import apiClient from "@/api/axiosConfig";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { toast } from "react-toastify";

const HUB_URL = "https://75ymkt.com/hubs/queue";

// --- Sürüklenebilir Satır Bileşeni ---
function SortableRow({ vehicle, index, onRemove }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: vehicle.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: isDragging ? "#f0f9ff" : "white",
        zIndex: isDragging ? 999 : "auto",
    };

    return (
        <tr ref={setNodeRef} style={style}>
            {/* Sürükleme Tutacağı */}
            <td className="py-3 px-5 border-b font-semibold text-blue-gray-400 w-12">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-blue-gray-50 inline-flex"
                    title="Sırayı değiştirmek için sürükle"
                >
                    <Bars3Icon className="h-5 w-5" />
                </div>
            </td>
            <td className="py-3 px-5 border-b font-semibold text-blue-gray-700">
                #{index + 1}
            </td>
            <td className="py-3 px-5 border-b">{vehicle.licensePlate}</td>
            <td className="py-3 px-5 border-b">{vehicle.userFullName}</td>
            <td className="py-3 px-5 border-b">
                <Button
                    color="red"
                    size="sm"
                    variant="text"
                    onClick={() => onRemove(vehicle.id)}
                >
                    Çıkar
                </Button>
            </td>
        </tr>
    );
}

export function QueueManagementPage() {
    const [routes, setRoutes] = useState([]);
    const [allVehicles, setAllVehicles] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [queuedVehicles, setQueuedVehicles] = useState([]);
    const [vehicleToAdd, setVehicleToAdd] = useState("");
    const [loadingQueue, setLoadingQueue] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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
        } catch {
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

        connection.start().then(() => {
            connection.on("ReceiveQueueUpdate", () => {
                fetchBaseData();
            });
        }).catch(console.error);

        return () => connection.stop();
    }, []);

    useEffect(() => {
        fetchQueueData();
        setVehicleToAdd("");
    }, [selectedRoute]);

    // --- Drag & Drop Bitti: Sırayı Kaydet ---
    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = queuedVehicles.findIndex((v) => v.id === active.id);
        const newIndex = queuedVehicles.findIndex((v) => v.id === over.id);
        const reordered = arrayMove(queuedVehicles, oldIndex, newIndex);

        // UI'ı anında güncelle (optimistic update)
        setQueuedVehicles(reordered);

        // Backend'e kaydet
        setIsSaving(true);
        try {
            await apiClient.post(`/routes/${selectedRoute.id}/queue/reorder`, {
                orderedVehicleIds: reordered.map((v) => v.id),
            });
            toast.success("Sıra güncellendi!", { autoClose: 1500 });
        } catch (err) {
            toast.error("Sıra kaydedilemedi, yenileniyor...");
            // Hata durumunda orijinal sırayı geri yükle
            fetchQueueData();
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddVehicleToQueue = async () => {
        if (!vehicleToAdd || !selectedRoute) return;
        try {
            await apiClient.post(`/routes/${selectedRoute.id}/queue`, {
                vehicleId: Number(vehicleToAdd),
            });
            setVehicleToAdd("");
            await fetchQueueData();
        } catch (error) {
            toast.error(error.response?.data || "Araç eklenemedi.");
        }
    };

    const handleRemoveVehicleFromQueue = async (vehicleId) => {
        if (!window.confirm("Bu aracı sıradan çıkarmak istediğinize emin misiniz?")) return;
        try {
            await apiClient.delete(`/routes/${selectedRoute.id}/queue/${vehicleId}`);
            await fetchQueueData();
        } catch {
            toast.error("Araç çıkarılamadı.");
        }
    };

    const availableVehicles = useMemo(() => {
        const queuedIds = new Set(queuedVehicles.map((v) => v.id));
        return allVehicles.filter((v) => !queuedIds.has(v.id) && v.isActive);
    }, [allVehicles, queuedVehicles]);

    const selectKey = selectedRoute
        ? `select-${selectedRoute.id}-${availableVehicles.length}`
        : "empty";

    return (
        <div className="mt-12 mb-8">
            <Card>
                <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
                    <Typography variant="h6" color="white">
                        Güzergah Sıra Yönetimi
                    </Typography>
                    <Typography variant="small" color="white" className="opacity-70 font-normal mt-1">
                        Sırayı değiştirmek için satırları sürükleyip bırakın.
                    </Typography>
                </CardHeader>
                <CardBody className="p-6 flex flex-col lg:flex-row gap-8">
                    {/* SOL PANEL - Güzergah Listesi */}
                    <div className="lg:w-1/3">
                        <Typography variant="h6" color="blue-gray" className="mb-4">
                            Güzergah Seçin
                        </Typography>
                        <Card className="w-full border">
                            <List>
                                {routes.map((route) => (
                                    <ListItem
                                        key={route.id}
                                        onClick={() => setSelectedRoute(route)}
                                        selected={selectedRoute?.id === route.id}
                                        className="cursor-pointer"
                                    >
                                        {route.routeName}
                                    </ListItem>
                                ))}
                            </List>
                        </Card>
                    </div>

                    {/* SAĞ PANEL - Sıra Tablosu */}
                    <div className="lg:w-2/3">
                        {!selectedRoute ? (
                            <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg p-12">
                                <Typography color="blue-gray">
                                    Lütfen soldan bir güzergah seçin
                                </Typography>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <Typography variant="h6" color="blue-gray">
                                        {selectedRoute.routeName} — {queuedVehicles.length} Araç
                                    </Typography>
                                    {isSaving && (
                                        <Typography variant="small" color="blue" className="animate-pulse">
                                            Kaydediliyor...
                                        </Typography>
                                    )}
                                </div>

                                <div className="overflow-x-auto border rounded-lg mb-8">
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <table className="w-full min-w-[540px] table-auto">
                                            <thead>
                                            <tr>
                                                {["", "Sıra", "Plaka", "Şoför", "İşlem"].map((h) => (
                                                    <th
                                                        key={h}
                                                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                                    >
                                                        <Typography
                                                            variant="small"
                                                            className="font-bold uppercase text-blue-gray-400"
                                                        >
                                                            {h}
                                                        </Typography>
                                                    </th>
                                                ))}
                                            </tr>
                                            </thead>
                                            <SortableContext
                                                items={queuedVehicles.map((v) => v.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <tbody>
                                                {loadingQueue ? (
                                                    <tr>
                                                        <td colSpan={5} className="text-center p-6 text-blue-gray-400">
                                                            Yükleniyor...
                                                        </td>
                                                    </tr>
                                                ) : queuedVehicles.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="text-center p-6 text-blue-gray-400">
                                                            Bu güzergahta sırada araç yok.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    queuedVehicles.map((vehicle, index) => (
                                                        <SortableRow
                                                            key={vehicle.id}
                                                            vehicle={vehicle}
                                                            index={index}
                                                            onRemove={handleRemoveVehicleFromQueue}
                                                        />
                                                    ))
                                                )}
                                                </tbody>
                                            </SortableContext>
                                        </table>
                                    </DndContext>
                                </div>

                                {/* Araç Ekleme Bölümü */}
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
                                                    {vehicle.licensePlate} ({vehicle.driverName || vehicle.userFullName})
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                    <Button onClick={handleAddVehicleToQueue} disabled={!vehicleToAdd}>
                                        Sıraya Ekle
                                    </Button>
                                </div>
                                {availableVehicles.length === 0 && (
                                    <Typography variant="small" color="gray" className="mt-2 text-center italic">
                                        * Eklenecek uygun (aktif) araç bulunamadı.
                                    </Typography>
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