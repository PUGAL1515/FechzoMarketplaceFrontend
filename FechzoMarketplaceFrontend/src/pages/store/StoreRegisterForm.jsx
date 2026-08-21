import { useState, useRef } from "react";
import axios from "axios";

const FileUploadButton = ({ label, name, accept = "image/*", multiple = false, onChange, preview, fileName }) => {
  const inputRef = useRef(null);
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        <input ref={inputRef} type="file" name={name} accept={accept} multiple={multiple} onChange={onChange} className="hidden" />
        <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-[#1e3a8a] hover:bg-blue-50 text-gray-700 hover:text-[#1e3a8a] transition-all duration-200 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {fileName ? "Change File" : "Choose File"}
        </button>
        {fileName && <span className="text-sm text-gray-600 truncate max-w-[180px]">{fileName}</span>}
      </div>
      {preview && typeof preview === "string" && <img src={preview} alt="preview" className="mt-3 h-24 w-24 object-cover rounded-lg border border-gray-200" />}
      {Array.isArray(preview) && preview.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {preview.map((src, i) => <img key={i} src={src} alt={`preview-${i}`} className="h-20 w-20 object-cover rounded-lg border border-gray-200" />)}
        </div>
      )}
    </div>
  );
};

const StoreRegisterForm = ({ storeType = "grocery" }) => {
  const [formData, setFormData] = useState({
    storeName: "", storeType, description: "", phone: "", email: "",
    username: "", password: "", confirmPassword: "",
    address: { street: "", city: "", state: "", pincode: "", landmark: "" },
    documents: { gstNumber: "", panNumber: "", aadhaarNumber: "", fssaiNumber: "" },
    bankDetails: { accountHolderName: "", accountNumber: "", ifscCode: "", bankName: "", upiId: "" },
    ownerDetails: { name: "", phone: "", email: "", designation: "Owner" },
    deliveryRadius: 5, minOrderValue: 0,
  });

  const [files, setFiles] = useState({
    logo: null, banner: null, storefrontImage: null,
    interiorImages: [], kitchenImages: [], packagingImages: [], images: [],
    gstCertificate: null, panCard: null, aadhaarCard: null, shopLicense: null,
    fssaiCertificate: null, cancelledCheque: null, addressProof: null,
  });

  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles?.[0];
    if (!file) return;
    setFiles((prev) => ({ ...prev, [name]: file }));
    setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
  };

  const handleMultipleFiles = (e) => {
    const { name, files: selectedFiles } = e.target;
    const fileArray = Array.from(selectedFiles || []);
    setFiles((prev) => ({ ...prev, [name]: fileArray }));
    setPreviews((prev) => ({ ...prev, [name]: fileArray.map((file) => URL.createObjectURL(file)) }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) { setError("Please enter a username."); return false; }
    if (formData.username.trim().length < 4) { setError("Username must be at least 4 characters."); return false; }
    if (!formData.password) { setError("Please enter a password."); return false; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters."); return false; }
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match."); return false; }
    if (!formData.storeName.trim()) { setError("Please enter store name."); return false; }
    if (!formData.phone.trim()) { setError("Please enter phone number."); return false; }
    if (!formData.email.trim()) { setError("Please enter email."); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(""); setError("");
    if (!validateForm()) { setLoading(false); return; }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("storeName", formData.storeName.trim());
      formDataToSend.append("storeType", formData.storeType);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("phone", formData.phone.trim());
      formDataToSend.append("email", formData.email.trim());
      formDataToSend.append("username", formData.username.trim().toLowerCase());
      formDataToSend.append("password", formData.password);
      formDataToSend.append("deliveryRadius", formData.deliveryRadius);
      formDataToSend.append("minOrderValue", formData.minOrderValue);
      formDataToSend.append("address", JSON.stringify(formData.address));
      formDataToSend.append("documents", JSON.stringify(formData.documents));
      formDataToSend.append("bankDetails", JSON.stringify(formData.bankDetails));
      formDataToSend.append("ownerDetails", JSON.stringify(formData.ownerDetails));
      formDataToSend.append("operatingHours", JSON.stringify([]));

      if (files.logo) formDataToSend.append("logo", files.logo);
      if (files.banner) formDataToSend.append("banner", files.banner);
      if (files.storefrontImage) formDataToSend.append("storefrontImage", files.storefrontImage);
      if (files.gstCertificate) formDataToSend.append("gstCertificate", files.gstCertificate);
      if (files.panCard) formDataToSend.append("panCard", files.panCard);
      if (files.aadhaarCard) formDataToSend.append("aadhaarCard", files.aadhaarCard);
      if (files.shopLicense) formDataToSend.append("shopLicense", files.shopLicense);
      if (files.fssaiCertificate) formDataToSend.append("fssaiCertificate", files.fssaiCertificate);
      if (files.cancelledCheque) formDataToSend.append("cancelledCheque", files.cancelledCheque);
      if (files.addressProof) formDataToSend.append("addressProof", files.addressProof);

      files.interiorImages?.forEach((file) => formDataToSend.append("interiorImages", file));
      files.kitchenImages?.forEach((file) => formDataToSend.append("kitchenImages", file));
      files.packagingImages?.forEach((file) => formDataToSend.append("packagingImages", file));
      files.images?.forEach((file) => formDataToSend.append("images", file));

      console.log("========== STORE REGISTRATION ==========");
      for (const [key, value] of formDataToSend.entries()) {
        console.log(key, value instanceof File ? `=> FILE: ${value.name}` : `=> ${value}`);
      }

      const response = await axios.post("http://localhost:5000/api/stores/register", formDataToSend, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        timeout: 120000,
      });

      console.log("Store Registration Response:", response.data);
      setMessage(response.data?.message || "Store registration submitted successfully.");
      setError("");
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err) {
      console.error("Store Registration Error:", err);
      const backendMessage = err.response?.data?.message || err.response?.data?.error;
      if (backendMessage) setError(backendMessage);
      else if (err.code === "ECONNABORTED") setError("Request timed out. Please check your server and try again.");
      else if (err.message === "Network Error") setError("Cannot connect to server. Please make sure the backend is running.");
      else setError("Something went wrong. Please try again.");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent transition";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";
  const sectionTitle = (num, title) => (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: "linear-gradient(135deg, #1e3a8a, #02066f)" }}>{num}</div>
      <h2 className="text-lg font-bold text-gray-800">{title}</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl p-6 mb-8 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #1e3a8a, #02066f)" }}>
          <h1 className="text-2xl md:text-3xl font-bold capitalize">Register {formData.storeType} Store</h1>
          <p className="mt-2 text-blue-100 text-sm md:text-base">Fill in the details below. Your store will be reviewed by our team before going live.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-10">
            <section>
              {sectionTitle(1, "Basic Information")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Store Name *</label>
                  <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} required className={inputClass} placeholder="e.g. Fresh Mart" />
                </div>
                <div>
                  <label className={labelClass}>Store Type *</label>
                  <select name="storeType" value={formData.storeType} onChange={handleChange} required className={inputClass}>
                    <option value="grocery">Grocery</option>
                    <option value="fashion">Fashion</option>
                    <option value="electronic">Electronic</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass} placeholder="Tell customers about your store..." />
                </div>
                <div>
                  <label className={labelClass}>Phone *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className={inputClass} placeholder="10-digit mobile number" />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} placeholder="store@email.com" />
                </div>
              </div>
            </section>

            <section>
              {sectionTitle(2, "Store Login Credentials")}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                <p className="text-sm text-blue-800">These credentials will be used by the store owner to login to the Store Admin Dashboard after admin approval.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Username *</label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange} required minLength={4} autoComplete="username" className={inputClass} placeholder="e.g. freshmart" />
                  <p className="mt-1 text-xs text-gray-500">Minimum 4 characters. This username must be unique.</p>
                </div>
                <div>
                  <label className={labelClass}>Password *</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required minLength={6} autoComplete="new-password" className={`${inputClass} pr-12`} placeholder="Enter password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1e3a8a]">{showPassword ? "Hide" : "Show"}</button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Minimum 6 characters.</p>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Confirm Password *</label>
                  <div className="relative max-w-md">
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required autoComplete="new-password" className={`${inputClass} pr-12`} placeholder="Re-enter password" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1e3a8a]">{showConfirmPassword ? "Hide" : "Show"}</button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && <p className="mt-1 text-xs text-green-600">Passwords match.</p>}
                </div>
              </div>
            </section>

            <section>
              {sectionTitle(3, "Owner / Contact Person")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Owner Name</label>
                  <input type="text" name="ownerDetails.name" value={formData.ownerDetails.name} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Owner Phone</label>
                  <input type="tel" name="ownerDetails.phone" value={formData.ownerDetails.phone} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Owner Email</label>
                  <input type="email" name="ownerDetails.email" value={formData.ownerDetails.email} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Designation</label>
                  <input type="text" name="ownerDetails.designation" value={formData.ownerDetails.designation} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </section>

            <section>
              {sectionTitle(4, "Address")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className={labelClass}>Street / Area</label>
                  <input type="text" name="address.street" value={formData.address.street} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input type="text" name="address.state" value={formData.address.state} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Pincode</label>
                  <input type="text" name="address.pincode" value={formData.address.pincode} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Landmark</label>
                  <input type="text" name="address.landmark" value={formData.address.landmark} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </section>

            <section>
              {sectionTitle(5, "Document Numbers")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>GST Number</label>
                  <input type="text" name="documents.gstNumber" value={formData.documents.gstNumber} onChange={handleChange} className={inputClass} placeholder="22AAAAA0000A1Z5" />
                </div>
                <div>
                  <label className={labelClass}>PAN Number</label>
                  <input type="text" name="documents.panNumber" value={formData.documents.panNumber} onChange={handleChange} className={inputClass} placeholder="ABCDE1234F" />
                </div>
                <div>
                  <label className={labelClass}>Aadhaar Number</label>
                  <input type="text" name="documents.aadhaarNumber" value={formData.documents.aadhaarNumber} onChange={handleChange} className={inputClass} />
                </div>
                {formData.storeType === "grocery" && (
                  <div>
                    <label className={labelClass}>FSSAI Number</label>
                    <input type="text" name="documents.fssaiNumber" value={formData.documents.fssaiNumber} onChange={handleChange} className={inputClass} />
                  </div>
                )}
              </div>
            </section>

            <section>
              {sectionTitle(6, "Bank Details")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Account Holder Name</label>
                  <input type="text" name="bankDetails.accountHolderName" value={formData.bankDetails.accountHolderName} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Account Number</label>
                  <input type="text" name="bankDetails.accountNumber" value={formData.bankDetails.accountNumber} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>IFSC Code</label>
                  <input type="text" name="bankDetails.ifscCode" value={formData.bankDetails.ifscCode} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Bank Name</label>
                  <input type="text" name="bankDetails.bankName" value={formData.bankDetails.bankName} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>UPI ID</label>
                  <input type="text" name="bankDetails.upiId" value={formData.bankDetails.upiId} onChange={handleChange} className={inputClass} placeholder="optional@upi" />
                </div>
              </div>
            </section>

            <section>
              {sectionTitle(7, "Upload Images & Documents")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUploadButton label="Store Logo" name="logo" accept="image/*" onChange={handleFileChange} preview={previews.logo} fileName={files.logo?.name} />
                <FileUploadButton label="Banner Image" name="banner" accept="image/*" onChange={handleFileChange} preview={previews.banner} fileName={files.banner?.name} />
                <FileUploadButton label="Storefront Photo *" name="storefrontImage" accept="image/*" onChange={handleFileChange} preview={previews.storefrontImage} fileName={files.storefrontImage?.name} />
                <FileUploadButton label="Interior Photos" name="interiorImages" accept="image/*" multiple onChange={handleMultipleFiles} preview={previews.interiorImages} fileName={files.interiorImages?.length ? `${files.interiorImages.length} file(s) selected` : null} />
                {formData.storeType === "grocery" && (
                  <FileUploadButton label="Kitchen Photos" name="kitchenImages" accept="image/*" multiple onChange={handleMultipleFiles} preview={previews.kitchenImages} fileName={files.kitchenImages?.length ? `${files.kitchenImages.length} file(s) selected` : null} />
                )}
                <FileUploadButton label="Packaging Photos" name="packagingImages" accept="image/*" multiple onChange={handleMultipleFiles} preview={previews.packagingImages} fileName={files.packagingImages?.length ? `${files.packagingImages.length} file(s) selected` : null} />
                <FileUploadButton label="Gallery Images" name="images" accept="image/*" multiple onChange={handleMultipleFiles} preview={previews.images} fileName={files.images?.length ? `${files.images.length} file(s) selected` : null} />
                <FileUploadButton label="GST Certificate" name="gstCertificate" accept="image/*,.pdf" onChange={handleFileChange} fileName={files.gstCertificate?.name} />
                <FileUploadButton label="PAN Card" name="panCard" accept="image/*,.pdf" onChange={handleFileChange} fileName={files.panCard?.name} />
                <FileUploadButton label="Aadhaar Card" name="aadhaarCard" accept="image/*,.pdf" onChange={handleFileChange} fileName={files.aadhaarCard?.name} />
                <FileUploadButton label="Shop License" name="shopLicense" accept="image/*,.pdf" onChange={handleFileChange} fileName={files.shopLicense?.name} />
                {formData.storeType === "grocery" && (
                  <FileUploadButton label="FSSAI Certificate" name="fssaiCertificate" accept="image/*,.pdf" onChange={handleFileChange} fileName={files.fssaiCertificate?.name} />
                )}
                <FileUploadButton label="Cancelled Cheque" name="cancelledCheque" accept="image/*,.pdf" onChange={handleFileChange} fileName={files.cancelledCheque?.name} />
                <FileUploadButton label="Address Proof" name="addressProof" accept="image/*,.pdf" onChange={handleFileChange} fileName={files.addressProof?.name} />
              </div>
            </section>

            <section>
              {sectionTitle(8, "Delivery Settings")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Delivery Radius (KM)</label>
                  <input type="number" min="1" value={formData.deliveryRadius} onChange={(e) => setFormData((prev) => ({ ...prev, deliveryRadius: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Minimum Order Value (₹)</label>
                  <input type="number" min="0" value={formData.minOrderValue} onChange={(e) => setFormData((prev) => ({ ...prev, minOrderValue: e.target.value }))} className={inputClass} />
                </div>
              </div>
            </section>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
                <div className="flex items-start gap-3">
                  <span className="text-red-600 text-lg">⚠</span>
                  <div>{error}</div>
                </div>
              </div>
            )}

            {message && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
                <div className="flex items-start gap-3">
                  <span className="text-green-600 text-lg">✓</span>
                  <div>{message}</div>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button type="submit" disabled={loading} className="w-full md:w-auto min-w-[240px] text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: loading ? "#64748b" : "linear-gradient(135deg, #1e3a8a, #02066f)" }}>
                {loading ? "Submitting..." : "Submit Store for Approval"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreRegisterForm;