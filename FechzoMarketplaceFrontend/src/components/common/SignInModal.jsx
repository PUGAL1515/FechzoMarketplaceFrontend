import React, { useState, useEffect } from "react";
import {
  FaGoogle,
  FaCheckCircle,
  FaSpinner,
  FaArrowLeft,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import api from "../../api"; 
const SignInModal = ({ toggleModal, setIsAuthenticated }) => {
  const [isEmailSelected, setIsEmailSelected] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [otpErrorMessage, setOtpErrorMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  useEffect(() => {
    if (otpSent && resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpSent, resendTimer]);
  const handleToggle = () => {
    setIsEmailSelected(!isEmailSelected);
    setInputValue("");
    setErrorMessage("");
    setOtpSent(false);
    setOtp(["", "", "", "", "", ""]);
    setOtpErrorMessage("");
    setResendTimer(30);
  };
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setErrorMessage("");
  };
  const handleOtpChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setOtpErrorMessage("");
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };
  const isValidInput = () => {
    const isValidEmail =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(inputValue);
    const isValidPhone = /^[0-9]{10}$/.test(inputValue);
    return isEmailSelected ? isValidEmail : isValidPhone;
  };
  // ============================================================
  // SEND OTP
  // ============================================================
  const handleSendOtp = async () => {
    if (!isValidInput()) {
      setErrorMessage(
        isEmailSelected
          ? "Please enter a valid email address."
          : "Please enter a valid 10-digit phone number."
      );
      return;
    }
    try {
      setLoading(true);
      const endpoint = isEmailSelected
        ? "/auth/email-otp"
        : "/auth/phone-otp";
      await api.post(endpoint, { value: inputValue });
      setOtpSent(true);
      setResendTimer(30);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  // ============================================================
  // VERIFY OTP
  // ============================================================
  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setOtpErrorMessage("Please enter a 6-digit OTP.");
      return;
    }
    try {
      setLoading(true);
      const response = await api.post("/auth/verify-otp", {
        value: inputValue,
        otp: otpString,
      });
      console.log("OTP verification response:", response.data);
      if (!response.data?.token || !response.data?.user) {
        throw new Error("Invalid response from server");
      }
      // Save login data
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("userProfile", JSON.stringify(response.data.user));
      // Notify Header
      if (typeof setIsAuthenticated === "function") {
        setIsAuthenticated(true);
      }
      window.dispatchEvent(new Event("auth-changed"));
      // Close modal
      toggleModal();
    } catch (error) {
      console.error("OTP verification error:", error);
      const message =
        error.response?.data?.message ||
        (error.message === "Invalid response from server"
          ? "Invalid OTP or server error. Please try again."
          : "Failed to verify OTP. Please try again.");
      setOtpErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendTimer(30);
    await handleSendOtp();
  };

  // ============================================================
  // GOOGLE LOGIN
  // ============================================================
  const handleLoginClick = () => {
    // baseURL already ends with /api
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/googleAuth`;
  };

  const handleBack = () => {
    setOtpSent(false);
    setOtp(["", "", "", "", "", ""]);
    setOtpErrorMessage("");
    setResendTimer(30);
  };

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-indigo-500/60 to-purple-600/60 backdrop-blur-md flex items-center justify-center z-[1000]"
      onClick={toggleModal}
    >
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl w-[90%] max-w-md shadow-2xl relative border border-gray-200"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="signin-title"
        >
          <button
            className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-500 transition-colors transform hover:scale-110"
            onClick={toggleModal}
            aria-label="Close modal"
          >
            ×
          </button>
          {/* Progress indicators */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  otpSent
                    ? "bg-indigo-100 text-indigo-600 border border-indigo-300"
                    : "bg-indigo-600 text-white"
                }`}
              >
                1
              </div>
              <div className="w-16 h-1 rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    otpSent ? "bg-indigo-600 w-full" : "bg-gray-300 w-0"
                  }`}
                />
              </div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  otpSent
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-400 border border-gray-300"
                }`}
              >
                2
              </div>
            </div>
          </div>
          <h2
            id="signin-title"
            className="text-3xl font-bold text-center text-indigo-900 mb-8"
          >
            {otpSent ? "Verify OTP" : "Sign In"}
          </h2>
          {!otpSent ? (
            <div className="space-y-6">
              {/* Input field */}
              <div className="relative">
                <input
                  type={isEmailSelected ? "email" : "tel"}
                  id="input-field"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all peer bg-white/75"
                  placeholder=" "
                  aria-describedby="input-error"
                />
                <label
                  htmlFor="input-field"
                  className="absolute left-2 top-4 text-gray-500 transition-all duration-200 bg-white/0 px-1 -translate-y-6 scale-75 transform 
                  peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 
                  peer-focus:-translate-y-5 peer-focus:scale-75 peer-focus:text-indigo-600 origin-[0]"
                >
                  {isEmailSelected ? "Email Address" : "Phone Number"}
                </label>
                {inputValue && isValidInput() && (
                  <FaCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100"
                  id="input-error"
                >
                  {errorMessage}
                </motion.p>
              )}
              <div className="flex justify-center mt-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSendOtp}
                  disabled={loading || !inputValue}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-200 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
                  {loading ? "Sending..." : "Send OTP"}
                </motion.button>
              </div>

              <div className="relative flex py-5 items-center my-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm font-medium">
                  OR
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLoginClick}
                className="w-full py-3.5 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-lg shadow-md border border-gray-200 flex items-center justify-center transition-colors"
              >
                <FaGoogle className="mr-3 text-blue-500" />
                Sign In with Google
              </motion.button>

              <div className="text-center mt-6">
                <button
                  onClick={handleToggle}
                  className="text-indigo-600 font-medium hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                >
                  {isEmailSelected
                    ? "Sign in with Phone Number instead"
                    : "Sign in with Email instead"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-600 text-center mb-6">
                Enter the 6-digit code sent to your{" "}
                {isEmailSelected ? "email" : "phone"}
                <span className="font-medium text-indigo-700">
                  {" "}
                  {isEmailSelected ? inputValue : `+91 ${inputValue}`}
                </span>
              </p>

              <div className="grid grid-cols-6 gap-2 sm:gap-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digit && index > 0) {
                        document.getElementById(`otp-${index - 1}`).focus();
                      }
                    }}
                    className="w-full aspect-square text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-white/75"
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>

              {otpErrorMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100"
                >
                  {otpErrorMessage}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleVerifyOtp}
                disabled={loading || otp.join("").length !== 6}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg shadow-green-200 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
                {loading ? "Verifying..." : "Verify & Continue"}
              </motion.button>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={handleBack}
                  className="text-indigo-600 font-medium hover:text-indigo-800 hover:underline flex items-center gap-1 transition-colors"
                >
                  <FaArrowLeft className="text-xs" /> Back
                </button>
                <button
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || loading}
                  className="text-indigo-600 font-medium hover:text-indigo-800 hover:underline transition-colors disabled:opacity-50 disabled:hover:no-underline"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

SignInModal.propTypes = {
  toggleModal: PropTypes.func.isRequired,
  setIsAuthenticated: PropTypes.func,
};

export default SignInModal;