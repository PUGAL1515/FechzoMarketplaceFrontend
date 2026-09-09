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

// 👇 New pages you will need
import StorePage from "./components/common/StorePage";           // Single store → products
import ProductDetail from "./components/common/ProductDetail"; // Single product page
import Wishlist from "../src/components/common/WishlistPage";      // Wishlist page
export default function App() {
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
          <Route path="/wishlist" element={<Wishlist />}/>
          {/* Optional: 404 */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </main>
    </BrowserRouter>
  );
}