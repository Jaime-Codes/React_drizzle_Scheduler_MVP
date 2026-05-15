import { useEffect, useState } from "react";
import { SimpleGrid } from "@mantine/core";
import dayjs from "dayjs";
import { useAuth } from "../src/hooks/auth";
import api from "../src/api";
import BookingRequests from "../src/components/BookingRequests";
import CaregiverMetrics from "../src/components/CaregiverMetrics";
import CaregiverDrawer from "../src/components/CaregiverDrawer";
import Calendar from "../src/components/Calendar";

export interface ScheduleEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  color: string;
}

export interface PendingRequest {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  clientName?: string;
}

export default function CaregiverDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [availabilityList, setAvailabilityList] = useState<any[]>([]);

  const loadDashboardData = async () => {
    try {
      const appointmentsRes = await api.get(`/appointments`);
      const rawAppointments = appointmentsRes.data;

      const approvedShifts = rawAppointments.filter(
        (app: any) => app.status !== "pending",
      );
      const pendingShifts = rawAppointments.filter(
        (app: any) => app.status === "pending",
      );

      const formattedCalendarEvents = approvedShifts.map((app: any) => ({
        id: app.id,
        title: app.clientName
          ? `Shift with ${app.clientName}`
          : app.status === "cancelled"
            ? `cancelled Block #${app.id}`
            : `approvedBlock #${app.id}`,
        start: dayjs(app.startTime).format("YYYY-MM-DD HH:mm:ss"),
        end: dayjs(app.endTime).format("YYYY-MM-DD HH:mm:ss"),
        color: app.status === "cancelled" ? "red" : "green",
      }));

      setEvents(formattedCalendarEvents);
      setPendingRequests(pendingShifts);

      if (user?.profileId) {
        const availabilityRes = await api.get(
          `/availability/caregiver/${user.profileId}`,
        );
        setAvailabilityList(availabilityRes.data);
      }
    } catch (err) {
      console.error("Dashboard refresh error:", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Handles approving or rejecting appointment rows
  const handleReviewAction = async (
    id: number,
    action: "approve" | "reject",
  ) => {
    try {
      await api.patch(`/appointments/${id}/review`, { action });
      alert(`Shift block successfully resolved as ${action}d!`);
      loadDashboardData();
    } catch (err) {
      console.error("Review action state submission crash:", err);
    }
  };
  if (!user) return;
  return (
    <div style={{ padding: "20px" }}>
      <SimpleGrid cols={{ base: 1, md: 2 }} mb='xl' spacing='lg'>
        <BookingRequests
          pendingRequests={pendingRequests}
          handleReviewAction={handleReviewAction}
        />
        <CaregiverMetrics user={user} setDrawerOpen={setDrawerOpen} />
      </SimpleGrid>
      <Calendar events={events} setEvents={setEvents} />
      <CaregiverDrawer
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        availabilityList={availabilityList}
        loadDashboardData={loadDashboardData}
        user={user}
      />
    </div>
  );
}
