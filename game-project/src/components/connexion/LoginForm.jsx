// LoginForm.jsx
import {Link, useNavigate} from 'react-router-dom';
import {useFormik} from 'formik';
import {z} from 'zod';

const loginSchema = z.object({
    email: z.string().email('Invalid email address').nonempty('Email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// eslint-disable-next-line react/prop-types
export default function LoginForm({onLogin}) {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
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

            console.log('Login Form Data', values);
            // Simuler une connexion réussie
            onLogin(values); // Met à jour l'état d'authentification
        },
    });

    return (
        <div className="flex justify-center items-center h-screen bg-white dark:bg-black">
            <form onSubmit={formik.handleSubmit}
                  className="bg-white p-8 rounded-lg shadow-2xl border-8 border-neon-pink neon-glow max-w-lg w-full">
                <h2 className="text-4xl font-extrabold text-center text-neon-blue mb-8 neon-glow glitch-text">Login</h2>

                <div className="mb-6">
                    <label htmlFor="email" className="block text-neon-green text-lg font-bold glitch-text">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className="mt-2 p-3 block w-full  border-2 border-neon-pink rounded-lg shadow-lg text-fuchsia-800 focus:ring-neon-blue focus:border-neon-blue neon-glow"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                    />
                    {formik.touched.email && formik.errors.email && (
                        <div className="text-neon-red text-sm mt-2 glitch-text">{formik.errors.email}</div>
                    )}
                </div>

                <div className="mb-6">
                    <label htmlFor="password"
                           className="block text-neon-green text-lg font-bold glitch-text">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className="mt-2 p-3 block w-full  border-2 border-neon-pink rounded-lg shadow-lg text-fuchsia-800 focus:ring-neon-blue focus:border-neon-blue neon-glow"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                    />
                    {formik.touched.password && formik.errors.password && (
                        <div className="text-neon-red text-sm mt-2 glitch-text">{formik.errors.password}</div>
                    )}
                </div>

                <div className="mb-6 text-center">
                    <Link to="/auth/register"
                          className="text-neon-pink hover:text-neon-blue neon-glow text-lg glitch-text">Sign up, I'm new
                        here</Link>
                </div>

                <button
                    type="submit"
                    className="w-full bg-neon-blue text-black font-bold p-3 rounded-lg hover:bg-neon-pink hover:text-white transition-transform duration-300 transform hover:scale-105 neon-glow"
                >
                    Login
                </button>
            </form>
        </div>


    );
}
