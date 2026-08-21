import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  Store,
  Save,
} from "lucide-react";

const API = "http://localhost:5000";

export default function StoreSettings() {

  const storeId =
    localStorage.getItem("storeId");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

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
  });

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {

    try {

      const response =
        await axios.get(
          `${API}/api/stores/${storeId}`
        );

      const store =
        response.data.store;

      setForm({
        storeName:
          store.storeName || "",

        storeType:
          store.storeType || "grocery",

        description:
          store.description || "",

        phone:
          store.phone || "",

        email:
          store.email || "",

        logo:
          store.logo || "",

        banner:
          store.banner || "",

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
      });

    } catch (error) {

      console.error(
        "Store fetch failed:",
        error
      );

    } finally {

      setLoading(false);

    }

  };

  const updateField = (
    field,
    value
  ) => {

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

  };

  const updateAddress = (
    field,
    value
  ) => {

    setForm((prev) => ({
      ...prev,

      address: {
        ...prev.address,
        [field]: value,
      },
    }));

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setSaving(true);

      await axios.put(
        `${API}/api/stores/${storeId}`,
        form
      );

      alert(
        "Store updated successfully"
      );

    } catch (error) {

      alert(
        error.response?.data?.message ||
          "Failed to update store"
      );

    } finally {

      setSaving(false);

    }

  };

  if (loading) {
    return (
      <div className="p-8">
        Loading store...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">

      <div className="mb-8">

        <h1 className="text-2xl font-bold">
          Store Settings
        </h1>

        <p className="text-gray-500 mt-1">
          Manage your store information.
        </p>

      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        <section className="bg-white border rounded-xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <Store
              className="text-blue-600"
            />

            <h2 className="text-lg font-bold">
              Store Information
            </h2>

          </div>

          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className="label">
                Store Name
              </label>

              <input
                value={form.storeName}
                onChange={(e) =>
                  updateField(
                    "storeName",
                    e.target.value
                  )
                }
                className="input"
              />
            </div>

            <div>

              <label className="label">
                Store Type
              </label>

              <select
                value={form.storeType}
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

          <div className="mt-5">

            <label className="label">
              Description
            </label>

            <textarea
              rows="4"
              value={form.description}
              onChange={(e) =>
                updateField(
                  "description",
                  e.target.value
                )
              }
              className="input resize-none"
            />

          </div>

        </section>

        <section className="bg-white border rounded-xl p-6">

          <h2 className="text-lg font-bold mb-5">
            Contact
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            <div>

              <label className="label">
                Phone
              </label>

              <input
                value={form.phone}
                onChange={(e) =>
                  updateField(
                    "phone",
                    e.target.value
                  )
                }
                className="input"
              />

            </div>

            <div>

              <label className="label">
                Email
              </label>

              <input
                value={form.email}
                onChange={(e) =>
                  updateField(
                    "email",
                    e.target.value
                  )
                }
                className="input"
              />

            </div>

          </div>

        </section>

        <section className="bg-white border rounded-xl p-6">

          <h2 className="text-lg font-bold mb-5">
            Store Media
          </h2>

          <div className="space-y-5">

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
              />

            </div>

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
              />

            </div>

          </div>

        </section>

        <section className="bg-white border rounded-xl p-6">

          <h2 className="text-lg font-bold mb-5">
            Address
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            {[
              ["street", "Street"],
              ["city", "City"],
              ["state", "State"],
              ["pincode", "Pincode"],
              ["landmark", "Landmark"],
            ].map(
              ([key, label]) => (

                <div key={key}>

                  <label className="label">
                    {label}
                  </label>

                  <input
                    value={
                      form.address[key]
                    }
                    onChange={(e) =>
                      updateAddress(
                        key,
                        e.target.value
                      )
                    }
                    className="input"
                  />

                </div>

              )
            )}

          </div>

        </section>

        <div className="flex justify-end">

          <button
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-lg flex items-center gap-2"
          >

            <Save size={18} />

            {saving
              ? "Saving..."
              : "Save Changes"}

          </button>

        </div>

      </form>

      <style>{`
        .label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 11px 13px;
          outline: none;
        }

        .input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
        }
      `}</style>

    </div>
  );
}