import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AppBar, Toolbar, Button, Container, Typography, Box } from "@mui/material";

import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import MasterLayout from "./components/MasterLayout";
import MastersPage from "./components/MastersPage";
import ReservationForm from "./pages/ReservationForm";
import CheckinForm from "./pages/CheckinForm";
import CheckinUpdate from "./pages/CheckinUpdate";
import RoomMaster from "./pages/RoomMaster";
import RoomShift from "./pages/RoomShift";
import RoomMaintenance from "./pages/RoomMaintenance";
import CreateRoomMaintenance from "./pages/CreateRoomMaintenance";
import UpdateRoomMaintenance from "./pages/UpdateRoomMaintenance";
import MistakeShift from "./pages/MistakeShift";
import AdditionalServices from "./pages/AdditionalServices";
import DayAmountTransactions from "./pages/DayAmountTransactions";
import AdvanceDataReport from "./pages/AdvanceDataReport";
import VisitingPurposeMaster from "./pages/VisitingPurposeMaster";
import RoomAdvance from "./pages/RoomAdvance";
import EarlyCheckinCharges from "./pages/EarlyCheckinCharges";
import { logoutUser } from "./redux/actions/loginAction";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiTextField: {
      defaultProps: {
        inputProps: {
          style: { textTransform: "uppercase" },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          textTransform: "uppercase",
        },
      },
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function TopBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useSelector((state) => state.login || {});

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ mr: 2 }}>
          Hotel Management
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {!isLoggedIn ? (
          <>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

function PublicLayout() {
  return (
    <>
      <TopBar />
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MasterLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route path="masters-page" element={<MastersPage />} />
            <Route path="reservation-form" element={<ReservationForm />} />
            <Route path="checkin-form" element={<CheckinForm />} />
            <Route path="checkin-update/:id" element={<CheckinUpdate />} />
            <Route path="checkin-update" element={<CheckinUpdate />} />
            <Route path="room-master" element={<RoomMaster />} />
            <Route path="room-shift" element={<RoomShift />} />
            <Route path="room-maintenance" element={<RoomMaintenance />} />
            <Route path="create-maintenance" element={<CreateRoomMaintenance />} />
            <Route path="update-maintenance" element={<UpdateRoomMaintenance />} />
            <Route path="mistake-shift/:id" element={<MistakeShift />} />
            <Route path="additional-services" element={<AdditionalServices />} />
            <Route path="day-amount-transactions" element={<DayAmountTransactions />} />
            <Route path="advance-data-report" element={<AdvanceDataReport />} />
            <Route path="visiting-purpose-master" element={<VisitingPurposeMaster />} />
            <Route path="room-advance" element={<RoomAdvance />} />
            <Route path="early-checkin" element={<EarlyCheckinCharges />} />
          </Route>

          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  );
}
