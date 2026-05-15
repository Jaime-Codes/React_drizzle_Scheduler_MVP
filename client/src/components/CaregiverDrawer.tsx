import {
  Text,
  Button,
  Select,
  Group,
  ScrollArea,
  Drawer,
  Divider,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useState, type SetStateAction } from "react";
import api from "../api";
import { type User } from "../hooks/auth";

type Props = {
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<SetStateAction<boolean>>;
  availabilityList: any[];
  loadDashboardData: () => Promise<void>;
  user: User;
};

const CaregiverDrawer = ({
  drawerOpen,
  setDrawerOpen,
  availabilityList,
  loadDashboardData,
  user,
}: Props) => {
  const [dayOfWeek, setDayOfWeek] = useState<string | null>("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const handleSaveAvailability = async () => {
    try {
      await api.post("/availability/add", {
        caregiverId: user?.profileId,
        dayOfWeek,
        startTime,
        endTime,
      });
      alert("Working shift hours registered successfully!");
      loadDashboardData();
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
  const DAYS_MAP = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return (
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
  );
};

export default CaregiverDrawer;
