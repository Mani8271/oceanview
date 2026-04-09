import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, TextField, Button, Select, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, Autocomplete } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../API/API";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const api = new API();

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <Box 
    onClick={onClick} 
    ref={ref}
    sx={{
      bgcolor: '#0e1729', color: '#4B90FC', px: 1.5, py: 0.5, borderRadius: '4px',
      border: '1px solid #3a4a6b', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
      '&:hover': { borderColor: '#4B90FC', bgcolor: '#1a2a4a' }
    }}
  >
    {value}
  </Box>
));

const INITIAL_FORM = {
  reservation_id: "", room_id: "", room_number: "", booking_guest_name: "", booking_phone_no: "",
  check_in_guest_name: "", guest_phone_no: "", id_proof_no: "", id_proof_type: "", state: "",
  district_name: "", address: "", check_in_date: "", check_out_date: "", visiting_purpose: "",
  booking_type: "", room_type: "", ep_cp_plan: "", company_name: "", booking_id: "", no_of_nights: "",
  no_of_guests: "", child: "", citizenship: "INDIAN", country_name: "INDIA", status: "Checked-In"
};

const darkField = {
  bgcolor: "#1a2035", borderRadius: '6px', fontFamily: "'Inter', 'Roboto', sans-serif",
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3a4a6b' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#5a7ab0' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4B90FC' },
  '& .MuiOutlinedInput-root': { color: '#e0e6f0', height: '32px', fontSize: '12px !important', fontWeight: '400 !important', bgcolor: '#1a2035', fontFamily: "inherit" },
  '& .MuiInputBase-input': { padding: '4px 8px', color: '#e0e6f0', fontWeight: '400 !important', fontSize: '12px !important' },
  '& .Mui-disabled': { bgcolor: '#141c2e', WebkitTextFillColor: '#8899bb !important' },
  '& .MuiSelect-select': { color: '#e0e6f0 !important', padding: '4px 8px !important', fontWeight: '400 !important', fontSize: '12px !important' },
  '& .MuiSvgIcon-root': { color: '#8899bb' },
};

const getDarkLabel = () => ({
  color: '#8faac8', fontSize: '9px', fontWeight: '600', mb: 0.3, textTransform: 'uppercase',
  letterSpacing: '1px', fontFamily: "'Inter', 'Roboto', sans-serif",
});

export default function CheckinForm({ onClose, initialData }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ ...INITIAL_FORM, ...(initialData || {}) });
  const [listDate, setListDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [listData, setListData] = useState([]);
  
  const [companies, setCompanies] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [bookingTypes, setBookingTypes] = useState([]);
  const [visitingPurposes, setVisitingPurposes] = useState([]);
  const [citizenshipList, setCitizenshipList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [districtList, setDistrictList] = useState([]);

  // Removed hardcoded states/cities as they are now fetched from masters per user request
  
  // Apply initialData (from props or location state)
  useEffect(() => {
    // Priority: initialData prop (if used as modal) > location.state (if navigated)
    const passedData = initialData || location.state;
    if (passedData) {
       if (passedData.resume_reservation_data) {
           // Restore room_id directly if it was passed back
           const backRoomId = passedData.room_id || passedData.resume_reservation_data.room_id;
           const backRoomNum = passedData.room_number || passedData.resume_reservation_data.room_number;
           
           // Automatically populate the form without re-triggering the early check-in alert!
           handleSelectReservation(passedData.resume_reservation_data, true);
           
           if (backRoomNum) {
               setFormData(prev => ({ 
                 ...prev, 
                 room_number: backRoomNum, 
                 room_id: backRoomId || prev.room_id,
                 hasCompletedEarlyCheckin: true 
               }));
               if (!backRoomId) handleRoomSearch(backRoomNum);
           } else {
               setFormData(prev => ({ ...prev, hasCompletedEarlyCheckin: true }));
           }
       } else {
           setFormData(prev => ({ 
             ...prev, 
             ...passedData, 
             check_in_date: passedData.check_in_date || prev.check_in_date || dayjs().format("YYYY-MM-DD") 
           }));
           
           if (passedData.room_number && !passedData.room_id) {
               handleRoomSearch(passedData.room_number);
           }
       }
    }
  }, [initialData, location.state]);

  // Fetch either check-ins or reservations to show in the right side table.
  // The user requested "reservation page data right side". We'll fetch reservations for the selected date.
  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [resComps, resRooms, resBookTypes, resPurposes, resCitizens, resCountries, resStates, resDistricts] = await Promise.all([
          api.get("api/company-masters"),
          api.get("api/room-types"),
          api.get("api/booking-types"),
          api.get("api/visiting-purposes"),
          api.get("api/citizenships"),
          api.get("api/countries"),
          api.get("api/states"),
          api.get("api/districts")
        ]);
        setCompanies((resComps?.data?.data || resComps?.data || []).map(c => c.company_name || c.name));
        setRoomTypes((resRooms?.data?.data || resRooms?.data || []).map(t => t.type_name || t.name));
        setBookingTypes((resBookTypes?.data?.data || resBookTypes?.data || []).map(t => t.type_name || t.name));
        setVisitingPurposes((resPurposes?.data?.data || resPurposes?.data || []).map(p => p.visiting_purpose || p.name));
        setCitizenshipList((resCitizens?.data?.data || resCitizens?.data || []).map(c => c.citizenship || c.name));
        setCountryList((resCountries?.data?.data || resCountries?.data || []).map(c => c.name || c.country_name));
        setStateList((resStates?.data?.data || resStates?.data || []).map(s => s.name || s.state_name));
        setDistrictList((resDistricts?.data?.data || resDistricts?.data || []).map(d => d.name || d.district_name));
      } catch (e) {
        console.error("Failed to fetch options", e);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`api/reservations?date=${listDate}`);
        setListData(res?.data?.data || res?.data || []);
      } catch (e) {
        setListData([]);
      }
    };
    fetchData();
  }, [listDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleSubmit = async () => {
    let submitRoomId = formData.room_id;
    const currentRoomNum = String(formData.room_number || "").trim();
    
    // Safety Net: Force lookup if ID is missing but number is present
    if (!submitRoomId && currentRoomNum) {
        try {
            const allRoomsRes = await api.get("api/room-masters");
            const rmList = allRoomsRes?.data?.data || allRoomsRes?.data || [];
            
            // Aggressive search: look for room number in any possible field name
            const foundRm = rmList.find(r => 
                (r.room_number && String(r.room_number).trim() === currentRoomNum) || 
                (r.room_no && String(r.room_no).trim() === currentRoomNum) ||
                (r.room && String(r.room).trim() === currentRoomNum) ||
                (r.id && String(r.id).trim() === currentRoomNum) // Some APIs use id as room number
            );
            
            if (foundRm) {
               submitRoomId = foundRm.id || foundRm.room_master_id || foundRm.room_id;
               setFormData(prev => ({ ...prev, room_id: submitRoomId }));
            }
        } catch(e) {
            console.error("Critical Room Lookup Failure", e);
        }
    }

    if (!submitRoomId) {
      toast.warning(`Could not verify Room ID for Room ${currentRoomNum}. Please select a different room.`);
      return;
    }

    const payload = {
        ...formData,
        room_id: submitRoomId,
        room_number: currentRoomNum,
        no_of_nights: parseInt(formData.no_of_nights) || 1,
        no_of_guests: parseInt(formData.no_of_guests) || 1,
        child: parseInt(formData.child) || 0,
        check_in_date: formData.check_in_date || dayjs().format("YYYY-MM-DD"),
        status: "Checked-In"
    };

    try {
      // 1. Fetch Company Early Check-in Rules before submitting
      let isEarlyCheckIn = false;
      let earlyCheckInData = null;
      if (formData.company_name) {
         try {
           const compRes = await api.get(`api/company-masters/by-name/${encodeURIComponent(formData.company_name.trim())}`);
           const compInfo = compRes?.data?.data || compRes?.data;
           const comp = Array.isArray(compInfo) && compInfo.length > 0 ? compInfo[0] : (!Array.isArray(compInfo) ? compInfo : null);
           
           if (comp && comp.early_check_in_start_time && comp.early_check_in_end_time) {
              // Calculate exactly the Indian Standard Time (IST)
              const currDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
              const currTime = String(currDate.getHours()).padStart(2, '0') + ":" + String(currDate.getMinutes()).padStart(2, '0');
              
              if (currTime >= comp.early_check_in_start_time && currTime <= comp.early_check_in_end_time) {
                  isEarlyCheckIn = true;
                  earlyCheckInData = {
                     start_time: comp.early_check_in_start_time,
                     end_time: comp.early_check_in_end_time,
                     early_check_in_amount: comp.early_check_in_amount,
                     company_name: comp.company_name
                  };
              }
           }
         } catch (e) {
            console.error("Failed to check company early check-in rules - trying fallback lookup", e);
            // Fallback: try fetching all companies
            try {
               const allCompRes = await api.get("api/company-masters");
               const allComps = allCompRes?.data?.data || allCompRes?.data || [];
               const comp = allComps.find(c => c.company_name?.toUpperCase() === formData.company_name.trim().toUpperCase());
               if (comp && comp.early_check_in_start_time && comp.early_check_in_end_time) {
                  const currDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
                  const currTime = String(currDate.getHours()).padStart(2, '0') + ":" + String(currDate.getMinutes()).padStart(2, '0');
                  if (currTime >= comp.early_check_in_start_time && currTime <= comp.early_check_in_end_time) {
                      isEarlyCheckIn = true;
                      earlyCheckInData = {
                         start_time: comp.early_check_in_start_time,
                         end_time: comp.early_check_in_end_time,
                         early_check_in_amount: comp.early_check_in_amount,
                         company_name: comp.company_name
                      };
                  }
               }
            } catch (err2) { }
         }
      }

      // 2. Submit Check-In
      await api.post("api/check-ins", payload);
      toast.success("Check-In Successful!");
      
      // 3. Conditional Navigation
      if (isEarlyCheckIn && !formData.hasCompletedEarlyCheckin) {
         toast.info("Early Check-In rules apply. Redirecting to Early Check-In Charges...");
         if (onClose) onClose();
         navigate("/early-checkin", {
            state: {
               room_number: formData.room_number,
               guest_name: formData.check_in_guest_name,
               booking_type: formData.booking_type,
               company_name: earlyCheckInData.company_name || formData.company_name,
               start_time: earlyCheckInData.start_time,
               end_time: earlyCheckInData.end_time,
               total_charges: earlyCheckInData.early_check_in_amount,
               post_early_checkin_redirect: '/room-advance'
            }
         });
      } else {
         if (onClose) {
            onClose();
         } else {
            // "then navigater chcekin form once chcekin complete then navigate to room adavances form"
            navigate("/room-advance", { state: { room_number: formData.room_number } });
         }
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save Check-In");
    }
  };

  const toDate = (val) => {
    if (!val) return null;
    const d = dayjs(val);
    return d.isValid() ? d.toDate() : null;
  };

  const handleRoomSearch = async (num) => {
    if (!num) return;
    try {
      const res = await api.get(`api/room-masters/current-guest?room_number=${num}`);
      const roomData = res?.data?.data || res?.data;
      if (roomData && (roomData.room_master_id || roomData.room_id || roomData.id)) {
        setFormData(prev => ({ 
          ...prev, 
          room_id: roomData.room_master_id || roomData.room_id || roomData.id,
          room_type: (roomData.room_type || prev.room_type || "").toUpperCase()
        }));
        return;
      }
    } catch (e) {
      // It's expected to fail if the room is vacant. Fallback triggered below.
    }
    
    // Fallback: search in room-types or similar if current-guest throws 404 or missing ID
    try {
      const allRooms = await api.get("api/room-masters");
      const rooms = allRooms?.data?.data || allRooms?.data || [];
      const found = rooms.find(r => String(r.room_number) === String(num));
      if (found) {
         setFormData(prev => ({ ...prev, room_id: found.id, room_type: (found.room_type || prev.room_type || "").toUpperCase() }));
      } else {
         toast.error(`Room ${num} not found in database`);
      }
    } catch (err) {
      console.error("Failed to fetch room masters", err);
    }
  };

  const handleSelectReservation = async (res, bypassEarlyCheck = false) => {
    let isEarlyCheckin = false;
    let earlyAmount = 0;
    
    // 1. Immediately check Early Check-in constraints
    if (res.company_name && !bypassEarlyCheck) {
       try {
          const compRes = await api.get(`api/company-masters/by-name/${encodeURIComponent(res.company_name.trim())}`);
          const compInfo = compRes?.data?.data || compRes?.data;
          const comp = Array.isArray(compInfo) && compInfo.length > 0 ? compInfo[0] : (!Array.isArray(compInfo) ? compInfo : null);
          
          if (comp && comp.early_check_in_start_time && comp.early_check_in_end_time) {
              const currDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
              const currTime = String(currDate.getHours()).padStart(2, '0') + ":" + String(currDate.getMinutes()).padStart(2, '0');
              if (currTime >= comp.early_check_in_start_time && currTime <= comp.early_check_in_end_time) {
                 isEarlyCheckin = true;
                 earlyAmount = comp.early_check_in_amount;
              }
          }
       } catch(e) {
          try {
             const allCompRes = await api.get("api/company-masters");
             const allComps = allCompRes?.data?.data || allCompRes?.data || [];
             const comp = allComps.find(c => c.company_name?.toUpperCase() === res.company_name.trim().toUpperCase());
             if (comp && comp.early_check_in_start_time && comp.early_check_in_end_time) {
                const currDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
                const currTime = String(currDate.getHours()).padStart(2, '0') + ":" + String(currDate.getMinutes()).padStart(2, '0');
                if (currTime >= comp.early_check_in_start_time && currTime <= comp.early_check_in_end_time) {
                   isEarlyCheckin = true;
                   earlyAmount = comp.early_check_in_amount;
                }
             }
          } catch (err2) {}
       }
    }

    if (isEarlyCheckin) {
       const ok = window.confirm(`EARLY CHECK-IN APPLIES!\n\nThis time falls inside the Early Check-In timeframe for Company: ${res.company_name}.\nThe charge will be Rs. ${earlyAmount}.\n\nDo you want to proceed to the Early Check-In charges page?`);
       if (!ok) return; // Abandon populating if user rejects

       // Directly open early check-in page automatically!
       if (onClose) onClose();
       navigate("/early-checkin", {
         state: {
           room_number: formData.room_number || res.room_number || "",
           room_id: formData.room_id || res.room_id || "",
           guest_name: res.guest_name || "",
           company_name: res.company_name,
           booking_type: res.booking_type,
           start_time: dayjs().format("HH:mm"),
           end_time: dayjs().format("HH:mm"),
           total_charges: earlyAmount,
           post_early_checkin_redirect: '/checkin-form',
           reservation_id_to_resume: res.id,
           resume_reservation_data: res
         }
       });
       return; // Stop execution here, we are leaving the page!
    }

    // 2. Populate form (Normal flow or returning flow)
    const nights = dayjs(res.check_out_date).diff(dayjs(res.check_in_date), 'day');
     setFormData(prev => ({
       ...prev,
       reservation_id: res.id || "",
       // Only populate room data if currently empty to avoid overwriting a dashboard selection
       room_number: prev.room_number || res.room_number || "",
       room_id: prev.room_id || res.room_id || res.room_master_id || "",
       booking_guest_name: (res.guest_name || "").toUpperCase(),
       booking_phone_no: res.phone_no || "",
       check_in_guest_name: (res.guest_name || "").toUpperCase(),
       guest_phone_no: res.phone_no || "",
       check_in_date: res.check_in_date || "",
       check_out_date: res.check_out_date || "",
       no_of_nights: nights || "",
       booking_type: (res.booking_type || "").toUpperCase(),
       room_type: res.room_type ? res.room_type.toUpperCase() : prev.room_type,
       ep_cp_plan: (res.food_plan || "").toUpperCase(),
       company_name: (res.company_name || "").toUpperCase(),
       booking_id: (res.booking_id || "").toUpperCase(),
       no_of_guests: res.no_of_persons || ""
     }));
     
     // If we just populated a room number but no ID, search for it
     if (!formData.room_id && (res.room_number || formData.room_number)) {
        handleRoomSearch(res.room_number || formData.room_number);
     }
    toast.info(`Selected Reservation #${res.id}`);
  };

  const renderField = (name, label, type = "text", options = [], isSelect = false, extraAction = null, isSearchable = false) => {
    const isMultiline = name === 'address';
    let fieldNode;

    const fieldStyle = {
      ...darkField,
      ...(isMultiline ? { '& .MuiOutlinedInput-root': { height: 'auto', p: 0.5 } } : {}),
      '& .MuiInputBase-input': { padding: '4px 8px', color: name === 'room_number' ? '#ffa500' : '#e0e6f0', fontWeight: name === 'room_number' ? 'bold' : 'normal' }
    };

    if (isSearchable) {
       fieldNode = (
         <Autocomplete
           fullWidth size="small" options={options} value={formData[name] || ""}
           onChange={(event, newValue) => setFormData(prev => ({ ...prev, [name]: (newValue || "").toUpperCase() }))}
           renderInput={(params) => <TextField {...params} sx={fieldStyle} />}
           PaperProps={{ sx: { bgcolor: '#1a2035', color: '#e0e6f0', border: '1px solid #3a4a6b', '& .MuiMenuItem-root:hover': { bgcolor: '#253050' } } }}
           sx={{
             ...fieldStyle,
             '& .MuiOutlinedInput-root': { ...fieldStyle['& .MuiOutlinedInput-root'], padding: '0 !important' }
           }}
         />
       );
    } else if (isSelect) {
      fieldNode = (
        <Select fullWidth size="small" name={name} value={formData[name] || ""} onChange={handleInputChange} sx={fieldStyle}>
          <MenuItem value=""><em>-- Select --</em></MenuItem>
          {options.map((o, idx) => <MenuItem key={idx} value={o.toUpperCase()}>{o.toUpperCase()}</MenuItem>)}
        </Select>
      );
    } else if (type === 'date') {
       fieldNode = (
         <Box sx={{
           '& .react-datepicker-wrapper': { width: '100%' },
           '& .react-datepicker__input-container input': {
             width: '100%', padding: '4px 8px', bgcolor: '#1a2035', color: '#e0e6f0',
             border: '1px solid #3a4a6b', borderRadius: '4px', fontSize: '12px', fontWeight: '500', height: '30px', boxSizing: 'border-box', outline: 'none'
           },
         }}>
           <DatePicker selected={toDate(formData[name])} onChange={(d) => setFormData(prev => ({ ...prev, [name]: dayjs(d).format("YYYY-MM-DD") }))} dateFormat="dd-MM-yyyy" />
         </Box>
       );
    } else {
      fieldNode = (
        <TextField 
          fullWidth size="small" name={name} value={formData[name] || ""} 
          onChange={handleInputChange} multiline={isMultiline} rows={isMultiline ? 3 : 1} 
          type={type} sx={fieldStyle}
          onBlur={name === 'room_number' ? (e) => handleRoomSearch(e.target.value) : null}
        />
      );
    }

    const isOrangeLabel = ['room_number', 'check_in_guest_name', 'guest_phone_no'].includes(name);

    return (
      <Box sx={{ mb: 1.2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.2 }}>
          <Typography sx={{ color: isOrangeLabel ? '#e89e2c' : '#6b7a90', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label.replace(':', '')}
          </Typography>
          {extraAction && (
             <Typography sx={{ color: '#28a745', fontSize: '10px', fontWeight: '600', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
               {extraAction}
             </Typography>
          )}
        </Box>
        {fieldNode}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'flex-start', p: onClose ? 0 : 2, width: '100%' }}>
      
      {/* LEFT COMPONENT - FORM */}
      <Box sx={{
        flex: 1.2, minWidth: 0, bgcolor: "#0e1729", color: '#e0e6f0',
        borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.7)', border: '1px solid #253050'
      }}>
        {/* Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #1a2a4a 0%, #0e1729 100%)', px: 3, py: 2,
          borderBottom: '1px solid #253050', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#e0e6f0', letterSpacing: '1px', textTransform: 'uppercase' }}>
             📋 Check In Page
          </Typography>
          {onClose && (
            <Box onClick={onClose} sx={{ cursor: 'pointer', color: '#8899bb', fontSize: '20px', lineHeight: 1, '&:hover': { color: '#ff5555' }, transition: 'color 0.2s' }}>✕</Box>
          )}
        </Box>

        {/* Form Body */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={1}>
            {/* Left Main Column */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {renderField('room_number', 'Room No:')}
                {renderField('booking_guest_name', 'Booking Guest Name:', 'text', [], false, 'Search')}
                {renderField('booking_phone_no', 'Booking Phone No:')}
                {renderField('check_in_guest_name', 'ChkIn Guest Name:')}
                {renderField('guest_phone_no', 'Guest Phone No:')}
                {renderField('id_proof_no', 'ID Proof No:')}
                {renderField('id_proof_type', 'ID Proof Type:', 'text', ['Aadhar', 'PAN', 'Passport', 'Driving License'], true)}
                {renderField('state', 'State:', 'text', stateList, true, null, true)}
                {renderField('district_name', 'City Name:', 'text', districtList, true, 'New', true)}
                {renderField('address', 'Address:')}
              </Box>
            </Grid>

            {/* Right Main Column */}
            <Grid item xs={12} md={6}>
               <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                 {renderField('check_in_date', 'Check IN Date:', 'date')}
                 {renderField('check_out_date', 'Check Out Date:', 'date')}
                 {renderField('visiting_purpose', 'Visiting Purpose:', 'text', visitingPurposes, true)}
                 {renderField('booking_type', 'Booking Type:')}
                 {renderField('room_type', 'Room Type:')}
                 {renderField('ep_cp_plan', 'EP/CP Plan:')}
                 {renderField('company_name', 'Company Name:')}
                 {renderField('booking_id', 'Booking ID:')}
                 {renderField('no_of_nights', 'No of Nights:')}

                 {/* No of Guests */}
                 <Box sx={{ mb: 1.2 }}>
                   <Typography sx={{ color: '#6b7a90', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', mb: 0.2 }}>No of Guests</Typography>
                   <Box sx={{ display: 'flex', gap: 2 }}>
                     <Box sx={{ flex: 1 }}>
                       <Typography sx={{ color: '#576478', fontSize: '9px', textTransform: 'uppercase', mb: 0.3 }}>No of Persons</Typography>
                       <TextField fullWidth size="small" name="no_of_guests" value={formData.no_of_guests || ""} onChange={handleInputChange} sx={{ ...darkField, '& .MuiOutlinedInput-root': { height: '32px' } }} />
                     </Box>
                     <Box sx={{ flex: 1 }}>
                       <Typography sx={{ color: '#576478', fontSize: '9px', textTransform: 'uppercase', mb: 0.3 }}>Child</Typography>
                       <TextField fullWidth size="small" name="child" value={formData.child || ""} onChange={handleInputChange} sx={{ ...darkField, '& .MuiOutlinedInput-root': { height: '32px' } }} />
                     </Box>
                   </Box>
                 </Box>

                 {renderField('citizenship', 'Citizenship:', 'text', citizenshipList, true, 'New')}
                 {renderField('country_name', 'Country Name:', 'text', countryList, true, 'New', true)}
               </Box>
            </Grid>
          </Grid>
          
          {/* Action Buttons styled like wireframe */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 4 }}>
             <Button onClick={() => onClose ? onClose() : navigate("/room-master")} sx={{
               background: 'linear-gradient(to bottom, #d32f2f, #9a0007)', color: '#fff', 
               fontWeight: 'bold', fontSize: '12px', width: '110px', height: '36px', 
               borderRadius: '4px', border: '2px solid rgba(255,255,255,0.7)', 
               boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.5)'
             }}>
               CLOSE
             </Button>
             <Button onClick={handleSubmit} sx={{
               background: 'linear-gradient(to bottom, #28a745, #145523)', color: '#fff', 
               fontWeight: 'bold', fontSize: '12px', width: '110px', height: '36px', 
               borderRadius: '4px', border: '2px solid rgba(255,255,255,0.7)', 
               boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.5)'
             }}>
               CHECKIN
             </Button>
          </Box>
        </Box>
      </Box>

      {/* RIGHT COMPONENT - LIST */}
      <Box sx={{ flex: 1.6, minWidth: 0, flexGrow: 1, bgcolor: '#0e1729', borderRadius: '12px', border: '1px solid #253050', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#1a2a4a', px: 2, py: 1, borderRadius: '4px 4px 0 0', border: '1px solid #253050', mb: 0 }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' }}>
              Reservation List
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {[
                { label: 'Yesterday', val: dayjs().subtract(1, 'day').format("YYYY-MM-DD") },
                { label: 'Today', val: dayjs().format("YYYY-MM-DD") },
                { label: 'Tomorrow', val: dayjs().add(1, 'day').format("YYYY-MM-DD") }
              ].map((btn) => (
                <Button key={btn.label} onClick={() => setListDate(btn.val)}
                  sx={{
                    bgcolor: listDate === btn.val ? '#4B90FC' : '#0e1729',
                    color: '#fff', fontSize: '10px', fontWeight: 'bold', px: 2, py: 0.5, minWidth: 'auto',
                    border: '1px solid #3a4a6b', borderRadius: '4px', '&:hover': { bgcolor: '#3a7ae0' }
                  }}>
                  {btn.label}
                </Button>
              ))}
              <Box className="custom-datepicker" sx={{ ml: 1 }}>
                <DatePicker selected={toDate(listDate)} onChange={(date) => setListDate(dayjs(date).format("YYYY-MM-DD"))}
                  dateFormat="dd-MM-yyyy" popperPlacement="bottom-end" customInput={<CustomDateInput />} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ bgcolor: '#0e1729', borderRadius: '0 0 8px 8px', overflow: 'hidden', border: '1px solid #253050', borderTop: 'none', height: '100%', minHeight: '500px' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#0d1321' }}>
                  {["Guest Name", "Company Name", "Check In - Out", "Nights"].map(h => (
                    <TableCell key={h} align={h === 'Nights' ? 'center' : 'left'}
                      sx={{ color: '#8899bb', fontWeight: '700', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #253050', py: 1.2, width: h === 'Nights' ? '1%' : 'auto', whiteSpace: 'nowrap' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {listData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: '#8899bb', py: 5, fontSize: '12px' }}>
                      No data found for {dayjs(listDate).format("DD MMM YYYY")}
                    </TableCell>
                  </TableRow>
                ) : (
                  listData.map((res, idx) => {
                    const nights = dayjs(res.check_out_date).diff(dayjs(res.check_in_date), 'day');
                    return (
                      <TableRow 
                        key={idx} 
                        onClick={() => handleSelectReservation(res)}
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#1a2035' } }}
                      >
                        <TableCell sx={{ borderBottom: '1px solid #1e2d45', py: 1.2 }}>
                          <Typography sx={{ color: '#4B90FC', fontSize: '11px', fontWeight: '600' }}>#{res.id || (Math.floor(Math.random()*1000))} - {res.guest_name || res.check_in_guest_name}</Typography>
                          <Typography sx={{ color: '#8899bb', fontSize: '10px' }}>{res.phone_no || res.guest_phone_no}</Typography>
                        </TableCell>
                        <TableCell sx={{ color: '#e0e6f0', borderBottom: '1px solid #1e2d45', fontSize: '11px' }}>
                          <Typography sx={{ color: '#e0e6f0', fontSize: '11px', fontWeight: '500' }}>{res.company_name}</Typography>
                          <Typography sx={{ color: '#8899bb', fontSize: '9px', textTransform: 'uppercase' }}>{res.booking_type}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #1e2d45' }}>
                          <Typography sx={{ color: '#10b981', fontSize: '11px', fontWeight: 'bold' }}>IN: {dayjs(res.check_in_date).format("DD MMM YYYY")}</Typography>
                          <Typography sx={{ color: '#ef4444', fontSize: '11px', fontWeight: 'bold' }}>OUT: {dayjs(res.check_out_date).format("DD MMM YYYY")}</Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: '1px solid #1e2d45' }}>
                          <Box sx={{ bgcolor: '#1a2035', color: '#e0e6f0', px: 1, py: 0.5, borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #3a4a6b', display: 'inline-block' }}>
                            {nights}N
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>
      </Box>

    </Box>
  );
}
