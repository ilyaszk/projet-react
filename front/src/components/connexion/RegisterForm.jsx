import { useFormik } from "formik";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { postData } from "../../services/ws-services.jsx";
import { useState } from "react"; // Pour le loading state

const registerSchema = z
  .object({
    username: z.string().min(2, "Username must be at least 2 characters"),
    firstname: z.string().min(2, "Firstname must be at least 2 characters"),
    lastname: z.string().min(2, "Lastname must be at least 2 characters"),
    email: z.string().email("Invalid email").nonempty("Email required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().nonempty("Please confirm password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="relative w-20 h-20">
      <div
        className="absolute inset-0 border-4 rounded-full
       dark:border-cyan-400 border-yellow-400
       animate-spin
       border-t-transparent dark:border-t-transparent"
      ></div>
      <div
        className="absolute inset-2 border-4 rounded-full
       dark:border-cyan-500 border-yellow-500
       animate-spin-reverse
       border-t-transparent dark:border-t-transparent"
      ></div>
    </div>
  </div>
);

export default function RegisterForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: "",
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: (values) => {
      try {
        registerSchema.parse(values);
      } catch (error) {
        return Object.fromEntries(
          error.errors.map((err) => [err.path[0], err.message])
        );
      }
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const data = await postData("/register", values);
        if (data.error) {
          alert(data.error);
          return;
        }
        alert("Registration successful, please confirm your email");
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const inputClasses = (field) => `
   w-full px-4 py-2 rounded-lg transition-all duration-300
   dark:bg-gray-700 bg-gray-100 
   dark:text-white text-gray-900
   ${
     formik.touched[field] && formik.errors[field]
       ? "dark:border-red-500 border-red-500"
       : "dark:border-cyan-400 border-yellow-400"
   }
   focus:ring-2 focus:ring-opacity-50 
   dark:focus:ring-cyan-400 focus:ring-yellow-400
 `;

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="backdrop-blur-sm p-8 rounded-2xl border-2 shadow-lg max-w-lg w-full m-8
       dark:bg-gradient-to-br dark:from-gray-800/50 dark:to-gray-900/50 dark:border-cyan-400 
       bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-yellow-400"
    >
      <h2
        className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent
       dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-600
       bg-gradient-to-r from-yellow-400 to-yellow-600"
      >
        Register
      </h2>

      {/* Form Fields */}
      {[
        "username",
        "firstname",
        "lastname",
        "email",
        "password",
        "confirmPassword",
      ].map((field) => (
        <div key={field} className="mb-6">
          <label
            className="block text-lg font-medium mb-2
           dark:text-cyan-400 text-yellow-400"
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          <input
            type={field.includes("password") ? "password" : "text"}
            {...formik.getFieldProps(field)}
            className={inputClasses(field)}
          />
          {formik.touched[field] && formik.errors[field] && (
            <div className="mt-2 text-red-500 text-sm">
              {formik.errors[field]}
            </div>
          )}
        </div>
      ))}

      {/* Sign In Link */}
      <div className="text-center mb-6">
        <Link
          to="/auth"
          className="text-lg font-medium transition-colors duration-300
           dark:text-cyan-400 dark:hover:text-cyan-300
           text-yellow-400 hover:text-yellow-300"
        >
          Sign in, I already have an account
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
        Register
      </button>

      {isLoading && <LoadingSpinner />}
    </form>
  );
}
