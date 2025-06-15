import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Start = () => {
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        axios.get(`${apiUrl}/api/verify`, { withCredentials: true })
            .then(result => {
                if (result.data.Status) {
                    if (result.data.role === "admin") {
                        navigate('/dashboard');
                    } else {
                        navigate('/employeedetail/' + result.data.id);
                    }
                }
            })
            .catch(err => console.log(err));
    }, [navigate]);

    const handleEmployeeLogin = () => {
        navigate('/employeelogin');
    };

    const handleAdminLogin = () => {
        navigate('/adminlogin');
    };

    return (
        <div id='form-body' style={{
            background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 50%, #d4b6f4 100%)',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="p-1 rounded" style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    <div style={{
                        padding: '30px',
                        borderRadius: '12px'
                    }}>
                        <h2 className="text-center" style={{
                            color: '#5e72e4',
                            marginBottom: '30px'
                        }}>Login As</h2>
                        <div className="d-flex justify-content-between mt-5 mb-2">
                            <button 
                                type="button" 
                                onClick={handleEmployeeLogin}
                                style={{
                                    background: 'linear-gradient(to right, #667eea, #764ba2)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 20px',
                                    borderRadius: '8px',
                                    width: '48%',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    ':hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 7px 14px rgba(102, 126, 234, 0.3)'
                                    }
                                }}
                            >
                                Employee
                            </button>
                            <button 
                                type="button" 
                                onClick={handleAdminLogin}
                                style={{
                                    background: 'linear-gradient(to right, #667eea, #764ba2)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 20px',
                                    borderRadius: '8px',
                                    width: '48%',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    ':hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 7px 14px rgba(102, 126, 234, 0.3)'
                                    }
                                }}
                            >
                                Admin
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Start;