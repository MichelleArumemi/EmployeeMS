import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminLogin() {
    // Use environment variable for API URL with fallback
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    // State management
    const [values, setValues] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();

    // Configure axios defaults
    useEffect(() => {
        axios.defaults.withCredentials = true;
    }, []);

    // Form validation
    const validateForm = () => {
        const newErrors = {};
        if (!values.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!values.password) {
            newErrors.password = 'Password is required';
        } else if (values.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Input change handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
        // Clear error when typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Form submission handler
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);

  try {
    const response = await axios.post(
      `${apiUrl}/auth/adminlogin`,
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

    if (response.data.success) {
      // Store minimal auth data
      localStorage.setItem('auth', JSON.stringify({
        isAuthenticated: true,
        user: response.data.data // Changed from response.data.user
      }));
      
      // Redirect to dashboard
      window.location.href = '/dashboard'; // Full page reload to ensure auth state
    }
  } catch (error) {
    // Error handling
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
            {/* Toast notifications container */}
            <ToastContainer 
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            
            {/* Login form container */}
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
                {/* Header section */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{
                        color: '#5e72e4',
                        marginBottom: '10px',
                        fontSize: '28px',
                        fontWeight: '700'
                    }}>
                        Admin Login
                    </h2>
                    <p style={{ color: '#6c757d', fontSize: '14px' }}>
                        Enter your credentials to access the dashboard
                    </p>
                </div>

                {/* Login form */}
                <form onSubmit={handleSubmit}>
                    {/* Email input */}
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
                            placeholder='admin@example.com'
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

                    {/* Password input */}
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

                    {/* Forgot password link */}
                    <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                        <Link 
                            to="/forgot-password" 
                            style={{
                                color: '#6c757d',
                                fontSize: '0.9rem',
                                textDecoration: 'none',
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* Submit button */}
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
                        {loading ? (
                            <>
                                <span>Logging in...</span>
                            </>
                        ) : 'Log in'}
                    </button>

                    {/* Sign up link */}
                    <div style={{
                        textAlign: 'center',
                        color: '#6c757d',
                        fontSize: '0.9rem'
                    }}>
                        Don't have an account?{' '}
                        <Link 
                            to="/adminsignup" 
                            style={{
                                color: '#764ba2',
                                fontWeight: '600',
                                textDecoration: 'none',
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
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

export default AdminLogin;

