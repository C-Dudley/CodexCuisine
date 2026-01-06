/**
 * SignupPage - User registration interface
 *
 * Email/password form that calls AuthContext.signUp()
 * Handles loading states, validation, and error display
 * Redirects to home on successful signup
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Loader, Mail, Lock, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "fair" | "strong" | null>(null);
  const { signUp, loading, error: authError } = useAuth();

  const displayError = localError || authError;

  const calculatePasswordStrength = (pwd: string): "weak" | "fair" | "strong" => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    if (strength < 2) return "weak";
    if (strength < 4) return "fair";
    return "strong";
  };

  const validateForm = (): boolean => {
    setLocalError(null);

    if (!email.trim()) {
      setLocalError("Email is required");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError("Please enter a valid email address");
      return false;
    }

    if (!password) {
      setLocalError("Password is required");
      return false;
    }

    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      setLocalError("Password must contain at least one uppercase letter");
      return false;
    }

    if (!/[0-9]/.test(password)) {
      setLocalError("Password must contain at least one number");
      return false;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    setPasswordStrength(pwd ? calculatePasswordStrength(pwd) : null);
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await signUp(email, password);
      // AuthContext will handle redirect on success
    } catch (err) {
      // Error is displayed via authError state
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            CodexCuisine
          </h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        {/* Signup Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-lg p-8 space-y-6"
        >
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLocalError(null);
                }}
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? "👁" : "👁‍🗨"}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {passwordStrength && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        passwordStrength === "weak"
                          ? i === 0
                            ? "bg-red-500"
                            : "bg-gray-300"
                          : passwordStrength === "fair"
                          ? i < 2
                            ? "bg-yellow-500"
                            : "bg-gray-300"
                          : "bg-green-500"
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`text-xs font-medium ${
                    passwordStrength === "weak"
                      ? "text-red-600"
                      : passwordStrength === "fair"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {passwordStrength === "weak"
                    ? "Weak password"
                    : passwordStrength === "fair"
                    ? "Fair password"
                    : "Strong password"}
                </p>
              </div>
            )}

            {/* Password Requirements */}
            <ul className="mt-3 text-xs text-gray-600 space-y-1">
              <li className={`flex items-center gap-2 ${password.length >= 8 ? "text-green-600" : ""}`}>
                {password.length >= 8 ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <div className="h-3 w-3 border border-gray-300 rounded-full" />
                )}
                At least 8 characters
              </li>
              <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? "text-green-600" : ""}`}>
                {/[A-Z]/.test(password) ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <div className="h-3 w-3 border border-gray-300 rounded-full" />
                )}
                One uppercase letter
              </li>
              <li className={`flex items-center gap-2 ${/[0-9]/.test(password) ? "text-green-600" : ""}`}>
                {/[0-9]/.test(password) ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <div className="h-3 w-3 border border-gray-300 rounded-full" />
                )}
                One number
              </li>
            </ul>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setLocalError(null);
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showConfirmPassword ? "👁" : "👁‍🗨"}
              </button>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword && password && (
              <p
                className={`mt-2 text-sm font-medium ${
                  password === confirmPassword ? "text-green-600" : "text-red-600"
                }`}
              >
                {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{displayError}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || password !== confirmPassword}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {loading && <Loader className="h-4 w-4 animate-spin" />}
            {loading ? "Creating account..." : "Create Account"}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="w-full text-center px-4 py-2 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold rounded-lg transition duration-200 block"
          >
            Sign In
          </Link>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
