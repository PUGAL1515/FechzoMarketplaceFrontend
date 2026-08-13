import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Header from "../src/components/common/Header";
import CartPage from "../src/components/common/CartPage";
import MarketplaceHome from "./marketplace/MarketplaceHome";

import GroceryHome from "./components/grocery/GroceryHome";
import GroceryProducts from "./components/grocery/GroceryProducts";

import FashionHome from "./components/fashion/FashionHome";
import FashionProducts from "./components/fashion/FashionProducts";

import ElectronicsHome from "./components/electronics/ElectronicsHome";
import ElectronicsProducts from "./components/electronics/ElectronicsProducts";

export default function App() {
  return (
    <BrowserRouter>
      <Header />

      <main>
        <Routes>
          <Route
            path="/"
            element={<MarketplaceHome />}
          />

          <Route
            path="/grocery"
            element={<GroceryHome />}
          />

          <Route
            path="/grocery/products"
            element={<GroceryProducts />}
          />

          <Route
            path="/fashion"
            element={<FashionHome />}
          />

          <Route
            path="/fashion/products"
            element={<FashionProducts />}
          />

          <Route
            path="/electronics"
            element={<ElectronicsHome />}
          />

          <Route
            path="/electronics/products"
            element={<ElectronicsProducts />}
          />

          <Route
            path="/cart"
            element={<CartPage />}
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}