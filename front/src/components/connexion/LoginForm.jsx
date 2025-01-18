// LoginForm.jsx
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// eslint-disable-next-line react/prop-types
export default function LoginForm({ onLogin }) {
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate: (values) => {
      try {
        // Parse the values using the Zod schema
        loginSchema.parse(values);
      } catch (error) {
        const errors = {};
        error.errors.forEach((err) => {
          errors[err.path[0]] = err.message;
        });
        return errors;
      }
    },
    onSubmit: (values) => {
      onLogin(values); // Met à jour l'état d'authentification
    },
  });

  return (
      <form
        onSubmit={formik.handleSubmit}
        className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl border-4 border-neon-pink max-w-lg w-full neon-glow"
      >
        <h2 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green neon-glow glitch-text mb-10">
          Login
        </h2>

        {/* Email Field */}
        <div className="mb-8">
          <label
            htmlFor="email"
            className="block text-lg font-bold text-neon-green mb-2 glitch-text"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="mt-1 p-4 block w-full text-lg text-fuchsia-800 bg-gray-50 dark:bg-gray-900 border-2 border-neon-pink rounded-xl shadow-lg focus:ring-neon-blue focus:border-neon-blue transition duration-300 neon-glow"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-neon-red text-sm mt-2 glitch-text">
              {formik.errors.email}
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-8">
          <label
            htmlFor="password"
            className="block text-lg font-bold text-neon-green mb-2 glitch-text"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="mt-1 p-4 block w-full text-lg text-fuchsia-800 bg-gray-50 dark:bg-gray-900 border-2 border-neon-pink rounded-xl shadow-lg focus:ring-neon-blue focus:border-neon-blue transition duration-300 neon-glow"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password && (
            <div className="text-neon-red text-sm mt-2 glitch-text">
              {formik.errors.password}
            </div>
          )}
        </div>

        {/* Sign Up Link */}
        <div className="mb-8 text-center">
          <Link
            to="/auth/register"
            className="text-neon-pink text-lg font-medium hover:text-neon-blue transition-colors duration-300 neon-glow glitch-text"
          >
            Sign up, I&apos;m new here
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-neon-blue to-neon-green text-black font-bold text-xl p-4 rounded-full shadow-lg hover:from-neon-pink hover:to-neon-purple hover:text-white transition-transform duration-300 transform hover:scale-110 neon-glow"
        >
          Login
        </button>
      </form>
  );
}
