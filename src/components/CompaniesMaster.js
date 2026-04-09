import { useState, useEffect } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  TextField, Checkbox, FormControlLabel, Grid,
  Select, MenuItem, RadioGroup, Radio
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

// Premium Theme: Black & White
const mainBg = "#f8f9fa";
const paperBg = "#ffffff";
const borderColor = "#ddd";
const labelBg = "#f8f9fa";
const primaryBlue = "#1976d2";
const lightBlue = "#e3f2fd";

const GridRow = ({ label, children, noBorderBottom }) => (
  <Box sx={{
    display: 'flex',
    borderBottom: noBorderBottom ? 'none' : `1px solid ${borderColor}`,
    minHeight: 48,
    bgcolor: 'transparent'
  }}>
    <Box sx={{
      width: '30%', minWidth: '220px', p: 1.5, color: "#444", textAlign: 'right', fontSize: '13px', fontWeight: '800',
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end', bgcolor: labelBg,
      borderRight: `1px solid ${borderColor}`, textTransform: 'uppercase'
    }}>
      {label}
    </Box>
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', px: 3, py: 1 }}>
      {children}
    </Box>
  </Box>
);

const BlueTabBtn = ({ label, active }) => (
  <Box tabIndex={-1} sx={{
    bgcolor: active ? primaryBlue : lightBlue,
    color: active ? '#fff' : primaryBlue,
    px: 2, py: 1, borderRadius: 1, fontWeight: 'bold', fontSize: '11px', border: `1px solid ${active ? primaryBlue : '#bbdefb'}`,
    outline: 'none',
    userSelect: 'none'
  }}>
    {label}
  </Box>
);

export default function CompaniesMaster() {
  const [companies, setCompanies] = useState([]);
  const [editId, setEditId] = useState(null);

  const [options, setOptions] = useState({
    roomTypes: [], bookingTypes: [], referenceOptions: [], remarkOptions: [],
    foodPlans: [], paymentModes: [], companiesList: [], paymentStatuses: [],
    invoiceGenerateOptions: [], personCounts: [], grossAmountOptions: [],
    bookingIdCodes: [], guestNameOptions: [], guestPhoneOptions: [], bookingIdMethods: []
  });

  const [personChecks, setPersonChecks] = useState([true, true, true, true]);

  const [formData, setFormData] = useState({
    company_name: "", booking_type: "", room_type: "", payment_mode: "", payment_status: "", food_plan: "",
    res_reference_method: "", upd_reference_method: "", res_remark_method: "", upd_remark_method: "",
    res_guest_name_method: "", upd_guest_name_method: "",
    res_phone_no_method: "", upd_phone_no_method: "",
    res_booking_id_method: "", upd_booking_id_method: "",
    res_gross_amount_method: "", upd_gross_amount_method: "",
    ota_name: "", booking_id_code: "",
    id_start_no: "1", id_padding: "4", id_suffix: "",
    checkout_blinking_time: "00:30"
  });

  useEffect(() => {
    fetchCompanies();
    fetchAllMasterOptions();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get("api/company-masters");
      if (res && res.data) setCompanies(res.data.data || res.data || []);
    } catch (error) { }
  };

  const fetchAllMasterOptions = async () => {
    const safeFetch = async (url) => {
      try {
        const res = await api.get(url);
        const rawBody = res?.data;
        if (Array.isArray(rawBody)) return rawBody;
        if (rawBody && Array.isArray(rawBody.data)) return rawBody.data;
        if (rawBody && Array.isArray(rawBody.records)) return rawBody.records;
        if (rawBody && Array.isArray(rawBody.options)) return rawBody.options;
        if (rawBody && Array.isArray(rawBody.items)) return rawBody.items;
        return [];
      } catch (e) {
        return [];
      }
    };
    const routes = [
      "api/room-types", "api/booking-types", "api/reference-options", "api/remark-options",
      "api/food-plans", "api/payment-modes", "api/companies", "api/payment-statuses",
      "api/invoice-generates", "api/person-counts", "api/total-gross-options",
      "api/booking-id-codes", "api/booking-guest-name-options", "api/booking-guest-phone-options",
      "api/booking-id-options", "api/ota-commission-structures"
    ];
    const data = await Promise.all(routes.map(r => safeFetch(r)));
    console.log("Master Data Fetched:", data);
    setOptions({
      roomTypes: data[0], bookingTypes: data[1], referenceOptions: data[2], remarkOptions: data[3],
      foodPlans: data[4], paymentModes: data[5], companiesList: data[6], paymentStatuses: data[7],
      invoiceGenerateOptions: data[8], personCounts: data[9], grossAmountOptions: data[10],
      bookingIdCodes: data[11], guestNameOptions: data[12], guestPhoneOptions: data[13],
      bookingIdMethods: data[14], otaCommissions: data[15]
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxToggle = (field, itemValue) => {
    setFormData(prev => {
      let currentVal = prev[field] || "";
      // Split by comma and trim to handle various spacing formats
      let parts = currentVal.split(",").map(s => s.trim()).filter(Boolean);
      
      const val = itemValue.toUpperCase();
      const isMethodField = field.toLowerCase().includes("_method");

      if (isMethodField) {
        const isHide = val === "HIDE";
        const isPrimary = ["COPY PASTE", "TEXT", "BOTH"].includes(val);
        const isRuleSet = !isHide && !isPrimary;

        if (isHide) {
          // HIDE is exclusive with everything
          return { ...prev, [field]: "HIDE" };
        }

        // Always remove HIDE if choosing anything else
        parts = parts.filter(p => p.toUpperCase() !== "HIDE");

        // If choosing a Primary (Blue) method, uncheck other Primaries
        if (isPrimary) {
          parts = parts.filter(p => !["COPY PASTE", "TEXT", "BOTH"].includes(p.toUpperCase()));
        }

        // If choosing a Rule Set (Green) method, uncheck other Rule Set items
        if (isRuleSet) {
          parts = parts.filter(p => ["COPY PASTE", "TEXT", "BOTH"].includes(p.toUpperCase()));
        }
      }

      // Toggle the item
      if (parts.some(p => p.toUpperCase() === val)) {
        parts = parts.filter(p => p.toUpperCase() !== val);
      } else {
        parts.push(itemValue);
      }
      
      return { ...prev, [field]: parts.join(", ") };
    });
  };

  const isChecked = (field, itemValue) => {
    const val = formData[field] || "";
    // Match exactly by trimming whitespace to be robust for database entries
    return val.split(",").map(s => s.trim().toUpperCase()).includes(String(itemValue).toUpperCase());
  };

  const handleEdit = (comp) => {
    setEditId(comp.id);
    const splitVal = (val, idx) => {
      if (!val) return "";
      const sVal = String(val);
      let part = "";
      if (sVal.includes("|")) {
        const sections = sVal.split("|");
        part = (sections[idx] || "").trim().toUpperCase();
      } else {
        // Legacy handling: use whole string
        part = sVal.trim().toUpperCase();
      }
      // Deduplicate items within each section (e.g. "COPY PASTE, ALPHABIT, ALPHABIT" -> "COPY PASTE, ALPHABIT")
      const uniqueItems = Array.from(new Set(part.split(",").map(s => s.trim()))).filter(Boolean);
      return uniqueItems.join(", ");
    };
    
    setFormData({
      ...comp,
      company_name: comp.company_name || "",
      booking_type: comp.booking_types || comp.booking_type || "",
      room_type: comp.room_types || comp.room_type || "",
      payment_mode: comp.payment_modes || comp.payment_mode || "",
      payment_status: comp.payment_statuses || comp.payment_status || comp.payment_type || "",
      food_plan: comp.breakfast_plans || comp.food_plan || "",
      ota_name: comp.ota_name || "",
      booking_id_code: comp.booking_id_code || "",
      res_reference_method: splitVal(comp.reference, 0),
      upd_reference_method: splitVal(comp.reference, 1),
      res_remark_method: splitVal(comp.remark, 0),
      upd_remark_method: splitVal(comp.remark, 1),
      res_guest_name_method: splitVal(comp.guest_name, 0),
      upd_guest_name_method: splitVal(comp.guest_name, 1),
      res_phone_no_method: splitVal(comp.phone_no, 0),
      upd_phone_no_method: splitVal(comp.phone_no, 1),
      res_booking_id_method: splitVal(comp.booking_id_method, 0),
      upd_booking_id_method: splitVal(comp.booking_id_method, 1),
      res_gross_amount_method: splitVal(comp.gross_amount, 0),
      upd_gross_amount_method: splitVal(comp.gross_amount, 1),
      id_start_no: comp.id_start_no || "1",
      id_padding: comp.id_padding || "4",
      id_suffix: comp.id_suffix || "",
      checkout_blinking_time: comp.checkout_blinking_time || "00:30"
    });
    // Robust parsing for allowed person counts (inferred from field or rates)
    const countsRaw = comp.allowed_person_counts || comp.person_counts || "";
    let countsArr = String(countsRaw).split(",").map(s => parseInt(s.trim())).filter(n => (n >= 1 && n <= 4));
    
    // Fallback: If no explicit counts field, infer from rates (Greater than 0 means allowed)
    if (countsArr.length === 0) {
      if (Number(comp.single_person_rate) > 0) countsArr.push(1);
      if (Number(comp.double_person_rate) > 0) countsArr.push(2);
      if (Number(comp.triple_person_rate) > 0) countsArr.push(3);
      if (Number(comp.quad_person_rate) > 0) countsArr.push(4);
    }
    
    // Default to ALL TRUE if absolutely nothing found
    const newChecks = countsArr.length === 0 ? [true, true, true, true] : [false, false, false, false];
    if (countsArr.length > 0) {
      countsArr.forEach(c => { newChecks[c-1] = true; });
    }
    setPersonChecks(newChecks);
    
    // Pre-populate Dynamic Commission Fields for Editing
    if (options.otaCommissions) {
      const extraData = {};
      options.otaCommissions.forEach(comm => {
        const label = comm.name || "";
        const key = String(label).toLowerCase().replace(/ /g, '_');
        if (key.includes('commission_gst') || key === 'commission_gst') extraData[key] = comp.gst_on_commission_percentage || "";
        else if (key.includes('commission')) extraData[key] = comp.commission_percentage || "";
        else if (key.includes('tds')) extraData[key] = comp.tds_percentage || "";
        else if (key.includes('tcs')) extraData[key] = comp.tcs_percentage || "";
        else if (key.includes('gst')) extraData[key] = comp.gst_percentage || "";
      });
      setFormData(prev => ({ ...prev, ...extraData }));
    }
  };

  const handleReset = () => {
    setEditId(null);
    setFormData({
      company_name: "", booking_type: "", room_type: "", payment_mode: "", payment_status: "", food_plan: "",
      res_reference_method: "", upd_reference_method: "", res_remark_method: "", upd_remark_method: "",
      res_guest_name_method: "", upd_guest_name_method: "",
      res_phone_no_method: "", upd_phone_no_method: "",
      res_booking_id_method: "", upd_booking_id_method: "",
      res_gross_amount_method: "", upd_gross_amount_method: "",
      single_person_rate: "", double_person_rate: "", triple_person_rate: "", quad_person_rate: "",
      check_in_time: "", check_out_time: "", time_set: "", early_check_in_amount: "", ota_name: "", booking_id_code: "",
      id_start_no: "1", id_padding: "4", id_suffix: "",
      checkout_blinking_time: "00:30"
    });
    setPersonChecks([true, true, true, true]);
  };

  const handleSubmit = async () => {
    if (!formData.company_name) return toast.error("Select Company");
    // Optimize storage: only save both if different, otherwise save once to save space
    const joinM = (res, upd) => {
      if (!res && !upd) return "";
      if (!upd || res === upd) return res;
      if (!res) return upd;
      return `${res} | ${upd}`;
    };
    const payload = {
      ...formData,
      booking_types: formData.booking_type, room_types: formData.room_type,
      payment_modes: formData.payment_mode, payment_statuses: formData.payment_status, breakfast_plans: formData.food_plan,
      reference: joinM(formData.res_reference_method, formData.res_reference_method), 
      remark: joinM(formData.res_remark_method, formData.res_remark_method),
      guest_name: joinM(formData.res_guest_name_method, formData.res_guest_name_method),
      phone_no: joinM(formData.res_phone_no_method, formData.res_phone_no_method),
      booking_id_method: joinM(formData.res_booking_id_method, formData.res_booking_id_method),
      gross_amount: joinM(formData.res_gross_amount_method, formData.res_gross_amount_method),
      payment_type: formData.payment_status || "PAID",
      payment_mode: formData.payment_mode || "UPI",
      
      // Numeric Conversion for Rates and Commission Fields
      single_person_rate: Number(formData['single_person_rate'] || 0),
      double_person_rate: Number(formData['double_person_rate'] || 0),
      triple_person_rate: Number(formData['triple_person_rate'] || 0),
      quad_person_rate: Number(formData['quad_person_rate'] || 0),
      commission_percentage: Number(formData['commission'] || formData['commission_percentage'] || 0),
      gst_on_commission_percentage: Number(formData['commission_gst'] || formData['gst_on_commission_percentage'] || 0),
      tds_percentage: Number(formData['tds'] || formData['tds_percentage'] || 0),
      tcs_percentage: Number(formData['tcs'] || formData['tcs_percentage'] || 0),
      gst_percentage: Number(formData['gst'] || formData['gst_percentage'] || 0),
      id_start_no: Number(formData.id_start_no || 1),
      id_padding: Number(formData.id_padding || 4),
      id_suffix: formData.id_suffix || ""
    };
    try {
      if (editId) await api.put(`api/company-masters/${editId}`, payload);
      else await api.post("api/company-masters", payload);
      toast.success("Saved Successfully"); handleReset(); fetchCompanies();
    } catch (e) { toast.error("Submission Failed"); }
  };

  const deleteConfig = async (id) => {
    if (!window.confirm("Delete this config?")) return;
    try { await api.delete(`api/company-masters/${id}`); toast.success("Deleted"); fetchCompanies(); } catch (e) { }
  };

  const getLabel = (o) => o.company_name || o.option_name || o.name || o.type_name || o.plan_name || o.mode_name || o.status_name || o.method_name || o.code || o.status || o.mode || o.label || o.title || "";

  const renderRadioMaster = (label, field, masterArr) => (
    <GridRow label={label}>
      <RadioGroup row value={formData[field]} onChange={e => handleInputChange(field, e.target.value)}>
        {(masterArr || []).map(o => {
          const lab = getLabel(o);
          const val = String(lab).toUpperCase();
          return <FormControlLabel key={o.id || val} value={val} control={<Radio size="small" />} label={<Typography fontSize="11px">{lab}</Typography>} />;
        })}
      </RadioGroup>
    </GridRow>
  );

  return (
    <Box sx={{ bgcolor: mainBg, minHeight: "100vh", p: 3, color: "#333" }}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={9}>
          <Paper elevation={0} sx={{ border: `1px solid ${borderColor}`, borderRadius: 2, overflow: 'hidden', bgcolor: paperBg }}>

            <GridRow label="Company Name">
              <Select size="small" fullWidth value={formData.company_name} onChange={e => handleInputChange('company_name', e.target.value)} displayEmpty sx={{ bgcolor: '#fff' }}>
                <MenuItem value=""><em>-- SELECT FROM MASTER --</em></MenuItem>
                {options.companiesList.map(c => {
                  const val = getLabel(c);
                  return <MenuItem key={c.id || val} value={val}>{val}</MenuItem>;
                })}
              </Select>
            </GridRow>

            <GridRow label="Booking Type">
              <Select size="small" fullWidth value={formData.booking_type} onChange={e => handleInputChange('booking_type', e.target.value)} displayEmpty sx={{ bgcolor: '#fff' }}>
                <MenuItem value=""><em>-- SELECT FROM MASTER --</em></MenuItem>
                {options.bookingTypes.map(c => {
                  const val = getLabel(c);
                  return <MenuItem key={c.id || val} value={val}>{val}</MenuItem>;
                })}
              </Select>
            </GridRow>

            <GridRow label="Room Type">
              <Select size="small" fullWidth value={formData.room_type} onChange={e => handleInputChange('room_type', e.target.value)} displayEmpty sx={{ bgcolor: '#fff' }}>
                <MenuItem value=""><em>-- SELECT FROM MASTER --</em></MenuItem>
                {options.roomTypes.map(c => {
                  const val = getLabel(c);
                  return <MenuItem key={c.id || val} value={val}>{val}</MenuItem>;
                })}
              </Select>
            </GridRow>

            <GridRow label="Food Plan">
              <Select size="small" fullWidth value={formData.food_plan} onChange={e => handleInputChange('food_plan', e.target.value)} displayEmpty sx={{ bgcolor: '#fff' }}>
                <MenuItem value=""><em>-- SELECT FROM MASTER --</em></MenuItem>
                {options.foodPlans.map(o => {
                  const val = getLabel(o);
                  return <MenuItem key={o.id || val} value={val}>{val}</MenuItem>;
                })}
              </Select>
            </GridRow>

            <GridRow label="Payment Mode Master">
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {options.paymentModes.map(o => {
                  const val = getLabel(o);
                  return (
                    <FormControlLabel key={o.id || val} control={<Checkbox size="small" checked={isChecked('payment_mode', val)} onChange={() => handleCheckboxToggle('payment_mode', val)} />} label={<Typography fontSize="10px">{val}</Typography>} />
                  );
                })}
              </Box>
            </GridRow>

            <GridRow label="Payment Status Master">
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {options.paymentStatuses.map(o => {
                  const val = getLabel(o);
                  return (
                    <FormControlLabel key={o.id || val} control={<Checkbox size="small" checked={isChecked('payment_status', val)} onChange={() => handleCheckboxToggle('payment_status', val)} />} label={<Typography fontSize="10px">{val}</Typography>} />
                  );
                })}
              </Box>
            </GridRow>

            <GridRow label="No of Persons & Tariff">
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[1, 2, 3, 4].map((n, i) => (
                    <Box key={n} sx={{ textAlign: 'center', border: `1px solid ${borderColor}`, p: 0.5, borderRadius: 1 }}>
                      <Typography fontSize="10px"><b>{n}</b></Typography>
                      <Checkbox size="small" checked={personChecks[i]} onChange={e => { const nP = [...personChecks]; nP[i] = e.target.checked; setPersonChecks(nP); }} sx={{ p: 0 }} />
                    </Box>
                  ))}
                </Box>
                <Grid container spacing={1} sx={{ flex: 1 }}>
                  {['Single', 'Double', 'Triple', 'Quad'].map((r, i) => {
                    const isAllowed = personChecks[i];
                    return (
                      <Grid item xs={6} md={3} key={r}>
                        <TextField 
                          size="small" 
                          label={isAllowed ? r : `${r} (N/A)`} 
                          value={isAllowed ? (formData[`${r.toLowerCase()}_person_rate`] || "") : ""} 
                          onChange={e => handleInputChange(`${r.toLowerCase()}_person_rate`, e.target.value)} 
                          disabled={!isAllowed}
                          fullWidth 
                          sx={{ 
                            bgcolor: isAllowed ? '#fff' : 'rgba(0,0,0,0.05)',
                            '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#999' }
                          }}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </GridRow>


            {/* Custom Guest Name Method Layout: 3-1 structure for consistency */}
            {/* Guest Name Method: Dynamic Card Layout */}
            <GridRow label="Guest Name Method">
              <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'stretch' }}>
                {/* 1. Primary Set (Blue): COPY PASTE, TEXT, BOTH */}
                {(() => {
                  const group = (options.guestNameOptions || []).filter(o => ["COPY PASTE", "TEXT", "BOTH"].includes(getLabel(o).toUpperCase()));
                  if (group.length === 0) return null;
                  const isActive = group.some(o => isChecked("res_guest_name_method", getLabel(o).toUpperCase()));
                  return (
                    <Box sx={{ display: 'flex', flex: 3.5, borderRadius: 1.5, overflow: 'hidden', border: `2px solid ${isActive ? primaryBlue : borderColor}`, bgcolor: isActive ? primaryBlue : '#fff' }}>
                      {group.map((o, idx) => {
                        const val = getLabel(o).toUpperCase();
                        const active = isChecked("res_guest_name_method", val);
                        return (
                          <Box key={val} onClick={() => handleCheckboxToggle("res_guest_name_method", val)} sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', borderRight: idx < group.length - 1 ? `1px solid ${active || isChecked("res_guest_name_method", getLabel(group[idx+1]).toUpperCase()) ? 'rgba(255,255,255,0.3)' : borderColor}` : 'none', color: active ? '#fff' : '#444', '&:hover': { bgcolor: active ? 'rgba(255,255,255,0.1)' : 'rgba(25, 118, 210, 0.04)' } }}>
                            <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>{getLabel(o)}</Typography>
                            <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })()}

                {/* 2. Rule Set (Green section): Now fully dynamic - shows anything not in Primary or Hide sets */}
                {(() => {
                  const group = (options.guestNameOptions || []).filter(o => !["COPY PASTE", "TEXT", "BOTH", "HIDE"].includes(getLabel(o).toUpperCase()));
                  if (group.length === 0) return null;
                  const isActive = group.some(o => isChecked("res_guest_name_method", getLabel(o).toUpperCase()));
                  return (
                    <Box sx={{ display: 'flex', flex: 2, borderRadius: 1.5, overflow: 'hidden', border: `2px solid ${isActive ? '#2e7d32' : borderColor}`, bgcolor: isActive ? '#e8f5e9' : '#fff' }}>
                      {group.map((o, idx) => {
                        const val = getLabel(o).toUpperCase();
                        const active = isChecked("res_guest_name_method", val);
                        return (
                          <Box key={val} onClick={() => handleCheckboxToggle("res_guest_name_method", val)} sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', borderRight: idx < group.length - 1 ? `1px solid ${isActive ? '#2e7d32' : borderColor}` : 'none', bgcolor: active ? '#2e7d32' : 'transparent', color: active ? '#fff' : '#444', '&:hover': { bgcolor: active ? '#2e7d32' : 'rgba(46, 125, 50, 0.04)' } }}>
                            <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>{getLabel(o)}</Typography>
                            <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })()}

                {/* 3. Single Part (Grey): HIDE */}
                {(() => {
                  const o = (options.guestNameOptions || []).find(o => getLabel(o).toUpperCase() === "HIDE");
                  if (!o) return null;
                  const val = getLabel(o).toUpperCase();
                  const active = isChecked("res_guest_name_method", val);
                  return (
                    <Box onClick={() => handleCheckboxToggle("res_guest_name_method", val)} sx={{ flex: 0.8, minWidth: 80, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', borderRadius: 1.5, border: `2px solid ${active ? '#616161' : borderColor}`, bgcolor: active ? '#616161' : '#fff', color: active ? '#fff' : '#444', '&:hover': { border: `2px solid #616161`, bgcolor: active ? '#616161' : 'rgba(0,0,0,0.04)' } }}>
                      <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Hide</Typography>
                      <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                    </Box>
                  );
                })()}
              </Box>
            </GridRow>
            {/* Guest Phone Method: Dynamic Card Layout */}
            <GridRow label="Guest Phone Method">
              <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'stretch' }}>
                {/* 1. Primary Set (Blue): COPY PASTE, TEXT, BOTH */}
                {(() => {
                  const group = (options.guestPhoneOptions || []).filter(o => ["COPY PASTE", "TEXT", "BOTH"].includes(getLabel(o).toUpperCase()));
                  if (group.length === 0) return null;
                  const isActive = group.some(o => isChecked("res_phone_no_method", getLabel(o).toUpperCase()));
                  return (
                    <Box sx={{ display: 'flex', flex: 3.5, borderRadius: 1.5, overflow: 'hidden', border: `2px solid ${isActive ? primaryBlue : borderColor}`, bgcolor: isActive ? primaryBlue : '#fff' }}>
                      {group.map((o, idx) => {
                        const val = getLabel(o).toUpperCase();
                        const active = isChecked("res_phone_no_method", val);
                        return (
                          <Box key={val} onClick={() => handleCheckboxToggle("res_phone_no_method", val)} sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', borderRight: idx < group.length - 1 ? `1px solid ${active || isChecked("res_phone_no_method", getLabel(group[idx+1]).toUpperCase()) ? 'rgba(255,255,255,0.3)' : borderColor}` : 'none', color: active ? '#fff' : '#444', '&:hover': { bgcolor: active ? 'rgba(255,255,255,0.1)' : 'rgba(25, 118, 210, 0.04)' } }}>
                            <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>{getLabel(o)}</Typography>
                            <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })()}

                {/* 2. Rule Set (Green section): Dynamic */}
                {(() => {
                  const group = (options.guestPhoneOptions || []).filter(o => !["COPY PASTE", "TEXT", "BOTH", "HIDE"].includes(getLabel(o).toUpperCase()));
                  if (group.length === 0) return null;
                  const isActive = group.some(o => isChecked("res_phone_no_method", getLabel(o).toUpperCase()));
                  return (
                    <Box sx={{ display: 'flex', flex: 1, borderRadius: 1.5, overflow: 'hidden', border: `2px solid ${isActive ? '#2e7d32' : borderColor}`, bgcolor: isActive ? '#e8f5e9' : '#fff' }}>
                      {group.map((o, idx) => {
                        const val = getLabel(o).toUpperCase();
                        const active = isChecked("res_phone_no_method", val);
                        return (
                          <Box key={val} onClick={() => handleCheckboxToggle("res_phone_no_method", val)} sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', borderRight: idx < group.length - 1 ? `1px solid ${isActive ? '#2e7d32' : borderColor}` : 'none', bgcolor: active ? '#2e7d32' : 'transparent', color: active ? '#fff' : '#444', '&:hover': { bgcolor: active ? '#2e7d32' : 'rgba(46, 125, 50, 0.04)' } }}>
                            <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>{getLabel(o)}</Typography>
                            <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })()}

                {/* 3. Single Part (Grey): HIDE */}
                {(() => {
                  const o = (options.guestPhoneOptions || []).find(o => getLabel(o).toUpperCase() === "HIDE");
                  if (!o) return null;
                  const val = getLabel(o).toUpperCase();
                  const active = isChecked("res_phone_no_method", val);
                  return (
                    <Box onClick={() => handleCheckboxToggle("res_phone_no_method", val)} sx={{ flex: 0.8, minWidth: 80, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', borderRadius: 1.5, border: `2px solid ${active ? '#616161' : borderColor}`, bgcolor: active ? '#616161' : '#fff', color: active ? '#fff' : '#444', '&:hover': { border: `2px solid #616161`, bgcolor: active ? '#616161' : 'rgba(0,0,0,0.04)' } }}>
                      <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Hide</Typography>
                      <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                    </Box>
                  );
                })()}
              </Box>
            </GridRow>
            {/* Gross Amount Method: Dynamic 3-Part Layout */}
            <GridRow label="Gross Amount Method">
              <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'stretch' }}>
                {/* 1. Primary Set (Blue): Interaction methods */}
                {(() => {
                  const group = (options.grossAmountOptions || []).filter(o => ["COPY PASTE", "TEXT", "BOTH"].includes(getLabel(o).toUpperCase()));
                  if (group.length === 0) return null;
                  const isActive = group.some(o => isChecked("res_gross_amount_method", getLabel(o).toUpperCase()));
                  return (
                    <Box sx={{ display: 'flex', flex: 3.5, borderRadius: 1.5, overflow: 'hidden', border: `2px solid ${isActive ? primaryBlue : borderColor}`, bgcolor: isActive ? primaryBlue : '#fff' }}>
                      {group.map((o, idx) => {
                        const val = getLabel(o).toUpperCase();
                        const active = isChecked("res_gross_amount_method", val);
                        return (
                          <Box key={val} onClick={() => handleCheckboxToggle("res_gross_amount_method", val)} sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', borderRight: idx < group.length - 1 ? `1px solid ${active || isChecked("res_gross_amount_method", getLabel(group[idx+1]).toUpperCase()) ? 'rgba(255,255,255,0.3)' : borderColor}` : 'none', color: active ? '#fff' : '#444', '&:hover': { bgcolor: active ? 'rgba(255,255,255,0.1)' : 'rgba(25, 118, 210, 0.04)' } }}>
                            <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>{getLabel(o)}</Typography>
                            <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })()}

                {/* 2. Rule Set (Green): Dynamic constraints like NUMERIC */}
                {(() => {
                  const group = (options.grossAmountOptions || []).filter(o => !["COPY PASTE", "TEXT", "BOTH", "HIDE"].includes(getLabel(o).toUpperCase()));
                  if (group.length === 0) return null;
                  const isActive = group.some(o => isChecked("res_gross_amount_method", getLabel(o).toUpperCase()));
                  return (
                    <Box sx={{ display: 'flex', flex: 1, borderRadius: 1.5, overflow: 'hidden', border: `2px solid ${isActive ? '#2e7d32' : borderColor}`, bgcolor: isActive ? '#e8f5e9' : '#fff' }}>
                      {group.map((o, idx) => {
                        const val = getLabel(o).toUpperCase();
                        const active = isChecked("res_gross_amount_method", val);
                        return (
                          <Box key={val} onClick={() => handleCheckboxToggle("res_gross_amount_method", val)} sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', borderRight: idx < group.length - 1 ? `1px solid ${isActive ? '#2e7d32' : borderColor}` : 'none', bgcolor: active ? '#2e7d32' : 'transparent', color: active ? '#fff' : '#444', '&:hover': { bgcolor: active ? '#2e7d32' : 'rgba(46, 125, 50, 0.04)' } }}>
                            <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>{getLabel(o)}</Typography>
                            <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })()}

                {/* 3. Hide Set (Grey) */}
                {(() => {
                  const o = (options.grossAmountOptions || []).find(o => getLabel(o).toUpperCase() === "HIDE");
                  if (!o) return null;
                  const val = getLabel(o).toUpperCase();
                  const active = isChecked("res_gross_amount_method", val);
                  return (
                    <Box onClick={() => handleCheckboxToggle("res_gross_amount_method", val)} sx={{ flex: 0.8, minWidth: 80, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', borderRadius: 1.5, border: `2px solid ${active ? '#616161' : borderColor}`, bgcolor: active ? '#616161' : '#fff', color: active ? '#fff' : '#444', '&:hover': { border: `2px solid #616161`, bgcolor: active ? '#616161' : 'rgba(0,0,0,0.04)' } }}>
                      <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Hide</Typography>
                      <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                    </Box>
                  );
                })()}
              </Box>
            </GridRow>
            {/* Booking ID Method: Dynamic Card Layout */}
            <GridRow label="Booking ID Method">
              <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'stretch' }}>
                {/* 1. Primary Option (Blue): COPY PASTE */}
                {(() => {
                  const o = (options.bookingIdMethods || []).find(o => getLabel(o).toUpperCase() === "COPY PASTE");
                  if (!o) return null;
                  const val = getLabel(o).toUpperCase();
                  const active = isChecked("res_booking_id_method", val);
                  return (
                    <Box onClick={() => handleCheckboxToggle("res_booking_id_method", val)} sx={{ flex: 1, minWidth: 100, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', borderRadius: 1.5, border: `2px solid ${active ? primaryBlue : borderColor}`, bgcolor: active ? primaryBlue : '#fff', color: active ? '#fff' : '#444', boxShadow: active ? '0 4px 12px rgba(25, 118, 210, 0.2)' : 'none', '&:hover': { border: `2px solid ${primaryBlue}`, bgcolor: active ? primaryBlue : 'rgba(25, 118, 210, 0.04)' } }}>
                      <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Copy Paste</Typography>
                      <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                    </Box>
                  );
                })()}

                {/* 2. Rule Set (Green): Dynamic */}
                {(() => {
                  const group = (options.bookingIdMethods || []).filter(o => !["COPY PASTE", "HIDE"].includes(getLabel(o).toUpperCase()));
                  if (group.length === 0) return null;
                  const isActive = group.some(o => isChecked("res_booking_id_method", getLabel(o).toUpperCase()));
                  return (
                    <Box sx={{ display: 'flex', flex: 3.5, borderRadius: 1.5, overflow: 'hidden', border: `2px solid ${isActive ? '#2e7d32' : borderColor}`, bgcolor: isActive ? '#e8f5e9' : '#fff' }}>
                      {group.map((o, idx) => {
                        const val = getLabel(o).toUpperCase();
                        const active = isChecked("res_booking_id_method", val);
                        return (
                          <Box key={val} onClick={() => handleCheckboxToggle("res_booking_id_method", val)} sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', borderRight: idx < group.length - 1 ? `1px solid ${isActive ? '#2e7d32' : borderColor}` : 'none', bgcolor: active ? '#2e7d32' : 'transparent', color: active ? '#fff' : '#444', '&:hover': { bgcolor: active ? '#2e7d32' : 'rgba(46, 125, 50, 0.04)' } }}>
                            <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>{getLabel(o)}</Typography>
                            <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })()}

                {/* 3. Single Part (Grey): HIDE */}
                {(() => {
                  const o = (options.bookingIdMethods || []).find(o => getLabel(o).toUpperCase() === "HIDE");
                  if (!o) return null;
                  const val = getLabel(o).toUpperCase();
                  const active = isChecked("res_booking_id_method", val);
                  return (
                    <Box onClick={() => handleCheckboxToggle("res_booking_id_method", val)} sx={{ flex: 0.8, minWidth: 80, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', borderRadius: 1.5, border: `2px solid ${active ? '#616161' : borderColor}`, bgcolor: active ? '#616161' : '#fff', color: active ? '#fff' : '#444', '&:hover': { border: `2px solid #616161`, bgcolor: active ? '#616161' : 'rgba(0,0,0,0.04)' } }}>
                      <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Hide</Typography>
                      <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                    </Box>
                  );
                })()}
              </Box>
            </GridRow>

            {((formData.res_booking_id_method || "").split(", ").some(m => ['ALPHANUMERIC', 'NUMERIC', 'ALPHABET', 'ID AUTO GENERATE'].includes(m.toUpperCase()))) && (
              <GridRow label={isChecked("res_booking_id_method", "ID AUTO GENERATE") ? "Booking ID Details" : "Booking ID Code"}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: '200px' }}>
                    <Select size="small" fullWidth value={formData.booking_id_code} onChange={e => handleInputChange('booking_id_code', e.target.value)} displayEmpty sx={{ bgcolor: '#fff' }}>
                      <MenuItem value=""><em>-- SELECT {isChecked("res_booking_id_method", "ID AUTO GENERATE") ? "PREFIX CODE" : "FROM MASTER"} --</em></MenuItem>
                      {(options.bookingIdCodes || []).map(o => {
                        const lab = getLabel(o);
                        return <MenuItem key={o.id || lab} value={lab}>{lab}</MenuItem>;
                      })}
                    </Select>
                  </Box>

                  {isChecked("res_booking_id_method", "ID AUTO GENERATE") && (
                    <>
                      <Box sx={{ width: 100 }}>
                        <TextField size="small" label="Start No" type="number" value={formData.id_start_no} onChange={e => handleInputChange('id_start_no', e.target.value)} />
                      </Box>
                      <Box sx={{ width: 100 }}>
                        <TextField size="small" label="Padding" type="number" value={formData.id_padding} onChange={e => handleInputChange('id_padding', e.target.value)} />
                      </Box>
                      <Box sx={{ width: 120 }}>
                        <TextField size="small" label="Suffix" value={formData.id_suffix} onChange={e => handleInputChange('id_suffix', e.target.value)} />
                      </Box>
                      <Box sx={{ bgcolor: '#e3f2fd', p: 1, borderRadius: 1, border: '1px dashed #1976d2' }}>
                        <Typography fontSize="10px" color="primary" fontWeight="bold">PREVIEW:</Typography>
                        <Typography fontSize="11px" fontWeight="bold">
                          {formData.booking_id_code}{String(formData.id_start_no || "").padStart(Number(formData.id_padding || 0), '0')}{formData.id_suffix}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </GridRow>
            )}

            {/* Booking Timings & Early Check-In: Restored to correct position */}
            <GridRow label="Booking Timings">
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BlueTabBtn label="IN" active />
                  {(() => {
                    const [h, m] = (formData.check_in_time || "00:00").split(":");
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${borderColor}`, borderRadius: 1.5, px: 1, bgcolor: '#fff', height: 32 }}>
                        <Select size="small" variant="standard" value={h} onChange={e => handleInputChange('check_in_time', `${e.target.value}:${m}`)} sx={{ fontSize: '13px', fontWeight: 'bold', width: 28, textAlign: 'center' }} disableUnderline IconComponent={() => null}>
                          {Array.from({ length: 24 }).map((_, i) => <MenuItem key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</MenuItem>)}
                        </Select>
                        <Typography sx={{ mx: 0.5, fontWeight: 'bold', color: primaryBlue, mt: -0.2 }}>:</Typography>
                        <Select size="small" variant="standard" value={m} onChange={e => handleInputChange('check_in_time', `${h}:${e.target.value}`)} sx={{ fontSize: '13px', fontWeight: 'bold', width: 28, textAlign: 'center' }} disableUnderline IconComponent={() => null}>
                          {Array.from({ length: 60 }).map((_, i) => <MenuItem key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</MenuItem>)}
                        </Select>
                      </Box>
                    );
                  })()}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BlueTabBtn label="OUT" active />
                  {(() => {
                    const [h, m] = (formData.check_out_time || "00:00").split(":");
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${borderColor}`, borderRadius: 1.5, px: 1, bgcolor: '#fff', height: 32 }}>
                        <Select size="small" variant="standard" value={h} onChange={e => handleInputChange('check_out_time', `${e.target.value}:${m}`)} sx={{ fontSize: '13px', fontWeight: 'bold', width: 28, textAlign: 'center' }} disableUnderline IconComponent={() => null}>
                          {Array.from({ length: 24 }).map((_, i) => <MenuItem key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</MenuItem>)}
                        </Select>
                        <Typography sx={{ mx: 0.5, fontWeight: 'bold', color: primaryBlue, mt: -0.2 }}>:</Typography>
                        <Select size="small" variant="standard" value={m} onChange={e => handleInputChange('check_out_time', `${h}:${e.target.value}`)} sx={{ fontSize: '13px', fontWeight: 'bold', width: 28, textAlign: 'center' }} disableUnderline IconComponent={() => null}>
                          {Array.from({ length: 60 }).map((_, i) => <MenuItem key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</MenuItem>)}
                        </Select>
                      </Box>
                    );
                  })()}
                </Box>

                <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontSize="10px" fontWeight="bold">DURATION SET:</Typography>
                  {(() => {
                    const [h, m] = (formData.time_set || "00:00").split(":");
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${borderColor}`, borderRadius: 1.5, px: 1, bgcolor: '#fff', height: 32 }}>
                        <Select size="small" variant="standard" value={h} onChange={e => handleInputChange('time_set', `${e.target.value}:${m}`)} sx={{ fontSize: '13px', fontWeight: 'bold', width: 28, textAlign: 'center' }} disableUnderline IconComponent={() => null}>
                          {Array.from({ length: 24 }).map((_, i) => <MenuItem key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</MenuItem>)}
                        </Select>
                        <Typography sx={{ mx: 0.5, fontWeight: 'bold', color: primaryBlue, mt: -0.2 }}>:</Typography>
                        <Select size="small" variant="standard" value={m} onChange={e => handleInputChange('time_set', `${h}:${e.target.value}`)} sx={{ fontSize: '13px', fontWeight: 'bold', width: 28, textAlign: 'center' }} disableUnderline IconComponent={() => null}>
                          {Array.from({ length: 60 }).map((_, i) => <MenuItem key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</MenuItem>)}
                        </Select>
                      </Box>
                    );
                  })()}
                </Box>
              </Box>
            </GridRow>
            
            {/* Hide Checkout Blinking Time for 3 Hours Booking */}
            {!String(formData.booking_type || "").toUpperCase().includes("3 HOURS") && (
              <GridRow label="Checkout Blinking Time">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontSize="10px" fontWeight="bold">HRS BEFORE:</Typography>
                  {(() => {
                    const [h, m] = (formData.checkout_blinking_time || "00:00").split(":");
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${borderColor}`, borderRadius: 1.5, px: 1, bgcolor: '#fff', height: 32 }}>
                        <Select size="small" variant="standard" value={h} onChange={e => handleInputChange('checkout_blinking_time', `${e.target.value}:${m}`)} sx={{ fontSize: '13px', fontWeight: 'bold', width: 28, textAlign: 'center' }} disableUnderline IconComponent={() => null}>
                          {Array.from({ length: 24 }).map((_, i) => <MenuItem key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</MenuItem>)}
                        </Select>
                        <Typography sx={{ mx: 0.5, fontWeight: 'bold', color: primaryBlue, mt: -0.2 }}>:</Typography>
                        <Select size="small" variant="standard" value={m} onChange={e => handleInputChange('checkout_blinking_time', `${h}:${e.target.value}`)} sx={{ fontSize: '13px', fontWeight: 'bold', width: 28, textAlign: 'center' }} disableUnderline IconComponent={() => null}>
                          {Array.from({ length: 60 }).map((_, i) => <MenuItem key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</MenuItem>)}
                        </Select>
                      </Box>
                    );
                  })()}
                  <Typography fontSize="10px" color="gray">(Sets when the dashboard should start alerting before checkout)</Typography>
                </Box>
              </GridRow>
            )}

            <GridRow label="Early Check-In">
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography fontSize="11px">START:</Typography>
                {(() => {
                  const [h, m] = (formData.early_check_in_start_time || "00:00").split(":");
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${borderColor}`, borderRadius: 1.5, px: 1, bgcolor: '#fff', height: 32 }}>
                      <Select size="small" variant="standard" value={h} onChange={e => handleInputChange('early_check_in_start_time', `${e.target.value}:${m}`)} sx={{ fontSize: '13px', fontWeight: 'bold', width: 28, textAlign: 'center' }} disableUnderline IconComponent={() => null}>
                        {Array.from({ length: 24 }).map((_, i) => <MenuItem key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</MenuItem>)}
                      </Select>
                      <Typography sx={{ mx: 0.5, fontWeight: 'bold', color: primaryBlue, mt: -0.2 }}>:</Typography>
                      <Select size="small" variant="standard" value={m} onChange={e => handleInputChange('early_check_in_start_time', `${h}:${e.target.value}`)} sx={{ fontSize: '13px', fontWeight: 'bold', width: 28, textAlign: 'center' }} disableUnderline IconComponent={() => null}>
                        {Array.from({ length: 60 }).map((_, i) => <MenuItem key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</MenuItem>)}
                      </Select>
                    </Box>
                  );
                })()}

                <Typography fontSize="11px">END:</Typography>
                {(() => {
                  const [h, m] = (formData.early_check_in_end_time || "00:00").split(":");
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${borderColor}`, borderRadius: 1.5, px: 1, bgcolor: '#fff', height: 32 }}>
                      <Select size="small" variant="standard" value={h} onChange={e => handleInputChange('early_check_in_end_time', `${e.target.value}:${m}`)} sx={{ fontSize: '13px', fontWeight: 'bold', width: 28, textAlign: 'center' }} disableUnderline IconComponent={() => null}>
                        {Array.from({ length: 24 }).map((_, i) => <MenuItem key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</MenuItem>)}
                      </Select>
                      <Typography sx={{ mx: 0.5, fontWeight: 'bold', color: primaryBlue, mt: -0.2 }}>:</Typography>
                      <Select size="small" variant="standard" value={m} onChange={e => handleInputChange('early_check_in_end_time', `${h}:${e.target.value}`)} sx={{ fontSize: '13px', fontWeight: 'bold', width: 28, textAlign: 'center' }} disableUnderline IconComponent={() => null}>
                        {Array.from({ length: 60 }).map((_, i) => <MenuItem key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</MenuItem>)}
                      </Select>
                    </Box>
                  );
                })()}

                <Typography fontSize="11px">AMOUNT:</Typography><TextField size="small" value={formData.early_check_in_amount || ""} onChange={e => handleInputChange('early_check_in_amount', e.target.value)} sx={{ width: 100 }} />
              </Box>
            </GridRow>

            {/* Reference Settings: Dynamic Card Layout (Restored Position) */}
            <GridRow label="Reference Settings">
              <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'stretch' }}>
                {/* 1. Combined Part (Blue): COPY PASTE, TEXT, BOTH */}
                {(() => {
                  const group = (options.referenceOptions || []).filter(o => ["COPY PASTE", "TEXT", "BOTH"].includes(getLabel(o).toUpperCase()));
                  if (group.length === 0) return null;
                  const isActive = group.some(o => isChecked("res_reference_method", getLabel(o).toUpperCase()));
                  return (
                    <Box sx={{ display: 'flex', flex: 3.5, borderRadius: 1.5, overflow: 'hidden', border: `2px solid ${isActive ? primaryBlue : borderColor}`, bgcolor: isActive ? primaryBlue : '#fff' }}>
                      {group.map((o, idx) => {
                        const val = getLabel(o).toUpperCase();
                        const active = isChecked("res_reference_method", val);
                        return (
                          <Box key={val} onClick={() => handleCheckboxToggle("res_reference_method", val)} sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', borderRight: idx < group.length - 1 ? `1px solid ${active || isChecked("res_reference_method", getLabel(group[idx+1]).toUpperCase()) ? 'rgba(255,255,255,0.3)' : borderColor}` : 'none', color: active ? '#fff' : '#444', '&:hover': { bgcolor: active ? 'rgba(255,255,255,0.1)' : 'rgba(25, 118, 210, 0.04)' } }}>
                            <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>{getLabel(o)}</Typography>
                            <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })()}

                {/* 2. Rule Set (Green section): Dynamic */}
                {(() => {
                  const group = (options.referenceOptions || []).filter(o => !["COPY PASTE", "TEXT", "BOTH", "HIDE"].includes(getLabel(o).toUpperCase()));
                  if (group.length === 0) return null;
                  const isActive = group.some(o => isChecked("res_reference_method", getLabel(o).toUpperCase()));
                  return (
                    <Box sx={{ display: 'flex', flex: 1.5, borderRadius: 1.5, overflow: 'hidden', border: `2px solid ${isActive ? '#2e7d32' : borderColor}`, bgcolor: isActive ? '#e8f5e9' : '#fff' }}>
                      {group.map((o, idx) => {
                        const val = getLabel(o).toUpperCase();
                        const active = isChecked("res_reference_method", val);
                        return (
                          <Box key={val} onClick={() => handleCheckboxToggle("res_reference_method", val)} sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', borderRight: idx < group.length - 1 ? `1px solid ${isActive ? '#2e7d32' : borderColor}` : 'none', bgcolor: active ? '#2e7d32' : 'transparent', color: active ? '#fff' : '#444', '&:hover': { bgcolor: active ? '#2e7d32' : 'rgba(46, 125, 50, 0.04)' } }}>
                            <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>{getLabel(o)}</Typography>
                            <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })()}

                {/* 3. Single Part (Grey): HIDE */}
                {(() => {
                  const o = (options.referenceOptions || []).find(o => getLabel(o).toUpperCase() === "HIDE");
                  if (!o) return null;
                  const val = getLabel(o).toUpperCase();
                  const active = isChecked("res_reference_method", val);
                  return (
                    <Box onClick={() => handleCheckboxToggle("res_reference_method", val)} sx={{ flex: 0.8, minWidth: 80, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', borderRadius: 1.5, border: `2px solid ${active ? '#616161' : borderColor}`, bgcolor: active ? '#616161' : '#fff', color: active ? '#fff' : '#444', '&:hover': { border: `2px solid #616161`, bgcolor: active ? '#616161' : 'rgba(0,0,0,0.04)' } }}>
                      <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Hide</Typography>
                      <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                    </Box>
                  );
                })()}
              </Box>
            </GridRow>

            {/* Remark Settings: Dynamic Card Layout (Restored Position) */}
            <GridRow label="Remark Settings">
              <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'stretch' }}>
                {/* 1. Combined Part (Blue): COPY PASTE, TEXT, BOTH */}
                {(() => {
                  const group = (options.remarkOptions || []).filter(o => ["COPY PASTE", "TEXT", "BOTH"].includes(getLabel(o).toUpperCase()));
                  if (group.length === 0) return null;
                  const isActive = group.some(o => isChecked("res_remark_method", getLabel(o).toUpperCase()));
                  return (
                    <Box sx={{ display: 'flex', flex: 3.5, borderRadius: 1.5, overflow: 'hidden', border: `2px solid ${isActive ? primaryBlue : borderColor}`, bgcolor: isActive ? primaryBlue : '#fff' }}>
                      {group.map((o, idx) => {
                        const val = getLabel(o).toUpperCase();
                        const active = isChecked("res_remark_method", val);
                        return (
                          <Box key={val} onClick={() => handleCheckboxToggle("res_remark_method", val)} sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', borderRight: idx < group.length - 1 ? `1px solid ${active || isChecked("res_remark_method", getLabel(group[idx+1]).toUpperCase()) ? 'rgba(255,255,255,0.3)' : borderColor}` : 'none', color: active ? '#fff' : '#444', '&:hover': { bgcolor: active ? 'rgba(255,255,255,0.1)' : 'rgba(25, 118, 210, 0.04)' } }}>
                            <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>{getLabel(o)}</Typography>
                            <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })()}

                {/* 2. Rule Set (Green section): Dynamic */}
                {(() => {
                  const group = (options.remarkOptions || []).filter(o => !["COPY PASTE", "TEXT", "BOTH", "HIDE"].includes(getLabel(o).toUpperCase()));
                  if (group.length === 0) return null;
                  const isActive = group.some(o => isChecked("res_remark_method", getLabel(o).toUpperCase()));
                  return (
                    <Box sx={{ display: 'flex', flex: 1.5, borderRadius: 1.5, overflow: 'hidden', border: `2px solid ${isActive ? '#2e7d32' : borderColor}`, bgcolor: isActive ? '#e8f5e9' : '#fff' }}>
                      {group.map((o, idx) => {
                        const val = getLabel(o).toUpperCase();
                        const active = isChecked("res_remark_method", val);
                        return (
                          <Box key={val} onClick={() => handleCheckboxToggle("res_remark_method", val)} sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', borderRight: idx < group.length - 1 ? `1px solid ${isActive ? '#2e7d32' : borderColor}` : 'none', bgcolor: active ? '#2e7d32' : 'transparent', color: active ? '#fff' : '#444', '&:hover': { bgcolor: active ? '#2e7d32' : 'rgba(46, 125, 50, 0.04)' } }}>
                            <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>{getLabel(o)}</Typography>
                            <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })()}

                {/* 3. Single Part (Grey): HIDE */}
                {(() => {
                  const o = (options.remarkOptions || []).find(o => getLabel(o).toUpperCase() === "HIDE");
                  if (!o) return null;
                  const val = getLabel(o).toUpperCase();
                  const active = isChecked("res_remark_method", val);
                  return (
                    <Box onClick={() => handleCheckboxToggle("res_remark_method", val)} sx={{ flex: 0.8, minWidth: 80, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', borderRadius: 1.5, border: `2px solid ${active ? '#616161' : borderColor}`, bgcolor: active ? '#616161' : '#fff', color: active ? '#fff' : '#444', '&:hover': { border: `2px solid #616161`, bgcolor: active ? '#616161' : 'rgba(0,0,0,0.04)' } }}>
                      <Typography fontSize="10px" fontWeight="800" sx={{ mb: 1, textTransform: 'uppercase' }}>Hide</Typography>
                      <Checkbox size="small" checked={active} sx={{ p: 0, color: active ? '#fff' : borderColor, '&.Mui-checked': { color: '#fff' } }} />
                    </Box>
                  );
                })()}
              </Box>
            </GridRow>
            
            <GridRow label="Invoice Settings">
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(options.invoiceGenerateOptions || []).map(o => {
                  const val = getLabel(o);
                  return (
                    <FormControlLabel key={o.id || val} control={<Checkbox size="small" checked={isChecked('bill_generate', val)} onChange={() => handleCheckboxToggle('bill_generate', val)} />} label={<Typography fontSize="10px">{val}</Typography>} />
                  );
                })}
              </Box>
            </GridRow>

            <GridRow label="Taxes & Commission" noBorderBottom>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {(options.otaCommissions || []).map(comm => {
                  const label = comm.name || "";
                  const key = String(label).toLowerCase().replace(/ /g, '_');
                  return (
                    <Box key={key} sx={{ textAlign: 'center' }}>
                      <Typography fontSize="10px" color="gray">{label.toUpperCase()}</Typography>
                      <TextField
                        size="small"
                        value={formData[key] || ""}
                        onChange={e => handleInputChange(key, e.target.value)}
                        sx={{ width: 85 }}
                        InputProps={{
                          endAdornment: <Typography fontSize="12px" sx={{ color: 'gray' }}>%</Typography>
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </GridRow>

            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2, bgcolor: labelBg, borderTop: `1px solid ${borderColor}` }}>
              <Button onClick={handleReset} variant="outlined" sx={{ color: '#444', borderColor: '#444' }}>CLEAR</Button>
              <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: primaryBlue, px: 4 }}>{editId ? "UPDATE CONFIGURATION" : "SAVE CONFIGURATION"}</Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={3}>
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${borderColor}`, borderRadius: 2 }}>
            <Table size="small">
              <TableHead><TableRow><TableCell sx={{ fontWeight: 'bold' }}>SAVED CONFIGS</TableCell><TableCell></TableCell></TableRow></TableHead>
              <TableBody>
                {companies.map(c => (
                  <TableRow key={c.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleEdit(c)}>
                    <TableCell sx={{ color: primaryBlue, fontWeight: 'bold', fontSize: '12px' }}>{c.company_name}</TableCell>
                    <TableCell align="right">
                      <Button size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleEdit(c); }}>EDIT</Button>
                      <Button size="small" color="error" onClick={(e) => { e.stopPropagation(); deleteConfig(c.id); }}>DEL</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
}
