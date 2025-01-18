// RegisterForm.js
import { useFormik } from "formik";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { postData } from "../../services/ws-services.jsx";

const registerSchema = z
  .object({
    username: z.string().min(2, "Username must be at least 2 characters long"),
    firstname: z
      .string()
      .min(2, "Firstname must be at least 2 characters long"),
    lastname: z.string().min(2, "Lastname must be at least 2 characters long"),
    email: z
      .string()
      .email("Invalid email address")
      .nonempty("Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().nonempty("Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

export default function RegisterForm() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: "",
      username: "",
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: (values) => {
      try {
        // Parse the values using the Zod schema
        registerSchema.parse(values);
      } catch (error) {
        const errors = {};
        error.errors.forEach((err) => {
          errors[err.path[0]] = err.message;
        });
        return errors;
      }
    },
    onSubmit: (values) => {
      postData("/register", values).then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        //add a message to inform the user that the registration was successful and that he must confirm his email
        alert("Registration successful, please confirm your email");
        navigate("/auth");
      });
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl border-4 border-neon-pink max-w-lg w-full neon-glow overflow-y-auto"
    >
      <h2 className="text-4xl font-extrabold text-center text-neon-blue mb-8 neon-glow glitch-text">
        Register
      </h2>

      <div className="mb-4">
        <label
          htmlFor="username"
          className="block text-neon-green text-lg font-bold glitch-text"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          className={`p-3 block w-full  border-2 ${
            formik.touched.username && formik.errors.username
              ? "border-neon-red"
              : "border-neon-pink"
          } rounded-lg shadow-lg text-fuchsia-800 focus:ring-neon-blue focus:border-neon-blue neon-glow`}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.username}
        />
        {formik.touched.username && formik.errors.username && (
          <div className="text-neon-red text-sm mt-2 glitch-text">
            {formik.errors.username}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="firstname"
          className="block text-neon-green text-lg font-bold glitch-text"
        >
          Firstname
        </label>
        <input
          id="firstname"
          name="firstname"
          type="text"
          className={`p-3 block w-full  border-2 ${
            formik.touched.firstname && formik.errors.firstname
              ? "border-neon-red"
              : "border-neon-pink"
          } rounded-lg shadow-lg text-fuchsia-800 focus:ring-neon-blue focus:border-neon-blue neon-glow`}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.firstname}
        />
        {formik.touched.firstname && formik.errors.firstname && (
          <div className="text-neon-red text-sm mt-2 glitch-text">
            {formik.errors.firstname}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="lastname"
          className="block text-neon-green text-lg font-bold glitch-text"
        >
          Lastname
        </label>
        <input
          id="lastname"
          name="lastname"
          type="text"
          className={`p-3 block w-full  border-2 ${
            formik.touched.lastname && formik.errors.lastname
              ? "border-neon-red"
              : "border-neon-pink"
          } rounded-lg shadow-lg text-fuchsia-800 focus:ring-neon-blue focus:border-neon-blue neon-glow`}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.lastname}
        />
        {formik.touched.lastname && formik.errors.lastname && (
          <div className="text-neon-red text-sm mt-2 glitch-text">
            {formik.errors.lastname}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="email"
          className="block text-neon-green text-lg font-bold glitch-text"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={`p-3 block w-full  border-2 ${
            formik.touched.email && formik.errors.email
              ? "border-neon-red"
              : "border-neon-pink"
          } rounded-lg shadow-lg text-fuchsia-800 focus:ring-neon-blue focus:border-neon-blue neon-glow`}
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

      <div className="mb-4">
        <label
          htmlFor="password"
          className="block text-neon-green text-lg font-bold glitch-text"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className={`p-3 block w-full  border-2 ${
            formik.touched.password && formik.errors.password
              ? "border-neon-red"
              : "border-neon-pink"
          } rounded-lg shadow-lg text-fuchsia-800 focus:ring-neon-blue focus:border-neon-blue neon-glow`}
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

      <div className="mb-4">
        <label
          htmlFor="confirmPassword"
          className="block text-neon-green text-lg font-bold glitch-text"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          className={`p-3 block w-full  border-2 ${
            formik.touched.confirmPassword && formik.errors.confirmPassword
              ? "border-neon-red"
              : "border-neon-pink"
          } rounded-lg shadow-lg text-fuchsia-800 focus:ring-neon-blue focus:border-neon-blue neon-glow`}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.confirmPassword}
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <div className="text-neon-red text-sm mt-2 glitch-text">
            {formik.errors.confirmPassword}
          </div>
        )}
      </div>

      <div className="mb-8 text-center">
        <Link
          to="/auth"
          className="text-neon-pink text-lg font-medium hover:text-neon-blue transition-colors duration-300 neon-glow glitch-text"
        >
          Sign in, I already have an account
        </Link>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-neon-blue to-neon-green text-black font-bold text-xl p-4 rounded-full shadow-lg hover:from-neon-pink hover:to-neon-purple hover:text-white transition-transform duration-300 transform hover:scale-110 neon-glow"
      >
        Register
      </button>
    </form>
  );
}
