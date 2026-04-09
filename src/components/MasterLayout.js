import React, { useRef, useEffect, useState } from "react";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Typography, Collapse } from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/actions/loginAction";

const SIDEBAR_WIDTH = 250;

const menuItems = [
  { text: "Dashboard / Calendar", path: "/dashboard" },
  { text: "Room Master Dashboard", path: "/room-master" },
  { text: "Reservation", path: "/reservation-form" },
  { text: "Check In", path: "/checkin-form" },
  { text: "Room Shift", path: "/room-shift" },
  { text: "Room Maintenance", path: "/room-maintenance" },
  { text: "Additional Services", path: "/additional-services" },
  { text: "Early Check-In", path: "/early-checkin" },
  { text: "Masters Page", path: "/masters-page" },
];

const reportItems = [
  { text: "Day Transaction", path: "/day-amount-transactions" },
  { text: "Advance Data", path: "/advance-data-report" },
];

export default function MasterLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [reportsOpen, setReportsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* HEADER */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 50,
          bgcolor: "#111",
          color: "white",
          display: "flex",
          alignItems: "center",
          px: 2,
          justifyContent: "space-between",
          zIndex: 1300,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", m: 0, p: 0, lineHeight: 1 }}>
          HOTEL<span style={{ color: "red" }}>OCEAN VIEW</span>
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ bgcolor: "white", color: "black", px: 1, py: 0.2, fontSize: 13, borderRadius: 1, cursor: "pointer" }}>&lt;</Box>
          <Box sx={{ bgcolor: "white", color: "black", px: 1, py: 0.2, fontSize: 13, borderRadius: 1, cursor: "pointer" }}>Today</Box>
          <Box sx={{ bgcolor: "white", color: "black", px: 1, py: 0.2, fontSize: 13, borderRadius: 1, cursor: "pointer" }}>&gt;</Box>
          <select style={{ padding: "2px 5px", fontSize: 13, borderRadius: "4px" }}>
            <option>1 Week</option>
            <option>1 Month</option>
          </select>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", fontSize: 11, fontWeight: "bold" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Box sx={{ width: 8, height: 8, bgcolor: "#00ff00", borderRadius: "50%" }} /> VACANT</Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Box sx={{ width: 8, height: 8, bgcolor: "#00aaff", borderRadius: "50%" }} /> OCCUPIED</Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Box sx={{ width: 8, height: 8, bgcolor: "red", borderRadius: "50%" }} /> RESERVED</Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Box sx={{ width: 8, height: 8, bgcolor: "orange", borderRadius: "50%" }} /> MAINTENANCE</Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Box sx={{ width: 8, height: 8, bgcolor: "magenta", borderRadius: "50%" }} /> OUT OF ORDER</Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Box sx={{ width: 8, height: 8, bgcolor: "blue", borderRadius: "50%" }} /> Not Ready</Box>
        </Box>
      </Box>

      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            bgcolor: "#111C31",
            color: "white",
            borderRight: "none",
            top: 50,
            height: "calc(100vh - 50px)"
          },
        }}
      >
        <Box sx={{ textAlign: "center", py: 1, borderBottom: "1px solid #1a2639" }}>
          <Typography variant="subtitle1" fontWeight="bold">ADMIN</Typography>
        </Box>
        <List sx={{ py: 0 }}>
          {menuItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    py: 1,
                    px: 2,
                    ...(isActive && {
                      bgcolor: "rgba(255,255,255,0.1)",
                    })
                  }}
                >
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive ? "bold" : "normal",
                      color: isActive ? "#fff" : "#b0b8c4"
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}

          {/* REPORTS COLLAPSIBLE */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => setReportsOpen(!reportsOpen)}
              sx={{ py: 1, px: 2 }}
            >
              <ListItemText 
                primary="Reports" 
                primaryTypographyProps={{ fontSize: 14, color: "#b0b8c4", fontWeight: reportsOpen ? "bold" : "normal" }} 
              />
              {reportsOpen ? <span style={{ color: "#8899bb", fontSize: '10px' }}>▲</span> : <span style={{ color: "#8899bb", fontSize: '10px' }}>▼</span>}
            </ListItemButton>
          </ListItem>
          
          <Collapse in={reportsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {reportItems.map((item, index) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <ListItemButton
                    key={index}
                    onClick={() => navigate(item.path)}
                    sx={{
                      py: 0.8,
                      pl: 4,
                      ...(isActive && { bgcolor: "rgba(255,255,255,0.05)" }),
                    }}
                  >
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: 13,
                        fontWeight: isActive ? "bold" : "normal",
                        color: isActive ? "#fff" : "#8faac8"
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                py: 1,
                px: 2,
                '&:hover': {
                  bgcolor: "rgba(255,0,0,0.1)",
                }
              }}
            >
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: "normal",
                  color: "#ff6b6b"
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* MAIN CONTENT AREA */}
      <Box
        component="main"
        ref={contentRef}
        sx={{
          flexGrow: 1,
          bgcolor: "#111C31",
          mt: "50px",
          height: "calc(100vh - 50px)",
          overflow: "auto",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
