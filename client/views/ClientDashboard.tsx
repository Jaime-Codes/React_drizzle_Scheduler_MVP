import { useEffect, useState } from "react";
import { Schedule } from "@mantine/schedule";
import {
  Card,
  Text,
  Button,
  Select,
  Modal,
  Textarea,
  Group,
  Badge,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { useAuth } from "../src/hooks/auth";
import api from "../src/api";

interface CaregiverOption {
  value: string;
  label: string;
}

interface AvailabilitySlot {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function ClientDashboard() {
  const { user } = useAuth();
  const [caregivers, setCaregivers] = useState<CaregiverOption[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<string | null>(
    null,
  );
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Booking Form State
  const [startTime, setStartTime] = useState<Date | string | null>(null);
  const [endTime, setEndTime] = useState<Date | string | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // 1. Fetch available caregivers and client's active bookings on load
    api.get("/clients/caregivers-list").then((res) => setCaregivers(res.data));
    fetchClientBookings();
  }, [user]);

  useEffect(() => {
    if (selectedCaregiver) {
      // 2. Fetch selected caregiver's availability rules when selected
      api.get(`/availability/caregiver/${selectedCaregiver}`).then((res) => {
        setAvailability(res.data);
      });
    }
  }, [selectedCaregiver]);

  const fetchClientBookings = async () => {
    const res = await api.get("/appointments");
    const formatted = res.data.map((app: any) => ({
      id: app.id,
      title: `Shift with Caregiver ${app.caregiverName || `#${app.caregiverId}`}`,
      start: dayjs(app.startTime).format("YYYY-MM-DD HH:mm:ss"),
      end: dayjs(app.endTime).format("YYYY-MM-DD HH:mm:ss"),
      color: app.status === "cancelled" ? "red" : "green",
    }));
    setBookings(formatted);
  };

  const handleBookAppointment = async () => {
    if (!startTime || !endTime || !selectedCaregiver) return;

    // Validate that the chosen booking time matches the caregiver's availability days/hours
    const chosenDay = dayjs(startTime).day();
    const formattedStartStr = dayjs(startTime).format("HH:mm");
    const formattedEndStr = dayjs(endTime).format("HH:mm");

    const matchSlot = availability.find(
      (slot) =>
        slot.dayOfWeek === chosenDay &&
        formattedStartStr >= slot.startTime &&
        formattedEndStr <= slot.endTime,
    );

    if (!matchSlot) {
      alert(
        "Error: The selected time falls outside of this caregiver's working shifts!",
      );
      return;
    }

    try {
      await api.post("/appointments/book", {
        caregiverId: parseInt(selectedCaregiver, 10),
        clientId: user?.profileId, // Uses client's specific table ID from context
        startTime:
          startTime instanceof Date ? startTime.toISOString() : startTime,
        endTime: endTime instanceof Date ? endTime.toISOString() : endTime,
        notes,
      });
      setBookingModalOpen(false);
      setNotes("");
      setStartTime(null);
      setEndTime(null);
      alert("Appointment successfully booked!");
      fetchClientBookings(); // Refresh calendar events on successful completion
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Card withBorder mb='xl' radius='md'>
        <Text size='lg' fw={700} mb='sm'>
          Book a Caregiver
        </Text>
        <Group align='flex-end'>
          <Select
            label='Choose a Caregiver Profile'
            placeholder='Select from registered staff'
            data={caregivers}
            value={selectedCaregiver}
            onChange={setSelectedCaregiver}
            style={{ width: "300px" }}
          />
          <Button
            color='blue'
            disabled={!selectedCaregiver}
            onClick={() => setBookingModalOpen(true)}
          >
            Schedule an Appointment
          </Button>
        </Group>

        {/* Display Text Rules of availability blocks for clarity */}
        {availability.length > 0 && (
          <div style={{ marginTop: "15px" }}>
            <Text size='sm' fw={600} mb='xs'>
              Active Working Shifts:
            </Text>
            <Group gap='xs'>
              {availability.map((slot) => (
                <Badge key={slot.id} variant='light' color='indigo'>
                  {DAYS[slot.dayOfWeek]}: {slot.startTime} - {slot.endTime}
                </Badge>
              ))}
            </Group>
          </div>
        )}
      </Card>

      {/* Main Schedule Board displaying the Client's active bookings */}
      <Card withBorder p='md' radius='md'>
        <Text size='md' fw={700} mb='md'>
          My Live Appointment Calendar
        </Text>
        <Schedule
          events={bookings}
          dayViewProps={{
            startTime: "08:00:00",
            endTime: "18:00:00",
            intervalMinutes: 30,
          }}
          weekViewProps={{
            startTime: "08:00:00",
            endTime: "18:00:00",
            withWeekendDays: true,
          }}
          monthViewProps={{ withWeekNumbers: true, firstDayOfWeek: 0 }}
        />
      </Card>

      {/* Booking Overlay Modal */}
      <Modal
        opened={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title='Schedule New Shift Block'
      >
        <DateTimePicker
          label='Appointment Start Date & Time'
          value={startTime}
          onChange={setStartTime}
          mb='md'
          required
        />
        <DateTimePicker
          label='Appointment End Date & Time'
          value={endTime}
          onChange={setEndTime}
          mb='md'
          required
        />
        <Textarea
          label='Special Notes / Instructions'
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          mb='xl'
        />

        <Group justify='flex-end'>
          <Button variant='outline' onClick={() => setBookingModalOpen(false)}>
            Cancel
          </Button>
          <Button color='green' onClick={handleBookAppointment}>
            Confirm Booking
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
