import { Link, useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";
import SidebarClose from "../../assets/SidebarClose";
import SidebarOpen from "../../assets/SidebarOpen";

const EmployeeSidebar = ({ sidebarOpen, toggleSidebar, handleLogout }) => {
  const location = useLocation();

  return (
    <div
      className={`col-auto col-md-3 col-xl-2 sidebar ${
        !sidebarOpen ? "sidebar-closed" : "sidebar-open"
      }`}
      style={{ backgroundColor: "#171f29" }}
    >
      <div
        className={`d-flex flex-column align-items-center align-items-sm-start ${
          sidebarOpen ? "px-3" : "px-1"
        } pt-2 text-white min-vh-100`}
      >
        <Link
          to="/dashboard"
          className="d-flex align-items-center justify-content-center pb-3 mb-md-1 mt-md-3 me-md-auto text-white text-decoration-none"
        >
          <span className="fs-5 fw-bolder d-flex align-items-center justify-content-center">
            <img
              src="/images/worksuite_img.png"
              alt="Logo Image"
              style={{
                maxWidth: "40px",
                height: "auto",
                width: "40px !important",
                marginLeft: "5px",
              }}
            />
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "900",
                marginTop: "0px",
                marginBottom: "0px",
                fontFamily: "Quicksand",
              }}
            >
              {sidebarOpen ? "Employee Management System" : ""}
            </h2>
          </span>
        </Link>
        <ul
          className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start w-100 mt-2"
          id="menu"
        >
          <li className="w-100">
            <Link
              to="/employeedashboard"
              className={`nav-link text-white ${
                sidebarOpen ? "px-3" : "px-1 justify-content-center"
              } my-1 py-2 align-middle ${
                location.pathname === "/employeedashboard" ? "active" : ""
              }`}
              title={!sidebarOpen ? "Dashboard" : ""}
            >
              <i className="fs-5 mx-1 bi bi-house"></i>
              <span
                className={`ms-2 d-none d-sm-inline ${
                  !sidebarOpen ? "hidden" : ""
                }`}
              >
                Dashboard
              </span>
            </Link>
          </li>
          <li className="w-100">
            <Link
              to="/dashboard/profile"
              className={`nav-link text-white ${
                sidebarOpen ? "px-3" : "px-1 justify-content-center"
              } my-1 py-2 align-middle ${
                location.pathname === "/dashboard/profile" ? "active" : ""
              }`}
              title={!sidebarOpen ? "Personal Profile" : ""}
            >
              <i className="fs-5 mx-1 bi bi-person-circle"></i>
              <span
                className={`ms-2 d-none d-sm-inline ${
                  !sidebarOpen ? "hidden" : ""
                }`}
              >
                Personal Profile
              </span>
            </Link>
          </li>
          <li className="w-100">
            <Link
              to="/employeedashboard/employeeattendance"
              className={`nav-link text-white ${
                sidebarOpen ? "px-3" : "px-1 justify-content-center"
              } my-1 py-2 align-middle ${
                location.pathname === "/dashboard/attendance" ? "active" : ""
              }`}
              title={!sidebarOpen ? "Attendance & Time" : ""}
            >
              <i className="fs-5 mx-1 bi bi-clock-history"></i>
              <span
                className={`ms-2 d-none d-sm-inline ${
                  !sidebarOpen ? "hidden" : ""
                }`}
              >
                Attendance & Time
              </span>
            </Link>
          </li>
          <li className="w-100">
            <Link
              to="/dashboard/leave"
              className={`nav-link text-white ${
                sidebarOpen ? "px-3" : "px-1 justify-content-center"
              } my-1 py-2 align-middle ${
                location.pathname === "/employeedashboard/employeeleave" ? "active" : ""
              }`}
              title={!sidebarOpen ? "Leave Management" : ""}
            >
              <i className="fs-5 mx-1 bi bi-calendar-x"></i>
              <span
                className={`ms-2 d-none d-sm-inline ${
                  !sidebarOpen ? "hidden" : ""
                }`}
              >
                Leave Management
              </span>
            </Link>
          </li>
          <li className="w-100">
            <Link
              to="/employeedashboard/employeeperformance"
              className={`nav-link text-white ${
                sidebarOpen ? "px-3" : "px-1 justify-content-center"
              } my-1 py-2 align-middle ${
                location.pathname === "/dashboard/performance" ? "active" : ""
              }`}
              title={!sidebarOpen ? "Performance & Goals" : ""}
            >
              <i className="fs-5 mx-1 bi bi-trophy"></i>
              <span
                className={`ms-2 d-none d-sm-inline ${
                  !sidebarOpen ? "hidden" : ""
                }`}
              >
                Performance & Goals
              </span>
            </Link>
          </li>
          <li className="w-100">
            <Link
              to="/employeedashboard/employeepayroll"
              className={`nav-link text-white ${
                sidebarOpen ? "px-3" : "px-1 justify-content-center"
              } my-1 py-2 align-middle ${
                location.pathname === "/dashboard/payroll" ? "active" : ""
              }`}
              title={!sidebarOpen ? "Payroll & Benefits" : ""}
            >
              <i className="fs-5 mx-1 bi bi-currency-dollar"></i>
              <span
                className={`ms-2 d-none d-sm-inline ${
                  !sidebarOpen ? "hidden" : ""
                }`}
              >
                Payroll & Benefits
              </span>
            </Link>
          </li>
          <li className="w-100">
            <Link
              to="/employeedashboard/employeenotifications"
              className={`nav-link text-white ${
                sidebarOpen ? "px-3" : "px-1 justify-content-center"
              } my-1 py-2 align-middle ${
                location.pathname === "/employeedashboard/employeenotifications" ? "active" : ""
              }`}
              title={!sidebarOpen ? "Notifications" : ""}
            >
              <i className="fs-5 mx-1 bi bi-bell"></i>
              <span
                className={`ms-2 d-none d-sm-inline ${
                  !sidebarOpen ? "hidden" : ""
                }`}
              >
                Notifications
              </span>
            </Link>
          </li>
        </ul>
        <Button
          variant="btn btn-danger"
          onClick={handleLogout}
          className="nav-link-logout mt-auto mb-3 w-100 align-middle"
          title={!sidebarOpen ? "Logout" : ""}
        >
          <i className={`fs-5 px-1 bi-power`}></i>
          <span
            className={`ms-2 d-none d-sm-inline ${
              !sidebarOpen ? "hidden" : ""
            }`}
          >
            Logout
          </span>
        </Button>
        <div
          className="d-flex justify-content-between align-items-center sidebarTogglerBox w-100 py-2"
          style={{ borderTop: "1px solid #333" }}
        >
          <button
            className="border-0 d-lg-block d-none text-lightest font-weight-bold"
            id="sidebarToggle"
            style={{ backgroundColor: "transparent", color: "#444" }}
            onClick={toggleSidebar}
            title={!sidebarOpen ? "Toggle Sidebar" : ""}
          >
            {!sidebarOpen ? <SidebarClose /> : <SidebarOpen />}
          </button>
          <p
            className="mb-0 px-1 py-0 rounded f-10"
            style={{ color: "#555", fontSize: "10px" }}
          >
            {!sidebarOpen ? "" : "v1.0"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSidebar;