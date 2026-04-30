import { useFormik } from "formik";

import * as Yup from "yup";

import { supabase } from "../../client/superbase";

import loginImage from "./loginimg.jpg";

interface LoginProps {
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
  onNavigateToPatientInfo?: () => void;
  onNavigateToGetstarted?: () => void;
}

function Login({ onSwitchToRegister, onLoginSuccess, onNavigateToPatientInfo, onNavigateToGetstarted }: LoginProps) {

  const formik = useFormik({

    initialValues: {

      email: "",

      password: "",

    },



    validationSchema: Yup.object({

      email: Yup.string().email("Invalid email").required("Required"),

      password: Yup.string().min(6).required("Required"),

    }),



    onSubmit: async (values) => {

      const { email, password } = values;



      const { data, error } = await supabase.auth.signInWithPassword({

        email,

        password,

      });



      if (error) {

        alert(error.message);

      } else {

        console.log("Login success:", data);

        alert("Login successful");

        try {
          const { data: patientData, error } = await supabase
            .from('patients')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
            console.error('Error checking patient data:', error);
            onLoginSuccess(); 
          } else if (patientData) {
            
            onLoginSuccess();
          } else {
            
             onNavigateToPatientInfo?.();
           

          }
        } catch (err) {
          console.error('Error checking patient data:', err);
          onLoginSuccess(); // Default to dashboard on error
        }

      }

    },

  });



  return (

    <div className="min-h-screen flex">

      {/* Left section: Login Form */}

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">

        <div className="w-full max-w-md">

          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Login</h2>

          

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



            <div className="mb-6">

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



            <div className="mb-4">

              <button 

                type="button"

                onClick={onSwitchToRegister}

                className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"

              >

                Don't have an account? Register here

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

                    Logging in...

                  </span>

                ) : (

                  'Login'

                )}

              </button>

            </div>

          </form>

        </div>

      </div>



      

      <div 

        className="hidden lg:flex w-1/2 bg-cover bg-center items-end p-12"

        style={{

          backgroundImage: `url(${loginImage})`

        }}

      >

        <div className="bg-black bg-opacity-50 text-white p-6 rounded-lg">

          <p className="text-lg italic mb-4">

            "South Asia Exclusive

Explore our Resorts and Destinations in South Asia

Find out how Travel is Better as a Member."

          </p>

          <p className="text-lg italic mb-4"></p>

          <p className="text-sm">Investor</p>

          <p className="text-sm">Global Real Estate Investment Firm</p>

        </div>

      </div>

    </div>

  );

}



export default Login;