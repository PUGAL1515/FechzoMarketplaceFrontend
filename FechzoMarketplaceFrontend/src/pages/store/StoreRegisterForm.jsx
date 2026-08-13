import { useState } from "react";
import axios from "axios";

const StoreRegisterForm = ({ storeType = "grocery" }) => {
  const [formData, setFormData] = useState({
    storeName: "",
    storeType: storeType,
    description: "",
    phone: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    },
    documents: {
      gstNumber: "",
      panNumber: "",
      aadhaarNumber: "",
    },
    bankDetails: {
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      upiId: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");
  setError("");

  try {
    const { data } = await axios.post(
      "http://localhost:5000/api/stores/register",
      formData
      // no Authorization header needed now
    );

    setMessage(data.message || "Store registered successfully!");
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Something went wrong. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  // Reusable input style
  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/focus:border-transparent transition";

  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div
          className="rounded-2xl p-6 mb-8 text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #1e3a8a, #02066f)" }}
        >
          <h1 className="text-2xl md:text-3xl font-bold capitalize">
            Register {storeType} Store
          </h1>
          <p className="mt-2 text-blue-100 text-sm md:text-base">
            Fill in the details below. Your store will be reviewed by our team
            before going live.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-10">
            
            {/* ========== Basic Information ========== */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, #1e3a8a, #02066f)" }}
                >
                  1
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  Basic Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Store Name *</label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="e.g. Fresh Mart"
                  />
                </div>

                <div>
                  <label className={labelClass}>Store Type</label>
                  <select
                    name="storeType"
                    value={formData.storeType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="grocery">Grocery</option>
                    <option value="fashion">Fashion</option>
                    <option value="electronic">Electronic</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className={inputClass}
                    placeholder="Tell customers about your store..."
                  />
                </div>

                <div>
                  <label className={labelClass}>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div>
                  <label className={labelClass}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="store@email.com"
                  />
                </div>
              </div>
            </section>

            {/* ========== Address ========== */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, #1e3a8a, #02066f)" }}
                >
                  2
                </div>
                <h2 className="text-lg font-bold text-gray-800">Address</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className={labelClass}>Street / Area</label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Shop no, street, area"
                  />
                </div>

                <div>
                  <label className={labelClass}>City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className={labelClass}>State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className={labelClass}>Pincode</label>
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="6-digit pincode"
                  />
                </div>

                <div>
                  <label className={labelClass}>Landmark</label>
                  <input
                    type="text"
                    name="address.landmark"
                    value={formData.address.landmark}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Nearby landmark"
                  />
                </div>
              </div>
            </section>

            {/* ========== Documents ========== */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, #1e3a8a, #02066f)" }}
                >
                  3
                </div>
                <h2 className="text-lg font-bold text-gray-800">Documents</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>GST Number</label>
                  <input
                    type="text"
                    name="documents.gstNumber"
                    value={formData.documents.gstNumber}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>

                <div>
                  <label className={labelClass}>PAN Number</label>
                  <input
                    type="text"
                    name="documents.panNumber"
                    value={formData.documents.panNumber}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="ABCDE1234F"
                  />
                </div>

                <div>
                  <label className={labelClass}>Aadhaar Number</label>
                  <input
                    type="text"
                    name="documents.aadhaarNumber"
                    value={formData.documents.aadhaarNumber}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="12-digit Aadhaar"
                  />
                </div>
              </div>
            </section>

            {/* ========== Bank Details ========== */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, #1e3a8a, #02066f)" }}
                >
                  4
                </div>
                <h2 className="text-lg font-bold text-gray-800">Bank Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Account Holder Name</label>
                  <input
                    type="text"
                    name="bankDetails.accountHolderName"
                    value={formData.bankDetails.accountHolderName}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Name as per bank"
                  />
                </div>

                <div>
                  <label className={labelClass}>Account Number</label>
                  <input
                    type="text"
                    name="bankDetails.accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Account number"
                  />
                </div>

                <div>
                  <label className={labelClass}>IFSC Code</label>
                  <input
                    type="text"
                    name="bankDetails.ifscCode"
                    value={formData.bankDetails.ifscCode}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. SBIN0001234"
                  />
                </div>

                <div>
                  <label className={labelClass}>Bank Name</label>
                  <input
                    type="text"
                    name="bankDetails.bankName"
                    value={formData.bankDetails.bankName}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Bank name"
                  />
                </div>

                <div>
                  <label className={labelClass}>UPI ID (optional)</label>
                  <input
                    type="text"
                    name="bankDetails.upiId"
                    value={formData.bankDetails.upiId}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="name@upi"
                  />
                </div>
              </div>
            </section>

            {/* ========== Submit ========== */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto min-w-[220px] text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: loading
                    ? "#64748b"
                    : "linear-gradient(135deg, #1e3a8a, #02066f)",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit for Approval"
                )}
              </button>
            </div>

            {/* Messages */}
            {message && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
                {message}
              </div>
            )}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreRegisterForm;