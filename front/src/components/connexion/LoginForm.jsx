import { Link } from "react-router-dom";
import { useFormik } from "formik";
import { z } from "zod";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Invalid email").nonempty("Email required"),
  password: z.string().min(6, "Password must be 6+ characters"),
});

const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="relative w-20 h-20">
      {/* Cercle extérieur */}
      <div
        className="absolute inset-0 border-4 rounded-full
        dark:border-cyan-400 border-yellow-400
        animate-spin
        border-t-transparent dark:border-t-transparent"
      ></div>
      {/* Cercle intérieur */}
      <div
        className="absolute inset-2 border-4 rounded-full
        dark:border-cyan-500 border-yellow-500
        animate-spin-reverse
        border-t-transparent dark:border-t-transparent"
      ></div>
    </div>
  </div>
);

// eslint-disable-next-line react/prop-types
export default function LoginForm({ onLogin }) {
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validate: (values) => {
      try {
        loginSchema.parse(values);
      } catch (error) {
        return Object.fromEntries(
          error.errors.map((err) => [err.path[0], err.message])
        );
      }
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      onLogin(values, () => setIsLoading(false));
    },
  });

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        className="backdrop-blur-sm p-8 rounded-2xl border-2 shadow-lg max-w-lg w-full
          dark:bg-gradient-to-br dark:from-gray-800/50 dark:to-gray-900/50 dark:border-cyan-400 
          bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-yellow-400 m-8"
      >
        <h2
          className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent
            dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-600
            bg-gradient-to-r from-yellow-400 to-yellow-600"
        >
          Login
        </h2>

        {/* Email Field */}
        <div className="mb-6">
          <label
            className="block text-lg font-medium mb-2
              dark:text-cyan-400 text-yellow-400"
          >
            Email
          </label>
          <input
            type="email"
            {...formik.getFieldProps("email")}
            className="w-full px-4 py-2 rounded-lg transition-all duration-300
              dark:bg-gray-700 bg-gray-100 
              dark:text-white text-gray-900
              dark:border-cyan-400 border-yellow-400
              focus:ring-2 focus:ring-opacity-50 
              dark:focus:ring-cyan-400 focus:ring-yellow-400"
          />
          {formik.touched.email && formik.errors.email && (
            <div className="mt-2 text-red-500 text-sm">
              {formik.errors.email}
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-6">
          <label
            className="block text-lg font-medium mb-2
              dark:text-cyan-400 text-yellow-400"
          >
            Password
          </label>
          <input
            type="password"
            {...formik.getFieldProps("password")}
            className="w-full px-4 py-2 rounded-lg transition-all duration-300
              dark:bg-gray-700 bg-gray-100 
              dark:text-white text-gray-900
              dark:border-cyan-400 border-yellow-400
              focus:ring-2 focus:ring-opacity-50 
              dark:focus:ring-cyan-400 focus:ring-yellow-400"
          />
          {formik.touched.password && formik.errors.password && (
            <div className="mt-2 text-red-500 text-sm">
              {formik.errors.password}
            </div>
          )}
        </div>

        {/* Sign Up Link */}
        <div className="text-center mb-6">
          <Link
            to="/auth/register"
            className="text-lg font-medium transition-colors duration-300
              dark:text-cyan-400 dark:hover:text-cyan-300
              text-yellow-400 hover:text-yellow-300"
          >
            Sign up, I&apos;m new here
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 rounded-full font-bold text-lg shadow-lg 
            transition-all duration-300 hover:scale-105
            dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500
            bg-gradient-to-r from-yellow-400 to-yellow-600
            dark:hover:shadow-cyan-500/50 hover:shadow-yellow-500/50
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Login
        </button>
      </form>

      {isLoading && <LoadingSpinner />}
    </>
  );
}
