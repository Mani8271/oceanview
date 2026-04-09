import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Modal, Backdrop, Fade, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../API/API";
import dayjs from "dayjs";
import ReservationForm from "./ReservationForm";
import BookingDetailsSidebar from "./BookingDetailsSidebar";
import CheckinForm from "./CheckinForm";

const api = new API();

const STATUS_COLORS = {
  VACANT: "#00ff00",
  OCCUPIED: "red",
  RESERVED: "#00aaff",
  MAINTENANCE: "orange",
  MAINTAINANCE: "orange",
  "OUT OF ORDER": "magenta",
  "NOTREADY": "brown",
  "RESERVED ROOM": "#00aaff",
  "CHECKINAC": "red",
  "AVAILABLE": "#00ff00"
};

const BAR_COLORS = {
  "RESERVED": "#00aaff",
  "RESERVED ROOM": "#00aaff",
  "OCCUPIED": "red",
  "CHECKINAC": "red",
  "AVAILABLE": "transparent",
  "NOTREADY": "transparent",
  "MAINTENANCE": "orange",
  "MAINTAINANCE": "orange",
  "ROOM SHIFT": "#146A8F"
};

export default function RoomMaster() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [calendarData, setCalendarData] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const [currentDate, setCurrentDate] = useState(dayjs().subtract(1, 'day').format("YYYY-MM-DD"));

  // Modal State
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [selectedResData, setSelectedResData] = useState(null);

  const [isCheckinOpen, setIsCheckinOpen] = useState(false);

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarResId, setSidebarResId] = useState(null);

  // Status Change Menu State
  const [roomAnchor, setRoomAnchor] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);

  const getDayDetails = (dayRaw) => {
    if (!dayRaw) return { status: "", guest_name: "", reservation_id: null, check_out_date: null, isReserved: false, isMaintenance: false, isShift: false };
    
    const excludedStatuses = ["VACANT", "AVAILABLE", "AVAILABLE ROOM", "NOTREADY"];
    const maintenanceStatuses = ["MAINTENANCE", "MAINTAINANCE"];
    const shiftStatuses = ["ROOM SHIFT", "ROOMSHIFT"];
    
    // Find all active slots (reservations, maintenance or shifts)
    const activeSlots = dayRaw.slots?.filter(s => 
      s.status && !excludedStatuses.includes(s.status.toUpperCase())
    ) || [];

    // Prioritize actual reservations over blocking states
    let reservedSlot = activeSlots.find(s => 
      !maintenanceStatuses.includes(s.status.toUpperCase()) &&
      !shiftStatuses.includes(s.status.toUpperCase()) &&
      (!s.end_time || s.end_time > "12:00:00" || s.start_time > "11:00:00")
    );
    
    // Fallback to shift or maintenance if no reservation
    if (!reservedSlot) {
      reservedSlot = activeSlots.find(s => shiftStatuses.includes(s.status.toUpperCase()) || maintenanceStatuses.includes(s.status.toUpperCase()));
    }
    
    if (!reservedSlot && activeSlots.length > 0) {
      reservedSlot = activeSlots[0];
    }

    if (reservedSlot) {
      const upperStatus = reservedSlot.status.toUpperCase();
      const isMaint = maintenanceStatuses.includes(upperStatus);
      const isShift = shiftStatuses.includes(upperStatus);
      
      let resId = reservedSlot.reservation_details?.id || dayRaw.reservation_id || dayRaw.booking_id || dayRaw.id;
      
      // Extract guest name more intelligently
      let guest = reservedSlot.guest_name || dayRaw.guest_name || "";
      let originalGuest = "";
      
      // Try to find original guest name if current name is just a shift/maintenance message
      const isMessage = guest.toUpperCase().includes("SHIFT") || guest.toUpperCase().includes("MOVE") || guest.toUpperCase().includes("MAINTEN");
      
      const guestSlot = dayRaw.slots?.find(s => 
        s.guest_name && 
        !s.guest_name.toUpperCase().includes("SHIFT") && 
        !s.guest_name.toUpperCase().includes("MOVE") &&
        !s.guest_name.toUpperCase().includes("MAINTEN")
      );
      
      if (guestSlot) {
        originalGuest = guestSlot.guest_name;
      } else if (reservedSlot.reservation_details?.guest_name) {
        originalGuest = reservedSlot.reservation_details.guest_name;
      }

      if (originalGuest && isMessage) {
         guest = `${originalGuest} (${guest})`;
      } else if (!guest && originalGuest) {
         guest = originalGuest;
      }

      if (!resId) {
          if (isMaint) resId = "MAINTENANCE";
          else if (isShift) resId = "ROOM_SHIFT"; // Stable ID to join bars in the same room row
      }

      return {
        ...dayRaw,
        status: reservedSlot.status,
        guest_name: guest,
        reservation_id: resId,
        check_out_date: (reservedSlot.reservation_details?.check_out_date || dayRaw.check_out_date),
        isReserved: true,
        isMaintenance: isMaint,
        isShift: isShift,
        primarySlot: reservedSlot
      };
    }

    // Default to top level if no slots found
    const topStatus = dayRaw.status || "";
    const isTopMaint = maintenanceStatuses.includes(topStatus.toUpperCase());
    const isTopShift = shiftStatuses.includes(topStatus.toUpperCase());
    
    let topResId = dayRaw.reservation_id || dayRaw.booking_id || dayRaw.id;
    if (!topResId) {
        if (isTopMaint) topResId = "MAINTENANCE";
        else if (isTopShift) topResId = "ROOM_SHIFT";
    }

    return { 
      ...dayRaw, 
      status: topStatus, 
      guest_name: dayRaw.guest_name || "", 
      reservation_id: topResId,
      isReserved: topStatus && !excludedStatuses.includes(topStatus.toUpperCase()),
      isMaintenance: isTopMaint,
      isShift: isTopShift
    };
  };

  const handleRoomClick = (event, room) => {
    setRoomAnchor(event.currentTarget);
    const todayDataRaw = room.calendar.find(c => dayjs(c.date).isSame(dayjs(), 'day')) || room.calendar[0] || {};
    const todayData = getDayDetails(todayDataRaw);
    setActiveRoom({ ...room, todayData });
  };

  const handleStatusResetClose = () => {
    setRoomAnchor(null);
    setActiveRoom(null);
  };

  const handleCheckinClick = () => {
    if (!activeRoom) return;
    const roomNum = activeRoom.room_number;
    const roomId = activeRoom.id || activeRoom.room_id || activeRoom.room_master_id;
    handleStatusResetClose();

    // Navigate to checkin-form with the room data
    navigate("/checkin-form", { state: { room_number: roomNum, room_id: roomId } });
  };

  const handleRemoveCheckin = async () => {
    if (!activeRoom || !activeRoom.todayData) return;
    const checkinId = activeRoom.todayData.id || activeRoom.todayData.reservation_id;
    if (!checkinId) { toast.error("No active check-in found to remove"); return; }
    const confirm = window.confirm(`Are you sure you want to REMOVE Check-In for Room ${activeRoom.room_number}?`);
    if (!confirm) return;
    handleStatusResetClose();
    try {
      await api.delete(`api/check-ins/${checkinId}`);
      toast.success("Check-In removed successfully");
      fetchCalendar();
    } catch (e) { toast.error(e.response?.data?.message || "Failed to remove Check-In"); }
  };


  const handleMakeAvailable = async () => {
    if (!activeRoom) return;
    const roomNum = activeRoom.room_number;
    const roomId = activeRoom.id || activeRoom.room_id || activeRoom.room_master_id;
    handleStatusResetClose();
    try {
      await api.post("api/room-masters", { room_id: roomId, room_number: roomNum, status: "AVAILABLE", date: "all" });
      toast.success(`Room ${roomNum} status reset to AVAILABLE`);
      fetchCalendar();
    } catch (e) { toast.error(`Error resetting room ${roomNum}`); }
  };

  const handleMakeNotReady = async () => {
    if (!activeRoom) return;
    const roomNum = activeRoom.room_number;
    const roomId = activeRoom.id || activeRoom.room_id || activeRoom.room_master_id;
    handleStatusResetClose();
    try {
      await api.post("api/room-masters", { room_id: roomId, room_number: roomNum, status: "NOTREADY", date: "all" });
      toast.success(`Room ${roomNum} status set to NOT READY`);
      fetchCalendar();
    } catch (e) { toast.error(`Error updating room ${roomNum}`); }
  };

  useEffect(() => {
    fetchStatusIcons();
  }, []);

  const fetchStatusIcons = async () => {
    try {
      const res = await api.get("api/room-status-icons");
      const data = res?.data?.data || res?.data || [];
      const map = {};
      data.forEach(item => { if (item.name) map[item.name.toUpperCase()] = item; });
      setStatusMap(map);
    } catch (e) { }
  };

  const getStatusColor = (s) => {
    if (!s) return "#333";
    const upperS = s.toString().toUpperCase().trim();

    // Prioritize dynamic color from statusMap
    if (statusMap[upperS]?.color) return statusMap[upperS].color;

    // Common typo handling
    if (upperS === "AVAILABLE" && statusMap["AVAILBLE"]?.color) return statusMap["AVAILBLE"].color;
    if (upperS === "AVAILBLE" && statusMap["AVAILABLE"]?.color) return statusMap["AVAILABLE"].color;

    // Status normalization for colors
    if (upperS === "RESERVED" && statusMap["RESERVED ROOM"]?.color) return statusMap["RESERVED ROOM"].color;

    return STATUS_COLORS[upperS] || "#333";
  };

  const getBarColor = (s) => {
    if (!s) return "transparent";
    const upperS = s.toString().toUpperCase().trim();

    // Prioritize dynamic color from statusMap
    if (statusMap[upperS]?.color) return statusMap[upperS].color;

    // Typos and Synonyms
    if (upperS === "AVAILABLE" && statusMap["AVAILBLE"]?.color) return statusMap["AVAILBLE"].color;
    if (upperS === "RESERVED" && statusMap["RESERVED ROOM"]?.color) return statusMap["RESERVED ROOM"].color;
    if (upperS === "RESERVED ROOM" && statusMap["RESERVED"]?.color) return statusMap["RESERVED"].color;

    return BAR_COLORS[upperS] || "#146A8F";
  };

  useEffect(() => {
    fetchCalendar();
  }, [currentDate]);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await api.get(`api/room-masters/calendar?date=${currentDate}`);
      setCalendarData(res?.data || res);
    } catch (error) {
      console.error("Failed to fetch calendar", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = api.baseURL || "https://hotel.pminfotechsolutions.in/";
    const cleanPath = path.toString().replace(/^storage\//, "").replace(/^\//, "");

    // Using the user-confirmed storage path for private uploads
    return `${baseUrl.replace(/\/$/, "")}/storage/app/public/${cleanPath}`;
  };

  // Check if clicked date is today (30 Mar) or later dates that should open popup
  // Today = 30 Mon = show inline (existing behavior before popup area)
  // 31 Tue onwards (tomorrow) = open as popup modal
  const handleCellClick = (room, day) => {
    const dayDataRaw = room.calendar.find(c => dayjs(c.date).isSame(day, 'day'));
    const dayData = getDayDetails(dayDataRaw);

    // Check if clicking on an already reserved/occupied bar
    if (dayData && dayData.isReserved) {
      setSidebarResId(dayData.reservation_id);
      setSelectedResData(dayData); // Pass the full available dayData 
      setIsSidebarOpen(true);
      return;
    }

    // DISBALED: Auto-opening reservation popup on cell touch/click 
    // to prevent accidental triggers as requested.
    /*
    const resData = {
      room_type: room.room_type || "",
      no_of_rooms: "1",
      check_in_date: day.format("YYYY-MM-DD"),
      check_out_date: day.add(1, 'day').format("YYYY-MM-DD"),
      ...(dayData?.guest_name ? { ...dayData, id: dayData.reservation_id, mobile_no: dayData.phone_no } : {})
    };

    setSelectedResData(resData);
    setIsReservationOpen(true);
    */
  };

  // Open blank reservation form from "NEW BOOKING" header or sidebar
  const handleNewBooking = () => {
    setSelectedResData(null);
    setIsReservationOpen(true);
  };

  if (loading && !calendarData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: "#111C31" }}>
        <CircularProgress />
      </Box>
    );
  }

  const days = [];
  const startDate = calendarData?.start_date || currentDate;
  for (let i = 0; i < 7; i++) { days.push(dayjs(startDate).add(i, "day")); }

  return (
    <Box sx={{ display: "flex", bgcolor: "#111C31", minHeight: "100vh", color: "#fff", p: 0 }}>
      {/* Dashboard Calendar View */}
      <Box sx={{ flex: 1, overflow: "auto", p: 0.5, height: 'calc(100vh - 60px)' }}>
        <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", tableLayout: "fixed" }}>
          <thead>
            <tr style={{ height: "calc((100vh - 65px) / 19)", minHeight: '30px', backgroundColor: "#0E1729" }}>
              <th
                onClick={handleNewBooking}
                style={{
                  width: "140px", border: "1px solid #576478",
                  color: "#4B90FC", fontSize: "14px", fontWeight: "bold", cursor: 'pointer',
                  position: 'sticky', top: 0, left: 0, zIndex: 100, backgroundColor: "#0E1729"
                }}
              >
                NEW BOOKING
              </th>
              {days.map((day, idx) => {
                const isToday = day.isSame(dayjs(), 'day');
                const isYesterday = day.isSame(dayjs().subtract(1, 'day'), 'day');
                const isTomorrow = day.isSame(dayjs().add(1, 'day'), 'day');
                let label = day.format("D ddd");
                let subLabel = isToday ? "Today" : isYesterday ? "Yesterday" : isTomorrow ? "Tomorrow" : "";

                return (
                  <th key={idx} style={{
                    border: "1px solid #576478", color: "#fff", fontSize: "12px",
                    backgroundColor: isToday ? "rgba(255,255,255,0.05)" : "#0E1729", padding: "2px",
                    position: 'sticky', top: 0, zIndex: 90
                  }}>
                    <Box sx={{ borderBottom: isToday ? "2px solid #4B90FC" : "none", display: 'inline-block', pb: 0.1 }}>
                      {label}
                    </Box>
                    {subLabel && (
                      <Typography sx={{ fontSize: '9px', mt: 0.1, color: '#aaa' }}>{subLabel}</Typography>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {(calendarData?.data || []).map((room, rIdx) => {
              const todayDataRaw = room.calendar.find(c => dayjs(c.date).isSame(dayjs(), 'day')) || room.calendar[0] || {};
              const todayData = getDayDetails(todayDataRaw);
              const currentStatus = todayData.status || "";

              return (
                <tr key={rIdx} style={{ height: "calc((100vh - 65px) / 19)", minHeight: '30px' }}>
                  <td style={{
                    border: "1px solid #576478", padding: "0", verticalAlign: "middle",
                    position: 'sticky', left: 0, zIndex: 80, backgroundColor: "#111C31",
                    height: "100%"
                  }}>
                    <Box
                      onClick={(e) => handleRoomClick(e, room)}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        navigate("/create-maintenance", { state: { room_number: room.room_number } });
                      }}
                      sx={{ display: "flex", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, cursor: 'pointer', overflow: "hidden", bgcolor: "#111C31" }}
                    >
                      {/* Full-width Background Image */}
                      {statusMap[currentStatus.toUpperCase()]?.icon && (
                        <img
                          src={getImageUrl(statusMap[currentStatus.toUpperCase()].icon)}
                          style={{
                            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                            objectFit: "fill", zIndex: 0
                          }}
                          alt=""
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      {!statusMap[currentStatus.toUpperCase()]?.icon && currentStatus.toUpperCase() === "AVAILABLE" && statusMap["AVAILBLE"]?.icon && (
                        <img
                          src={getImageUrl(statusMap["AVAILBLE"].icon)}
                          style={{
                            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                            objectFit: "fill", zIndex: 0
                          }}
                          alt=""
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}

                      {/* Overlay Text Block */}
                      <Box sx={{ position: "relative", zIndex: 1, width: "100%", height: "100%", display: "flex", alignItems: "center" }}>

                        {/* Room Number inside the colored icon (left side) */}
                        <Box sx={{ width: "36px", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                          <Typography sx={{
                            fontSize: "14px", fontWeight: "900", color: "#fff",
                            textShadow: "1px 1px 4px rgba(0,0,0,0.9)", lineHeight: 1, position: "relative", top: "-1px"
                          }}>
                            {room.room_number}
                          </Typography>
                        </Box>

                        {/* Status Text centered in the remaining space (no background box) */}
                        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", px: 0.5 }}>
                          <Typography sx={{
                            fontSize: "9px", fontWeight: "800", color: "#fff",
                            textTransform: "uppercase", textAlign: "center",
                            textShadow: "1px 1px 3px rgba(0,0,0,0.9)", lineHeight: 1.1,
                            whiteSpace: "normal"
                          }}>
                            {currentStatus}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </td>

                  {days.map((day, dIdx) => {
                    const dayDataRaw = room.calendar.find(c => dayjs(c.date).isSame(day, 'day'));
                    const dayData = getDayDetails(dayDataRaw);
                    const status = dayData.status;
                    const guest = dayData.guest_name;
                    const isReservedStatus = dayData.isReserved;

                    let isStart = false;
                    if (isReservedStatus) {
                      const prevDay = day.subtract(1, 'day');
                      const prevDataRaw = room.calendar.find(c => dayjs(c.date).isSame(prevDay, 'day'));
                      const prevData = getDayDetails(prevDataRaw);
                      
                      const resId = dayData.reservation_id || guest;
                      const prevResId = prevData.reservation_id || prevData.guest_name;
                      
                      if (!prevDataRaw || !prevData.isReserved || prevResId !== resId) isStart = true;
                    }

                    let duration = 0;
                    if (isStart) {
                      const resId = dayData.reservation_id || guest;

                      let checkOutDate = null;
                      if (dayData.check_out_date) {
                        checkOutDate = dayjs(dayData.check_out_date);
                      }

                      if (checkOutDate && checkOutDate.isValid()) {
                        const startDay = day.startOf('day');
                        const endDay = checkOutDate.startOf('day');

                        if (endDay.isBefore(startDay, 'day')) {
                          isStart = false; 
                        } else {
                          let diffDays = endDay.diff(startDay, 'day');
                          // If it's a checkout day (diff 0), we still want to show a 1-day bar for that guest 
                          // to represent their occupancy on that day if we have no previous data.
                          duration = Math.min(Math.max(1, diffDays), 7 - dIdx);
                        }
                      } else {
                        // Fallback to searching consecutive days if no check_out_date
                        for (let i = 0; i < 7 - dIdx; i++) {
                          const checkDay = day.add(i, 'day');
                          const checkDataRaw = room.calendar.find(c => dayjs(c.date).isSame(checkDay, 'day'));
                          const checkData = getDayDetails(checkDataRaw);
                          const checkResId = checkData.reservation_id || checkData.guest_name;

                          const isCheckoutDate = checkDataRaw?.slots?.some(s => 
                            ["VACANT", "AVAILABLE"].includes((s.status || "").toUpperCase()) && 
                            (s.start_time >= "11:00:00" || s.end_time >= "12:00:00")
                          );

                          if (checkDataRaw && checkResId === resId && checkData.isReserved) {
                            if (isCheckoutDate) break; 
                            duration++;
                          } else break;
                        }
                      }
                    }

                    const isToday = day.isSame(dayjs(), 'day');

                    return (
                      <td
                        key={dIdx}
                        onClick={() => handleCellClick(room, day)}
                        style={{
                          border: "1px solid #576478",
                          position: "relative",
                          cursor: (dayData && (dayData.reservation_id || dayData.guest_name)) ? 'pointer' : 'default',
                          backgroundColor: isToday ? "rgba(255,255,255,0.03)" : "transparent"
                        }}
                      >
                        {isStart && (
                          <Box sx={{
                            position: "absolute", left: "8px", top: "5px", bottom: "5px",
                            width: `calc(${(duration * 100)}% - 16px)`,
                            bgcolor: getBarColor(status), borderRadius: "20px",
                            display: "flex", alignItems: "center", px: 1.5, zIndex: 10,
                            border: "1px solid rgba(255,255,255,0.2)",
                            overflow: "hidden",
                            boxSizing: "border-box"
                          }}>
                            <Typography sx={{
                              fontSize: "10px", fontWeight: "bold",
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                            }}>
                              {guest || (dayData.isMaintenance ? "MAINTENANCE" : (dayData.isShift ? "ROOM SHIFT" : "RESERVED"))}
                            </Typography>
                          </Box>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>

      {/* Reservation Popup Modal — Dark Theme */}
      <Modal
        open={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 400, sx: { bgcolor: 'rgba(0,0,0,0.85)' } }}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }}
      >
        <Fade in={isReservationOpen}>
          <Box sx={{
            outline: 'none',
            width: '90%',
            maxWidth: 860,
            maxHeight: '92vh',
            overflowY: 'auto',
            borderRadius: '12px',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { bgcolor: '#0e1729' },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#3a4a6b', borderRadius: '3px' },
          }}>
            <ReservationForm
              onClose={() => { setIsReservationOpen(false); fetchCalendar(); }}
              initialData={selectedResData}
            />
          </Box>
        </Fade>
      </Modal>

      {/* Booking Details Sidebar (Right Panel) */}
      <BookingDetailsSidebar
        open={isSidebarOpen}
        reservationId={sidebarResId}
        reservationData={selectedResData}
        onClose={() => {
          setIsSidebarOpen(false);
          setSidebarResId(null);
          setSelectedResData(null);
        }}
      />

      {/* Room Status Action Menu */}
      <Menu
        anchorEl={roomAnchor}
        open={Boolean(roomAnchor)}
        onClose={handleStatusResetClose}
        PaperProps={{
          sx: {
            bgcolor: "#1a2035", color: "#fff", border: "1px solid #3a4a6b", mt: 1,
            '& .MuiMenuItem-root': { fontSize: '12px', fontWeight: 'bold' },
            '& .MuiMenuItem-root:hover': { bgcolor: '#253050' }
          }
        }}
      >
        <MenuItem onClick={handleMakeAvailable} sx={{ color: '#00ff00' }}>
          MAKE AVAILABLE (ALL DATES)
        </MenuItem>
        <MenuItem onClick={handleMakeNotReady} sx={{ color: '#ffaa00' }}>
          MAKE NOT READY
        </MenuItem>
        {activeRoom?.todayData && (["CHECKINAC", "CHECK IN AC", "CHECK IN", "OCCUPIED", "CHECKEDIN", "CHECKED-IN"].includes((activeRoom.todayData.status || "").toUpperCase())) && (
          <>
            <MenuItem onClick={() => {
               const cid = activeRoom.todayData.id || activeRoom.todayData.reservation_id;
               navigate(`/mistake-shift/${cid}`, { state: { old_room_number: activeRoom.room_number } });
               handleStatusResetClose();
            }} sx={{ color: '#ffaa00' }}>
              MISTAKE SHIFT
            </MenuItem>
            <MenuItem onClick={handleRemoveCheckin} sx={{ color: '#ff5555' }}>
              REMOVE CHECK-IN
            </MenuItem>
          </>
        )}
        <MenuItem onClick={handleCheckinClick} sx={{ color: '#ffaa00' }}>
          CHECK-IN
        </MenuItem>
        <MenuItem onClick={() => {
          const checkinId = activeRoom?.todayData?.reservation_id || activeRoom?.todayData?.id;
          if (checkinId) {
            navigate(`/checkin-update/${checkinId}`);
            handleStatusResetClose();
          } else {
            toast.info("No active check-in or reservation found for this room");
            handleStatusResetClose();
          }
        }} sx={{ color: '#4B90FC' }}>
          UPDATE CHECK-IN
        </MenuItem>
        <MenuItem onClick={() => navigate("/room-shift", { state: { old_room_number: activeRoom?.room_number } })} sx={{ color: '#00aaff' }}>
          ROOM SHIFT
        </MenuItem>
        <MenuItem onClick={() => navigate("/create-maintenance", { state: { room_number: activeRoom?.room_number } })} sx={{ color: '#e89e2c' }}>
          CREATE MAINTENANCE
        </MenuItem>
        <MenuItem onClick={() => navigate("/update-maintenance", { state: { room_number: activeRoom?.room_number } })} sx={{ color: '#ffaa00' }}>
          UPDATE MAINTENANCE
        </MenuItem>
        <MenuItem onClick={() => navigate("/additional-services", { state: { room_number: activeRoom?.room_number } })} sx={{ color: '#ff6666' }}>
          ADDITIONAL SERVICES
        </MenuItem>
        <MenuItem onClick={() => navigate("/early-checkin", { state: { room_number: activeRoom?.room_number } })} sx={{ color: '#ff6666' }}>
          EARLY CHECK-IN
        </MenuItem>
        <MenuItem onClick={() => navigate("/room-advance", { state: { room_number: activeRoom?.room_number } })} sx={{ color: '#00ff00' }}>
          ROOM ADVANCE
        </MenuItem>
      </Menu>
    </Box>
  );
}


