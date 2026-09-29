import React, {
  useEffect,
  useState,
} from "react";
import {
  User,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import {
  useCart,
} from "../../../context/CartContext";

import SignInModal from "../../common/SignInModal";
import SearchBar from "../../common/SearchBar";
import api from "../../../api/api";
import HeaderLogo from "./HeaderLogo";
import HeaderLocation from "./HeaderLocation";
import HeaderProfile from "./HeaderProfile";
import HeaderActions from "./HeaderActions";
import CategoryNavigation from "./CategoryNavigation";
import MobileMenu from "./MobileMenu";
export default function Header() {
  /* --------------------------------
     CART
  -------------------------------- */
  const {
    cartCount,
  } = useCart();
  /* --------------------------------
     USER
  -------------------------------- */
  const [
    user,
    setUser,
  ] = useState(null);
  /* --------------------------------
     ADDRESS
  -------------------------------- */
  const [
    userAddress,
    setUserAddress,
  ] = useState(null);
  const [
    loadingAddress,
    setLoadingAddress,
  ] = useState(false);
  /* --------------------------------
     DROPDOWNS
  -------------------------------- */
  const [
    showProfile,
    setShowProfile,
  ] = useState(false);
  const [
    showSignIn,
    setShowSignIn,
  ] = useState(false);
  const [
    showLocation,
    setShowLocation,
  ] = useState(false);
  const [
    showMobileMenu,
    setShowMobileMenu,
  ] = useState(false);
  /* --------------------------------
     LOAD USER ADDRESS
  -------------------------------- */
  const loadUserAddress = async (
    userData
  ) => {
    try {
      if (!userData?._id) {
        setUserAddress(null);
        return;
      }
      setLoadingAddress(true);
      const response =
        await api.get(
          `/users/${userData._id}`
        );
      const addresses =
        response.data?.addresses || [];
      if (addresses.length > 0) {
        setUserAddress(
          addresses[0]
        );
      } else {
        setUserAddress(null);
      }
    } catch (error) {
      console.error(
        "Error loading user address:",
        error
      );
      setUserAddress(null);
    } finally {
      setLoadingAddress(false);
    }
  };
  /* --------------------------------
     INITIALIZE HEADER
  -------------------------------- */
  const initHeader = async () => {
    try {
      const token =
        localStorage.getItem(
          "authToken"
        ) ||
        localStorage.getItem(
          "jwt_token"
        ) ||
        localStorage.getItem(
          "token"
        );

      const storedUser =
        localStorage.getItem(
          "userProfile"
        );


      if (
        token &&
        storedUser
      ) {

        const parsedUser =
          JSON.parse(
            storedUser
          );

        setUser(
          parsedUser
        );

        await loadUserAddress(
          parsedUser
        );

      } else {

        setUser(null);

        setUserAddress(null);

      }

    } catch (error) {

      console.error(
        "Error initializing header:",
        error
      );

      setUser(null);

      setUserAddress(null);

    }
  };


  /* --------------------------------
     INITIAL LOAD
  -------------------------------- */

  useEffect(() => {

    initHeader();


    window.addEventListener(
      "storage",
      initHeader
    );

    window.addEventListener(
      "auth-changed",
      initHeader
    );


    return () => {

      window.removeEventListener(
        "storage",
        initHeader
      );

      window.removeEventListener(
        "auth-changed",
        initHeader
      );

    };

  }, []);


  /* --------------------------------
     CLICK OUTSIDE
  -------------------------------- */

  useEffect(() => {

    const handleClickOutside = (
      event
    ) => {

      /* Profile */

      if (
        showProfile &&
        !event.target.closest(
          ".profile-dropdown"
        )
      ) {

        setShowProfile(false);

      }


      /* Location */

      if (
        showLocation &&
        !event.target.closest(
          ".location-dropdown"
        )
      ) {

        setShowLocation(false);

      }

    };


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, [
    showProfile,
    showLocation,
  ]);


  /* --------------------------------
     LOGOUT
  -------------------------------- */

  const handleLogout = () => {

    localStorage.removeItem(
      "authToken"
    );

    localStorage.removeItem(
      "jwt_token"
    );

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "userProfile"
    );


    setUser(null);

    setUserAddress(null);

    setShowProfile(false);

    setShowLocation(false);


    window.dispatchEvent(
      new Event(
        "auth-changed"
      )
    );

  };


  /* --------------------------------
     USER NAME
  -------------------------------- */

  const getUserName = () => {

    if (!user) {
      return "Account";
    }

    return (
      user.name ||
      user.fullName ||
      user.username ||
      user.firstName ||
      user.email?.split("@")[0] ||
      "User"
    );

  };


  /* --------------------------------
     USER INITIAL
  -------------------------------- */

  const getUserInitial = () => {

    return getUserName()
      .charAt(0)
      .toUpperCase();

  };


  /* --------------------------------
     USER AVATAR
  -------------------------------- */

  const avatarUrl =
    user?.profilePicture ||
    user?.profileImage ||
    user?.avatar ||
    null;


  /* --------------------------------
     MANAGE ADDRESS
  -------------------------------- */

  const handleManageAddresses = () => {

    setShowLocation(false);

    window.location.href =
      "/addresses";

  };


  return (
    <>
      {/* =====================================
          HEADER
      ====================================== */}

      <header
        className="
          relative
          sticky
          top-0
          z-[100]
          bg-white
          border-b
          border-gray-200
          shadow-[0_2px_8px_rgba(0,0,0,0.08)]
        "
      >

        <div className="bg-white">

          <div
            className="
              max-w-[1500px]
              mx-auto
              px-4
              lg:px-8
            "
          >

            {/* =================================
                DESKTOP HEADER ROW
            ================================== */}

            <div
              className="
                h-[68px]
                flex
                items-center
                gap-4
                lg:gap-6
              "
            >

              {/* Logo */}

              <HeaderLogo />


              {/* Search */}

              <SearchBar />


              {/* Location */}

              <HeaderLocation
                userAddress={
                  userAddress
                }

                loadingAddress={
                  loadingAddress
                }

                showLocation={
                  showLocation
                }

                setShowLocation={
                  setShowLocation
                }

                onManageAddresses={
                  handleManageAddresses
                }
              />


              {/* Profile / Login */}

              <div
                className="
                  relative
                  profile-dropdown
                  shrink-0
                "
              >

                {user ? (

                  <HeaderProfile
                    user={user}

                    avatarUrl={
                      avatarUrl
                    }

                    showProfile={
                      showProfile
                    }

                    setShowProfile={
                      setShowProfile
                    }

                    getUserName={
                      getUserName
                    }

                    getUserInitial={
                      getUserInitial
                    }

                    onLogout={
                      handleLogout
                    }
                  />

                ) : (

                  <button
                    type="button"
                    onClick={() =>
                      setShowSignIn(true)
                    }
                    className="
                      flex
                      items-center
                      gap-2
                      px-3
                      sm:px-4
                      py-2.5
                      rounded-lg
                      text-gray-800
                      hover:bg-gray-50
                      transition
                      font-semibold
                      text-sm
                    "
                  >

                    <User size={20} />

                    <span
                      className="
                        hidden
                        sm:block
                      "
                    >
                      Login
                    </span>

                    <ChevronDown
                      size={15}
                      className="
                        hidden
                        sm:block
                      "
                    />

                  </button>

                )}

              </div>


              {/* Wishlist + Cart */}

              <HeaderActions
                cartCount={
                  cartCount
                }
              />


              {/* Mobile Menu Button */}

              <button
                type="button"
                onClick={() =>
                  setShowMobileMenu(
                    (prev) => !prev
                  )
                }
                className="
                  md:hidden
                  p-2
                  rounded-lg
                  hover:bg-gray-100
                  transition
                "
                aria-label="Menu"
              >

                {showMobileMenu ? (
                  <X size={23} />
                ) : (
                  <Menu size={23} />
                )}

              </button>

            </div>


            {/* Mobile Search */}

            <SearchBar mobile />

          </div>

        </div>


        {/* =====================================
            CATEGORY NAVIGATION
        ====================================== */}

        <CategoryNavigation />


        {/* =====================================
            MOBILE MENU
        ====================================== */}

        <MobileMenu
          showMobileMenu={
            showMobileMenu
          }

          showLocation={
            showLocation
          }

          setShowLocation={
            setShowLocation
          }

          setShowMobileMenu={
            setShowMobileMenu
          }

          userAddress={
            userAddress
          }
        />

      </header>


      {/* =====================================
          LOGIN MODAL
      ====================================== */}

      {showSignIn && (

        <SignInModal
          toggleModal={() =>
            setShowSignIn(false)
          }

          setIsAuthenticated={() => {

            window.dispatchEvent(
              new Event(
                "auth-changed"
              )
            );

          }}
        />

      )}

    </>
  );
}