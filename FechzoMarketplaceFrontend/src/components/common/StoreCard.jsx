// src/components/cards/StoreCard.jsx

import { Link } from "react-router-dom";

/* ============================================================
   GET CURRENT INDIA DAY + TIME
   ============================================================ */

function getIndiaDateTime() {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);

  const getPart = (type) =>
    parts.find((part) => part.type === type)?.value;

  let hour = Number(getPart("hour"));
  const minute = Number(getPart("minute"));

  /*
   * Some browsers can return "24" for midnight
   * when using Intl with hour12:false.
   */
  if (hour === 24) {
    hour = 0;
  }

  return {
    day: String(getPart("weekday") || "")
      .toLowerCase()
      .trim(),

    hour,

    minute,
  };
}

/* ============================================================
   CONVERT HH:mm TO MINUTES
   ============================================================ */

function timeToMinutes(time) {
  if (!time) {
    return null;
  }

  const value = String(time).trim();

  const parts = value.split(":");

  if (parts.length !== 2) {
    return null;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return null;
  }

  if (hours < 0 || hours > 23) {
    return null;
  }

  if (minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

/* ============================================================
   GET STORE OPEN / CLOSED STATUS
   ============================================================ */

function getStoreOpenStatus(store) {
  console.log("======================================");
  console.log("STORE OPEN STATUS CHECK");
  console.log("Store:", store?.storeName);
  console.log("store.isOpen:", store?.isOpen);
  console.log("operatingHours:", store?.operatingHours);

  /* ----------------------------------------------------------
     GET OPERATING HOURS
     ---------------------------------------------------------- */

  const operatingHours = Array.isArray(
    store?.operatingHours
  )
    ? store.operatingHours
    : [];

  /* ----------------------------------------------------------
     NO OPERATING HOURS
     ---------------------------------------------------------- */

  if (operatingHours.length === 0) {
    console.log("RESULT: CLOSED - No operating hours");

    return {
      isOpen: false,
      label: "Closed",
    };
  }

  /* ----------------------------------------------------------
     CURRENT INDIA DATE + TIME
     ---------------------------------------------------------- */

  const current = getIndiaDateTime();

  const currentMinutes =
    current.hour * 60 + current.minute;

  console.log("Current India:", {
    day: current.day,
    hour: current.hour,
    minute: current.minute,
    currentMinutes,
  });

  /* ----------------------------------------------------------
     FIND TODAY'S SCHEDULE
     ---------------------------------------------------------- */

  const todaySchedule = operatingHours.find(
    (item) => {
      const scheduleDay = String(
        item?.day || ""
      )
        .toLowerCase()
        .trim();

      return scheduleDay === current.day;
    }
  );

  console.log("Today's Schedule:", todaySchedule);

  /* ----------------------------------------------------------
     NO SCHEDULE FOR TODAY
     ---------------------------------------------------------- */

  if (!todaySchedule) {
    console.log(
      "RESULT: CLOSED - No schedule for today"
    );

    return {
      isOpen: false,
      label: "Closed",
    };
  }

  /* ----------------------------------------------------------
     TODAY MANUALLY CLOSED
     ---------------------------------------------------------- */

  if (todaySchedule.isClosed === true) {
    console.log(
      "RESULT: CLOSED - Today is manually closed"
    );

    return {
      isOpen: false,
      label: "Closed",
    };
  }

  /* ----------------------------------------------------------
     MANUAL STORE STATUS
     
     store.isOpen = false
     means owner/admin has manually taken store offline.
     ---------------------------------------------------------- */

  if (store?.isOpen === false) {
    console.log(
      "RESULT: CLOSED - Store manually offline"
    );

    return {
      isOpen: false,
      label: "Closed",
    };
  }

  /* ----------------------------------------------------------
     GET OPEN / CLOSE TIME
     ---------------------------------------------------------- */

  const openingMinutes = timeToMinutes(
    todaySchedule.open
  );

  const closingMinutes = timeToMinutes(
    todaySchedule.close
  );

  console.log("Schedule Minutes:", {
    openingMinutes,
    closingMinutes,
  });

  /* ----------------------------------------------------------
     INVALID TIMING
     ---------------------------------------------------------- */

  if (
    openingMinutes === null ||
    closingMinutes === null
  ) {
    console.log(
      "RESULT: CLOSED - Invalid timing"
    );

    return {
      isOpen: false,
      label: "Closed",
    };
  }

  let isWithinOperatingHours = false;

  /* ==========================================================
     NORMAL SAME-DAY TIMING

     Example:

     09:00 -> 21:00

     08:59 CLOSED
     09:00 OPEN
     12:00 OPEN
     20:59 OPEN
     21:00 CLOSED
     ========================================================== */

  if (openingMinutes < closingMinutes) {
    isWithinOperatingHours =
      currentMinutes >= openingMinutes &&
      currentMinutes < closingMinutes;
  }

  /* ==========================================================
     OVERNIGHT TIMING

     Example:

     18:00 -> 02:00

     18:00 OPEN
     23:59 OPEN
     00:00 OPEN
     01:59 OPEN
     02:00 CLOSED
     ========================================================== */

  else if (openingMinutes > closingMinutes) {
    isWithinOperatingHours =
      currentMinutes >= openingMinutes ||
      currentMinutes < closingMinutes;
  }

  /* ==========================================================
     SAME OPEN/CLOSE TIME

     09:00 -> 09:00

     Treat as CLOSED.
     ========================================================== */

  else {
    isWithinOperatingHours = false;
  }

  console.log("Within Operating Hours:", isWithinOperatingHours);

  /* ----------------------------------------------------------
     FINAL RESULT
     ---------------------------------------------------------- */

  const finalStatus =
    isWithinOperatingHours;

  console.log("FINAL STATUS:", {
    isOpen: finalStatus,
    label: finalStatus
      ? "Open"
      : "Closed",
  });

  console.log("======================================");

  return {
    isOpen: finalStatus,
    label: finalStatus ? "Open" : "Closed",
  };
}

/* ============================================================
   FORMAT STORE TYPE
   ============================================================ */

function formatStoreType(type) {
  if (!type) {
    return "Store";
  }

  const value = String(type)
    .toLowerCase()
    .trim();

  if (value === "grocery") {
    return "Grocery";
  }

  if (value === "fashion") {
    return "Fashion";
  }

  if (
    value === "electronics" ||
    value === "electronic"
  ) {
    return "Electronics";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

/* ============================================================
   STORE CARD
   ============================================================ */

export default function StoreCard({ store }) {
  /* ----------------------------------------------------------
     DEBUG STORE DATA
     ---------------------------------------------------------- */

  console.log("========== STORE CARD DATA ==========");

  console.log("Store:", store);

  console.log(
    "Store Name:",
    store?.storeName
  );

  console.log(
    "Store isOpen:",
    store?.isOpen
  );

  console.log(
    "Operating Hours:",
    store?.operatingHours
  );

  console.log(
    "India Date:",
    getIndiaDateTime()
  );

  console.log("=====================================");

  /* ----------------------------------------------------------
     STORE OPEN STATUS
     ---------------------------------------------------------- */

  const {
    isOpen,
    label,
  } = getStoreOpenStatus(store);

  /* ----------------------------------------------------------
     STORE IMAGE
     ---------------------------------------------------------- */

  const storeImage =
    store?.logo ||
    store?.storefrontImage ||
    store?.images?.[0] ||
    "https://via.placeholder.com/400x200?text=Store";

  /* ----------------------------------------------------------
     STORE TYPE
     ---------------------------------------------------------- */

  const storeType = formatStoreType(
    store?.storeType
  );

  /* ----------------------------------------------------------
     STORE NAME
     ---------------------------------------------------------- */

  const storeName =
    store?.storeName || "Store";

  /* ----------------------------------------------------------
     LOCATION
     ---------------------------------------------------------- */

  const storeLocation =
    store?.address?.city ||
    store?.address?.fullAddress ||
    "Local Store";

  /* ----------------------------------------------------------
     DELIVERY TIME
     ---------------------------------------------------------- */

  const deliveryTime = "10-20 min";

  /* ----------------------------------------------------------
     MINIMUM ORDER
     ---------------------------------------------------------- */

  const minOrderValue = Number(
    store?.minOrderValue || 0
  );

  /* ==========================================================
     UI
     ========================================================== */

  return (
    <Link
      to={`/store/${store?._id}`}
      className="
        group
        block
        bg-white
        rounded-2xl
        border
        border-slate-200/70
        overflow-hidden
        shadow-[0_4px_20px_rgba(30,58,138,0.06)]
        hover:shadow-[0_8px_30px_rgba(30,58,138,0.12)]
        transition-all
        duration-300
        hover:-translate-y-1
      "
    >
      {/* ======================================================
          IMAGE SECTION
          ====================================================== */}

      <div className="relative h-36 sm:h-40 overflow-hidden">

        {/* STORE IMAGE */}

        <img
          src={storeImage}
          alt={storeName}
          className="
            w-full
            h-full
            object-cover
            group-hover:scale-105
            transition-transform
            duration-500
          "
          loading="lazy"
        />

        {/* ====================================================
            CLOSED OVERLAY
            ==================================================== */}

        {!isOpen && (
          <div
            className="
              absolute
              inset-0
              z-10
              bg-black/45
              flex
              items-center
              justify-center
            "
          >
            <div
              className="
                px-4
                py-2
                rounded-full
                bg-black/75
                backdrop-blur-sm
                border
                border-white/20
                shadow-lg
              "
            >
              <span
                className="
                  text-white
                  text-sm
                  font-bold
                  tracking-wide
                "
              >
                Store Closed
              </span>
            </div>
          </div>
        )}

        {/* ====================================================
            OPEN / CLOSED BADGE
            ==================================================== */}

        <div
          className="
            absolute
            top-3
            left-3
            z-20
          "
        >
          <span
            className={`
              inline-flex
              items-center
              px-2.5
              py-1
              rounded-full
              text-[11px]
              font-bold
              text-white
              shadow-md
              ${
                isOpen
                  ? "bg-gradient-to-r from-emerald-500 to-green-600"
                  : "bg-slate-700/90"
              }
            `}
          >
            {label}
          </span>
        </div>

        {/* ====================================================
            STORE TYPE BADGE
            ==================================================== */}

        <div
          className="
            absolute
            top-3
            right-3
            z-20
          "
        >
          <span
            className="
              inline-flex
              items-center
              px-2.5
              py-1
              rounded-full
              text-[11px]
              font-semibold
              bg-white/90
              text-slate-700
              backdrop-blur-sm
              shadow-sm
            "
          >
            {storeType}
          </span>
        </div>
      </div>

      {/* ======================================================
          STORE CONTENT
          ====================================================== */}

      <div className="p-4">

        {/* STORE NAME */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-2
          "
        >
          <div className="min-w-0">

            <h3
              className="
                font-bold
                text-slate-800
                text-[15px]
                truncate
                group-hover:text-[#1e3a8a]
                transition-colors
              "
            >
              {storeName}
            </h3>

            <p
              className="
                text-xs
                text-slate-500
                mt-0.5
                truncate
                capitalize
              "
            >
              {storeLocation}
            </p>

          </div>
        </div>

        {/* ====================================================
            STORE META
            ==================================================== */}

        <div
          className="
            flex
            items-center
            gap-3
            mt-3
            text-xs
            text-slate-600
            flex-wrap
          "
        >

          {/* RATING */}

          <div className="flex items-center gap-1">

            <span className="text-amber-500">
              ★
            </span>

            <span className="font-medium">
              4.2
            </span>

          </div>

          {/* SEPARATOR */}

          <span
            className="
              w-1
              h-1
              rounded-full
              bg-slate-300
            "
          />

          {/* DELIVERY */}

          <span>
            {deliveryTime}
          </span>

          {/* MIN ORDER */}

          {minOrderValue > 0 && (
            <>
              <span
                className="
                  w-1
                  h-1
                  rounded-full
                  bg-slate-300
                "
              />

              <span>
                Min ₹{minOrderValue}
              </span>
            </>
          )}

        </div>

        {/* ====================================================
            CLOSED MESSAGE
            ==================================================== */}

        {!isOpen && (
          <div
            className="
              mt-3
              px-3
              py-2
              rounded-lg
              bg-slate-50
              border
              border-slate-100
            "
          >
            <p
              className="
                text-xs
                text-slate-500
              "
            >
              This store is currently closed.
            </p>
          </div>
        )}

      </div>
    </Link>
  );
}