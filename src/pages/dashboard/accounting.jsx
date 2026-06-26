import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import { toast } from "react-toastify";
import apiClient from "@/api/axiosConfig";

const months = [
  { value: "1", label: "Ocak" },
  { value: "2", label: "Subat" },
  { value: "3", label: "Mart" },
  { value: "4", label: "Nisan" },
  { value: "5", label: "Mayis" },
  { value: "6", label: "Haziran" },
  { value: "7", label: "Temmuz" },
  { value: "8", label: "Agustos" },
  { value: "9", label: "Eylul" },
  { value: "10", label: "Ekim" },
  { value: "11", label: "Kasim" },
  { value: "12", label: "Aralik" },
];

const currentDate = new Date();

const emptyForm = {
  vehicleId: "",
  periodMonth: String(currentDate.getMonth() + 1),
  periodYear: String(currentDate.getFullYear()),
  previousBalance: "",
  incomeAmount: "",
  expenseAmount: "",
  description: "",
};

const selectMenuProps = {
  className: "z-[9999] max-h-72",
};

const money = (value) =>
  Number(value || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  });

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  return Number(String(value).replace(",", ".")) || 0;
};

export function AccountingPage() {
  const [users, setUsers] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [filters, setFilters] = useState({
    vehicleId: "",
    periodMonth: "",
    periodYear: "",
  });

  const driverOptions = useMemo(
    () =>
      users.flatMap((user) =>
        (user.vehicles || []).map((vehicle) => ({
          userId: user.id,
          userFullName: user.fullName,
          vehicleId: String(vehicle.id),
          licensePlate: vehicle.licensePlate,
          label: `${user.fullName} - ${vehicle.licensePlate}`,
        }))
      ),
    [users]
  );

  const selectedDriver = useMemo(
    () => driverOptions.find((item) => item.vehicleId === String(formData.vehicleId)),
    [driverOptions, formData.vehicleId]
  );

  const totalBalance =
    toNumber(formData.previousBalance) + toNumber(formData.incomeAmount) - toNumber(formData.expenseAmount);

  const queryString = () => {
    const params = new URLSearchParams();
    if (filters.vehicleId) params.append("vehicleId", filters.vehicleId);
    if (filters.periodMonth) params.append("periodMonth", filters.periodMonth);
    if (filters.periodYear) params.append("periodYear", filters.periodYear);
    const query = params.toString();
    return query ? `?${query}` : "";
  };

  const fetchUsers = async () => {
    const response = await apiClient.get("/accounting/users");
    const data = response.data || [];
    setUsers(data);

    const firstVehicle = data.flatMap((user) => user.vehicles || [])[0];
    if (firstVehicle && !formData.vehicleId) {
      setFormData((prev) => ({ ...prev, vehicleId: String(firstVehicle.id) }));
    }
  };

  const fetchSummaries = async () => {
    const response = await apiClient.get(`/accounting/monthly-summaries${queryString()}`);
    setSummaries(response.data || []);
  };

  const loadPage = async () => {
    try {
      await Promise.all([fetchUsers(), fetchSummaries()]);
    } catch (err) {
      console.error(err);
      toast.error("Cari ozet bilgileri yuklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData((prev) => ({
      ...emptyForm,
      vehicleId: prev.vehicleId || driverOptions[0]?.vehicleId || "",
    }));
  };

  const buildPayload = () => ({
    userId: selectedDriver?.userId || null,
    vehicleId: Number(formData.vehicleId),
    periodMonth: Number(formData.periodMonth),
    periodYear: Number(formData.periodYear),
    previousBalance: toNumber(formData.previousBalance),
    incomeAmount: toNumber(formData.incomeAmount),
    expenseAmount: toNumber(formData.expenseAmount),
    description: formData.description?.trim() || null,
  });

  const handleSubmit = async () => {
    if (!formData.vehicleId) {
      toast.error("Once sofor/plaka seciniz.");
      return;
    }

    if (!formData.periodMonth || !formData.periodYear) {
      toast.error("Ay ve yil zorunludur.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await apiClient.put(`/accounting/monthly-summaries/${editingId}`, buildPayload());
        toast.success("Cari ozet guncellendi.");
      } else {
        await apiClient.post("/accounting/monthly-summaries", buildPayload());
        toast.success("Cari ozet kaydedildi.");
      }

      resetForm();
      await fetchSummaries();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Cari ozet kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (summary) => {
    setEditingId(summary.id);
    setFormData({
      vehicleId: String(summary.vehicleId || ""),
      periodMonth: String(summary.periodMonth),
      periodYear: String(summary.periodYear),
      previousBalance: summary.previousBalance ?? "",
      incomeAmount: summary.incomeAmount ?? "",
      expenseAmount: summary.expenseAmount ?? "",
      description: summary.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (summary) => {
    if (!window.confirm(`${summary.periodName} cari ozeti silinsin mi?`)) return;

    try {
      await apiClient.delete(`/accounting/monthly-summaries/${summary.id}`);
      toast.success("Cari ozet silindi.");
      await fetchSummaries();
    } catch (err) {
      console.error(err);
      toast.error("Cari ozet silinemedi.");
    }
  };

  const selectedTotal = summaries.reduce((sum, item) => sum + Number(item.totalBalance || 0), 0);

  if (loading) {
    return <Typography className="mt-12 text-center">Cari ozet ekrani yukleniyor...</Typography>;
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-8">
      <Card className="relative z-30 overflow-visible">
        <CardHeader
          variant="gradient"
          color="gray"
          className="relative z-40 mb-4 flex flex-col gap-4 overflow-visible p-6 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <Typography variant="h6" color="white">
              Aylik Cari Ozet
            </Typography>
            <Typography variant="small" color="white" className="font-normal opacity-70">
              Sofor/plaka secerek aylik devir, arti ve eksi bakiye girisi
            </Typography>
          </div>
          <div className="w-full md:w-96">
            <Select
              label="Sofor / Plaka"
              value={formData.vehicleId}
              onChange={(val) => handleChange("vehicleId", val)}
              menuProps={selectMenuProps}
              containerProps={{ className: "relative z-[9999]" }}
            >
              {driverOptions.map((option) => (
                <Option key={option.vehicleId} value={option.vehicleId}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </CardHeader>
        <CardBody className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-blue-gray-50 p-4">
            <Typography variant="small" className="font-bold uppercase text-blue-gray-400">
              Secili Sofor
            </Typography>
            <Typography className="font-semibold text-blue-gray-700">
              {selectedDriver?.userFullName || "-"}
            </Typography>
          </div>
          <div className="rounded-lg border border-blue-gray-50 p-4">
            <Typography variant="small" className="font-bold uppercase text-blue-gray-400">
              Plaka
            </Typography>
            <Typography className="font-semibold text-blue-gray-700">
              {selectedDriver?.licensePlate || "-"}
            </Typography>
          </div>
          <div className="rounded-lg border border-blue-gray-50 p-4">
            <Typography variant="small" className="font-bold uppercase text-blue-gray-400">
              Kayit Sayisi
            </Typography>
            <Typography className="font-semibold text-blue-gray-700">{summaries.length}</Typography>
          </div>
          <div className="rounded-lg border border-blue-gray-50 p-4">
            <Typography variant="small" className="font-bold uppercase text-blue-gray-400">
              Listelenen Bakiye
            </Typography>
            <Typography className={`font-semibold ${selectedTotal >= 0 ? "text-blue-gray-800" : "text-red-700"}`}>
              {money(selectedTotal)}
            </Typography>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-4 p-6">
          <Typography variant="h6" color="white">
            {editingId ? "Cari Ozet Duzenle" : "Yeni Cari Ozet"}
          </Typography>
        </CardHeader>
        <CardBody className="grid gap-4 md:grid-cols-4">
          <Select
            label="Ay"
            value={formData.periodMonth}
            onChange={(val) => handleChange("periodMonth", val)}
            menuProps={selectMenuProps}
          >
            {months.map((month) => (
              <Option key={month.value} value={month.value}>
                {month.label}
              </Option>
            ))}
          </Select>
          <Input
            type="number"
            label="Yil"
            value={formData.periodYear}
            onChange={(e) => handleChange("periodYear", e.target.value)}
          />
          <Input
            type="number"
            step="0.01"
            label="Onceki Aydan Devir"
            value={formData.previousBalance}
            onChange={(e) => handleChange("previousBalance", e.target.value)}
          />
          <Input
            type="number"
            step="0.01"
            label="Arti Tutar"
            value={formData.incomeAmount}
            onChange={(e) => handleChange("incomeAmount", e.target.value)}
          />
          <Input
            type="number"
            step="0.01"
            label="Eksi Tutar"
            value={formData.expenseAmount}
            onChange={(e) => handleChange("expenseAmount", e.target.value)}
          />
          <Input
            label="Aciklama"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
          <div className="rounded-lg border border-blue-gray-50 p-4 md:col-span-2">
            <Typography variant="small" className="font-bold uppercase text-blue-gray-400">
              Toplam Bakiye
            </Typography>
            <Typography className={`text-lg font-semibold ${totalBalance >= 0 ? "text-green-700" : "text-red-700"}`}>
              {money(totalBalance)}
            </Typography>
          </div>
          <div className="flex justify-end gap-3 md:col-span-4">
            {editingId && (
              <Button variant="text" color="blue-gray" onClick={resetForm}>
                Vazgec
              </Button>
            )}
            <Button color="green" onClick={handleSubmit} disabled={saving}>
              {saving ? "Kaydediliyor..." : editingId ? "Guncelle" : "Kaydet"}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-4 flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
        >
          <Typography variant="h6" color="white">
            Girilen Cari Ozetler
          </Typography>
          <div className="grid w-full gap-3 md:w-auto md:grid-cols-4">
            <Select
              label="Plaka"
              value={filters.vehicleId}
              onChange={(val) => setFilters({ ...filters, vehicleId: val || "" })}
              menuProps={selectMenuProps}
            >
              {driverOptions.map((option) => (
                <Option key={option.vehicleId} value={option.vehicleId}>
                  {option.label}
                </Option>
              ))}
            </Select>
            <Select
              label="Ay"
              value={filters.periodMonth}
              onChange={(val) => setFilters({ ...filters, periodMonth: val || "" })}
              menuProps={selectMenuProps}
            >
              {months.map((month) => (
                <Option key={month.value} value={month.value}>
                  {month.label}
                </Option>
              ))}
            </Select>
            <Input
              type="number"
              label="Yil"
              value={filters.periodYear}
              onChange={(e) => setFilters({ ...filters, periodYear: e.target.value })}
            />
            <Button color="white" variant="text" onClick={fetchSummaries}>
              Filtrele
            </Button>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          <table className="w-full min-w-[1100px] table-auto">
            <thead>
              <tr>
                {[
                  "Donem",
                  "Sofor",
                  "Plaka",
                  "Devir",
                  "Arti",
                  "Eksi",
                  "Toplam",
                  "Aciklama",
                  "Kayit Tarihi",
                  "Islem",
                ].map((head) => (
                  <th key={head} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                    <Typography variant="small" className="font-bold uppercase text-blue-gray-400">
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summaries.map((summary) => (
                <tr key={summary.id} className="hover:bg-blue-gray-50/50">
                  <td className="border-b border-blue-gray-50 py-3 px-4 font-semibold">{summary.periodName}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-4">{summary.userFullName || "-"}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-4">{summary.plateNumber || "-"}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-4">{money(summary.previousBalance)}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-4 text-green-700">
                    {money(summary.incomeAmount)}
                  </td>
                  <td className="border-b border-blue-gray-50 py-3 px-4 text-red-700">
                    {money(summary.expenseAmount)}
                  </td>
                  <td
                    className={`border-b border-blue-gray-50 py-3 px-4 font-semibold ${
                      summary.totalBalance >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {money(summary.totalBalance)}
                  </td>
                  <td className="border-b border-blue-gray-50 py-3 px-4">{summary.description || "-"}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-4">{summary.createdAt?.slice(0, 10)}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="text" color="blue" onClick={() => handleEdit(summary)}>
                        Duzenle
                      </Button>
                      <Button size="sm" variant="text" color="red" onClick={() => handleDelete(summary)}>
                        Sil
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {summaries.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-blue-gray-400">
                    Cari ozet bulunamadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default AccountingPage;
