import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Typography, Grid, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, CircularProgress, Paper, Modal, Backdrop, Fade
} from "@mui/material";
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
  booking_id: "",
  guest_name: "",
  mobile_no: "",
  company_name: "",
  reference: "",
  remark: "",
  gross_amount: "",
  advance: "0",
  balance: "",
  room_type: "",
  booking_type: "",
  food_plan: "",
  payment_mode: "",
  check_in_date: "",
  check_out_date: "",
  check_in_time: "12:00 PM",
  check_out_time: "11:00 AM",
  no_of_rooms: "",
  no_of_persons: "",
  payment_status: "",
  status: ""
};

// Dark theme styles matching reference image
const darkField = {
  bgcolor: "#1a2035",
  borderRadius: '6px',
  fontFamily: "'Inter', 'Roboto', sans-serif",
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3a4a6b !important' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#5a7ab0 !important' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4B90FC !important' },
  '& .MuiOutlinedInput-root': {
    color: '#e0e6f0',
    height: '32px',
    fontSize: '12px !important',
    fontWeight: '400 !important',
    bgcolor: '#1a2035',
    fontFamily: "inherit",
    '&.Mui-disabled fieldset': { borderColor: '#2d3748 !important' },
  },
  '& .MuiInputBase-input': {
    padding: '4px 8px',
    color: '#e0e6f0',
    fontWeight: '400 !important',
    fontSize: '12px !important',
  },
  '& .Mui-disabled': {
    bgcolor: '#141c2e !important',
    WebkitTextFillColor: '#8899bb !important',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2d3748 !important' },
  },
  '& .MuiSelect-select': {
    color: '#e0e6f0 !important',
    padding: '4px 8px !important',
    fontWeight: '400 !important',
    fontSize: '12px !important'
  },
  '& .MuiSvgIcon-root': { color: '#8899bb' },
};

const getDarkLabel = () => ({
  color: '#8faac8',
  fontSize: '9px',
  fontWeight: '600',
  mb: 0.3,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  fontFamily: "'Inter', 'Roboto', sans-serif",
});

export default function ReservationForm({ onClose, initialData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const initialDataFromState = location.state?.initialData || location.state?.reservationData;

  const [formData, setFormData] = useState(() => {
    const rawData = initialData || initialDataFromState || {};
    return {
      ...INITIAL_FORM,
      ...rawData,
      mobile_no: rawData.phone_no || rawData.mobile_no || "",
      gross_amount: rawData.total_gross_amt || rawData.gross_amount || "",
      advance: (rawData.advance_amt !== undefined && rawData.advance_amt !== null) ? String(rawData.advance_amt) : (rawData.advance !== undefined && rawData.advance !== null ? String(rawData.advance) : "0"),
      balance: (rawData.balance_amt !== undefined && rawData.balance_amt !== null) ? String(rawData.balance_amt) : (rawData.balance !== undefined && rawData.balance !== null ? String(rawData.balance) : "0"),
      payment_status: String(rawData.payment_status || rawData.pay_status || rawData.payment_type || "").trim().toUpperCase(),
      status: String(rawData.status || "CONFIRMED").trim().toUpperCase()
    };
  });
  const [reservations, setReservations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [bookingTypes, setBookingTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(initialData?.id || initialDataFromState?.id || null);
  const [options, setOptions] = useState({
    foodPlans: [], paymentModes: [], referenceOptions: [], remarkOptions: [], paymentStatuses: []
  });
  const [config, setConfig] = useState(null);

  const [listDate, setListDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [dateFilteredReservations, setDateFilteredReservations] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  // Advance History State
  const [isAdvModalOpen, setIsAdvModalOpen] = useState(false);
  const [advHistory, setAdvHistory] = useState([]);
  const [advAddData, setAdvAddData] = useState({ amount: "", mode: "UPI" });
  const [advLoading, setAdvLoading] = useState(false);

  const fetchAdvHistory = async (resId) => {
    if (!resId) return;
    setAdvLoading(true);
    try {
      const res = await api.get(`api/advances?reservation_id=${resId}`);
      setAdvHistory(res?.data || []);
    } catch (e) {
      toast.error("Failed to fetch advance history");
    } finally {
      setAdvLoading(false);
    }
  };

  const handleOpenAdvModal = () => {
    if (!editId) {
      toast.info("Please save the reservation first or select an existing one.");
      return;
    }
    setAdvAddData({ amount: "", mode: "UPI" });
    fetchAdvHistory(editId);
    setIsAdvModalOpen(true);
  };

  const handleAddAdvance = async () => {
    if (!advAddData.amount || parseFloat(advAddData.amount) <= 0) {
      toast.error("Enter a valid advance amount");
      return;
    }
    setAdvLoading(true);
    try {
      await api.post("api/advances", {
        reservation_id: editId,
        advance_amount: advAddData.amount,
        pay_mode: advAddData.mode
      });
      toast.success("Advance added successfully");
      setAdvAddData({ amount: "", mode: "UPI" });
      fetchAdvHistory(editId);
      // Refresh current reservation data if needed to update balance
      fetchInitialData();
      fetchFilteredReservations(listDate);
    } catch (e) {
      toast.error("Error saving advance");
    } finally {
      setAdvLoading(false);
    }
  };

  // Phone History State
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneHistory, setPhoneHistory] = useState([]);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [hasPhoneHistory, setHasPhoneHistory] = useState(false);

  useEffect(() => {
    if (formData.mobile_no && formData.mobile_no.length === 10) {
      api.get(`api/reservations?phone_no=${formData.mobile_no}`).then(res => {
        const data = res?.data?.data || res?.data || [];
        setHasPhoneHistory(data.length > 0);
      }).catch(e => {
        setHasPhoneHistory(false);
      });
    } else {
      setHasPhoneHistory(false);
    }
  }, [formData.mobile_no]);

  const fetchPhoneHistory = async (phone) => {
    if (!phone) {
      toast.info("Please enter a phone number first.");
      return;
    }
    setPhoneLoading(true);
    setIsPhoneModalOpen(true);
    try {
      const res = await api.get(`api/reservations?phone_no=${phone}`);
      setPhoneHistory(res?.data?.data || res?.data || []);
    } catch (e) {
      toast.error("Failed to fetch phone history");
    } finally {
      setPhoneLoading(false);
    }
  };

  const toDate = (val) => {
    if (!val) return null;
    const d = dayjs(val);
    return d.isValid() ? d.toDate() : null;
  };

  const parseConfig = (comp) => {
    if (!comp) return null;
    const splitVal = (v, idx) => {
      if (!v) return "";
      const sVal = String(v);
      if (sVal.includes("|")) {
        const sections = sVal.split("|");
        return (sections[idx] || "").trim().toUpperCase();
      }
      return sVal.trim().toUpperCase();
    };
    return {
      ...comp,
      res_guest_name_method: splitVal(comp.guest_name, 0),
      upd_guest_name_method: splitVal(comp.guest_name, 1),
      res_phone_no_method: splitVal(comp.phone_no, 0),
      upd_phone_no_method: splitVal(comp.phone_no, 1),
      res_booking_id_method: splitVal(comp.booking_id_method, 0),
      upd_booking_id_method: splitVal(comp.booking_id_method, 1),
      res_remark_method: splitVal(comp.remark, 0),
      upd_remark_method: splitVal(comp.remark, 1),
      res_reference_method: splitVal(comp.reference, 0),
      upd_reference_method: splitVal(comp.reference, 1),
      res_gross_amount_method: splitVal(comp.gross_amount, 0),
      upd_gross_amount_method: splitVal(comp.gross_amount, 1),
      res_advance_method: splitVal(comp.advance || "TEXT ENTER", 0),
      upd_advance_method: splitVal(comp.advance || "TEXT ENTER", 1),
      id_start_no: comp.id_start_no || 1,
      id_padding: comp.id_padding || 4,
      id_suffix: comp.id_suffix || ""
    };
  };

  const calculateGrossAmount = () => {
    if (!config) return { amount: 0, error: "" };
    const rooms = parseInt(formData.no_of_rooms) || 0;
    const persons = parseInt(formData.no_of_persons) || 0;
    if (rooms === 0 || persons === 0) return { amount: 0, error: "" };

    const b = (formData.booking_type || "").toUpperCase();
    const isShortStay = b.includes("DAYUSE") || b.includes("DAY USE") || b.includes("HOUR") || b.includes("HR");
    const nights = (formData.check_in_date && formData.check_out_date) ? dayjs(formData.check_out_date).diff(dayjs(formData.check_in_date), 'day') : 0;
    const actualNights = nights > 0 ? nights : (isShortStay ? 1 : 0);

    const rates = {
      1: parseFloat(config.single_person_rate) || 0,
      2: parseFloat(config.double_person_rate) || 0,
      3: parseFloat(config.triple_person_rate) || 0,
      4: parseFloat(config.quad_person_rate) || 0
    };

    const maxCapPerRoom = rates[4] > 0 ? 4 : (rates[3] > 0 ? 3 : (rates[2] > 0 ? 2 : 1));
    let error = "";

    if (persons > (rooms * maxCapPerRoom)) {
      error = `Exceeds max capacity (${maxCapPerRoom} persons per room)`;
    } else if (persons < rooms) {
      error = `Requires at least ${rooms} persons for ${rooms} rooms`;
    }

    let totalRate = 0;
    if (persons >= rooms) {
      let extra = persons - rooms;
      for (let i = 0; i < rooms; i++) {
        let personsInThisRoom = 1;
        const canTake = Math.min(extra, maxCapPerRoom - 1);
        personsInThisRoom += canTake;
        extra -= canTake;
        totalRate += rates[personsInThisRoom] || 0;
      }
    } else {
      totalRate = rates[1] * rooms;
    }

    return { amount: totalRate * actualNights, error };
  };

  const { amount: calculatedGross, error: capError } = calculateGrossAmount();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchFilteredReservations(listDate);
  }, [listDate]);

  const fetchFilteredReservations = async (date) => {
    setListLoading(true);
    try {
      const res = await api.get(`api/reservations?date=${date}`);
      setDateFilteredReservations(res?.data?.data || res?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setListLoading(false);
    }
  };

  // Apply initialData when it changes (from room master cell click or navigation state)
  useEffect(() => {
    const dataToUse = initialData || initialDataFromState;
    if (dataToUse) {
      setFormData(prev => ({
        ...INITIAL_FORM,
        ...prev,
        ...dataToUse,
        // Map variant field names from API to form state
        mobile_no: dataToUse.phone_no || dataToUse.mobile_no || prev.mobile_no || "",
        gross_amount: dataToUse.total_gross_amt || dataToUse.gross_amount || prev.gross_amount || "",
        advance: (dataToUse.advance_amt !== undefined && dataToUse.advance_amt !== null) ? String(dataToUse.advance_amt) : (dataToUse.advance !== undefined && dataToUse.advance !== null ? String(dataToUse.advance) : prev.advance || "0"),
        balance: (dataToUse.balance_amt !== undefined && dataToUse.balance_amt !== null) ? String(dataToUse.balance_amt) : (dataToUse.balance !== undefined && dataToUse.balance !== null ? String(dataToUse.balance) : prev.balance || "0"),
        payment_status: String(dataToUse.payment_status || dataToUse.pay_status || dataToUse.payment_type || prev.payment_status || "").trim().toUpperCase(),
        status: String(dataToUse.status || prev.status || "CONFIRMED").trim().toUpperCase()
      }));
      setEditId(dataToUse.id || null);
      if (dataToUse.company_name) {
        handleCompanyChange(dataToUse.company_name);
      }
    }
  }, [initialData, initialDataFromState]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resComps, resRooms, resBookTypes, resReservations, resFood, resPay, resRef, resRem, resPayStatus] = await Promise.all([
        api.get("api/company-masters"),
        api.get("api/room-types"),
        api.get("api/booking-types"),
        api.get("api/reservations"),
        api.get("api/food-plans"),
        api.get("api/payment-modes"),
        api.get("api/reference-options"),
        api.get("api/remark-options"),
        api.get("api/payment-statuses")
      ]);

      setCompanies(resComps?.data?.data || resComps?.data || []);
      setRoomTypes(resRooms?.data?.data || resRooms?.data || []);
      setBookingTypes(resBookTypes?.data?.data || resBookTypes?.data || []);
      setReservations(resReservations?.data?.data || resReservations?.data || []);

      setOptions({
        foodPlans: resFood?.data?.data || resFood?.data || [],
        paymentModes: resPay?.data?.data || resPay?.data || [],
        referenceOptions: resRef?.data?.data || resRef?.data || [],
        remarkOptions: resRem?.data?.data || resRem?.data || [],
        paymentStatuses: resPayStatus?.data?.data || resPayStatus?.data || []
      });

      setFormData(prev => ({
        ...prev,
        payment_status: prev.payment_status || "",
        payment_mode: prev.payment_mode || ""
      }));

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!formData.company_name || companies.length === 0) return;

    const b = (formData.booking_type || "").trim().toUpperCase();
    const r = (formData.room_type || "").trim().toUpperCase();
    const c = (formData.company_name || "").trim().toUpperCase();

    const companyMatches = companies.filter(comp => (comp.company_name || "").toUpperCase() === c);
    if (companyMatches.length === 0) return;

    const splitArr = (str) => (str || "").split(",").map(x => x.trim()).filter(x => x);
    const aggregate = (key) => {
      const all = companyMatches.flatMap(m => {
        let val = m[key] || "";
        if (!val) {
          if (key.includes("booking")) val = m.booking_types || m.booking_type || "";
          else if (key.includes("room")) val = m.room_types || m.room_type || "";
          else if (key.includes("payment_mode")) val = m.payment_modes || m.payment_mode || "";
          else if (key.includes("payment_status")) val = m.payment_statuses || m.payment_status || m.payment_type || "";
          else if (key.includes("payment")) val = m.payment_modes || m.payment_mode || m.payment_statuses || m.payment_status || m.payment_type || "";
          else if (key.includes("plan") || key.includes("food") || key.includes("breakfast")) val = m.breakfast_plans || m.food_plan || "";
        }
        return splitArr(val);
      });
      return [...new Set(all)].join(", ");
    };

    const exactMatch = companyMatches.find(comp =>
      (comp.booking_type || "").toUpperCase() === b &&
      (comp.room_type || "").toUpperCase() === r
    ) || companyMatches[0];

    const configWithFullOptions = {
      ...exactMatch,
      booking_types: aggregate("booking_types"),
      booking_type: aggregate("booking_types"),
      room_types: aggregate("room_types"),
      room_type: aggregate("room_types"),
      payment_modes: aggregate("payment_modes"),
      payment_statuses: aggregate("payment_statuses"),
      breakfast_plans: aggregate("breakfast_plans"),
    };

    setConfig(parseConfig(configWithFullOptions));

    const isShortStay = b.includes("DAYUSE") || b.includes("DAY USE") || b.includes("HOUR") || b.includes("HR");

    setFormData(prev => {
      const updates = {
        check_in_time: configWithFullOptions.check_in_time || "12:00 PM",
        check_out_time: configWithFullOptions.check_out_time || "11:00 AM",
        check_out_date: isShortStay ? prev.check_in_date : (prev.check_out_date === prev.check_in_date ? dayjs(prev.check_in_date).add(1, 'day').format("YYYY-MM-DD") : prev.check_out_date),
      };

      if (configWithFullOptions.booking_id_method?.toUpperCase().includes("ID AUTO GENERATE") && !prev.booking_id) {
        const code = configWithFullOptions.booking_id_code || "";
        const formattedNum = String(configWithFullOptions.id_start_no || 1).padStart(Number(configWithFullOptions.id_padding || 4), '0');
        updates.booking_id = `${code}${formattedNum}${configWithFullOptions.id_suffix || ""}`;
      }

      if (!prev.payment_status && configWithFullOptions.payment_statuses) {
        const sModes = configWithFullOptions.payment_statuses.split(",").map(m => m.trim()).filter(Boolean);
        if (sModes.length > 0) updates.payment_status = sModes[0];
      }

      if (!prev.payment_mode && configWithFullOptions.payment_modes) {
        const pModes = configWithFullOptions.payment_modes.split(",").map(m => m.trim()).filter(Boolean);
        if (pModes.length > 0) updates.payment_mode = pModes[0];
      }

      if (!prev.food_plan && configWithFullOptions.breakfast_plans) {
        const fPlans = configWithFullOptions.breakfast_plans.split(",").map(m => m.trim()).filter(Boolean);
        if (fPlans.length === 1) updates.food_plan = fPlans[0];
      }

      return { ...prev, ...updates };
    });
  }, [formData.company_name, formData.booking_type, formData.room_type, companies]);

  const handleCompanyChange = (val) => {
    const matches = companies.filter(c => (c.company_name || "").toUpperCase() === val.toUpperCase());
    if (matches.length === 0) return;

    const splitArr = (str) => (str || "").split(",").map(x => x.trim()).filter(x => x);
    const aggregate = (key) => {
      const all = matches.flatMap(m => {
        let v = m[key] || "";
        if (!v) {
          if (key.includes("booking")) v = m.booking_types || m.booking_type || "";
          else if (key.includes("room")) v = m.room_types || m.room_type || "";
        }
        return splitArr(v);
      });
      return [...new Set(all)].join(", ");
    };

    const aggregatedBTypes = splitArr(aggregate("booking_types"));
    const aggregatedRTypes = splitArr(aggregate("room_types"));
    const aggregatedPStatuses = splitArr(aggregate("payment_statuses"));
    const aggregatedFoodPlans = splitArr(aggregate("breakfast_plans"));

    setFormData(prev => ({
      ...prev,
      company_name: val,
      booking_type: aggregatedBTypes.includes(prev.booking_type) ? prev.booking_type : (aggregatedBTypes[0] || ""),
      room_type: aggregatedRTypes.includes(prev.room_type) ? prev.room_type : (aggregatedRTypes[0] || ""),
      payment_status: aggregatedPStatuses.includes(prev.payment_status) ? prev.payment_status : (aggregatedPStatuses[0] || ""),
      food_plan: aggregatedFoodPlans.includes(prev.food_plan) ? prev.food_plan : (aggregatedFoodPlans[0] || ""),
    }));
  };

  const validateInput = (field, value, methodString) => {
    if (!methodString || !value) return true;
    const m = methodString.toUpperCase();
    const rules = m.split(",").map(part => part.trim());
    const label = field.replace('_', ' ').replace('no', 'number').toUpperCase();

    if (rules.includes("NUMERIC") && !/^\d*$/.test(value)) {
      toast.error(`${label} must be numeric only`);
      return false;
    }
    if ((rules.includes("ALPHABIT") || rules.includes("ALPHABET")) && !/^[a-zA-Z\s]*$/.test(value)) {
      toast.error(`${label} must be alphabetic characters only`);
      return false;
    }
    if (rules.includes("ALPHANUMERIC") && !/^[a-zA-Z0-9\s]*$/.test(value)) {
      toast.error(`${label} must be alphanumeric only`);
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const isUpdate = editId !== null;

    let method = "";
    if (name === "booking_id") method = isUpdate ? (config?.upd_booking_id_method || config?.res_booking_id_method) : config?.res_booking_id_method;
    else if (name === "mobile_no") method = isUpdate ? config?.upd_phone_no_method : config?.res_phone_no_method;
    else if (name === "guest_name") method = isUpdate ? config?.upd_guest_name_method : config?.res_guest_name_method;
    else if (name === "gross_amount") method = isUpdate ? (config?.upd_gross_amount_method || config?.res_gross_amount_method) : config?.res_gross_amount_method;
    else if (name === "remark") method = isUpdate ? config?.upd_remark_method : config?.res_remark_method;
    else if (name === "reference") method = isUpdate ? config?.upd_reference_method : config?.res_reference_method;
    else if (name === "advance") method = isUpdate ? (config?.upd_advance_method || config?.res_advance_method) : config?.res_advance_method;

    if (validateInput(name, value, method)) {
      if (name === "mobile_no") {
        if (value && !/^\d*$/.test(value)) return;
        if (value.length > 10) return;
      }

      if (name === "no_of_rooms" || name === "no_of_persons") {
        if (value !== "" && (parseInt(value) < 1 || isNaN(parseInt(value)))) {
          toast.error(`${name.replace(/_/g, ' ')} must be at least 1`);
          return;
        }
      }

      if (name === "gross_amount") {
        const parsed = parseFloat(value) || 0;
        if (value !== "" && parsed < calculatedGross) {
          toast.error(`Cannot paste gross amount less than calculated rate (₹${calculatedGross})`);
          return;
        }
      }

      const skipUpper = ['booking_id', 'gross_amount', 'advance', 'balance', 'mobile_no'];
      const finalValue = skipUpper.includes(name) ? value : value.toUpperCase();

      setFormData(prev => {
        const next = { ...prev, [name]: finalValue };
        if (name === "gross_amount" || name === "advance") {
          const g = parseFloat(next.gross_amount) || 0;
          const a = parseFloat(next.advance) || 0;
          next.balance = (g - a).toString();
        }
        return next;
      });
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setEditId(null);
    setConfig(null);
  };

  const handleSave = async () => {
    const isUpdate = editId !== null;
    const errorList = [];

    if (!formData.company_name) errorList.push("Company Name");
    if (!formData.check_in_date) errorList.push("Check In Date");
    if (!formData.no_of_rooms) errorList.push("No of Rooms");
    if (!formData.no_of_persons) errorList.push("No of Persons");

    const checkVisible = (key, method) => {
      const m = (method || "").toUpperCase();
      if (m && !m.includes("HIDE") && !formData[key]) {
        errorList.push(key.replace(/_/g, " ").toUpperCase());
      }
    };

    if (config) {
      checkVisible("guest_name", isUpdate ? config.upd_guest_name_method : config.res_guest_name_method);
      checkVisible("booking_id", isUpdate ? (config.upd_booking_id_method || config.res_booking_id_method) : config.res_booking_id_method);
      checkVisible("mobile_no", isUpdate ? config.upd_phone_no_method : config.res_phone_no_method);
      checkVisible("reference", isUpdate ? (config.upd_reference_method || config.res_reference_method) : config.res_reference_method);
      checkVisible("remark", isUpdate ? (config.upd_remark_method || config.res_remark_method) : config.res_remark_method);
      checkVisible("gross_amount", isUpdate ? config.upd_gross_amount_method : config.res_gross_amount_method);
      checkVisible("advance", isUpdate ? config.upd_advance_method : config.res_advance_method);
    }

    if (!formData.booking_type) errorList.push("Booking Type");
    if (!formData.room_type) errorList.push("Room Type");
    if (!formData.payment_status) errorList.push("Payment Status");
    if ((parseFloat(formData.advance) || 0) > 0 && !formData.payment_mode) errorList.push("Payment Mode");

    if (errorList.length > 0) {
      toast.error(`Please enter required fields: ${errorList.join(", ")}`);
      return;
    }

    if (formData.mobile_no && formData.mobile_no.length !== 10) {
      toast.error("Mobile number must be 10 digits");
      return;
    }

    if (capError) {
      toast.error(capError);
      return;
    }

    if ((parseFloat(formData.gross_amount) || 0) < calculatedGross) {
      toast.error(`Gross amount cannot be less than calculated amount (₹${calculatedGross})`);
      return;
    }

    const payload = {
      company_name: String(formData.company_name || ""),
      guest_name: String(formData.guest_name || ""),
      booking_id: String(formData.booking_id || ""),
      food_plan: String(formData.food_plan || ""),
      phone_no: String(formData.mobile_no || ""),
      booking_type: String(formData.booking_type || ""),
      room_type: String(formData.room_type || ""),
      reference: String(formData.reference || ""),
      remark: String(formData.remark || ""),
      check_in_date: formData.check_in_date,
      check_out_date: formData.check_out_date || formData.check_in_date,
      no_of_nights: dayjs(formData.check_out_date || formData.check_in_date).diff(dayjs(formData.check_in_date), 'day') || 1,
      check_in_time: String(formData.check_in_time || "12:00 PM"),
      check_out_time: String(formData.check_out_time || "11:00 AM"),
      no_of_rooms: parseInt(formData.no_of_rooms) || 0,
      no_of_persons: parseInt(formData.no_of_persons) || 0,
      total_gross_amt: parseFloat(formData.gross_amount) || 0,
      advance_amt: parseFloat(formData.advance) || 0,
      balance_amt: parseFloat(formData.balance) || 0,
      pay_mode: String(formData.payment_mode || ""),
      status: String(formData.status || "CONFIRMED").toUpperCase(),
      payment_status: String(formData.payment_status || "PENDING").toUpperCase()
    };

    try {
      if (editId) {
        await api.put(`api/reservations/${editId}`, payload);
        toast.success("Reservation updated");
      } else {
        await api.post("api/reservations", payload);
        toast.success("Reservation saved");
      }
      handleReset();
      fetchInitialData();
      if (onClose) onClose();
      navigate("/room-master");
    } catch (e) {
      if (e.response && e.response.data && e.response.data.errors) {
        const errors = Object.values(e.response.data.errors).flat().join(", ");
        toast.error(`Error: ${errors}`);
      } else {
        toast.error(e.response?.data?.message || "Failed to save reservation");
      }
    }
  };

  const handleEdit = async (row) => {
    if (!row.id) return;
    setEditId(row.id);
    
    setListLoading(true);
    try {
      // Fetch full reservation details by ID to ensure all fields (like payment_status) are loaded
      const res = await api.get(`api/reservations/${row.id}`);
      const fullData = res?.data?.data || res?.data || row;

      // Robust mapping of field names from API/DB to form state
      const mappedPaymentStatus = (fullData.payment_status || fullData.pay_status || fullData.payment_type || fullData.pay_type || "");
      const mappedStatus = (fullData.status || "");

      setFormData(prev => ({
        ...prev,
        ...fullData,
        mobile_no: fullData.phone_no || fullData.mobile_no || "",
        gross_amount: fullData.total_gross_amt || fullData.gross_amount || "",
        advance: (fullData.advance_amt !== undefined && fullData.advance_amt !== null) ? String(fullData.advance_amt) : (fullData.advance !== undefined && fullData.advance !== null ? String(fullData.advance) : "0"),
        balance: (fullData.balance_amt !== undefined && fullData.balance_amt !== null) ? String(fullData.balance_amt) : (fullData.balance !== undefined && fullData.balance !== null ? String(fullData.balance) : "0"),
        payment_status: String(mappedPaymentStatus).trim().toUpperCase(),
        status: String(mappedStatus).trim().toUpperCase(),
        payment_mode: fullData.pay_mode || fullData.payment_mode || "",
        check_in_date: fullData.check_in_date || "",
        check_out_date: fullData.check_out_date || "",
        no_of_rooms: fullData.no_of_rooms || "",
        no_of_persons: fullData.no_of_persons || ""
      }));

      handleCompanyChange(fullData.company_name || row.company_name || "WALKIN");
    } catch (e) {
      console.error("Failed to fetch full reservation details", e);
      // Fallback to row data if fetch fails
      setFormData(prev => ({ ...prev, ...row }));
    } finally {
      setListLoading(false);
    }
  };

  const getOpt = (fieldKey, fallback) => {
    if (!config) return fallback;
    const singular = fieldKey.replace(/_statuses$/, '_status').replace(/_modes$/, '_mode').replace(/_types$/, '_type').replace(/s$/, '');
    const plural = fieldKey.endsWith('s') ? fieldKey : `${fieldKey}s`;

    let str = "";
    if (fieldKey === "payment_statuses" || fieldKey === "payment_status") {
      str = config.payment_statuses || config.payment_status || config.payment_type || "";
    } else if (fieldKey === "breakfast_plans" || fieldKey === "food_plan") {
      str = config.breakfast_plans || config.food_plan || "";
    } else {
      str = config[fieldKey] || config[plural] || config[singular] || "";
    }

    if (str && str.toUpperCase().trim() !== "ALL") {
      const parts = [...new Set(str.split(",").map(x => x.trim()).filter(x => x))];
      return parts.map(name => ({ name }));
    }
    return fallback;
  };

  const renderConfigField = (name, label, method, type, listOptions = [], extraProps = {}) => {
    const m = method?.toUpperCase() || "TEXT ENTER";
    const isHidden = m === "HIDE";
    const currentVal = isHidden ? "" : formData[name];
    const isUpdate = editId !== null;

    // Field is no longer completely removed when hidden, but will be disabled.

    const handlePaste = (e) => {
      if (name === 'mobile_no') {
        const pasteData = e.clipboardData.getData('text');
        const digitsOnly = pasteData.replace(/\D/g, '');
        if (digitsOnly.length > 0 && digitsOnly.length < 10) {
          e.preventDefault();
          toast.error("Invalid Paste: Phone number must be exactly 10 digits");
        }
      }
    };

    const isCopyPaste = m.includes("COPY PASTE") || m.includes("COPY-PASTE") || m.includes("COPYPASTE");
    const handleKeyDown = (e) => {
      if (isCopyPaste && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
      }
    };

    const isSelect = m === "SELECT BOX" || m === "LIST BOX" || m === "LISTBOX";
    let fieldNode;

    if (isSelect) {
      const pluralKey = name === 'booking_type' ? 'booking_types' :
        name === 'room_type' ? 'room_types' :
          name === 'food_plan' ? 'breakfast_plans' :
            name === 'payment_mode' ? 'payment_modes' : name;
      const allowedItems = config?.[pluralKey] || config?.[name] || "";
      let filtered = allowedItems ? listOptions.filter(o => {
        const val = o.option_name || o.name || o.type_name || o.mode_name || o.plan_name;
        return allowedItems.split(",").map(x => x.trim()).includes(val);
      }) : [...listOptions];

      // CRITICAL: Ensure current value is ALWAYS in the options list so MUI Select can display it
      if (currentVal && !filtered.some(o => (o.option_name || o.name || o.type_name || o.mode_name || o.plan_name) === currentVal)) {
        filtered.push({ name: currentVal, option_name: currentVal });
      }

      fieldNode = (
        <Select
          fullWidth size="small" name={name} value={currentVal}
          onChange={handleInputChange} disabled={isHidden || (filtered.length <= 1)}
          sx={darkField}
          MenuProps={{
            PaperProps: {
              sx: { bgcolor: '#1a2035', color: '#e0e6f0', border: '1px solid #3a4a6b', '& .MuiMenuItem-root:hover': { bgcolor: '#253050' } }
            }
          }}
        >
          <MenuItem value="" sx={{ color: '#8899bb', fontSize: '12px' }}><em>-- Select {label} --</em></MenuItem>
          {filtered.map((o, idx) => {
            const val = o.option_name || o.name || o.type_name || o.mode_name || o.plan_name;
            return <MenuItem key={idx} value={val} sx={{ color: '#e0e6f0', fontSize: '12px', fontWeight: '400' }}>{val}</MenuItem>;
          })}
        </Select>
      );
    } else {
      const isDisabled = (name === "booking_id" && m.includes("ID AUTO GENERATE")) || name === "balance" || isHidden;
      fieldNode = (
        <TextField
          fullWidth size="small" name={name} value={currentVal}
          onChange={handleInputChange} onKeyDown={handleKeyDown} onPaste={handlePaste}
          disabled={isDisabled} multiline={name === 'remark'} rows={name === 'remark' ? 3 : 1}
          placeholder={isCopyPaste ? "Paste..." : (isHidden ? "HIDDEN" : "")}
          sx={{
            ...darkField,
            ...(name === 'remark' ? { '& .MuiOutlinedInput-root': { height: 'auto', color: '#e0e6f0', bgcolor: '#1a2035', fontSize: '12px !important' } } : {}),
            ...(isHidden ? { opacity: 0.6 } : {})
          }}
        />
      );
    }

    return (
      <Box sx={{ mb: 0.8 }} key={name}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.2 }}>
          <Typography sx={getDarkLabel()}>{label}</Typography>
          {name === 'mobile_no' && hasPhoneHistory && (
            <Typography
              onClick={() => fetchPhoneHistory(formData.mobile_no)}
              sx={{ color: '#4B90FC', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              History
            </Typography>
          )}
          {(name === 'gross_amount' || name === 'advance') && (
            <Typography
              onClick={name === 'advance' ? handleOpenAdvModal : undefined}
              sx={{ color: '#4B90FC', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              View History
            </Typography>
          )}
        </Box>
        {fieldNode}
      </Box>
    );
  };

  const isUpdate = editId !== null;
  const nights = (formData.check_in_date && formData.check_out_date)
    ? dayjs(formData.check_out_date).diff(dayjs(formData.check_in_date), 'day')
    : 0;
  const bType = (formData.booking_type || "").toUpperCase();
  const isShortStay = bType.includes("DAYUSE") || bType.includes("DAY USE") || bType.includes("HOUR") || bType.includes("HR");

  const paymentOptions = (() => {
    const baseOpts = getOpt("payment_statuses", options.paymentStatuses.map(ps => ({ name: ps.status_name || ps.name })));
    const current = (formData.payment_status || "").toUpperCase().trim();
    const allOpts = [...baseOpts];
    if (current && !baseOpts.some(o => (o.name || o.status_name).toUpperCase().trim() === current)) {
      allOpts.push({ name: current });
    }
    return allOpts;
  })();

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'flex-start', p: onClose ? 0 : 2, width: '100%' }}>
      <Box sx={{
        flex: 1.2,
        minWidth: 0,
        bgcolor: "#0e1729",
        color: '#e0e6f0',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: onClose ? '0 25px 60px rgba(0,0,0,0.7)' : '0 10px 30px rgba(0,0,0,0.5)',
        border: '1px solid #253050'
      }}>
        {/* Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #1a2a4a 0%, #0e1729 100%)',
          px: 3, py: 2,
          borderBottom: '1px solid #253050',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <Typography sx={{
            fontSize: '16px', fontWeight: '700', color: '#e0e6f0',
            letterSpacing: '1px', textTransform: 'uppercase'
          }}>
            {isUpdate ? "✏️ Reservation Update" : "📋 Reservation Page"}
          </Typography>
          {onClose && (
            <Box onClick={onClose} sx={{
              cursor: 'pointer', color: '#8899bb', fontSize: '20px', lineHeight: 1,
              '&:hover': { color: '#ff5555' }, transition: 'color 0.2s'
            }}>✕</Box>
          )}
        </Box>

        {/* Form Body */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={4}>
            {/* LEFT MAIN COLUMN */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {/* Company Name */}
                <Box sx={{ mb: 0.8 }}>
                  <Typography sx={getDarkLabel()}>Company Name</Typography>
                  <Select
                    fullWidth size="small" name="company_name" value={formData.company_name}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    sx={darkField}
                    MenuProps={{
                      PaperProps: {
                        sx: { bgcolor: '#1a2035', color: '#e0e6f0', border: '1px solid #3a4a6b', '& .MuiMenuItem-root:hover': { bgcolor: '#253050' } }
                      }
                    }}
                  >
                    <MenuItem value="" sx={{ color: '#8899bb', fontSize: '12px' }}><em>-- Select Company --</em></MenuItem>
                    {companies.map(c => <MenuItem key={c.id} value={c.company_name} sx={{ color: '#e0e6f0', fontSize: '12px', fontWeight: '400' }}>{c.company_name}</MenuItem>)}
                  </Select>
                </Box>

                {renderConfigField("guest_name", "Guest Name", isUpdate ? config?.upd_guest_name_method : config?.res_guest_name_method, isUpdate ? config?.upd_guest_name_type : config?.res_guest_name_type, [])}
                {renderConfigField("booking_id", "Booking ID", isUpdate ? (config?.upd_booking_id_method || config?.res_booking_id_method) : config?.res_booking_id_method, isUpdate ? (config?.upd_booking_id_type || config?.res_booking_id_type) : config?.res_booking_id_type, [])}
                {renderConfigField("mobile_no", "Phone Number", isUpdate ? config?.upd_phone_no_method : config?.res_phone_no_method, isUpdate ? config?.upd_phone_no_type : config?.res_phone_no_type, [])}
                {renderConfigField("booking_type", "Booking Type", "SELECT BOX", "TEXT", getOpt("booking_types", bookingTypes.map(t => ({ name: t.type_name || t.name }))))}
                {renderConfigField("room_type", "Room Type", "SELECT BOX", "TEXT", getOpt("room_types", roomTypes.map(t => ({ name: t.type_name || t.name }))))}
                {renderConfigField("food_plan", "Food Plan", "SELECT BOX", "TEXT", getOpt("breakfast_plans", options.foodPlans.map(t => ({ name: t.plan_name || t.name }))))}
                {renderConfigField("reference", "Reference", isUpdate ? (config?.upd_reference_method || config?.res_reference_method) : config?.res_reference_method, isUpdate ? (config?.upd_reference_type || config?.res_reference_type) : config?.res_reference_type, getOpt("reference", options.referenceOptions))}
                {renderConfigField("remark", "Remark", isUpdate ? (config?.upd_remark_method || config?.res_remark_method) : config?.res_remark_method, isUpdate ? (config?.upd_remark_type || config?.res_remark_type) : config?.res_remark_type, getOpt("remark", options.remarkOptions))}
              </Box>
            </Grid>

            {/* RIGHT MAIN COLUMN */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {/* Check In & Check Out Date + No of Night */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 0.8 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={getDarkLabel()}>Check In & Check Out Date</Typography>
                    <Box sx={{
                      '& .react-datepicker-wrapper': { width: '100%' },
                      '& .react-datepicker__input-container input': {
                        width: '100%', padding: '6px 8px',
                        bgcolor: '#1a2035', color: '#e0e6f0',
                        border: '1px solid #3a4a6b', borderRadius: '6px',
                        fontSize: '12px', fontWeight: '500', height: '32px',
                        boxSizing: 'border-box', outline: 'none', background: '#1a2035',
                        '&:hover': { borderColor: '#5a7ab0' },
                        '&:focus': { borderColor: '#4B90FC' },
                      },
                    }}>
                      <DatePicker
                        selectsRange={!isShortStay}
                        startDate={toDate(formData.check_in_date)}
                        endDate={!isShortStay ? toDate(formData.check_out_date) : null}
                        selected={isShortStay ? toDate(formData.check_in_date) : null}
                        onChange={(update) => {
                          if (isShortStay) {
                            const date = dayjs(update).format("YYYY-MM-DD");
                            setFormData(prev => ({ ...prev, check_in_date: date, check_out_date: date }));
                          } else {
                            const [start, end] = update;
                            setFormData(prev => ({
                              ...prev,
                              check_in_date: start ? dayjs(start).format("YYYY-MM-DD") : prev.check_in_date,
                              check_out_date: end ? dayjs(end).format("YYYY-MM-DD") : "",
                            }));
                          }
                        }}
                        dateFormat="dd-MM-yyyy" minDate={new Date()}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ width: '60px' }}>
                    <Typography sx={getDarkLabel()}>No of Night</Typography>
                    <Box sx={{
                      bgcolor: '#1a2035', color: '#8899bb',
                      textAlign: 'center', py: '6px', borderRadius: '6px',
                      fontWeight: 'bold', fontSize: '12px', border: '1px solid #3a4a6b',
                      height: '32px', boxSizing: 'border-box'
                    }}>
                      {nights}
                    </Box>
                  </Box>
                </Box>

                {/* Check In / Out Time */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 0.8 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={getDarkLabel()}>Check In Time</Typography>
                    <TextField fullWidth size="small" value={formData.check_in_time} disabled
                      sx={{ ...darkField, '& .MuiInputBase-input': { textAlign: 'center', color: '#8899bb !important', padding: '8px' } }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={getDarkLabel()}>Check Out Time</Typography>
                    <TextField fullWidth size="small" value={formData.check_out_time} disabled
                      sx={{ ...darkField, '& .MuiInputBase-input': { textAlign: 'center', color: '#8899bb !important', padding: '8px' } }} />
                  </Box>
                </Box>

                {/* No of Rooms / Persons */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 0.8 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={getDarkLabel()}>No of Rooms</Typography>
                    <TextField fullWidth size="small" name="no_of_rooms" value={formData.no_of_rooms}
                      sx={{ ...darkField, '& .MuiInputBase-input': { textAlign: 'center' } }} onChange={handleInputChange} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={getDarkLabel()}>No of Persons</Typography>
                    <TextField fullWidth size="small" name="no_of_persons" value={formData.no_of_persons}
                      sx={{ ...darkField, '& .MuiInputBase-input': { textAlign: 'center' } }} onChange={handleInputChange} />
                  </Box>
                </Box>

                {/* Bottom Right Layout - Payment & Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>

                  {/* Payment Width matches exactly "No of Persons" column */}
                  <Box sx={{ width: 'calc(50% - 6px)', display: 'flex', flexDirection: 'column' }}>

                    {/* Payment Status */}
                    <Box sx={{ mb: 0.8 }}>
                      <Typography sx={getDarkLabel()}>Payment Status</Typography>
                      <Select fullWidth size="small" name="payment_status" value={formData.payment_status || ""}
                        onChange={handleInputChange} disabled={paymentOptions.length <= 1}
                        sx={{
                          ...darkField, height: '32px',
                        }}
                        MenuProps={{ PaperProps: { sx: { bgcolor: '#1a2035', color: '#e0e6f0', border: '1px solid #3a4a6b', '& .MuiMenuItem-root:hover': { bgcolor: '#253050' } } } }}
                      >
                        <MenuItem value="" sx={{ color: '#8899bb', fontSize: '12px' }}><em>-- Select Status --</em></MenuItem>
                        {paymentOptions.map((ps, idx) => (
                          <MenuItem key={idx} value={ps.name} sx={{ color: '#e0e6f0', fontSize: '12px', fontWeight: '400' }}>{ps.name}</MenuItem>
                        ))}
                      </Select>
                    </Box>

                    {renderConfigField("gross_amount", "Total Gross Amount", isUpdate ? (config?.upd_gross_amount_method || config?.res_gross_amount_method) : config?.res_gross_amount_method, isUpdate ? (config?.upd_gross_amount_type || config?.res_gross_amount_type) : config?.res_gross_amount_type, [])}
                    {renderConfigField("advance", "Advance", isUpdate ? (config?.upd_advance_method || config?.res_advance_method) : config?.res_advance_method, isUpdate ? (config?.upd_advance_type || config?.res_advance_type) : config?.res_advance_type, [])}
                    {renderConfigField("balance", "Balance", "TEXT ENTER", "NUMERIC", [])}
                    {(parseFloat(formData.advance) || 0) > 0 &&
                      renderConfigField("payment_mode", "Payment Mode", "SELECT BOX", "TEXT", getOpt("payment_modes", options.paymentModes.map(m => ({ name: m.mode_name || m.name }))))
                    }

                    {/* Buttons Placed Below Payment Modes */}
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Grid container spacing={1}>
                        {isUpdate && (
                          <Grid item xs={6}>
                            <Button
                              fullWidth onClick={handleOpenAdvModal}
                              variant="contained" sx={{ bgcolor: '#7c3aed', color: '#fff', fontWeight: 'bold', fontSize: '10px', p: 1, borderRadius: '20px', '&:hover': { bgcolor: '#6d28d9' } }}>
                              ADVANCE
                            </Button>
                          </Grid>
                        )}

                        <Grid item xs={isUpdate ? 6 : 6}>
                          <Button fullWidth onClick={onClose || (() => navigate("/room-master"))} variant="contained" sx={{ bgcolor: '#dc2626', color: '#fff', fontWeight: 'bold', fontSize: '10px', p: 1, borderRadius: '20px', '&:hover': { bgcolor: '#b91c1c' } }}>
                            CLOSE
                          </Button>
                        </Grid>

                        <Grid item xs={isUpdate ? 6 : 6}>
                          <Button fullWidth onClick={handleSave} variant="contained" sx={{ bgcolor: '#16a34a', color: '#fff', fontWeight: 'bold', fontSize: '10px', p: 1, borderRadius: '20px', '&:hover': { bgcolor: '#15803d' } }}>
                            {isUpdate ? "UPDATE" : "SAVE"}
                          </Button>
                        </Grid>

                        {isUpdate && (
                          <Grid item xs={6}>
                            <Button fullWidth variant="contained" sx={{ bgcolor: '#ca8a04', color: '#fff', fontWeight: 'bold', fontSize: '10px', p: 1, borderRadius: '20px', '&:hover': { bgcolor: '#a16207' } }}>
                              CANCEL
                            </Button>
                          </Grid>
                        )}

                        {isUpdate && (
                          <Grid item xs={6}>
                            <Button fullWidth variant="contained" sx={{ bgcolor: '#7f1d1d', color: '#fff', fontWeight: 'bold', fontSize: '10px', p: 1, borderRadius: '20px', '&:hover': { bgcolor: '#450a0a' } }}>
                              DELETE
                            </Button>
                          </Grid>
                        )}
                      </Grid>
                    </Box>

                    {/* Capacity Alert (if any) */}
                    {capError && (
                      <Box sx={{
                        display: 'flex', flexDirection: 'column', gap: 0.5, p: 1, mt: 1,
                        bgcolor: 'rgba(255,107,107,0.1)', borderRadius: '6px',
                        border: '1px solid rgba(255,107,107,0.3)'
                      }}>
                        <Typography sx={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: '12px' }}>⚠️ CAPACITY ALERT</Typography>
                        <Typography sx={{ color: '#e0e6f0', fontSize: '11px', fontWeight: '500' }}>{capError}</Typography>
                        <Typography sx={{ color: '#ff6b6b', fontSize: '10px', mt: 0.5 }}>Calculated Gross for this setup: ₹{calculatedGross}</Typography>
                      </Box>
                    )}

                  </Box>
                </Box>

              </Box>
            </Grid>
          </Grid>
        </Box>

      </Box>

      {/* Reservation List Section */}
      {!onClose && (
        <Box sx={{
          flex: 1.6,
          minWidth: 0,
          flexGrow: 1,
          bgcolor: '#0e1729',
          borderRadius: '12px',
          border: '1px solid #253050',
          display: 'flex', flexDirection: 'column',
          overflow: 'visible' // Changed from hidden to allow calendar popup
        }}>
          {/* List Header with Date Switcher */}
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            bgcolor: '#1a2a4a', px: 2, py: 1, borderRadius: '4px 4px 0 0',
            border: '1px solid #253050', mb: 0
          }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' }}>
              Reservation List
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {[
                { label: 'Yesterday', val: dayjs().subtract(1, 'day').format("YYYY-MM-DD") },
                { label: 'Today', val: dayjs().format("YYYY-MM-DD") },
                { label: 'Tomorrow', val: dayjs().add(1, 'day').format("YYYY-MM-DD") }
              ].map((btn) => (
                <Button
                  key={btn.label}
                  onClick={() => setListDate(btn.val)}
                  sx={{
                    bgcolor: listDate === btn.val ? '#4B90FC' : '#0e1729',
                    color: '#fff', fontSize: '10px', fontWeight: 'bold', px: 2, py: 0.5, minWidth: 'auto',
                    border: '1px solid #3a4a6b', borderRadius: '4px',
                    '&:hover': { bgcolor: '#3a7ae0' }
                  }}
                >
                  {btn.label}
                </Button>
              ))}
              <Box className="custom-datepicker" sx={{ ml: 1 }}>
                <DatePicker
                  selected={toDate(listDate)}
                  onChange={(date) => setListDate(dayjs(date).format("YYYY-MM-DD"))}
                  dateFormat="dd-MM-yyyy"
                  popperPlacement="bottom-end"
                  customInput={<CustomDateInput />}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ bgcolor: '#0e1729', borderRadius: '0 0 8px 8px', overflow: 'hidden', border: '1px solid #253050', borderTop: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#0d1321' }}>
                  {["Guest Name", "Company Name", "Check In - Out", "Nights"].map(h => (
                    <TableCell key={h} align={h === 'Nights' ? 'center' : 'left'}
                      sx={{
                        color: '#8899bb', fontWeight: '700', fontSize: '10px', textTransform: 'uppercase',
                        letterSpacing: '0.5px', borderBottom: '1px solid #253050', py: 1.2,
                        width: h === 'Nights' ? '1%' : 'auto', whiteSpace: 'nowrap'
                      }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {listLoading ? (
                  <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={20} /></TableCell></TableRow>
                ) : dateFilteredReservations.length === 0 ? (
                  <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: '#8899bb', fontSize: '12px' }}>No reservations found for this date</TableCell></TableRow>
                ) : (
                  dateFilteredReservations.map((res) => (
                    <TableRow key={res.id} hover onClick={() => handleEdit(res)}
                      sx={{ '&:hover': { bgcolor: '#1a2a4a' }, bgcolor: 'transparent', cursor: 'pointer', '& td': { borderBottom: '1px solid #1e2d45' } }}>
                      <TableCell sx={{ color: '#e0e6f0', fontSize: '11px', fontWeight: '500', py: 1 }}>{res.guest_name}</TableCell>
                      <TableCell sx={{ color: '#8899bb', fontSize: '11px', py: 1 }}>{res.company_name}</TableCell>
                      <TableCell sx={{ color: '#e0e6f0', fontSize: '11px', py: 1, whiteSpace: 'nowrap' }}>
                        {dayjs(res.check_in_date).format("DD-MM-YYYY")} - {dayjs(res.check_out_date).format("DD-MM-YYYY")}
                      </TableCell>
                      <TableCell align="center" sx={{ color: '#e0e6f0', fontSize: '11px', py: 1 }}>{res.no_of_nights}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        </Box>
      )}

      {/* Advance Management Modal */}
      <Modal
        open={isAdvModalOpen}
        onClose={() => setIsAdvModalOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={isAdvModalOpen}>
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 450, bgcolor: '#0e1729', color: '#e0e6f0', border: '1px solid #253050',
            borderRadius: '12px', boxShadow: 24, p: 4, outline: 'none'
          }}>
            <Typography variant="h6" sx={{ color: '#4B90FC', fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
              💳 ADVANCE HISTORY
            </Typography>

            {/* List Section */}
            <Box sx={{ maxHeight: '250px', overflowY: 'auto', mb: 3, border: '1px solid #1e2d45', borderRadius: '8px' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#1a2035' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#8899bb', fontWeight: 'bold', fontSize: '11px' }}>Date & Time</TableCell>
                    <TableCell sx={{ color: '#8899bb', fontWeight: 'bold', fontSize: '11px' }}>Mode</TableCell>
                    <TableCell align="right" sx={{ color: '#8899bb', fontWeight: 'bold', fontSize: '11px' }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {advLoading && advHistory.length === 0 ? (
                    <TableRow><TableCell colSpan={3} align="center" sx={{ py: 2 }}><CircularProgress size={20} /></TableCell></TableRow>
                  ) : advHistory.length === 0 ? (
                    <TableRow><TableCell colSpan={3} align="center" sx={{ color: '#8899bb', fontSize: '11px', py: 2 }}>No history found</TableCell></TableRow>
                  ) : (
                    advHistory.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell sx={{ color: '#e0e6f0', fontSize: '11px' }}>
                          {dayjs(h.date).format("DD-MM-YYYY")} <span style={{ color: '#8899bb' }}>{h.time}</span>
                        </TableCell>
                        <TableCell sx={{ color: '#4B90FC', fontSize: '11px', fontWeight: '500' }}>{h.pay_mode}</TableCell>
                        <TableCell align="right" sx={{ color: '#16a34a', fontWeight: 'bold', fontSize: '11px' }}>₹{h.advance_amount}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>

            {/* Total Collected */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, mb: 3 }}>
              <Typography sx={{ color: '#8faac8', fontSize: '12px', fontWeight: 'bold' }}>TOTAL COLLECTED:</Typography>
              <Typography sx={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
                ₹{advHistory.reduce((acc, curr) => acc + parseFloat(curr.advance_amount || 0), 0).toFixed(2)}
              </Typography>
            </Box>

            {/* Add New Advance Section */}
            <Typography sx={{ color: '#8faac8', fontSize: '10px', fontWeight: 'bold', mb: 1, textTransform: 'uppercase' }}>
              Add New Advance
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={7}>
                <TextField
                  fullWidth size="small" type="number" placeholder="Enter Amount"
                  value={advAddData.amount} onChange={(e) => setAdvAddData(prev => ({ ...prev, amount: e.target.value }))}
                  sx={{ ...darkField }}
                />
              </Grid>
              <Grid item xs={5}>
                <Select
                  fullWidth size="small" value={advAddData.mode}
                  onChange={(e) => setAdvAddData(prev => ({ ...prev, mode: e.target.value }))}
                  sx={{ ...darkField, height: '32px' }}
                >
                  {options.paymentModes.map(m => (
                    <MenuItem key={m.id} value={m.mode_name || m.name} sx={{ fontSize: '12px' }}>{m.mode_name || m.name}</MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button fullWidth onClick={() => setIsAdvModalOpen(false)} variant="outlined" sx={{ color: '#8899bb', borderColor: '#3a4a6b', borderRadius: '20px', fontSize: '11px' }}>
                CANCEL
              </Button>
              <Button
                fullWidth onClick={handleAddAdvance} disabled={advLoading} variant="contained"
                sx={{ bgcolor: '#4B90FC', color: '#fff', borderRadius: '20px', fontWeight: 'bold', fontSize: '11px', '&:hover': { bgcolor: '#3a7ae0' } }}>
                {advLoading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : "ADD ADVANCE"}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
      {/* Phone History Modal */}
      <Modal
        open={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={isPhoneModalOpen}>
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 700, bgcolor: '#0e1729', color: '#e0e6f0', border: '1px solid #253050',
            borderRadius: '12px', boxShadow: 24, p: 4, outline: 'none'
          }}>
            <Typography variant="h6" sx={{ color: '#4B90FC', fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
              📞 BOOKING HISTORY FOR: {formData.mobile_no}
            </Typography>

            <Box sx={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #1e2d45', borderRadius: '8px' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#1a2035' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#8899bb', fontWeight: 'bold', fontSize: '11px' }}>ID</TableCell>
                    <TableCell sx={{ color: '#8899bb', fontWeight: 'bold', fontSize: '11px' }}>Guest & Company</TableCell>
                    <TableCell sx={{ color: '#8899bb', fontWeight: 'bold', fontSize: '11px' }}>Stay Dates</TableCell>
                    <TableCell sx={{ color: '#8899bb', fontWeight: 'bold', fontSize: '11px' }}>Room Type</TableCell>
                    <TableCell align="right" sx={{ color: '#8899bb', fontWeight: 'bold', fontSize: '11px' }}>Total Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {phoneLoading ? (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><CircularProgress size={20} /></TableCell></TableRow>
                  ) : phoneHistory.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ color: '#8899bb', fontSize: '12px', py: 4 }}>No past reservations found</TableCell></TableRow>
                  ) : (
                    phoneHistory.map((res) => (
                      <TableRow key={res.id}>
                        <TableCell sx={{ color: '#4B90FC', fontSize: '11px', fontWeight: 'bold' }}>#{res.id}</TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography sx={{ color: '#e0e6f0', fontSize: '12px', fontWeight: '500' }}>{res.guest_name}</Typography>
                          <Typography sx={{ color: '#8899bb', fontSize: '10px' }}>{res.company_name}</Typography>
                        </TableCell>
                        <TableCell sx={{ color: '#e0e6f0', fontSize: '11px' }}>
                          {dayjs(res.check_in_date).format("DD MMM YYYY")} - {dayjs(res.check_out_date).format("DD MMM YYYY")}
                        </TableCell>
                        <TableCell sx={{ color: '#8899bb', fontSize: '11px' }}>{res.room_type}</TableCell>
                        <TableCell align="right" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '11px' }}>₹{res.total_gross_amt}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button onClick={() => setIsPhoneModalOpen(false)} variant="contained" sx={{ bgcolor: '#4B90FC', color: '#fff', borderRadius: '20px', px: 4 }}>
                CLOSE
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}











