import React, { useEffect, useState } from "react";
import { Check, Copy, Share2, X } from "lucide-react";

export default function ProductShare({ productName = "Product" }) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Always gets the exact current product URL
  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const handleShare = async () => {
    const shareData = {
      title: productName,
      text: `Check out ${productName} on Fechzo`,
      url: shareUrl,
    };

    // Mobile / supported browsers
    if (
      typeof navigator !== "undefined" &&
      navigator.share
    ) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled share sheet
        if (error?.name !== "AbortError") {
          console.error("Share failed:", error);
          setShowModal(true);
        }
      }

      return;
    }

    // Desktop / unsupported browser
    setShowModal(true);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showModal]);

  return (
    <>
      {/* ================= SHARE BUTTON ================= */}
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share product"
        title="Share product"
        className="
          w-10 h-10
          rounded-full
          bg-white
          shadow
          border border-gray-100
          flex items-center justify-center
          hover:shadow-md
          hover:bg-gray-50
          transition
          cursor-pointer
        "
      >
        <Share2
          size={19}
          className="text-gray-600"
        />
      </button>

      {/* ================= SHARE MODAL ================= */}
      {showModal && (
        <div
          className="
            fixed inset-0
            z-[9999]
            bg-black/40
            flex items-center justify-center
            p-4
          "
          onClick={() => setShowModal(false)}
        >
          <div
            className="
              w-full max-w-md
              bg-white
              rounded-2xl
              shadow-2xl
              p-5
              relative
            "
            onClick={(event) => event.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="
                absolute
                right-4
                top-4
                w-8 h-8
                rounded-full
                flex items-center justify-center
                hover:bg-gray-100
                transition
              "
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="pr-8">
              <h3 className="text-lg font-semibold text-gray-900">
                Share Product
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Share this product with your friends
              </p>
            </div>

            {/* Product */}
            <div className="mt-5 p-3 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">
                {productName}
              </p>
            </div>

            {/* URL */}
            <div className="mt-4">
              <label className="text-xs font-medium text-gray-500">
                Product link
              </label>

              <div className="mt-1 flex items-center gap-2">
                <div
                  className="
                    flex-1
                    min-w-0
                    bg-gray-50
                    border
                    border-gray-200
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    text-gray-600
                    truncate
                  "
                  title={shareUrl}
                >
                  {shareUrl}
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="
                    shrink-0
                    h-10
                    px-4
                    rounded-lg
                    bg-black
                    text-white
                    text-sm
                    font-medium
                    flex items-center
                    gap-2
                    hover:bg-gray-800
                    transition
                  "
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Done */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="
                mt-5
                w-full
                h-11
                rounded-lg
                border
                border-gray-200
                text-gray-700
                font-medium
                hover:bg-gray-50
                transition
              "
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}