import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppHeader from "../../components/AppHeader/AppHeader";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./Dashboard.css";
import profilePic from "../pages/profile.png";
import OrderReceived from "../pages/OrderReceived.png";
import OrderProcessing from "../pages/2.png";
import Otw from "../pages/3.png";
import Delivered from "../pages/4.png";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import BusinesswomanWavingHello from "../pages/businesswomanwavinghello.svg";
import {
  orderManager,
  ORDER_STATUS,
  formatPrice,
} from "../../utils/dataManager";

const ORDER_STEPS = [
  {
    status: ORDER_STATUS.RECEIVED,
    label: "Order Received",
    image: OrderReceived,
  },
  {
    status: ORDER_STATUS.DELIVERED,
    label: "Delivered!",
    image: Delivered,
  },
];

export default function Dashboard() {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });
  const [firestoreUser, setFirestoreUser] = useState(null);
  const [currentDate, setCurrentDate] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const today = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    setCurrentDate(today.toLocaleDateString("en-US", options));

    if (user?.uid) {
      const orders = orderManager.getOrdersByUser(user.uid);
      setUserOrders(orders);
      if (orders.length > 0) {
        const recentOrder = orders[orders.length - 1];
        setCurrentOrder(recentOrder);
      }
    }
  }, [location.state, user?.uid]);

  useEffect(() => {
    const fetchUserFromFirestore = async () => {
      if (user) {
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setFirestoreUser(docSnap.data());
        }
      }
    };
    fetchUserFromFirestore();
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile && !sidebarCollapsed) {
        setSidebarCollapsed(true);
        localStorage.setItem("sidebarCollapsed", JSON.stringify(true));
      } else if (!isMobile && sidebarCollapsed) {
        setSidebarCollapsed(false);
        localStorage.setItem("sidebarCollapsed", JSON.stringify(false));
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarCollapsed]);

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleDashboardLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const currentStepIndex = ORDER_STEPS.findIndex(
    (step) => step.status === currentOrder?.status
  );

  return (
    <div className="dashboard-container">
      <Sidebar onCollapseChange={handleSidebarCollapse} />
      <div className={`main-content-wrapper ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <div className={`page-header ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
          <div className="page-header-title">
            <h2>Dashboard</h2>
            <p className="date">{currentDate}</p>
          </div>
          <AppHeader
            user={user}
            profilePic={profilePic}
            handleLogout={handleDashboardLogout}
            sidebarCollapsed={sidebarCollapsed}
          />
        </div>

        <main className="main-dashboard">
          <div className="welcome-card">
            <div>
              <h2>Hi, {firestoreUser?.firstName || "Guest"}!</h2>
              <p>
                Welcome To Trailblazer Printing And
                <br />
                Layout Services.
              </p>
            </div>
            <img
              src={BusinesswomanWavingHello}
              alt="Welcome Illustration"
              className="welcome-card-svg"
            />
          </div>

          <div className="order-progress">
            <h3>Order Progress</h3>
            <div className="order-info">
              <div className="order-line">
                <div className="order-row">
                  <span className="order-label">Order ID:</span>
                  <span className="order-value">{currentOrder?.id || "No orders yet"}</span>
                </div>
                <div className="order-row">
                  <span className="order-label">Files:</span>
                  <span className="order-value">
                    {currentOrder?.files?.length || 0} file(s)
                  </span>
                </div>
                <div className="order-row">
                  <span className="order-label">Total Amount:</span>
                  <span className="order-value1">
                    {formatPrice(currentOrder?.totalAmount || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="progress-steps">
              {ORDER_STEPS.map((step, index) => (
                <React.Fragment key={step.status}>
                  <div className={`step ${index <= currentStepIndex ? "active" : ""}`}>
                    <div className={`icon-circle ${index <= currentStepIndex ? "highlight" : ""}`}>
                      <img src={step.image} alt={step.label} className="step-img" />
                    </div>
                    <p>{step.label}</p>
                  </div>
                  {index < ORDER_STEPS.length - 1 && <div className="line"></div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
