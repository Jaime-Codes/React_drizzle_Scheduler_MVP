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
  Chip,
  SimpleGrid,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
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
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "17:00"
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [caregivers, setCaregivers] = useState<CaregiverOption[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<string | null>(
    null,
  );
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableHourSlots, setAvailableHourSlots] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<string[]>([]); // Tracks array of picked hours (e.g. ["09:00", "10:00"])
  const [notes, setNotes] = useState("");

  useEffect(() => {
    api.get("/clients/caregivers-list").then((res) => setCaregivers(res.data));
    fetchClientBookings();
  }, [user]);

  useEffect(() => {
    if (selectedCaregiver) {
      api.get(`/availability/caregiver/${selectedCaregiver}`).then((res) => {
        setAvailability(res.data);
      });
    }
  }, [selectedCaregiver]);

  useEffect(() => {
    if (!selectedDate || availability.length === 0) {
      setAvailableHourSlots([]);
      return;
    }

    const dayOfWeek = dayjs(selectedDate).day();
    const matchingRules = availability.filter(
      (slot) => slot.dayOfWeek === dayOfWeek,
    );

    const dynamicHours: string[] = [];

    matchingRules.forEach((rule) => {
      const startHour = parseInt(rule.startTime.split(":")[0], 10);
      const endHour = parseInt(rule.endTime.split(":")[0], 10);

      // Loop through working blocks in 1-hour chunks
      for (let h = startHour; h < endHour; h++) {
        const formattedHour = `${String(h).padStart(2, "0")}:00`;
        dynamicHours.push(formattedHour);
      }
    });

    setAvailableHourSlots(dynamicHours);
    setSelectedHours([]); // Reset selected inputs on date shift
  }, [selectedDate, availability]);

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
    if (!selectedDate || selectedHours.length === 0 || !selectedCaregiver) {
      alert("Please select at least one hour block.");
      return;
    }

    const sortedHours = [...selectedHours].sort((a, b) => a.localeCompare(b));
    const firstHour = parseInt(sortedHours[0].split(":")[0], 10);
    const lastHour = parseInt(
      sortedHours[sortedHours.length - 1].split(":")[0],
      10,
    );

    const baseDateStr = dayjs(selectedDate).format("YYYY-MM-DD");
    const finalStartISO = dayjs(
      `${baseDateStr} ${String(firstHour).padStart(2, "0")}:00:00`,
    ).toISOString();
    const finalEndISO = dayjs(
      `${baseDateStr} ${String(lastHour + 1).padStart(2, "0")}:00:00`,
    ).toISOString();

    try {
      await api.post("/appointments/book", {
        caregiverId: parseInt(selectedCaregiver, 10),
        clientId: user?.profileId,
        startTime: finalStartISO,
        endTime: finalEndISO,
        notes,
      });

      setBookingModalOpen(false);
      setNotes("");
      setSelectedHours([]);
      alert("Appointment requested! Status is pending caregiver review.");
      fetchClientBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const getDayProps = (date: string) => {
    const parsedDayjsInstance = dayjs(date);
    const dayOfWeek = parsedDayjsInstance.day();
    const hasAvailability = availability.some(
      (slot) => slot.dayOfWeek === dayOfWeek,
    );

    if (hasAvailability) {
      return {
        style: {
          backgroundColor: "var(--mantine-color-blue-1)",
          color: "var(--mantine-color-blue-9)",
          fontWeight: 700,
          borderRadius: "100%",
        },
      };
    }

    return {};
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
            Open Scheduler Panel
          </Button>
        </Group>
      </Card>

      <Card withBorder p='md' radius='md'>
        <Text size='md' fw={700} mb='md'>
          My Live Appointment Calendar
        </Text>
        <Schedule events={bookings} />
      </Card>

      {/* Modern Time-Increment Booking Modal */}
      <Modal
        opened={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title='Select Available Shift Increments'
        size='lg'
      >
        <DateInput
          label='Choose Date'
          placeholder='Pick appointment date'
          value={selectedDate}
          //@ts-ignore
          onChange={setSelectedDate}
          minDate={new Date()}
          mb='md'
          required
          getDayProps={getDayProps}
        />

        <Text size='sm' fw={500} mb='xs'>
          Available Hourly Blocks for this Day:
        </Text>

        {availableHourSlots.length === 0 ? (
          <Text size='xs' c='red' mb='md'>
            The caregiver has not declared availability for this day of the
            week.
          </Text>
        ) : (
          <Chip.Group
            multiple
            value={selectedHours}
            onChange={setSelectedHours}
          >
            <SimpleGrid cols={4} spacing='xs' mb='md'>
              {availableHourSlots.map((hour) => {
                const hourNum = parseInt(hour.split(":")[0], 10);
                const nextHourStr = `${String(hourNum + 1).padStart(2, "0")}:00`;
                return (
                  <Chip key={hour} value={hour} variant='filled' color='blue'>
                    {hour} - {nextHourStr}
                  </Chip>
                );
              })}
            </SimpleGrid>
          </Chip.Group>
        )}

        <Textarea
          label='Special Notes / Care Instructions'
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          mb='xl'
        />

        <Group justify='flex-end'>
          <Button variant='outline' onClick={() => setBookingModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color='green'
            onClick={handleBookAppointment}
            disabled={selectedHours.length === 0}
          >
            Submit Booking Request
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
