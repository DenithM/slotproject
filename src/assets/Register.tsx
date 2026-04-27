import { useFormik } from "formik";
import * as Yup from "yup";
import { supabase } from "../../client/superbase";
import swimmingPoolImage from "./logimg.png";

function Register({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },

    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string().min(6, "Password must be at least 6 characters").required("Required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], "Passwords must match")
        .required("Required"),
    }),

    onSubmit: async (values) => {
      const { email, password } = values;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            skip_email_verification: true
          }
        }
      });

      if (error) {
        alert(error.message);
      } else if (data.user) {
        console.log("Registration success:", data);
        alert("Registration successful! You can check your mail for verification.");
      } else {
        console.log("Registration data:", data);
        alert("Registration completed. You can now login.");
      }
    },
  });
      
  return (
    <div className="min-h-screen flex">
      {/* Left section: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Register</h2>
          
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  formik.touched.email && formik.errors.email 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
                id="email"
                name="email"
                placeholder="Enter Email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  formik.touched.password && formik.errors.password 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
                id="password"
                name="password"
                placeholder="Enter Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</div>
              )}
            </div>

            <div className="mb-4">
              <button 
                type="button"
                onClick={onSwitchToLogin}
                className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                Already have an account? Login here
              </button>
            </div>

            <div className="grid">
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </span>
                ) : (
                  'Register'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      
      <div 
        className="hidden lg:flex w-1/2 bg-cover bg-center items-end p-12"
        style={{
          backgroundImage: `url(${swimmingPoolImage})`
        }}
      >
        <div className="bg-gray-400 bg-opacity-70 backdrop-blur-md  text-white p-6 rounded-lg border border-white border-opacity-20">
           <p className="text-lg italic mb-4">
            "90+ Years of Excellence: Honoring Dr. Denith Visionary Legacy as a Leading Multispeciality Hospital in Chennai"
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
