import { useState } from "react";
import { Box, Typography, Button, Divider, Grid } from "@mui/material";
import BookingTypesMaster from "./BookingTypesMaster";
import InvoiceGenerateMaster from "./InvoiceGenerateMaster";
import RoomTypesMaster from "./RoomTypesMaster";
import PaymentStatusesMaster from "./PaymentStatusesMaster";
import TaxesMaster from "./TaxesMaster";
import CompaniesMaster from "./CompaniesMaster";
import FoodPlansMaster from "./FoodPlansMaster";
import PaymentModesMaster from "./PaymentModesMaster";
import GrossAmountOptionsMaster from "./GrossAmountOptionsMaster";
import PersonCountsMaster from "./PersonCountsMaster";
import OtaCommissionStructuresMaster from "./OtaCommissionStructuresMaster";
import RoomsMaster from "./RoomsMaster";
import RoomStatusIconsMaster from "./RoomStatusIconsMaster";
import RemarkOptionsMaster from "./RemarkOptionsMaster";
import ReferenceOptionsMaster from "./ReferenceOptionsMaster";
import BookingGuestNameOptionsMaster from "./BookingGuestNameOptionsMaster";
import AdditionalServicesMaster from "./AdditionalServicesMaster";
import BookingGuestPhoneOptionsMaster from "./BookingGuestPhoneOptionsMaster";
import BookingIdCodesMaster from "./BookingIdCodesMaster";
import BookingIdMethodsMaster from "./BookingIdMethodsMaster";
import MaintenancesMaster from "./MaintenancesMaster";
import SimpleCompaniesMaster from "./SimpleCompaniesMaster";
import RoomStatusOptionsMaster from "./RoomStatusOptionsMaster";
import HourlyCheckoutBlinkingTimesMaster from "./HourlyCheckoutBlinkingTimesMaster";
import VisitingPurposeMaster from "../pages/VisitingPurposeMaster";
import DepartmentsMaster from "./DepartmentsMaster";
import CategoriesMaster from "./CategoriesMaster";
import CitizenshipsMaster from "./CitizenshipsMaster";
import HotelMaster from "./HotelMaster";
import CountriesMaster from "./CountriesMaster";
import StatesMaster from "./StatesMaster";
import DistrictsMaster from "./DistrictsMaster";
import IssueTypesMaster from "./IssueTypesMaster";

export default function MastersPage() {
  const [activeMaster, setActiveMaster] = useState(null);

  const mastersList = [
    { id: "booking_types", label: "Booking Types" },
    { id: "invoice_generate", label: "Invoice Generate" },
    { id: "room_types", label: "Room Types" },
    { id: "rooms", label: "Rooms" },
    { id: "room_status_icons", label: "Room Status Icons" },
    { id: "room_status_options", label: "Room Status Options" },
    { id: "remark_options", label: "Remark Options" },
    { id: "reference_options", label: "Reference Options" },
    { id: "additional_services", label: "Additional Services" },
    { id: "booking_guest_name_options", label: "Booking Guest Name Options" },
    { id: "booking_guest_phone_options", label: "Booking Guest Phone Options" },
    { id: "booking_id_methods", label: "Booking ID Methods" },
    { id: "booking_id_codes", label: "Booking ID Codes" },
    { id: "maintenances", label: "Maintenances" },
    { id: "payment_statuses", label: "Payment Statuses" },
    { id: "payment_modes", label: "Payment Modes" },
    { id: "taxes", label: "Taxes" },
    { id: "companies", label: "Company Settings" },
    { id: "company_names", label: "Company Names" },
    { id: "person_counts", label: "Person Counts" },
    { id: "ota_commission", label: "OTA Commissions" },
    { id: "gross_amount_options", label: "Gross Amount Options" },
    { id: "food_plans", label: "Food Plans" },
    { id: "hourly_checkout_blinking_times", label: "Hourly Checkout Blinking" },
    { id: "visiting_purpose", label: "Visiting Purpose" },
    { id: "departments", label: "Departments" },
    { id: "categories", label: "Categories" },
    { id: "citizenships", label: "Citizenships" },
    { id: "hotel_details", label: "Hotel Details" },
    { id: "country_names", label: "Country Names" },
    { id: "states", label: "States" },
    { id: "districts", label: "Districts" },
    { id: "issue_types", label: "Issue Types" }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Masters Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Select a master category below to manage its records.
      </Typography>

      {/* Buttons for different masters */}
      <Grid container spacing={2} mb={4}>
        {mastersList.map((master) => (
          <Grid item key={master.id}>
            <Button
              variant={activeMaster === master.id ? "contained" : "outlined"}
              color="primary"
              onClick={() => setActiveMaster(master.id)}
              sx={{ minWidth: 140, borderRadius: 2 }}
            >
              {master.label}
            </Button>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* Render the selected master component */}
      <Box>
        {activeMaster === "booking_types" && <BookingTypesMaster />}
        {activeMaster === "invoice_generate" && <InvoiceGenerateMaster />}
        {activeMaster === "room_types" && <RoomTypesMaster />}
        {activeMaster === "rooms" && <RoomsMaster />}
        {activeMaster === "room_status_icons" && <RoomStatusIconsMaster />}
        {activeMaster === "room_status_options" && <RoomStatusOptionsMaster />}
        {activeMaster === "remark_options" && <RemarkOptionsMaster />}
        {activeMaster === "reference_options" && <ReferenceOptionsMaster />}
        {activeMaster === "additional_services" && <AdditionalServicesMaster />}
        {activeMaster === "booking_guest_name_options" && <BookingGuestNameOptionsMaster />}
        {activeMaster === "booking_guest_phone_options" && <BookingGuestPhoneOptionsMaster />}
        {activeMaster === "booking_id_methods" && <BookingIdMethodsMaster />}
        {activeMaster === "booking_id_codes" && <BookingIdCodesMaster />}
        {activeMaster === "maintenances" && <MaintenancesMaster />}
        {activeMaster === "payment_statuses" && <PaymentStatusesMaster />}
        {activeMaster === "payment_modes" && <PaymentModesMaster />}
        {activeMaster === "taxes" && <TaxesMaster />}
        {activeMaster === "companies" && <CompaniesMaster />}
        {activeMaster === "company_names" && <SimpleCompaniesMaster />}
        {activeMaster === "person_counts" && <PersonCountsMaster />}
        {activeMaster === "ota_commission" && <OtaCommissionStructuresMaster />}
        {activeMaster === "gross_amount_options" && <GrossAmountOptionsMaster />}
        {activeMaster === "food_plans" && <FoodPlansMaster />}
        {activeMaster === "hourly_checkout_blinking_times" && <HourlyCheckoutBlinkingTimesMaster />}
        {activeMaster === "visiting_purpose" && <VisitingPurposeMaster />}
        {activeMaster === "departments" && <DepartmentsMaster />}
        {activeMaster === "categories" && <CategoriesMaster />}
        {activeMaster === "citizenships" && <CitizenshipsMaster />}
        {activeMaster === "hotel_details" && <HotelMaster />}
        {activeMaster === "country_names" && <CountriesMaster />}
        {activeMaster === "states" && <StatesMaster />}
        {activeMaster === "districts" && <DistrictsMaster />}
        {activeMaster === "issue_types" && <IssueTypesMaster />}
      </Box>
    </Box>
  );
}
