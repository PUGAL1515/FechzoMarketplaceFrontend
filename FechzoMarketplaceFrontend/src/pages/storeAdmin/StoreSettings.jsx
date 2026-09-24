import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  Store,
  Save,
  Phone,
  Mail,
  Image as ImageIcon,
  MapPin,
  Clock3,
  CheckCircle2,
  XCircle,
  Loader2,
  Building2,
  Info,
  Copy,
} from "lucide-react";

const API = "http://localhost:5000";

const DAYS = [
  {
    key: "monday",
    label: "Monday",
    short: "MON",
  },
  {
    key: "tuesday",
    label: "Tuesday",
    short: "TUE",
  },
  {
    key: "wednesday",
    label: "Wednesday",
    short: "WED",
  },
  {
    key: "thursday",
    label: "Thursday",
    short: "THU",
  },
  {
    key: "friday",
    label: "Friday",
    short: "FRI",
  },
  {
    key: "saturday",
    label: "Saturday",
    short: "SAT",
  },
  {
    key: "sunday",
    label: "Sunday",
    short: "SUN",
  },
];

const DEFAULT_OPERATING_HOURS = DAYS.map((day) => ({
  day: day.key,
  open: "09:00",
  close: "21:00",
  isClosed: day.key === "sunday",
}));

const getDefaultHours = () =>
  DEFAULT_OPERATING_HOURS.map((item) => ({
    ...item,
  }));

export default function StoreSettings() {
  const storeId = localStorage.getItem("storeId");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [saveMessage, setSaveMessage] = useState("");

  const [form, setForm] = useState({
    storeName: "",
    storeType: "grocery",
    description: "",
    phone: "",
    email: "",
    logo: "",
    banner: "",

    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    },

    operatingHours: getDefaultHours(),
  });

  // ============================================================
  // FETCH STORE
  // ============================================================

  useEffect(() => {
    if (storeId) {
      fetchStore();
    } else {
      setLoading(false);
    }
  }, [storeId]);

  const fetchStore = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("storeToken");

      if (!token) {
        console.error("Store token not found");

        alert(
          "Store session expired. Please login again."
        );

        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API}/api/stores/owner/${storeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const store = response.data.data;

      const existingHours = Array.isArray(
        store.operatingHours
      )
        ? store.operatingHours
        : [];

      const normalizedHours = DAYS.map((day) => {
        const found = existingHours.find(
          (item) => item.day === day.key
        );

        return (
          found || {
            day: day.key,
            open: "09:00",
            close: "21:00",
            isClosed: day.key === "sunday",
          }
        );
      });

      setForm({
        storeName: store.storeName || "",

        storeType:
          store.storeType || "grocery",

        description:
          store.description || "",

        phone: store.phone || "",

        email: store.email || "",

        logo: store.logo || "",

        banner: store.banner || "",

        address: {
          street:
            store.address?.street || "",

          city:
            store.address?.city || "",

          state:
            store.address?.state || "",

          pincode:
            store.address?.pincode || "",

          landmark:
            store.address?.landmark || "",
        },

        operatingHours: normalizedHours,
      });
    } catch (error) {
      console.error(
        "Store fetch failed:",
        error.response?.data || error
      );

      if (error.response?.status === 401) {
        alert(
          "Your store session has expired. Please login again."
        );
      } else if (error.response?.status === 403) {
        alert(
          "You are not authorized to access this store."
        );
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to load store settings"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FIELD UPDATE
  // ============================================================

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateAddress = (field, value) => {
    setForm((prev) => ({
      ...prev,

      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  // ============================================================
  // OPERATING HOURS
  // ============================================================

  const updateOperatingHour = (
    index,
    field,
    value
  ) => {
    setForm((prev) => {
      const hours = [
        ...prev.operatingHours,
      ];

      hours[index] = {
        ...hours[index],
        [field]: value,
      };

      return {
        ...prev,
        operatingHours: hours,
      };
    });
  };

  const toggleOperatingDay = (index) => {
    setForm((prev) => {
      const hours = [
        ...prev.operatingHours,
      ];

      hours[index] = {
        ...hours[index],

        isClosed:
          !hours[index].isClosed,
      };

      return {
        ...prev,
        operatingHours: hours,
      };
    });
  };

  const copyMondayToAll = () => {
    const monday =
      form.operatingHours.find(
        (item) => item.day === "monday"
      );

    if (!monday) return;

    const updatedHours = DAYS.map((day) => ({
      day: day.key,
      open: monday.open,
      close: monday.close,
      isClosed: monday.isClosed,
    }));

    setForm((prev) => ({
      ...prev,
      operatingHours: updatedHours,
    }));
  };

  // ============================================================
  // OPEN DAYS COUNT
  // ============================================================

  const openDaysCount = useMemo(() => {
    return form.operatingHours.filter(
      (item) => !item.isClosed
    ).length;
  }, [form.operatingHours]);

  // ============================================================
  // VALIDATE
  // ============================================================

  const validateHours = () => {
    for (
      const item of form.operatingHours
    ) {
      if (item.isClosed) {
        continue;
      }

      if (!item.open || !item.close) {
        return `${item.day} opening and closing time are required`;
      }

      if (item.close <= item.open) {
        return `${item.day}: closing time must be after opening time`;
      }
    }

    return null;
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaveMessage("");

    const timingError =
      validateHours();

    if (timingError) {
      alert(timingError);
      return;
    }

    try {
      setSaving(true);

      // Get store token
      const token =
        localStorage.getItem(
          "storeToken"
        );

      // Check token
      if (!token) {
        alert(
          "Store session expired. Please login again."
        );

        return;
      }

      // Check store ID
      if (!storeId) {
        alert(
          "Store ID not found. Please login again."
        );

        return;
      }

      const response =
        await axios.put(
          `${API}/api/stores/owner/${storeId}`,
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

      console.log(
        "Store update response:",
        response.data
      );

      setSaveMessage(
        "Store settings saved successfully"
      );

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Store update failed:",
        error.response?.data || error
      );

      if (
        error.response?.status === 401
      ) {
        alert(
          "Your store session has expired. Please login again."
        );
      } else if (
        error.response?.status === 403
      ) {
        alert(
          "You are not authorized to update this store."
        );
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to update store"
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={32}
            className="animate-spin text-blue-600"
          />

          <p className="text-gray-500 text-sm">
            Loading store settings...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <Store
                size={25}
                className="text-blue-600"
              />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Store Settings
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Manage your store profile,
                contact details and business
                hours.
              </p>
            </div>
          </div>

          <button
            type="submit"
            form="store-settings-form"
            disabled={saving}
            className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl font-semibold shadow-sm transition"
          >
            {saving ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Save size={18} />
            )}

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>

        {/* SAVE MESSAGE */}

        {saveMessage && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
            <CheckCircle2 size={19} />

            <span className="text-sm font-medium">
              {saveMessage}
            </span>
          </div>
        )}

        <form
          id="store-settings-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* STORE INFORMATION */}

          <section className="card">

            <div className="section-header">

              <div className="icon-box bg-blue-50">
                <Building2
                  size={20}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="section-title">
                  Store Information
                </h2>

                <p className="section-description">
                  Basic information about
                  your store
                </p>
              </div>

            </div>

            <div className="p-6 space-y-5">

              <div className="grid md:grid-cols-2 gap-5">

                <div>
                  <label className="label">
                    Store Name
                  </label>

                  <input
                    value={
                      form.storeName
                    }
                    onChange={(e) =>
                      updateField(
                        "storeName",
                        e.target.value
                      )
                    }
                    className="input"
                    placeholder="Enter store name"
                  />
                </div>

                <div>
                  <label className="label">
                    Store Type
                  </label>

                  <select
                    value={
                      form.storeType
                    }
                    onChange={(e) =>
                      updateField(
                        "storeType",
                        e.target.value
                      )
                    }
                    className="input"
                  >
                    <option value="grocery">
                      Grocery
                    </option>

                    <option value="fashion">
                      Fashion
                    </option>

                    <option value="electronics">
                      Electronics
                    </option>
                  </select>
                </div>

              </div>

              <div>
                <label className="label">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={
                    form.description
                  }
                  onChange={(e) =>
                    updateField(
                      "description",
                      e.target.value
                    )
                  }
                  className="input resize-none"
                  placeholder="Describe your store..."
                />

                <p className="text-xs text-gray-400 mt-2">
                  Add a short description
                  customers can understand
                  easily.
                </p>
              </div>

            </div>
          </section>

          {/* CONTACT */}

          <section className="card">

            <div className="section-header">

              <div className="icon-box bg-green-50">
                <Phone
                  size={20}
                  className="text-green-600"
                />
              </div>

              <div>
                <h2 className="section-title">
                  Contact Information
                </h2>

                <p className="section-description">
                  Contact details for
                  customers
                </p>
              </div>

            </div>

            <div className="p-6">

              <div className="grid md:grid-cols-2 gap-5">

                <div>
                  <label className="label">
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone
                      size={17}
                      className="input-icon"
                    />

                    <input
                      value={form.phone}
                      onChange={(e) =>
                        updateField(
                          "phone",
                          e.target.value
                        )
                      }
                      className="input pl-10"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="input-icon"
                    />

                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        updateField(
                          "email",
                          e.target.value
                        )
                      }
                      className="input pl-10"
                      placeholder="store@example.com"
                    />
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* MEDIA */}

          <section className="card">

            <div className="section-header">

              <div className="icon-box bg-purple-50">
                <ImageIcon
                  size={20}
                  className="text-purple-600"
                />
              </div>

              <div>
                <h2 className="section-title">
                  Store Media
                </h2>

                <p className="section-description">
                  Manage your store logo
                  and banner
                </p>
              </div>

            </div>

            <div className="p-6">

              <div className="grid lg:grid-cols-2 gap-6">

                {/* LOGO */}

                <div>
                  <label className="label">
                    Logo URL
                  </label>

                  <input
                    value={form.logo}
                    onChange={(e) =>
                      updateField(
                        "logo",
                        e.target.value
                      )
                    }
                    className="input"
                    placeholder="https://..."
                  />

                  <div className="media-preview">

                    {form.logo ? (
                      <img
                        src={form.logo}
                        alt="Store logo"
                        className="max-h-24 max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon
                          size={30}
                          className="mx-auto mb-2"
                        />

                        <p className="text-sm">
                          Logo preview
                        </p>
                      </div>
                    )}

                  </div>
                </div>

                {/* BANNER */}

                <div>
                  <label className="label">
                    Banner URL
                  </label>

                  <input
                    value={form.banner}
                    onChange={(e) =>
                      updateField(
                        "banner",
                        e.target.value
                      )
                    }
                    className="input"
                    placeholder="https://..."
                  />

                  <div className="media-preview h-32 overflow-hidden">

                    {form.banner ? (
                      <img
                        src={form.banner}
                        alt="Store banner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon
                          size={30}
                          className="mx-auto mb-2"
                        />

                        <p className="text-sm">
                          Banner preview
                        </p>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* OPERATING HOURS */}

          <section className="card">

            <div className="section-header flex-col sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="icon-box bg-orange-50">
                  <Clock3
                    size={20}
                    className="text-orange-600"
                  />
                </div>

                <div>
                  <h2 className="section-title">
                    Store Timings
                  </h2>

                  <p className="section-description">
                    Manage weekly opening
                    hours
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={
                  copyMondayToAll
                }
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                <Copy size={16} />

                Apply Monday to all
              </button>

            </div>

            <div className="p-4 sm:p-6">

              {/* SUMMARY */}

              <div className="grid grid-cols-2 gap-3 mb-5">

                <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                  <p className="text-xs text-green-600 font-medium">
                    Open Days
                  </p>

                  <p className="text-2xl font-bold text-green-700 mt-1">
                    {openDaysCount}

                    <span className="text-sm font-medium">
                      {" "}
                      / 7
                    </span>
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 font-medium">
                    Closed Days
                  </p>

                  <p className="text-2xl font-bold text-gray-700 mt-1">
                    {7 - openDaysCount}

                    <span className="text-sm font-medium">
                      {" "}
                      / 7
                    </span>
                  </p>
                </div>

              </div>

              {/* INFO */}

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 flex gap-3">

                <Info
                  size={19}
                  className="text-blue-600 mt-0.5 shrink-0"
                />

                <p className="text-sm text-blue-700">
                  Set your regular weekly
                  business hours. Closed
                  days will not accept
                  orders based on store
                  timing.
                </p>

              </div>

              {/* DAYS */}

              <div className="space-y-3">

                {form.operatingHours.map(
                  (timing, index) => {

                    const day =
                      DAYS[index];

                    return (
                      <div
                        key={
                          timing.day
                        }
                        className={`border rounded-xl p-4 transition ${
                          timing.isClosed
                            ? "bg-gray-50 border-gray-200"
                            : "bg-white border-gray-200"
                        }`}
                      >

                        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1fr_auto] gap-4 items-end">

                          {/* DAY */}

                          <div className="flex items-center gap-3">

                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold ${
                                timing.isClosed
                                  ? "bg-gray-200 text-gray-500"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {
                                day.short
                              }
                            </div>

                            <div>
                              <p className="font-semibold text-gray-900">
                                {
                                  day.label
                                }
                              </p>

                              <div className="flex items-center gap-1.5 mt-1">

                                {timing.isClosed ? (
                                  <>
                                    <XCircle
                                      size={
                                        13
                                      }
                                      className="text-gray-400"
                                    />

                                    <span className="text-xs text-gray-500">
                                      Closed
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2
                                      size={
                                        13
                                      }
                                      className="text-green-500"
                                    />

                                    <span className="text-xs text-green-600">
                                      Open
                                    </span>
                                  </>
                                )}

                              </div>
                            </div>

                          </div>

                          {/* OPEN TIME */}

                          <div>
                            <label className="time-label">
                              Opening Time
                            </label>

                            <input
                              type="time"
                              value={
                                timing.open
                              }
                              disabled={
                                timing.isClosed
                              }
                              onChange={(
                                e
                              ) =>
                                updateOperatingHour(
                                  index,
                                  "open",
                                  e.target
                                    .value
                                )
                              }
                              className="input disabled:bg-gray-100 disabled:text-gray-400"
                            />
                          </div>

                          {/* CLOSE TIME */}

                          <div>
                            <label className="time-label">
                              Closing Time
                            </label>

                            <input
                              type="time"
                              value={
                                timing.close
                              }
                              disabled={
                                timing.isClosed
                              }
                              onChange={(
                                e
                              ) =>
                                updateOperatingHour(
                                  index,
                                  "close",
                                  e.target
                                    .value
                                )
                              }
                              className="input disabled:bg-gray-100 disabled:text-gray-400"
                            />
                          </div>

                          {/* STATUS */}

                          <button
                            type="button"
                            onClick={() =>
                              toggleOperatingDay(
                                index
                              )
                            }
                            className={`h-[46px] inline-flex items-center justify-center gap-2 px-5 rounded-xl text-sm font-semibold transition ${
                              timing.isClosed
                                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {timing.isClosed ? (
                              <>
                                <XCircle
                                  size={
                                    17
                                  }
                                />
                                Closed
                              </>
                            ) : (
                              <>
                                <CheckCircle2
                                  size={
                                    17
                                  }
                                />
                                Open
                              </>
                            )}
                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            </div>
          </section>

          {/* ADDRESS */}

          <section className="card">

            <div className="section-header">

              <div className="icon-box bg-red-50">
                <MapPin
                  size={20}
                  className="text-red-600"
                />
              </div>

              <div>
                <h2 className="section-title">
                  Store Address
                </h2>

                <p className="section-description">
                  Location details of your
                  store
                </p>
              </div>

            </div>

            <div className="p-6">

              <div className="grid md:grid-cols-2 gap-5">

                {[
                  [
                    "street",
                    "Street Address",
                  ],
                  ["city", "City"],
                  ["state", "State"],
                  [
                    "pincode",
                    "Pincode",
                  ],
                  [
                    "landmark",
                    "Landmark",
                  ],
                ].map(
                  ([key, label]) => (
                    <div
                      key={key}
                      className={
                        key ===
                        "street"
                          ? "md:col-span-2"
                          : ""
                      }
                    >
                      <label className="label">
                        {label}
                      </label>

                      <input
                        value={
                          form.address[
                            key
                          ]
                        }
                        onChange={(e) =>
                          updateAddress(
                            key,
                            e.target.value
                          )
                        }
                        className="input"
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                    </div>
                  )
                )}

              </div>
            </div>
          </section>

          {/* BOTTOM SAVE */}

          <div className="flex justify-end pb-8">

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3.5 rounded-xl font-semibold shadow-sm transition"
            >
              {saving ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save size={18} />
              )}

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>
        </form>
      </div>

      {/* STYLES */}

      <style>{`

        .card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }

        .section-header {
          min-height: 76px;
          padding: 18px 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-box {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #111827;
        }

        .section-description {
          font-size: 13px;
          color: #6b7280;
          margin-top: 3px;
        }

        .label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .time-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 6px;
        }

        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 11px 13px;
          background: #ffffff;
          color: #111827;
          outline: none;
          transition: all 0.2s ease;
        }

        .input:hover {
          border-color: #9ca3af;
        }

        .input:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px
            rgba(37, 99, 235, 0.08);
        }

        .input:disabled {
          cursor: not-allowed;
        }

        .input-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .media-preview {
          margin-top: 12px;
          height: 128px;
          border: 1px dashed #d1d5db;
          border-radius: 12px;
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        button {
          transition:
            background-color 0.2s ease,
            color 0.2s ease,
            transform 0.15s ease;
        }

        button:active {
          transform: scale(0.98);
        }

        @media (max-width: 640px) {
          .section-header {
            padding: 16px;
          }
        }

      `}</style>
    </div>
  );
}