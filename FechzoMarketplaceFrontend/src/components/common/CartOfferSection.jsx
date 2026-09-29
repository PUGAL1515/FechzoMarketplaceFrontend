import React, { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import api from "../../api";

const OFFER_APPLICABLE = "/marketplace/store/offers/offers/applicable";
const OFFER_VALIDATE_COUPON = "/marketplace/store/offers/offers/validate-coupon";

/**
 * Handles auto offers + coupon codes for cart
 */
export default function CartOfferSection({
  storeId,
  subtotal,
  productIds = [],
  productDiscount = 0,
  itemCount = 0,
  mrpTotal = 0,
  onOfferChange, // ({ appliedOffer, offerDiscount, freeDelivery }) => void
}) {
  const [offerLoading, setOfferLoading] = useState(false);
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [offerDiscount, setOfferDiscount] = useState(0);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [couponLocked, setCouponLocked] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const notifyParent = (offer, discount, freeDel) => {
    if (typeof onOfferChange === "function") {
      onOfferChange({
        appliedOffer: offer,
        offerDiscount: discount,
        freeDelivery: freeDel,
      });
    }
  };

  // ---------- AUTO OFFER (skip if coupon locked) ----------
  useEffect(() => {
    const fetchAutoOffer = async () => {
      if (couponLocked) return;

      if (!storeId || subtotal <= 0) {
        setAppliedOffer(null);
        setOfferDiscount(0);
        setFreeDelivery(false);
        notifyParent(null, 0, false);
        return;
      }

      setOfferLoading(true);
      try {
        const res = await api.post(OFFER_APPLICABLE, {
          storeId,
          subtotal,
          productIds,
        });

        const data = res.data?.data;
        const offer = data?.appliedOffer || null;
        const discount = Number(data?.discountAmount) || 0;
        const freeDel = !!data?.freeDelivery;

        setAppliedOffer(offer);
        setOfferDiscount(discount);
        setFreeDelivery(freeDel);
        notifyParent(offer, discount, freeDel);
      } catch (err) {
        console.error("Auto offer error:", err);
        setAppliedOffer(null);
        setOfferDiscount(0);
        setFreeDelivery(false);
        notifyParent(null, 0, false);
      } finally {
        setOfferLoading(false);
      }
    };

    fetchAutoOffer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, subtotal, couponLocked, JSON.stringify(productIds)]);

  // ---------- APPLY COUPON ----------
  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Enter a coupon code");
      return;
    }
    if (!storeId) {
      setCouponError("Store not found in cart");
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await api.post(OFFER_VALIDATE_COUPON, {
        storeId,
        couponCode: code,
        subtotal,
        productIds,
      });

      if (res.data?.valid === false || res.data?.success === false) {
        setCouponError(res.data?.message || "Invalid coupon");
        return;
      }

      const data = res.data?.data;
      const offer = data?.offer || null;
      const discount = Number(data?.discountAmount) || 0;
      const freeDel = !!data?.freeDelivery;

      setAppliedOffer(offer);
      setOfferDiscount(discount);
      setFreeDelivery(freeDel);
      setCouponLocked(true);
      setCouponError("");
      notifyParent(offer, discount, freeDel);
    } catch (err) {
      console.error("Coupon error:", err);
      setCouponError(
        err.response?.data?.message || "Invalid or expired coupon"
      );
    } finally {
      setCouponLoading(false);
    }
  };

  // ---------- REMOVE COUPON ----------
  const handleRemoveCoupon = () => {
    setCouponInput("");
    setCouponError("");
    setCouponLocked(false);
    setAppliedOffer(null);
    setOfferDiscount(0);
    setFreeDelivery(false);
    notifyParent(null, 0, false);
    // auto offer will re-fetch via useEffect
  };

  const payableTotal = Math.max(0, subtotal - offerDiscount);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
          Price Details
        </h2>
      </div>

      <div className="p-5 space-y-4">
        {/* Coupon box */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2">
            Have a coupon?
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="e.g. SEP15OFF"
              disabled={couponLocked}
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase disabled:bg-slate-50"
            />
            {couponLocked ? (
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="px-3 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading}
                className="px-4 py-2 text-sm font-semibold bg-slate-800 text-white rounded-lg disabled:opacity-50"
              >
                {couponLoading ? "..." : "Apply"}
              </button>
            )}
          </div>
          {couponError && (
            <p className="text-xs text-red-500 mt-1">{couponError}</p>
          )}
          {couponLocked && appliedOffer?.couponCode && (
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              Coupon {appliedOffer.couponCode} applied
            </p>
          )}
        </div>

        {/* Price rows */}
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">
            Price ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <span className="text-slate-800">
            ₹{Number(mrpTotal || 0).toLocaleString("en-IN")}
          </span>
        </div>

        {productDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Product Discount</span>
            <span className="text-emerald-600 font-medium">
              - ₹{productDiscount.toLocaleString("en-IN")}
            </span>
          </div>
        )}

        {offerDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">
              Offer
              {appliedOffer?.badgeText ? ` (${appliedOffer.badgeText})` : ""}
            </span>
            <span className="text-emerald-600 font-medium">
              - ₹{offerDiscount.toLocaleString("en-IN")}
            </span>
          </div>
        )}

        {offerLoading && (
          <p className="text-xs text-slate-400">Checking offers...</p>
        )}

        {appliedOffer && offerDiscount > 0 && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
            <p className="text-xs font-semibold text-indigo-700">
              {appliedOffer.title || "Offer applied"}
            </p>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Delivery</span>
          <span className="text-emerald-600 font-semibold">
            {freeDelivery ? "FREE" : "FREE"}
          </span>
        </div>

        <div className="border-t border-dashed border-slate-300 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-slate-900">
              Total Amount
            </span>
            <span className="text-xl font-bold text-slate-900">
              ₹{payableTotal.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {(productDiscount > 0 || offerDiscount > 0) && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            <Tag size={15} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">
              You are saving ₹
              {(productDiscount + offerDiscount).toLocaleString("en-IN")} on
              this order
            </span>
          </div>
        )}
      </div>
    </div>
  );
}