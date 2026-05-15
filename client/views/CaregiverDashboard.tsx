import { useEffect, useState } from "react";
import { Schedule } from "@mantine/schedule";
import {
  Card,
  Text,
  Button,
  Select,
  Group,
  SimpleGrid,
  Badge,
  ScrollArea,
  Drawer,
  Divider,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import dayjs from "dayjs";
import { useAuth } from "../src/hooks/auth";
import api from "../src/api";

interface ScheduleEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  color: string;
}

interface PendingRequest {
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

  // Availability Shift Form State
  const [dayOfWeek, setDayOfWeek] = useState<string | null>("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [availabilityList, setAvailabilityList] = useState<any[]>([]);
  const DAYS_MAP = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // Universal data fetcher for the workspace metrics
  const loadDashboardData = async () => {
    try {
      const appointmentsRes = await api.get(`/appointments`);
      // ... keep your existing approvedShifts / pendingShifts sorting logic exactly the same ...

      // ADD THIS: Fetch the logged-in caregiver's specific availability slots
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

  const handleSaveAvailability = async () => {
    try {
      await api.post("/availability/add", {
        caregiverId: user?.profileId,
        startTime,
        endTime,
      });
      setDrawerOpen(false);
      alert("Working shift hours registered successfully!");
    } catch (err) {
      console.error("Failed to commit availability mapping indexes:", err);
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    try {
      await api.delete(`/availability/slot/${slotId}`);
      alert("Slot removed!");
      loadDashboardData(); // Refresh the list automatically
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* SECTION 1: Top Dashboard Interaction Row */}
      <SimpleGrid cols={{ base: 1, md: 2 }} mb='xl' spacing='lg'>
        {/* Sub-Panel A: Inbound Request Management List */}
        <Card withBorder radius='md' p='md'>
          <Text size='md' fw={700} mb='sm'>
            Pending Booking Requests ({pendingRequests.length})
          </Text>
          <ScrollArea h={200} type='auto'>
            {pendingRequests.length === 0 ? (
              <Text c='dimmed' size='sm'>
                No incoming booking requests to review.
              </Text>
            ) : (
              pendingRequests.map((req) => (
                <Card
                  key={req.id}
                  withBorder
                  mb='xs'
                  p='sm'
                  radius='sm'
                  bg='var(--mantine-color-gray-0)'
                >
                  <Group justify='space-between' mb='xs'>
                    <Text size='sm' fw={600}>
                      Booking ID #{req.id}
                    </Text>
                    <Badge color='yellow'>Pending Review</Badge>
                  </Group>
                  <Text size='xs' c='dimmed'>
                    {dayjs(req.startTime).format("MMM D, YYYY")} from{" "}
                    {dayjs(req.startTime).format("HH:mm")} to{" "}
                    {dayjs(req.endTime).format("HH:mm")}
                  </Text>
                  {req.notes && (
                    <Text
                      size='xs'
                      mt='xs'
                      style={{ fontStyle: "italic" }}
                      c='dimmed'
                    >
                      Notes: "{req.notes}"
                    </Text>
                  )}
                  <Group justify='flex-end' mt='md' gap='xs'>
                    <Button
                      color='red'
                      size='xs'
                      variant='light'
                      onClick={() => handleReviewAction(req.id, "reject")}
                    >
                      Reject
                    </Button>
                    <Button
                      color='green'
                      size='xs'
                      onClick={() => handleReviewAction(req.id, "approve")}
                    >
                      Approve Shift
                    </Button>
                  </Group>
                </Card>
              ))
            )}
          </ScrollArea>
        </Card>

        {/* Sub-Panel B: Profile & Profile Action Controls */}
        <Card
          withBorder
          radius='md'
          p='md'
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Text size='xs' c='dimmed' fw={700}>
              CAREGIVER METRICS
            </Text>
            <Text size='xl' fw={700}>
              Welcome back, {user?.name}!
            </Text>
            <Text size='sm' c='dimmed' mt='xs'>
              Review clients scheduling choices on the left sidebar pane, or
              click below to adjust your active work hours.
            </Text>
          </div>
          <Button
            color='indigo'
            fullWidth
            mt='md'
            onClick={() => setDrawerOpen(true)}
          >
            Manage My Recurring Shifts
          </Button>
        </Card>
      </SimpleGrid>

      {/* SECTION 2: Master Working Calendar Schedule Grid */}
      <Card withBorder p='md' radius='md'>
        <Text size='md' fw={700} mb='md'>
          My Working Calendar Schedule
        </Text>
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
          monthViewProps={{ withWeekNumbers: true, firstDayOfWeek: 0 }}
        />
      </Card>

      {/* SECTION 3: Sliding Sidebar Menu for setting standard working shifts */}
      <Drawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title='Manage Availability & Shifts'
        padding='md'
        position='right'
      >
        {/* A. VIEW EXISTING SLOTS */}
        <Text size='sm' fw={700} mb='xs' c='dimmed'>
          YOUR CURRENT SCHEDULE:
        </Text>
        <ScrollArea
          h={150}
          mb='lg'
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "10px",
          }}
        >
          {availabilityList.length === 0 ? (
            <Text size='xs' c='dimmed' p='xs'>
              No standard hours set yet. You will show up as unavailable to
              clients.
            </Text>
          ) : (
            availabilityList.map((slot) => (
              <Group
                justify='space-between'
                key={slot.id}
                mb='xs'
                p='xs'
                style={{ background: "#f8f9fa", borderRadius: "4px" }}
              >
                <div>
                  <Text size='sm' fw={500}>
                    {DAYS_MAP[slot.dayOfWeek]}
                  </Text>
                  <Text size='xs' c='dimmed'>
                    {slot.startTime} - {slot.endTime}
                  </Text>
                </div>
                <Button
                  color='red'
                  variant='light'
                  size='compact-xs'
                  onClick={() => handleDeleteSlot(slot.id)}
                >
                  Remove
                </Button>
              </Group>
            ))
          )}
        </ScrollArea>

        <Divider my='md' label='Add New Shift Block' labelPosition='center' />

        {/* B. ADD NEW SLOTS FORM */}
        <Select
          label='Day of Week'
          value={dayOfWeek}
          onChange={setDayOfWeek}
          data={[
            { value: "0", label: "Sunday" },
            { value: "1", label: "Monday" },
            { value: "2", label: "Tuesday" },
            { value: "3", label: "Wednesday" },
            { value: "4", label: "Thursday" },
            { value: "5", label: "Friday" },
            { value: "6", label: "Saturday" },
          ]}
          mb='md'
        />
        <TimeInput
          label='Shift Start Time'
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          mb='md'
          required
        />
        <TimeInput
          label='Shift End Time'
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          mb='xl'
          required
        />

        <Group justify='flex-end'>
          <Button variant='outline' onClick={() => setDrawerOpen(false)}>
            Close
          </Button>
          <Button color='green' onClick={handleSaveAvailability}>
            Add Shift Block
          </Button>
        </Group>
      </Drawer>
    </div>
  );
}
