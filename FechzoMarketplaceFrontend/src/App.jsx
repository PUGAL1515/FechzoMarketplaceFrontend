import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Header from "./components/common/Header";
import CartPage from "./components/common/CartPage";

import MarketplaceHome from "./marketplace/MarketplaceHome";

// Category pages
import GroceryHome from "./components/grocery/GroceryHome";
import GroceryProducts from "./components/grocery/GroceryProducts";

import FashionHome from "./components/fashion/FashionHome";
import FashionProducts from "./components/fashion/FashionProducts";

import ElectronicsHome from "./components/electronics/ElectronicsHome";
import ElectronicsProducts from "./components/electronics/ElectronicsProducts";

// Store related
import StoreRegisterForm from "./pages/store/StoreRegisterForm";
import StoreAdmin from "./pages/storeAdmin/StoreAdmin";
import StoreLogin from "./pages/storeAdmin/StoreLogin";

import StorePage from "./components/common/StorePage";
import ProductDetail from "./components/common/ProductDetail";
import StoreAds from "./pages/storeAdmin/StoreAds";
import AdForm from "./pages/storeAdmin/AdForm";

 // Single product page
import Wishlist from "../src/components/common/WishlistPage";      // Wishlist page
import OrderPage from "./pages/orders/OrderPage";
export default function App() {
  // ============================================================
  // LOGIN TRANSFER FROM FECHZO FOOD (5173)
  // ============================================================
  useEffect(() => {
  const handleLoginTransfer = () => {
    try {
      const params = new URLSearchParams(window.location.search);

      const token = params.get("token");
      const userStr = params.get("user"); // already decoded by URLSearchParams

      // No transfer parameters
      if (!token || !userStr) return;

      // Parse the user (NO extra decodeURIComponent)
      const user = JSON.parse(userStr);

      // Save in Marketplace
      localStorage.setItem("jwt_token", token);
      localStorage.setItem("userProfile", JSON.stringify(user));

      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Notify Header
      window.dispatchEvent(new Event("auth-changed"));

      console.log("✅ Login transferred successfully:", user);
    } catch (error) {
      console.error("❌ Error processing login transfer:", error);
    }
  };

  handleLoginTransfer();
}, []);

  return (
    <BrowserRouter>
      <Header />

      <main className="min-h-screen bg-slate-50">
        <Routes>
          {/* ====================== HOME ====================== */}
          <Route path="/" element={<MarketplaceHome />} />

          {/* ====================== GROCERY ====================== */}
          <Route path="/grocery" element={<GroceryHome />} />
          <Route path="/grocery/products" element={<GroceryProducts />} />
          <Route path="/grocery/product/:productId" element={<ProductDetail />} />

          {/* ====================== FASHION ====================== */}
          <Route path="/fashion" element={<FashionHome />} />
          <Route path="/fashion/products" element={<FashionProducts />} />
          <Route path="/fashion/product/:productId" element={<ProductDetail />} />

          {/* ====================== ELECTRONICS ====================== */}
          <Route path="/electronics" element={<ElectronicsHome />} />
          <Route path="/electronics/products" element={<ElectronicsProducts />} />
          <Route path="/electronics/product/:productId" element={<ProductDetail />} />

          {/* ====================== STORE ====================== */}
          <Route path="/store/:storeId" element={<StorePage />} />

          {/* ====================== CART ====================== */}
          <Route path="/cart" element={<CartPage />} />

          {/* ====================== STORE REGISTRATION ====================== */}
          <Route path="/register-store" element={<StoreRegisterForm />} />

          {/* ====================== STORE ADMIN ====================== */}
          <Route path="/store-admin/login" element={<StoreLogin />} />
          <Route path="/store-admin/dashboard" element={<StoreAdmin />} />
          <Route path="/store-admin/ads" element={<StoreAds />} />
          <Route path="/store-admin/ads/create" element={<AdForm />} />
          <Route path="/store-admin/ads/edit/:id" element={<AdForm />} />
          <Route
path="/wishlist"element={<Wishlist />}/>
          {/* Optional: 404 */}
          {/* <Route path="*" element={<NotFound />} /> */}
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}