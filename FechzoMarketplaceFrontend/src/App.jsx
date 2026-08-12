import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Header from "./common/components/Header";
import CartPage from "./common/components/CartPage";
import MarketplaceHome from "./marketplace/MarketplaceHome";

import GroceryHome from "./grocery/GroceryHome";
import GroceryProducts from "./grocery/GroceryProducts";

import FashionHome from "./fashion/FashionHome";
import FashionProducts from "./fashion/FashionProducts";

import ElectronicsHome from "./electronics/ElectronicsHome";
import ElectronicsProducts from "./electronics/ElectronicsProducts";

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