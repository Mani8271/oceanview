import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Grid, TextField, Button, Select, MenuItem, Checkbox, FormControlLabel, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
      bgcolor: '#1a2035', color: '#e0e6f0', px: 1, py: '6px', borderRadius: '4px',
      border: '1px solid #3a4a6b', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', height: '30px', boxSizing: 'border-box'
    }}
  >
    {value}
  </Box>
));

const darkField = {
  bgcolor: "#1a2035", borderRadius: '4px', border: '1px solid #3a4a6b',
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiOutlinedInput-root': { color: '#e0e6f0', height: '30px', fontSize: '11px', bgcolor: '#1a2035' },
  '& .MuiInputBase-input': { padding: '4px 8px' },
  '& .Mui-disabled': { bgcolor: '#141c2e', WebkitTextFillColor: '#8899bb !important' },
  '& .MuiSelect-select': { padding: '4px 8px !important', color: '#e0e6f0' },
  '& .MuiSvgIcon-root': { color: '#8899bb' },
};

const getDarkLabel = () => ({
  color: '#576478', fontSize: '10px', mb: 0.5, letterSpacing: '0.5px'
});

export default function CheckinUpdate({ id: propId, onClose, initialData }) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const location = useLocation();
  const id = propId || paramId || location.state?.id;
  const [formData, setFormData] = useState({
    check_in_date: dayjs().format("YYYY-MM-DD"),
    check_out_date: dayjs().add(1, 'day').format("YYYY-MM-DD"),
    check_in_time: "12:00 PM",
    check_out_time: "11:00 AM",
    room_number: "",
    booking_guest_name: "",
    booking_phone_no: "",
    check_in_guest_name: "",
    check_in_guest_phone_no: "",
    guest_phone_no: "",
    id_proof_no: "",
    id_proof_type: "",
    state: "",
    district_name: "",
    address: "",
    visiting_purpose: "",
    company_name: "",
    booking_type: "",
    room_type: "",
    ep_cp_plan: "",
    booking_id: "",
    no_of_guests: "",
    child: "",
    citizenship: "",
    country_name: "",
    reference: "",
    remark: "",
    cust_gst_company: "",
    customer_gst_no: "",
    credit_company: "",
    room_charges: "",
    no_of_nights: "1",
    total_charges: "",
    total_tax: "",
    total_gross: "",
    include_tax: false
  });

  const [visitingPurposes, setVisitingPurposes] = useState([]);
  const [checkinId, setCheckinId] = useState(null);
  const [citizenshipList, setCitizenshipList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [photos, setPhotos] = useState({ photo1: null, photo2: null, photo3: null, photo4: null });
  const fileInputRefs = {
    photo1: useRef(), photo2: useRef(), photo3: useRef(), photo4: useRef()
  };

  useEffect(() => {
    fetchOptions();
    if (id || initialData) {
      fetchCheckinDetails(id || initialData?.id);
    }
  }, [id, initialData]);

  const fetchOptions = async () => {
    try {
      const [resPurposes, resCitizens, resCountries, resStates, resDistricts] = await Promise.all([
        api.get("api/visiting-purposes"),
        api.get("api/citizenships"),
        api.get("api/countries"),
        api.get("api/states"),
        api.get("api/districts")
      ]);
      setVisitingPurposes((resPurposes?.data?.data || resPurposes?.data || []).map(p => p.visiting_purpose || p.name));
      setCitizenshipList((resCitizens?.data?.data || resCitizens?.data || []).map(c => c.citizenship || c.name || c));
      setCountryList((resCountries?.data?.data || resCountries?.data || []).map(c => c.name || c.country_name || c));
      setStateList((resStates?.data?.data || resStates?.data || []).map(s => s.name || s.state_name || s));
      setDistrictList((resDistricts?.data?.data || resDistricts?.data || []).map(d => d.name || d.district_name || d));
    } catch (e) { }
  };


  const fetchCheckinDetails = async (targetId) => {
    if (!targetId || targetId === "undefined") return;
    setLoading(true);
    try {
      let data = null;
      
      // Step 1: Prevent 404 toast by safely looking up the correct Check-In ID first
      try {
        const allRes = await api.get("api/check-ins");
        const list = allRes?.data?.data || allRes?.data || [];
        const found = list.find(c => 
          String(c.reservation_id) === String(targetId) || 
          String(c.id) === String(targetId) || 
          String(c.booking_id) === String(targetId)
        );
        
        if (found) {
          data = found;
          // Fetch full single check-in details now that we reliably know the check-in ID
          try {
            const singleRes = await api.get(`api/check-ins/${found.id}`);
            let singleData = singleRes?.data?.data || singleRes?.data;
            if (Array.isArray(singleData) && singleData.length > 0) singleData = singleData[0];
            if (singleData && typeof singleData === 'object') {
              data = { ...data, ...singleData };
            }
          } catch(e) {} // ignore inner errors
        }
      } catch (err) {}

      // Step 2: Fallback to reservations if it wasn't found in check-ins at all
      if (!data) {
         try {
           const res2 = await api.get(`api/reservations/${targetId}`);
           data = res2?.data?.data || res2?.data;
           if (Array.isArray(data) && data.length > 0) data = data[0];
         } catch (e) {}
      }

      // Step 3: Final fallback: check "current-guest" by potential room number in ID if applicable
      if (!data && (formData.room_number || targetId)) {
          const roomToSearch = formData.room_number || (String(targetId).length < 5 ? targetId : null);
          if (roomToSearch) {
              try {
                const guestRes = await api.get(`api/room-masters/current-guest?room_number=${roomToSearch}`);
                data = guestRes?.data?.data || guestRes?.data;
                if (Array.isArray(data) && data.length > 0) data = data[0];
              } catch(e) {}
          }
      }

      // Step 4: Map Date to Form Data
      if (data && typeof data === 'object') {
        const checkid = data.check_in_id || data.id || targetId;
        setCheckinId(checkid);

        setFormData(prev => ({ 
          ...prev, 
          ...data,
          // Ensuring names and phone numbers map correctly from all possible API fields
          booking_guest_name: data.booking_guest_name || data.guest_name || prev.booking_guest_name,
          booking_phone_no: data.booking_phone_no || data.mobile_no || data.phone_no || prev.booking_phone_no,
          check_in_guest_name: data.check_in_guest_name || data.guest_name || prev.check_in_guest_name,
          guest_phone_no: data.guest_phone_no || data.guest_phone_no || data.mobile_no || data.phone_no || prev.guest_phone_no,
          check_in_guest_phone_no: data.check_in_guest_phone_no || data.guest_phone_no || data.phone_no || prev.check_in_guest_phone_no,
          
          // Geography fallbacks
          state: data.state || data.state_name || data.state_name_display || prev.state,
          district_name: data.district_name || data.city_name || data.city || data.district || data.district_display || prev.district_name,
          country_name: data.country_name || data.country || data.country_name_display || prev.country_name,
          address: data.address || data.guest_address || data.full_address || prev.address,
          
          // ID Proof fallbacks
          id_proof_no: data.id_proof_no || data.id_proof_number || data.id_proof || data.id_no || prev.id_proof_no,
          id_proof_type: data.id_proof_type || data.id_type || data.id_proof_type_display || prev.id_proof_type,
          
          // GST & Credit Info Mapping
          cust_gst_company: data.cust_gst_company || data.guest_gst_company_name || data.gst_company || prev.cust_gst_company,
          customer_gst_no: data.customer_gst_no || data.guest_gst_company_no || data.gst_no || prev.customer_gst_no,
          credit_company: data.credit_company || data.credit_company_name || data.company || prev.credit_company,
          
          // Room info
          room_number: data.room_number || prev.room_number,
          room_type: data.room_type || prev.room_type,
          booking_type: data.booking_type || data.booking_category || data.type_of_booking || prev.booking_type,
          ep_cp_plan: data.ep_cp_plan || data.food_plan || data.plan || data.plan_name || prev.ep_cp_plan,
          company_name: data.company_name || data.corporate_name || data.walkin_direct || prev.company_name,
          booking_id: data.booking_id || data.booking_no || data.reservation_no || prev.booking_id,
          citizenship: data.citizenship || data.citizenship_type || prev.citizenship,
          visiting_purpose: data.visiting_purpose || data.purpose || prev.visiting_purpose,
          
          // Charges
          room_charges: data.room_charges || data.rent || data.rate || prev.room_charges,
          total_charges: data.total_charges || data.gross_amount || data.total_amt || prev.total_charges,
          total_tax: data.total_tax || data.tax_amount || data.tax || prev.total_tax,
          total_gross: data.total_gross || data.total_gross_amt || data.gross || prev.total_gross,
          no_of_nights: data.no_of_nights || data.nights || data.duration || prev.no_of_nights,
          check_in_id: data.check_in_id || (data.id && data.status && data.status.toUpperCase().includes('E') ? data.id : null)
        }));
      }
    } catch (err) { 
        console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value.toUpperCase() }));
  };

  const handlePhotoUpload = (key) => fileInputRefs[key].current.click();
  const onFileChange = (key, e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotos(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  };

  const handleUpdate = async () => {
    try {
      const targetId = checkinId || id || formData.id;
      if (!targetId) {
        toast.error("ID is required for update");
        return;
      }
      
      const payload = {
        ...formData,
        room_id: formData.room_id || formData.room_master_id || formData.id,
        no_of_nights: parseInt(formData.no_of_nights) || 1,
        no_of_guests: parseInt(formData.no_of_guests) || 1,
        child: parseInt(formData.child) || 0,
        status: "Checked-In" // Ensuring consistency with CheckinForm.js
      };

      await api.put(`api/check-ins/${targetId}`, payload);
      toast.success("Check-In Updated Successfully!");

      if (onClose) {
        onClose();
        if (window.location.pathname.includes("room-master")) window.location.reload();
      } else {
        navigate("/room-master");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update check-in");
    }
  };

  const renderField = (name, label, type = "text", options = [], isSelect = false) => {
    const isMultiline = name === 'remark' || name === 'address';
    let fieldNode;

    const value = (formData[name] !== undefined && formData[name] !== null) ? formData[name] : "";

    const fieldSx = {
      ...darkField,
      ...(isMultiline ? { '& .MuiOutlinedInput-root': { height: 'auto', py: 0.5 } } : {})
    };

    if (isSelect) {
      fieldNode = (
        <Select fullWidth size="small" name={name} value={value} onChange={handleInputChange} sx={fieldSx}>
          <MenuItem value=""><em>-- Select --</em></MenuItem>
          {options.map((o, idx) => <MenuItem key={idx} value={o.toUpperCase()}>{o.toUpperCase()}</MenuItem>)}
        </Select>
      );
    } else {
      fieldNode = (
        <TextField fullWidth size="small" name={name} value={value} onChange={handleInputChange} multiline={isMultiline} rows={isMultiline ? 3 : 1} type={type} sx={fieldSx} />
      );
    }

    return (
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={getDarkLabel()}>{label}</Typography>
        {fieldNode}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'flex-start', p: onClose ? 0 : 2, width: '100%', bgcolor: '#0a1128' }}>
      
      {/* LEFT COMPONENT - FORM */}
      <Box sx={{ flex: 1, minWidth: 0, bgcolor: "#0e1729", color: '#e0e6f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.7)', border: '1px solid #253050' }}>
        <Box sx={{ background: 'linear-gradient(135deg, #1a2a4a 0%, #0e1729 100%)', px: 3, py: 2, borderBottom: '1px solid #253050', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#e0e6f0', letterSpacing: '1px', textTransform: 'uppercase' }}>📋 Check In Update</Typography>
          {onClose && <Box onClick={onClose} sx={{ cursor: 'pointer', color: '#8899bb', fontSize: '20px', lineHeight: 1, '&:hover': { color: '#ff5555' } }}>✕</Box>}
        </Box>

        <Box sx={{ p: { xs: 1.5, md: 2 } }}>
          <Grid container spacing={1.5}>
            <Grid item xs={4}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={getDarkLabel()}>Check In & Check Out Date</Typography>
                  <Box sx={{ '& .react-datepicker-wrapper': { width: '100%' } }}>
                    <DatePicker 
                      selected={formData.check_in_date ? new Date(formData.check_in_date) : null}
                      onChange={(d) => setFormData(p => ({ ...p, check_in_date: dayjs(d).format("YYYY-MM-DD") }))}
                      customInput={<CustomDateInput value={dayjs(formData.check_in_date).format("DD/MM/YYYY")} />}
                    />
                  </Box>
                </Box>
                <Box sx={{ width: '60px' }}>
                  <Typography sx={getDarkLabel()}>Night</Typography>
                  <TextField fullWidth size="small" value={formData.no_of_nights} disabled sx={darkField} />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={getDarkLabel()}>Check In Time</Typography>
                  <Select fullWidth size="small" name="check_in_time" value={formData.check_in_time} onChange={handleInputChange} sx={darkField}>
                    <MenuItem value="12:00 PM">12:00 PM</MenuItem><MenuItem value="02:00 PM">02:00 PM</MenuItem>
                  </Select>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={getDarkLabel()}>Check Out Time</Typography>
                  <Select fullWidth size="small" name="check_out_time" value={formData.check_out_time} onChange={handleInputChange} sx={darkField}>
                    <MenuItem value="11:00 AM">11:00 AM</MenuItem><MenuItem value="10:00 AM">10:00 AM</MenuItem>
                  </Select>
                </Box>
              </Box>

              {renderField('room_number', 'Room No')}
              {renderField('booking_guest_name', 'Booking Guest Name')}
              {renderField('booking_phone_no', 'Booking Guest Phone No')}
              {renderField('check_in_guest_name', 'Check In Guest Name')}
              {renderField('guest_phone_no', 'Check In Guest Phone No')}
              {renderField('id_proof_no', 'ID Proof No')}
              {renderField('id_proof_type', 'ID Proof Type', 'text', ['AADHAR', 'PAN', 'PASSPORT'], true)}
              {renderField('state', 'State Name', 'text', stateList, true)}
              {renderField('district_name', 'City Name', 'text', districtList, true)}
              {renderField('address', 'Address')}
            </Grid>

            <Grid item xs={4}>
               {renderField('visiting_purpose', 'Visiting Purpose', 'text', visitingPurposes, true)}
               {renderField('company_name', 'Company Name', 'text', ['WALKIN', 'WALKINS', 'DIRECT'], true)}
               {renderField('booking_type', 'Booking Type', 'text', ['SINGLE', 'DOUBLE', 'MULTIPLEDAYS'], true)}
               {renderField('room_type', 'Room Type', 'text', ['NON AC', 'AC DELUXE', 'CLASSIC AC'], true)}
               {renderField('ep_cp_plan', 'Food Plan', 'text', ['EP', 'CP'], true)}
               {renderField('booking_id', 'Booking ID No')}
               
               <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                 <Box sx={{ flex: 1 }}>{renderField('no_of_guests', 'No of Persons')}</Box>
                 <Box sx={{ flex: 1 }}>{renderField('child', 'Child')}</Box>
               </Box>

               {renderField('citizenship', 'Citizenship', 'text', citizenshipList, true)}
               {renderField('country_name', 'Country Name', 'text', countryList, true)}
            </Grid>

            <Grid item xs={4}>
               {renderField('cust_gst_company', 'Guest GST Company Name')}
               {renderField('customer_gst_no', 'Guest GST Company No')}
               {renderField('credit_company', 'Credit Company & Guest Name', 'text', ['NA', 'MMT', 'GOIBIBO', 'WALKIN', 'DIRECT'], true)}
               <Box sx={{ display: 'flex', gap: 1 }}>
                 <Box sx={{ flex: 1 }}>{renderField('reference', 'Reference')}</Box>
                 <Box sx={{ flex: 1 }}>{renderField('remark', 'Remark')}</Box>
               </Box>

               <Box sx={{ mb: 2 }}>
                 <Typography sx={getDarkLabel()}>Photos G1</Typography>
                 <Grid container spacing={1}>
                   {[1, 2].map(num => (
                     <Grid item xs={6} key={num}>
                       <Box sx={{ width: '100%', height: '70px', bgcolor: '#1a2035', borderRadius: '4px', border: '1px dashed #3a4a6b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {photos[`photo${num}`] ? <img src={photos[`photo${num}`]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Typography sx={{ color: '#3a4a6b', fontSize: '10px' }}>{num}</Typography>}
                       </Box>
                       <input type="file" hidden ref={fileInputRefs[`photo${num}`]} onChange={(e) => onFileChange(`photo${num}`, e)} />
                       <Typography onClick={() => handlePhotoUpload(`photo${num}`)} sx={{ fontSize: '8px', textAlign: 'center', color: '#4B90FC', cursor: 'pointer', mt: 0.2 }}>Upload</Typography>
                     </Grid>
                   ))}
                 </Grid>
               </Box>

               <Box sx={{ border: '1px solid #1a2639', p: 1, borderRadius: '4px', bgcolor: 'rgba(26, 32, 53, 0.5)', mb: 2 }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={7}><Typography sx={getDarkLabel()}>Room Charges</Typography><TextField fullWidth size="small" name="room_charges" value={formData.room_charges} onChange={handleInputChange} sx={darkField}/></Grid>
                    <Grid item xs={5}><Typography sx={getDarkLabel()}>Night</Typography><TextField fullWidth size="small" value={formData.no_of_nights} disabled sx={darkField}/></Grid>
                    <Grid item xs={12}><Typography sx={getDarkLabel()}>Total Charges</Typography><TextField fullWidth size="small" name="total_charges" value={formData.total_charges} onChange={handleInputChange} sx={darkField}/></Grid>
                    <Grid item xs={6}><Typography sx={getDarkLabel()}>Total Tax</Typography><TextField fullWidth size="small" value={formData.total_tax} disabled sx={darkField}/></Grid>
                    <Grid item xs={6}><Typography sx={getDarkLabel()}>Total Gross</Typography><TextField fullWidth size="small" value={formData.total_gross} disabled sx={darkField}/></Grid>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 1 }}>
                      <Button size="small" sx={{ bgcolor: '#4B90FC', color: '#fff', fontSize: '10px', height: '24px', px: 3, '&:hover': { bgcolor: '#3a7ae0' } }}>CALC</Button>
                    </Box>
                  </Grid>
               </Box>

               <Box sx={{ display: 'flex', gap: 2, mt: 1, justifyContent: 'center' }}>
                 <Button onClick={handleUpdate} sx={{ background: 'linear-gradient(to bottom, #28a745, #145523)', color: '#fff', fontWeight: 'bold', height: '28px', fontSize: '11px', width: '100px' }}>UPDATE</Button>
                 <Button onClick={() => onClose ? onClose() : navigate("/room-master")} sx={{ background: 'linear-gradient(to bottom, #d32f2f, #9a0007)', color: '#fff', fontWeight: 'bold', height: '28px', fontSize: '11px', width: '100px' }}>CLOSE</Button>
               </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

    </Box>
  );
}
