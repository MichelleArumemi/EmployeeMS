// import { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { useNavigate, Link } from 'react-router-dom';
// import { toast } from 'react-toastify';

// function EmployeeLogin() {
//     // API base URL, adjusted for employee authentication
//     const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; 
    
//     const [values, setValues] = useState({
//         email: '',
//         password: ''
//     });
//     const [errors, setErrors] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [passwordVisible, setPasswordVisible] = useState(false);
//     const navigate = useNavigate();
    
//     // Use ref to track if we've already checked auth to prevent infinite loops
//     const hasCheckedAuth = useRef(false);

//     // Configure axios to send cookies with requests
//     useEffect(() => {
//         axios.defaults.withCredentials = true;
//     }, []);

//     // Check if already authenticated as an employee - FIXED to prevent infinite loop
//     useEffect(() => {
//         // Only check once
//         if (hasCheckedAuth.current) return;
//         hasCheckedAuth.current = true; // Set flag immediately to prevent loop
//         const checkAuth = () => {
//             try {
//                 const authData = localStorage.getItem('auth');
//                 if (authData) {
//                     const parsedAuth = JSON.parse(authData);
//                     if (parsedAuth?.isAuthenticated && 
//                         (parsedAuth.role === 'employee' || parsedAuth.role === 'admin')) {
//                         navigate('/employeedashboard', { replace: true });
//                         return;
//                     }
//                 }
//             } catch (error) {
//                 console.error('Error checking auth:', error);
//                 // Clear invalid auth data
//                 localStorage.removeItem('auth');
//             }
//         };
//         checkAuth();
//     }, [navigate]); // Only depend on navigate

//     // Form validation logic
//     const validateForm = () => {
//         const newErrors = {};
//         if (!values.email.trim()) {
//             newErrors.email = 'Email address is required';
//         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
//             newErrors.email = 'Please enter a valid email address';
//         }
//         if (!values.password) {
//             newErrors.password = 'Password is required';
//         } else if (values.password.length < 8) {
//             newErrors.password = 'Password must be at least 8 characters long';
//         }
//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     // Handler for input field changes
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setValues({ ...values, [name]: value });
//         // Clear error message for the field as user types
//         if (errors[name]) {
//             setErrors(prev => ({ ...prev, [name]: '' }));
//         }
//     };

//     // Handler for form submission
//     const handleSubmit = async (e) => {
//         e.preventDefault(); // Prevent default form submission
//         if (!validateForm()) return; // Validate form inputs

//         setLoading(true); // Start loading state

//         try {
//             // Send login request to the employee login endpoint
//             const response = await axios.post(
//                 `${apiUrl}/employeelogin`, // Changed API endpoint
//                 {
//                     email: values.email.trim(),
//                     password: values.password.trim()
//                 },
//                 {
//                     withCredentials: true, // Send cookies with the request
//                     headers: {
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );

//             console.log('Employee Login response:', response.data); // Debug log

//             if (response.data.success) {
//                 // Store authentication data in localStorage
//                 // Ensure 'role' is correctly captured from your backend response
//                 const authData = {
//                     isAuthenticated: true,
//                     user: response.data.user || null,
//                     role: response.data.role || 'employee'
//                 };

//                 localStorage.setItem('auth', JSON.stringify(authData));
                
//                 toast.success('Employee Login successful!'); // Show success notification
                
//                 // Navigate to the employee dashboard upon successful login
//                 navigate('/employeedashboard', { replace: true }); 
//             } else {
//                 // Show error message from the backend, or a generic one
//                 toast.error(response.data.message || 'Employee Login failed');
//             }
//         } catch (error) {
//             console.error('Employee Login error:', error); // Log the full error

//             // Handle specific error responses
//             if (error.response?.status === 401) {
//                 toast.error('Invalid email or password');
//             } else if (error.response?.status === 500) {
//                 toast.error('Server error. Please try again later.');
//             } else if (!error.response) {
//                 // Network error (no response from server)
//                 toast.error('Network error. Please check your connection.');
//             } else {
//                 // Generic error for other HTTP status codes
//                 toast.error(error.response?.data?.message || 'Employee Login failed');
//             }
//         } finally {
//             setLoading(false); // End loading state
//         }
//     };

//     return (
//         <div id='form-body' style={{
//             background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 50%, #d4b6f4 100%)',
//             minHeight: '100vh',
//             padding: '20px',
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center'
//         }}>
//             <div className="login-container" style={{
//                 background: 'rgba(255, 255, 255, 0.95)',
//                 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
//                 backdropFilter: 'blur(8px)',
//                 border: '1px solid rgba(255, 255, 255, 0.3)',
//                 borderRadius: '16px',
//                 padding: '40px',
//                 width: '100%',
//                 maxWidth: '450px',
//                 transition: 'all 0.3s ease'
//             }}>
//                 <div style={{ textAlign: 'center', marginBottom: '30px' }}>
//                     <h2 style={{
//                         color: '#5e72e4',
//                         marginBottom: '10px',
//                         fontSize: '28px',
//                         fontWeight: '700'
//                     }}>
//                         Employee Login
//                     </h2>
//                     <p style={{ color: '#6c757d', fontSize: '14px' }}>
//                         Enter your credentials to access your employee dashboard
//                     </p>
//                 </div>

//                 <form onSubmit={handleSubmit}>
//                     <div className="mb-4">
//                         <label htmlFor='email' className="form-label" style={{
//                             color: '#5e72e4',
//                             fontWeight: '500',
//                             marginBottom: '8px',
//                             display: 'block'
//                         }}>
//                             Email Address
//                         </label>
//                         <input
//                             type="email"
//                             name='email'
//                             autoComplete='username'
//                             placeholder='employee@example.com'
//                             value={values.email}
//                             onChange={handleInputChange}
//                             style={{
//                                 border: errors.email ? '1px solid #ff3860' : '1px solid #ced4da',
//                                 borderRadius: '8px',
//                                 padding: '12px 15px',
//                                 width: '100%',
//                                 fontSize: '16px',
//                                 transition: 'border-color 0.3s ease',
//                                 outline: 'none'
//                             }}
//                         />
//                         {errors.email && (
//                             <div style={{ 
//                                 color: '#ff3860', 
//                                 fontSize: '0.8rem', 
//                                 marginTop: '5px' 
//                             }}>
//                                 {errors.email}
//                             </div>
//                         )}
//                     </div>

//                     <div className="mb-4">
//                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                             <label htmlFor='password' className="form-label" style={{
//                                 color: '#5e72e4',
//                                 fontWeight: '500',
//                                 marginBottom: '8px',
//                                 display: 'block'
//                             }}>
//                                 Password
//                             </label>
//                             <button 
//                                 type="button"
//                                 onClick={() => setPasswordVisible(!passwordVisible)}
//                                 style={{
//                                     background: 'none',
//                                     border: 'none',
//                                     color: '#6c757d',
//                                     cursor: 'pointer',
//                                     fontSize: '0.8rem'
//                                 }}
//                             >
//                                 {passwordVisible ? 'Hide' : 'Show'}
//                             </button>
//                         </div>
//                         <div style={{ position: 'relative' }}>
//                             <input
//                                 type={passwordVisible ? 'text' : 'password'}
//                                 name='password'
//                                 autoComplete='current-password'
//                                 placeholder='Your password'
//                                 value={values.password}
//                                 onChange={handleInputChange}
//                                 style={{
//                                     border: errors.password ? '1px solid #ff3860' : '1px solid #ced4da',
//                                     borderRadius: '8px',
//                                     padding: '12px 15px',
//                                     width: '100%',
//                                     fontSize: '16px',
//                                     transition: 'border-color 0.3s ease',
//                                     outline: 'none'
//                                 }}
//                             />
//                         </div>
//                         {errors.password && (
//                             <div style={{ 
//                                 color: '#ff3860', 
//                                 fontSize: '0.8rem', 
//                                 marginTop: '5px' 
//                             }}>
//                                 {errors.password}
//                             </div>
//                         )}
//                     </div>

//                     <div style={{ marginBottom: '20px', textAlign: 'right' }}>
//                         <Link 
//                             to="/forgot-password"
//                             style={{
//                                 color: '#6c757d',
//                                 fontSize: '0.9rem',
//                                 textDecoration: 'none'
//                             }}
//                         >
//                             Forgot password?
//                         </Link>
//                     </div>

//                     <button 
//                         type="submit" 
//                         disabled={loading}
//                         style={{
//                             background: 'linear-gradient(to right, #667eea, #764ba2)',
//                             color: 'white',
//                             border: 'none',
//                             padding: '14px 20px',
//                             borderRadius: '8px',
//                             width: '100%',
//                             fontWeight: '600',
//                             cursor: loading ? 'not-allowed' : 'pointer',
//                             opacity: loading ? 0.7 : 1,
//                             fontSize: '16px',
//                             transition: 'all 0.3s ease',
//                             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//                             marginBottom: '20px',
//                             display: 'flex',
//                             justifyContent: 'center',
//                             alignItems: 'center',
//                             gap: '10px'
//                         }}
//                     >
//                         {loading ? 'Logging in...' : 'Log in'}
//                     </button>

//                     <div style={{
//                         textAlign: 'center',
//                         color: '#6c757d',
//                         fontSize: '0.9rem'
//                     }}>
//                         Don't have an account?{' '}
//                         <Link 
//                             to="/employeesignup"
//                             style={{
//                                 color: '#764ba2',
//                                 fontWeight: '600',
//                                 textDecoration: 'none'
//                             }}
//                         >
//                             Sign Up
//                         </Link>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }

// export default EmployeeLogin;

// import { useState, useEffect, useContext } from 'react';
// import axios from 'axios';
// import { useNavigate, Link } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { AuthContext } from '../../App'; // Import AuthContext

// function EmployeeLogin() {
//     const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; 
    
//     const [values, setValues] = useState({
//         email: '',
//         password: ''
//     });
//     const [errors, setErrors] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [passwordVisible, setPasswordVisible] = useState(false);
//     const navigate = useNavigate();
//     const { auth, setAuth, verifyAuth } = useContext(AuthContext); // Use context

//     // Configure axios to send cookies with requests
//     useEffect(() => {
//         axios.defaults.withCredentials = true;
//     }, []);

//     // Check if already authenticated - using context instead of localStorage
//     useEffect(() => {
//         if (auth.isAuthenticated && (auth.role === 'employee' || auth.role === 'admin')) {
//             navigate('/employeedashboard', { replace: true });
//         }
//     }, [auth.isAuthenticated, auth.role, navigate]);

//     // Form validation logic
//     const validateForm = () => {
//         const newErrors = {};
//         if (!values.email.trim()) {
//             newErrors.email = 'Email address is required';
//         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
//             newErrors.email = 'Please enter a valid email address';
//         }
//         if (!values.password) {
//             newErrors.password = 'Password is required';
//         } else if (values.password.length < 8) {
//             newErrors.password = 'Password must be at least 8 characters long';
//         }
//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     // Handler for input field changes
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setValues({ ...values, [name]: value });
//         // Clear error message for the field as user types
//         if (errors[name]) {
//             setErrors(prev => ({ ...prev, [name]: '' }));
//         }
//     };

//     // Handler for form submission
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!validateForm()) return;

//         setLoading(true);

//         try {
//             // Send login request to the employee login endpoint
//             const response = await axios.post(
//                 `${apiUrl}/employeelogin`,
//                 {
//                     email: values.email.trim(),
//                     password: values.password.trim()
//                 },
//                 {
//                     withCredentials: true,
//                     headers: {
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );

//             console.log('Employee Login response:', response.data);

//             if (response.data.success) {
//                 // Show success message
//                 toast.success('Employee Login successful!');
                
//                 // Store token if provided (similar to admin login)
//                 if (response.data.token) {
//                     localStorage.setItem('token', response.data.token);
//                 }
                
//                 // Verify authentication using context
//                 await verifyAuth();
                
//                 // Navigate to employee dashboard
//                 navigate('/employeedashboard', { replace: true }); 
//             } else {
//                 toast.error(response.data.message || 'Employee Login failed');
//             }
//         } catch (error) {
//             console.error('Employee Login error:', error);

//             // Handle specific error responses
//             if (error.response?.status === 401) {
//                 toast.error('Invalid email or password');
//             } else if (error.response?.status === 500) {
//                 toast.error('Server error. Please try again later.');
//             } else if (!error.response) {
//                 toast.error('Network error. Please check your connection.');
//             } else {
//                 toast.error(error.response?.data?.message || 'Employee Login failed');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div id='form-body' style={{
//             background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 50%, #d4b6f4 100%)',
//             minHeight: '100vh',
//             padding: '20px',
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center'
//         }}>
//             <div className="login-container" style={{
//                 background: 'rgba(255, 255, 255, 0.95)',
//                 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
//                 backdropFilter: 'blur(8px)',
//                 border: '1px solid rgba(255, 255, 255, 0.3)',
//                 borderRadius: '16px',
//                 padding: '40px',
//                 width: '100%',
//                 maxWidth: '450px',
//                 transition: 'all 0.3s ease'
//             }}>
//                 <div style={{ textAlign: 'center', marginBottom: '30px' }}>
//                     <h2 style={{
//                         color: '#5e72e4',
//                         marginBottom: '10px',
//                         fontSize: '28px',
//                         fontWeight: '700'
//                     }}>
//                         Employee Login
//                     </h2>
//                     <p style={{ color: '#6c757d', fontSize: '14px' }}>
//                         Enter your credentials to access your employee dashboard
//                     </p>
//                 </div>

//                 <form onSubmit={handleSubmit}>
//                     <div className="mb-4">
//                         <label htmlFor='email' className="form-label" style={{
//                             color: '#5e72e4',
//                             fontWeight: '500',
//                             marginBottom: '8px',
//                             display: 'block'
//                         }}>
//                             Email Address
//                         </label>
//                         <input
//                             type="email"
//                             name='email'
//                             autoComplete='username'
//                             placeholder='employee@example.com'
//                             value={values.email}
//                             onChange={handleInputChange}
//                             style={{
//                                 border: errors.email ? '1px solid #ff3860' : '1px solid #ced4da',
//                                 borderRadius: '8px',
//                                 padding: '12px 15px',
//                                 width: '100%',
//                                 fontSize: '16px',
//                                 transition: 'border-color 0.3s ease',
//                                 outline: 'none'
//                             }}
//                         />
//                         {errors.email && (
//                             <div style={{ 
//                                 color: '#ff3860', 
//                                 fontSize: '0.8rem', 
//                                 marginTop: '5px' 
//                             }}>
//                                 {errors.email}
//                             </div>
//                         )}
//                     </div>

//                     <div className="mb-4">
//                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                             <label htmlFor='password' className="form-label" style={{
//                                 color: '#5e72e4',
//                                 fontWeight: '500',
//                                 marginBottom: '8px',
//                                 display: 'block'
//                             }}>
//                                 Password
//                             </label>
//                             <button 
//                                 type="button"
//                                 onClick={() => setPasswordVisible(!passwordVisible)}
//                                 style={{
//                                     background: 'none',
//                                     border: 'none',
//                                     color: '#6c757d',
//                                     cursor: 'pointer',
//                                     fontSize: '0.8rem'
//                                 }}
//                             >
//                                 {passwordVisible ? 'Hide' : 'Show'}
//                             </button>
//                         </div>
//                         <div style={{ position: 'relative' }}>
//                             <input
//                                 type={passwordVisible ? 'text' : 'password'}
//                                 name='password'
//                                 autoComplete='current-password'
//                                 placeholder='Your password'
//                                 value={values.password}
//                                 onChange={handleInputChange}
//                                 style={{
//                                     border: errors.password ? '1px solid #ff3860' : '1px solid #ced4da',
//                                     borderRadius: '8px',
//                                     padding: '12px 15px',
//                                     width: '100%',
//                                     fontSize: '16px',
//                                     transition: 'border-color 0.3s ease',
//                                     outline: 'none'
//                                 }}
//                             />
//                         </div>
//                         {errors.password && (
//                             <div style={{ 
//                                 color: '#ff3860', 
//                                 fontSize: '0.8rem', 
//                                 marginTop: '5px' 
//                             }}>
//                                 {errors.password}
//                             </div>
//                         )}
//                     </div>

//                     <div style={{ marginBottom: '20px', textAlign: 'right' }}>
//                         <Link 
//                             to="/forgot-password"
//                             style={{
//                                 color: '#6c757d',
//                                 fontSize: '0.9rem',
//                                 textDecoration: 'none'
//                             }}
//                         >
//                             Forgot password?
//                         </Link>
//                     </div>

//                     <button 
//                         type="submit" 
//                         disabled={loading}
//                         style={{
//                             background: 'linear-gradient(to right, #667eea, #764ba2)',
//                             color: 'white',
//                             border: 'none',
//                             padding: '14px 20px',
//                             borderRadius: '8px',
//                             width: '100%',
//                             fontWeight: '600',
//                             cursor: loading ? 'not-allowed' : 'pointer',
//                             opacity: loading ? 0.7 : 1,
//                             fontSize: '16px',
//                             transition: 'all 0.3s ease',
//                             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//                             marginBottom: '20px',
//                             display: 'flex',
//                             justifyContent: 'center',
//                             alignItems: 'center',
//                             gap: '10px'
//                         }}
//                     >
//                         {loading ? 'Logging in...' : 'Log in'}
//                     </button>

//                     <div style={{
//                         textAlign: 'center',
//                         color: '#6c757d',
//                         fontSize: '0.9rem'
//                     }}>
//                         Don't have an account?{' '}
//                         <Link 
//                             to="/employeesignup"
//                             style={{
//                                 color: '#764ba2',
//                                 fontWeight: '600',
//                                 textDecoration: 'none'
//                             }}
//                         >
//                             Sign Up
//                         </Link>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }

// export default EmployeeLogin;


import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../App'; // Import AuthContext

function EmployeeLogin() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; 
    
    const [values, setValues] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();
    const { auth, setAuth, verifyAuth } = useContext(AuthContext); // Use context

    // Configure axios to send cookies with requests
    useEffect(() => {
        axios.defaults.withCredentials = true;
    }, []);

    // Check if already authenticated - using context instead of localStorage
    useEffect(() => {
        if (auth.isAuthenticated && (auth.role === 'employee' || auth.role === 'admin')) {
            navigate('/employeedashboard', { replace: true });
        }
    }, [auth.isAuthenticated, auth.role, navigate]);

    // Form validation logic
    const validateForm = () => {
        const newErrors = {};
        if (!values.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!values.password) {
            newErrors.password = 'Password is required';
        } else if (values.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handler for input field changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
        // Clear error message for the field as user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handler for form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            // Send login request to the employee login endpoint
            const response = await axios.post(
                `${apiUrl}/employeelogin`,
                {
                    email: values.email.trim(),
                    password: values.password.trim()
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Employee Login response:', response.data);

            if (response.data.success) {
                // Show success message
                toast.success('Employee Login successful!');
                
                // Store token if provided (similar to admin login)
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    
                    // Set default Authorization header for future requests
                    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                }
                
                // Verify authentication using context
                await verifyAuth();
                
                // Navigate to employee dashboard
                navigate('/employeedashboard', { replace: true }); 
            } else {
                toast.error(response.data.message || 'Employee Login failed');
            }
        } catch (error) {
            console.error('Employee Login error:', error);

            // Handle specific error responses
            if (error.response?.status === 401) {
                toast.error('Invalid email or password');
            } else if (error.response?.status === 500) {
                toast.error('Server error. Please try again later.');
            } else if (!error.response) {
                toast.error('Network error. Please check your connection.');
            } else {
                toast.error(error.response?.data?.message || 'Employee Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id='form-body' style={{
            background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 50%, #d4b6f4 100%)',
            minHeight: '100vh',
            padding: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div className="login-container" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
                padding: '40px',
                width: '100%',
                maxWidth: '450px',
                transition: 'all 0.3s ease'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{
                        color: '#5e72e4',
                        marginBottom: '10px',
                        fontSize: '28px',
                        fontWeight: '700'
                    }}>
                        Employee Login
                    </h2>
                    <p style={{ color: '#6c757d', fontSize: '14px' }}>
                        Enter your credentials to access your employee dashboard
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor='email' className="form-label" style={{
                            color: '#5e72e4',
                            fontWeight: '500',
                            marginBottom: '8px',
                            display: 'block'
                        }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            name='email'
                            autoComplete='username'
                            placeholder='employee@example.com'
                            value={values.email}
                            onChange={handleInputChange}
                            style={{
                                border: errors.email ? '1px solid #ff3860' : '1px solid #ced4da',
                                borderRadius: '8px',
                                padding: '12px 15px',
                                width: '100%',
                                fontSize: '16px',
                                transition: 'border-color 0.3s ease',
                                outline: 'none'
                            }}
                        />
                        {errors.email && (
                            <div style={{ 
                                color: '#ff3860', 
                                fontSize: '0.8rem', 
                                marginTop: '5px' 
                            }}>
                                {errors.email}
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label htmlFor='password' className="form-label" style={{
                                color: '#5e72e4',
                                fontWeight: '500',
                                marginBottom: '8px',
                                display: 'block'
                            }}>
                                Password
                            </label>
                            <button 
                                type="button"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#6c757d',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem'
                                }}
                            >
                                {passwordVisible ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={passwordVisible ? 'text' : 'password'}
                                name='password'
                                autoComplete='current-password'
                                placeholder='Your password'
                                value={values.password}
                                onChange={handleInputChange}
                                style={{
                                    border: errors.password ? '1px solid #ff3860' : '1px solid #ced4da',
                                    borderRadius: '8px',
                                    padding: '12px 15px',
                                    width: '100%',
                                    fontSize: '16px',
                                    transition: 'border-color 0.3s ease',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        {errors.password && (
                            <div style={{ 
                                color: '#ff3860', 
                                fontSize: '0.8rem', 
                                marginTop: '5px' 
                            }}>
                                {errors.password}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                        <Link 
                            to="/forgot-password"
                            style={{
                                color: '#6c757d',
                                fontSize: '0.9rem',
                                textDecoration: 'none'
                            }}
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            background: 'linear-gradient(to right, #667eea, #764ba2)',
                            color: 'white',
                            border: 'none',
                            padding: '14px 20px',
                            borderRadius: '8px',
                            width: '100%',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            fontSize: '16px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            marginBottom: '20px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>

                    <div style={{
                        textAlign: 'center',
                        color: '#6c757d',
                        fontSize: '0.9rem'
                    }}>
                        Don't have an account?{' '}
                        <Link 
                            to="/employeesignup"
                            style={{
                                color: '#764ba2',
                                fontWeight: '600',
                                textDecoration: 'none'
                            }}
                        >
                            Sign Up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EmployeeLogin;