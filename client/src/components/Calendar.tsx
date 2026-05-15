import { useEffect, useState } from "react";
import { Schedule } from "@mantine/schedule";
import dayjs from "dayjs";
import api from "../api";
import { useAuth } from "../hooks/auth";

interface BackendAppointment {
  id: number;
  caregiverId: number;
  clientId: number;
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  notes: string | null;
  clientName?: string;
}

interface ScheduleEvent {
  id: number;
  title: string;
  start: string; // Must format to: "YYYY-MM-DD HH:mm:ss"
  end: string; // Must format to: "YYYY-MM-DD HH:mm:ss"
  color: string;
}

type Props = {
  events: ScheduleEvent[];
  setEvents: React.Dispatch<React.SetStateAction<ScheduleEvent[]>>;
};

const Calendar = ({ events, setEvents }: Props) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAndFormatAppointments() {
      try {
        const res = await api.get(`/appointments`);
        const rawAppointments: BackendAppointment[] = res.data;

        // 2. Map backend columns directly to your Mantine view specs
        const formattedEvents = rawAppointments.map((app): ScheduleEvent => {
          let eventColor = "blue";
          if (app.status === "cancelled") eventColor = "red";
          if (app.status === "completed") eventColor = "green";
          if (app.status === "no_show") eventColor = "orange";

          return {
            id: app.id,
            title: app.notes || `Shift Booking #${app.id}`,
            // DayJS parsing transforms ISO database text directly into required schedule text format
            start: dayjs(app.startTime).format("YYYY-MM-DD HH:mm:ss"),
            end: dayjs(app.endTime).format("YYYY-MM-DD HH:mm:ss"),
            color: eventColor,
          };
        });

        setEvents(formattedEvents);
      } catch (err) {
        console.error("Failed to load schedule items:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAndFormatAppointments();
  }, [user]);

  if (loading) return <div>Syncing Schedule Data...</div>;

  return (
    <Schedule
      events={events}
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
      monthViewProps={{
        withWeekNumbers: true,
        firstDayOfWeek: 0,
      }}
      yearViewProps={{
        withWeekNumbers: true,
      }}
    />
  );
};

export default Calendar;
