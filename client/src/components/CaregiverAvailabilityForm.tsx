import { useState } from "react";
import { Button, Select } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import api from "../api";

export function CaregiverAvailabilityForm({
  caregiverId,
}: {
  caregiverId: number;
}) {
  const [day, setDay] = useState<string | null>("1");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");

  const handleSaveAvailability = async () => {
    console.log("states go here", day, start, end);
    if (!start || !end) return;
    console.log("states go here!!!!");
    await api.post("/availability/add", {
      caregiverId,
      dayOfWeek: parseInt(day || "1"),
      startTime: start,
      endTime: end,
    });
    alert("Working hours added!");
  };

  return (
    <div>
      <Select
        label='Select Day of Week'
        value={day}
        onChange={setDay}
        data={[
          { value: "1", label: "Monday" },
          { value: "2", label: "Tuesday" },
          { value: "3", label: "Wednesday" },
          { value: "4", label: "Thursday" },
          { value: "5", label: "Friday" },
        ]}
        mb='sm'
      />
      <TimeInput
        label='Shift Start Time'
        value={start}
        onChange={(e) => setStart(e.target.value)}
        mb='sm'
      />
      <TimeInput
        label='Shift End Time'
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        mb='md'
      />
      <Button onClick={handleSaveAvailability} color='green' fullWidth>
        Set Availability
      </Button>
    </div>
  );
}
