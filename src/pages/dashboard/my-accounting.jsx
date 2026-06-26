import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, CardHeader, Input, Option, Select, Typography } from "@material-tailwind/react";
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

const selectMenuProps = {
  className: "z-[9999] max-h-72",
};

const money = (value) =>
  Number(value || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  });

export function MyAccounting() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ periodMonth: "", periodYear: "" });

  const queryString = () => {
    const params = new URLSearchParams();
    if (filters.periodMonth) params.append("periodMonth", filters.periodMonth);
    if (filters.periodYear) params.append("periodYear", filters.periodYear);
    const query = params.toString();
    return query ? `?${query}` : "";
  };

  const fetchData = async () => {
    try {
      const response = await apiClient.get(`/accounting/my-monthly-summaries${queryString()}`);
      setSummaries(response.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Cari ozetleriniz yuklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totals = useMemo(
    () =>
      summaries.reduce(
        (acc, item) => ({
          previousBalance: acc.previousBalance + Number(item.previousBalance || 0),
          incomeAmount: acc.incomeAmount + Number(item.incomeAmount || 0),
          expenseAmount: acc.expenseAmount + Number(item.expenseAmount || 0),
        }),
        { previousBalance: 0, incomeAmount: 0, expenseAmount: 0 }
      ),
    [summaries]
  );

  const latestBalance = summaries[0]?.totalBalance || 0;

  if (loading) {
    return <Typography className="mt-12 text-center">Cari ozetler yukleniyor...</Typography>;
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-8">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-4 p-6">
          <Typography variant="h6" color="white">
            Cari Ozetlerim
          </Typography>
          <Typography variant="small" color="white" className="font-normal opacity-70">
            Size ait aylik devir, arti, eksi ve toplam bakiye ozetleri
          </Typography>
        </CardHeader>
        <CardBody className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-blue-gray-50 p-4">
            <Typography variant="small" className="font-bold uppercase text-blue-gray-400">
              Toplam Devir
            </Typography>
            <Typography className="font-semibold text-blue-gray-700">{money(totals.previousBalance)}</Typography>
          </div>
          <div className="rounded-lg border border-blue-gray-50 p-4">
            <Typography variant="small" className="font-bold uppercase text-blue-gray-400">
              Toplam Arti
            </Typography>
            <Typography className="font-semibold text-green-700">{money(totals.incomeAmount)}</Typography>
          </div>
          <div className="rounded-lg border border-blue-gray-50 p-4">
            <Typography variant="small" className="font-bold uppercase text-blue-gray-400">
              Toplam Eksi
            </Typography>
            <Typography className="font-semibold text-red-700">{money(totals.expenseAmount)}</Typography>
          </div>
          <div className="rounded-lg border border-blue-gray-50 p-4">
            <Typography variant="small" className="font-bold uppercase text-blue-gray-400">
              Son Bakiye
            </Typography>
            <Typography className={`font-semibold ${latestBalance >= 0 ? "text-blue-gray-800" : "text-red-700"}`}>
              {money(latestBalance)}
            </Typography>
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
            Aylik Cari Ozetler
          </Typography>
          <div className="grid w-full gap-3 md:w-auto md:grid-cols-3">
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
            <Button color="white" variant="text" onClick={fetchData}>
              Filtrele
            </Button>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          <table className="w-full min-w-[920px] table-auto">
            <thead>
              <tr>
                {[
                  "Donem",
                  "Plaka",
                  "Onceki Devir",
                  "Arti Tutar",
                  "Eksi Tutar",
                  "Toplam Bakiye",
                  "Aciklama",
                  "Kayit Tarihi",
                ].map((head) => (
                  <th key={head} className="border-b border-blue-gray-50 py-3 px-5 text-left">
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
                  <td className="border-b border-blue-gray-50 py-3 px-5 font-semibold">{summary.periodName}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{summary.plateNumber || "-"}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{money(summary.previousBalance)}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5 text-green-700">
                    {money(summary.incomeAmount)}
                  </td>
                  <td className="border-b border-blue-gray-50 py-3 px-5 text-red-700">
                    {money(summary.expenseAmount)}
                  </td>
                  <td
                    className={`border-b border-blue-gray-50 py-3 px-5 font-semibold ${
                      summary.totalBalance >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {money(summary.totalBalance)}
                  </td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{summary.description || "-"}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{summary.createdAt?.slice(0, 10)}</td>
                </tr>
              ))}
              {summaries.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-blue-gray-400">
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

export default MyAccounting;
