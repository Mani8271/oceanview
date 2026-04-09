import React, { useState, useEffect } from "react";
import { Box, Typography, Button, CircularProgress, Divider, Grid, Drawer } from "@mui/material";
import { useNavigate } from "react-router-dom";
import API from "../API/API";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const api = new API();

const darkText = { color: "#8faac8", fontSize: "12px", mb: 0.5 };
const lightText = { color: "#ffffff", fontSize: "14px", fontWeight: "bold" };
const redTitle = { color: "#f44336", fontSize: "13px", fontWeight: "bold", mb: 2, mt: 2 };
const numberText = { color: "#e0e6f0", fontSize: "13px", fontWeight: "bold" };

export default function BookingDetailsSidebar({ open, reservationId, reservationData, onClose }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (open) {
      if (reservationData) {
        setData(reservationData); // Show immediate subset data first
      }
      // Always attempt to fetch rich data
      if (reservationId || reservationData?.guest_name || reservationData?.id || reservationData?.reservation_id) {
        fetchReservation();
      }
    } else {
      setData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reservationId]);

  const fetchReservation = async () => {
    setLoading(true);
    try {
      let foundData = null;
      const targetId = reservationId || reservationData?.reservation_id || reservationData?.id || reservationData?.booking_id;
      
      if (targetId) {
        try {
          const res = await api.get(`api/reservations/${targetId}`);
          let parsed = res?.data?.data || res?.data;
          // Handle if API wraps it in array
          if (Array.isArray(parsed) && parsed.length > 0) parsed = parsed[0];
          
          // Verify we got the rich object
          if (parsed && typeof parsed === 'object' && parsed.status) {
            foundData = parsed;
          }
        } catch (err) {}
      }

      const isCheckinStatus = ["CHECKINAC", "OCCUPIED", "CHECKEDIN", "CHECKED-IN", "CHECK IN AC"].includes((foundData?.status || reservationData?.status || "").toUpperCase().replace(/[-\s]+/g, ""));
      const roomNum = reservationData?.room_number || foundData?.room_number;

      if (isCheckinStatus && roomNum) {
        try {
          const res = await api.get(`api/room-masters/current-guest?room_number=${roomNum}`);
          const currentGuest = res?.data?.data || res?.data;
          if (currentGuest) {
            foundData = { ...(foundData || {}), ...currentGuest, check_in_id: currentGuest.check_in_id || currentGuest.id };
          }
        } catch (err) {}
      }

      const checkId = foundData?.check_in_id || foundData?.id || targetId;
      if (isCheckinStatus && checkId) {
        try {
          const res = await api.get(`api/check-ins/${checkId}`);
          let parsed = res?.data?.data || res?.data;
          if (Array.isArray(parsed) && parsed.length > 0) parsed = parsed[0];
          if (parsed && typeof parsed === 'object') {
            foundData = { ...(foundData || {}), ...parsed };
          }
        } catch (err) {}
      }

      if (!foundData) {
        const allRes = await api.get("api/reservations");
        let list = allRes?.data?.data || allRes?.data || [];
        if (!Array.isArray(list)) list = [list];

        // Try matching by ID first, if not then match by Guest Name + Date logic
        let found = list.find(r => 
          (targetId && (String(r.id) === String(targetId) || String(r.booking_id) === String(targetId))) ||
          (reservationData?.guest_name && (String(r.guest_name).trim().toLowerCase() === String(reservationData.guest_name).trim().toLowerCase()))
        );

        if (found) {
          foundData = found;
        }
      }

      if (isCheckinStatus && !foundData?.check_in_id) {
          const allCheckins = await api.get("api/check-ins");
          const list = allCheckins?.data?.data || allCheckins?.data || [];
          const found = list.find(c => 
            String(c.reservation_id) === String(targetId) || 
            (roomNum && String(c.room_number) === String(roomNum))
          );
          if (found) {
            foundData = { ...(foundData || {}), ...found, check_in_id: found.id };
          }
      }

      if (foundData) {
        // Merge so we don't lose anything
        setData(prev => ({ ...prev, ...foundData }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatD = (dString) => {
    if (!dString) return "N/A";
    return dayjs(dString).format("ddd, DD MMM YYYY");
  };

  const formatT = (tString) => {
    if (!tString) return "N/A";
    const arr = tString.split(":");
    if (arr.length >= 2) {
      let h = parseInt(arr[0], 10);
      let m = arr[1];
      let ampm = h >= 12 ? "PM" : "AM";
      h = h % 12;
      if (h === 0) h = 12;
      return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
    }
    return tString;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          bgcolor: "#0b1120",
          color: "#fff",
          borderLeft: "1px solid #3a4a6b",
          boxShadow: "-10px 0px 30px rgba(0,0,0,0.8)"
        }
      }}
    >
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress />
          </Box>
        ) : !data ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography>Reservation not found or loading failed.</Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {/* Guest Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid #253050' }}>
              <Typography sx={darkText}>Guest Name</Typography>
              <Typography sx={{ color: "#ffd700", fontSize: "18px", fontWeight: "bold" }}>
                {data.guest_name || "N/A"}
              </Typography>
            </Box>

            {/* Room Info */}
            <Box sx={{ p: 2, borderBottom: '1px solid #253050' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography sx={darkText}>Number of Rooms</Typography>
                <Typography sx={numberText}>{data.no_of_rooms || "0"}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={darkText}>Number of Guests</Typography>
                <Typography sx={numberText}>{data.no_of_persons || "0"}</Typography>
              </Box>
            </Box>

            {/* Booking Details */}
            <Box sx={{ p: 2, borderBottom: '1px solid #253050' }}>
              <Typography sx={redTitle}>Booking Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={darkText}>Check In</Typography>
                    <Typography sx={lightText}>{formatD(data.check_in_date)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={darkText}>Check Out</Typography>
                    <Typography sx={lightText}>{formatD(data.check_out_date)}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={darkText}>Booking Duration</Typography>
                    <Typography sx={lightText}>{data.no_of_nights || "0"}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={darkText}>Company Name</Typography>
                    <Typography sx={lightText}>{data.company_name || "N/A"}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={darkText}>Booking ID No</Typography>
                    <Typography sx={lightText}>{data.booking_id || "N/A"}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={darkText}>Guest Phone No</Typography>
                    <Typography sx={lightText}>{data.phone_no || data.mobile_no || "N/A"}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={darkText}>Food Plan</Typography>
                    <Typography sx={lightText}>{data.food_plan || "N/A"}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={darkText}>Booking Type</Typography>
                    <Typography sx={lightText}>{data.booking_type || "N/A"}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={darkText}>Room Type</Typography>
                    <Typography sx={lightText}>{data.room_type || "N/A"}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={darkText}>Check In Time</Typography>
                    <Typography sx={lightText}>
                      {data.check_in_time ? formatT(data.check_in_time) : "12:00 PM"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={darkText}>Check Out Time</Typography>
                    <Typography sx={lightText}>
                      {data.check_out_time ? formatT(data.check_out_time) : "11:00 AM"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Payment Summary */}
            <Box sx={{ p: 2, borderBottom: '1px solid #253050' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ color: '#8faac8', fontSize: '12px', mr: 2 }}>Total Gross :</Typography>
                <Typography sx={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>
                  {data.total_gross_amt || data.gross_amount || "0.00"}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ color: '#8faac8', fontSize: '12px', mr: 2 }}>Advance :</Typography>
                <Typography sx={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>
                  {data.advance_amt || data.advance || "0.00"}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Typography sx={{ color: '#f44336', fontSize: '13px', fontWeight: 'bold', mr: 2 }}>Balance :</Typography>
                <Typography sx={{ color: '#f44336', fontSize: '15px', fontWeight: 'bold' }}>
                  {data.balance_amt || data.balance || "0.00"}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', mt: 'auto', gap: 1 }}>
              <Button
                variant="contained"
                onClick={() => { navigate("/room-advance", { state: { room_number: data.room_number } }); onClose(); }}
                sx={{ bgcolor: '#7c3aed', color: '#fff', fontSize: '10px', fontWeight: 'bold', width: '90px', borderRadius: '4px', '&:hover': { bgcolor: '#6d28d9' } }}
              >
                ADVANCE
              </Button>
              
              {(() => {
                const status = (data.status || "").toUpperCase().replace(/[-\s]+/g, "");
                const isCheckedIn = ["CHECKINAC", "OCCUPIED", "CHECKEDIN"].includes(status);
                const isReserved = ["RESERVED", "CONFIRMED", "RESERVEDROOM"].includes(status);
                const targetId = data.check_in_id || data.id || data.reservation_id || data.booking_id;

                if (isCheckedIn) {
                  return (
                    <>
                      <Button
                        variant="contained"
                        onClick={() => {
                          if (targetId) navigate(`/checkin-update/${targetId}`);
                          onClose();
                        }}
                        sx={{ bgcolor: '#4B90FC', color: '#fff', fontSize: '10px', fontWeight: 'bold', width: '90px', borderRadius: '4px', '&:hover': { bgcolor: '#3a7ae0' } }}
                      >
                        UPDATE
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => {
                          if (targetId) navigate(`/mistake-shift/${targetId}`, { state: { old_room_number: data.room_number } });
                          onClose();
                        }}
                        sx={{ bgcolor: '#ffaa00', color: '#fff', fontSize: '10px', fontWeight: 'bold', width: '90px', borderRadius: '4px' }}
                      >
                        MISTAKE
                      </Button>
                      <Button
                        variant="contained"
                        onClick={async () => {
                           if (!window.confirm("Are you sure you want to REMOVE this Check-In?")) return;
                           try {
                             await api.delete(`api/check-ins/${targetId}`);
                             toast.success("Removed successfully");
                             onClose();
                             window.location.reload(); // Hard refresh to sync dashboard
                           } catch (e) { toast.error("Removal failed"); }
                        }}
                        sx={{ bgcolor: '#dc2626', color: '#fff', fontSize: '10px', fontWeight: 'bold', width: '90px', borderRadius: '4px' }}
                      >
                        REMOVE
                      </Button>
                    </>
                  );
                } else if (isReserved) {
                  return (
                    <Button
                      variant="contained"
                      onClick={() => {
                        navigate("/reservation-form", { state: { initialData: data } });
                        onClose();
                      }}
                      sx={{ bgcolor: '#4B90FC', color: '#fff', fontSize: '10px', fontWeight: 'bold', width: '90px', borderRadius: '4px', '&:hover': { bgcolor: '#3a7ae0' } }}
                    >
                      RESERVATION UPDATE
                    </Button>
                  );
                }
                return null;
              })()}

              <Button
                variant="contained"
                onClick={onClose}
                sx={{ bgcolor: '#333', color: '#fff', fontSize: "10px", fontWeight: "bold", width: '90px', borderRadius: "4px" }}
              >
                CLOSE
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
