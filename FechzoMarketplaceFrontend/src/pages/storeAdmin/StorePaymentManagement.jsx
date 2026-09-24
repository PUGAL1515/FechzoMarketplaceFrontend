import React, { useState, useEffect, useCallback } from "react";
import api from "../../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, startOfDay, endOfDay, subDays } from "date-fns";

const API_BASE = "/marketplace/payments";

// Helper to get storeId consistently
const getStoreId = () => {
    const storeData = JSON.parse(localStorage.getItem("store") || "{}");
    return (
        storeData.id ||
        storeData._id ||
        storeData.storeId ||
        localStorage.getItem("storeId") ||
        null
    );
};

const StorePaymentManagement = () => {
    // ====================== STATE ======================
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState({
        totalOrders: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        refundedAmount: 0,
        codCount: 0,
        onlineCount: 0,
    });
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    // Filters
    const [search, setSearch] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [fromDate, setFromDate] = useState(startOfDay(new Date()));
    const [toDate, setToDate] = useState(endOfDay(new Date()));
    const [activeQuickFilter, setActiveQuickFilter] = useState("today");

    // ====================== FETCH DATA ======================
    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const storeId = getStoreId();

            if (!storeId) {
                alert("Store not logged in. Please login again.");
                setLoading(false);
                return;
            }

            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: search || undefined,
                paymentStatus: paymentStatus || undefined,
                paymentMethod: paymentMethod || undefined,
                fromDate: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
                toDate: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
                storeId,
            };

            const [listRes, summaryRes] = await Promise.all([
                api.get(API_BASE, { params }),
                api.get(`${API_BASE}/summary`, { params }),
            ]);

            // List
            setPayments(listRes.data?.data || []);
            setPagination((prev) => ({
                ...prev,
                total: listRes.data?.pagination?.total || 0,
                totalPages: listRes.data?.pagination?.totalPages || 0,
            }));

            // Summary - more defensive
            const summaryData = summaryRes.data?.data || summaryRes.data || {};
            setSummary({
                totalOrders: summaryData.totalOrders || 0,
                totalAmount: summaryData.totalAmount || 0,
                paidAmount: summaryData.paidAmount || 0,
                pendingAmount: summaryData.pendingAmount || 0,
                refundedAmount: summaryData.refundedAmount || 0,
                codCount: summaryData.codCount || 0,
                onlineCount: summaryData.onlineCount || 0,
            });
        } catch (err) {
            console.error("Error fetching payments:", err);
            alert(err.response?.data?.message || "Failed to load payments");
        } finally {
            setLoading(false);
        }
    }, [
        pagination.page,
        pagination.limit,
        search,
        paymentStatus,
        paymentMethod,
        fromDate,
        toDate,
    ]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    // ====================== QUICK FILTERS ======================
    const applyQuickFilter = (type) => {
        const today = new Date();
        let from = null;
        let to = endOfDay(today);

        switch (type) {
            case "today":
                from = startOfDay(today);
                break;
            case "yesterday":
                from = startOfDay(subDays(today, 1));
                to = endOfDay(subDays(today, 1));
                break;
            case "week":
                from = startOfDay(subDays(today, 6));
                break;
            case "month":
                from = startOfDay(subDays(today, 29));
                break;
            default:
                from = null;
                to = null;
        }

        setFromDate(from);
        setToDate(to);
        setActiveQuickFilter(type);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    // ====================== HANDLERS ======================
    const handleSearch = (e) => {
        e.preventDefault();
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleClearFilters = () => {
        setSearch("");
        setPaymentStatus("");
        setPaymentMethod("");
        setFromDate(startOfDay(new Date()));
        setToDate(endOfDay(new Date()));
        setActiveQuickFilter("today");
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    // Mark COD as Paid
    const handleMarkAsPaid = async (orderId) => {
        if (!window.confirm("Mark this COD payment as Paid?")) return;

        try {
            const storeId = getStoreId();
            if (!storeId) {
                alert("Store not logged in");
                return;
            }

            await api.patch(
                `${API_BASE}/${orderId}/status`,
                { paymentStatus: "Paid" },
                { params: { storeId } }
            );

            fetchPayments(); // refresh list + summary
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to update payment status");
        }
    };

    // PDF Download
    const handleDownloadPDF = async () => {
        try {
            const storeId = getStoreId();
            if (!storeId) {
                alert("Store not logged in");
                return;
            }

            const params = {
                search: search || undefined,
                paymentStatus: paymentStatus || undefined,
                paymentMethod: paymentMethod || undefined,
                fromDate: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
                toDate: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
                storeId,
            };

            const response = await api.get(`${API_BASE}/download-pdf`, {
                params,
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `payments_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("PDF download error:", err);
            alert("Failed to download PDF");
        }
    };

    // ====================== UI HELPERS ======================
    const statusColor = (status) => {
        switch (status) {
            case "Paid":
                return "bg-green-100 text-green-800";
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Failed":
                return "bg-red-100 text-red-800";
            case "Refunded":
                return "bg-purple-100 text-purple-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const methodColor = (method) => {
        return method === "Online"
            ? "bg-blue-100 text-blue-800"
            : "bg-orange-100 text-orange-800";
    };

    const getPageNumbers = () => {
        const { page, totalPages } = pagination;
        const pages = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (page <= 4) {
                pages.push(1, 2, 3, 4, 5, "...", totalPages);
            } else if (page >= totalPages - 3) {
                pages.push(
                    1,
                    "...",
                    totalPages - 4,
                    totalPages - 3,
                    totalPages - 2,
                    totalPages - 1,
                    totalPages
                );
            } else {
                pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
            }
        }
        return pages;
    };

    // ====================== RENDER ======================
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Payment Management</h1>
                    <p className="text-sm text-gray-500">Track and manage store payments</p>
                </div>

                <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Download PDF
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                <SummaryCard title="Total Orders" value={summary.totalOrders} />
                <SummaryCard
                    title="Total Amount"
                    value={`₹${Number(summary.totalAmount || 0).toLocaleString()}`}
                />
                <SummaryCard
                    title="Paid"
                    value={`₹${Number(summary.paidAmount || 0).toLocaleString()}`}
                    color="text-green-600"
                />
                <SummaryCard
                    title="Pending"
                    value={`₹${Number(summary.pendingAmount || 0).toLocaleString()}`}
                    color="text-yellow-600"
                />
                <SummaryCard
                    title="Refunded"
                    value={`₹${Number(summary.refundedAmount || 0).toLocaleString()}`}
                    color="text-purple-600"
                />
                <SummaryCard
                    title="COD / Online"
                    value={`${summary.codCount || 0} / ${summary.onlineCount || 0}`}
                />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {[
                        { key: "today", label: "Today" },
                        { key: "yesterday", label: "Yesterday" },
                        { key: "week", label: "Last 7 Days" },
                        { key: "month", label: "Last 30 Days" },
                    ].map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => applyQuickFilter(item.key)}
                            className={`px-4 py-1.5 text-sm rounded-full border transition ${activeQuickFilter === item.key
                                    ? "bg-indigo-600 text-white border-indigo-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <form
                    onSubmit={handleSearch}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
                >
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Order ID, Payment ID, Customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Payment Status
                        </label>
                        <select
                            value={paymentStatus}
                            onChange={(e) => {
                                setPaymentStatus(e.target.value);
                                setPagination((p) => ({ ...p, page: 1 }));
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Failed">Failed</option>
                            <option value="Refunded">Refunded</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Payment Method
                        </label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => {
                                setPaymentMethod(e.target.value);
                                setPagination((p) => ({ ...p, page: 1 }));
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">All Methods</option>
                            <option value="COD">COD</option>
                            <option value="Online">Online</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            From Date
                        </label>
                        <DatePicker
                            selected={fromDate}
                            onChange={(date) => {
                                setFromDate(date);
                                setActiveQuickFilter("");
                                setPagination((p) => ({ ...p, page: 1 }));
                            }}
                            dateFormat="dd MMM yyyy"
                            placeholderText="Start date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            isClearable
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            To Date
                        </label>
                        <DatePicker
                            selected={toDate}
                            onChange={(date) => {
                                setToDate(date);
                                setActiveQuickFilter("");
                                setPagination((p) => ({ ...p, page: 1 }));
                            }}
                            dateFormat="dd MMM yyyy"
                            placeholderText="End date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            isClearable
                        />
                    </div>
                </form>

                <div className="flex gap-3 mt-4">
                    <button
                        type="button"
                        onClick={handleSearch}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                    >
                        Apply Filters
                    </button>
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Order ID
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Customer
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Amount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Method
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
                                        Loading payments...
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
                                        No payments found
                                    </td>
                                </tr>
                            ) : (
                                payments.map((p) => (
                                    <tr key={p._id || p.orderId} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            {p.orderId}
                                            {p.paymentId && (
                                                <div
                                                    className="text-xs text-gray-400 mt-0.5 truncate max-w-35"
                                                    title={p.paymentId}
                                                >
                                                    {p.paymentId}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            <div>{p.deliveryAddress?.name || p.user?.name || "-"}</div>
                                            <div className="text-xs text-gray-400">
                                                {p.deliveryAddress?.phone || p.user?.phone || ""}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                            ₹{Number(p.totalAmount || 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${methodColor(
                                                    p.paymentMethod
                                                )}`}
                                            >
                                                {p.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(
                                                    p.paymentStatus
                                                )}`}
                                            >
                                                {p.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {p.createdAt
                                                ? format(new Date(p.createdAt), "dd MMM yyyy, hh:mm a")
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {p.paymentMethod === "COD" &&
                                                p.paymentStatus === "Pending" && (
                                                    <button
                                                        onClick={() => handleMarkAsPaid(p.orderId)}
                                                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition"
                                                    >
                                                        Mark as Paid
                                                    </button>
                                                )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            Showing{" "}
                            <span className="font-medium">
                                {(pagination.page - 1) * pagination.limit + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                                {Math.min(pagination.page * pagination.limit, pagination.total)}
                            </span>{" "}
                            of <span className="font-medium">{pagination.total}</span> results
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handlePageChange(1)}
                                disabled={pagination.page === 1}
                                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                            >
                                First
                            </button>

                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                            >
                                Prev
                            </button>

                            {getPageNumbers().map((pageNum, idx) =>
                                pageNum === "..." ? (
                                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`min-w-9 px-3 py-1.5 text-sm border rounded-lg ${pagination.page === pageNum
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "hover:bg-gray-50"
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                            >
                                Next
                            </button>

                            <button
                                onClick={() => handlePageChange(pagination.totalPages)}
                                disabled={pagination.page === pagination.totalPages}
                                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                            >
                                Last
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ====================== Summary Card ====================== */
const SummaryCard = ({ title, value, color = "text-gray-900" }) => (
    <div className="bg-white rounded-xl shadow-sm p-4">
        <p className="text-xs text-gray-500 mb-1">{title}</p>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
);

export default StorePaymentManagement;