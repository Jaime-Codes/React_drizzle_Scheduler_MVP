import { useState } from "react";
import { Button, Textarea } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import api from "../api";

export function ClientBookingForm({
  caregiverId,
  clientId,
}: {
  caregiverId: number;
  clientId: number;
}) {
  const [start, setStart] = useState<Date | string | null>(null);
  const [end, setEnd] = useState<Date | string | null>(null);
  const [notes, setNotes] = useState("");

  const handleBook = async () => {
    if (!start || !end) return;
    await api.post("/appointments/book", {
      caregiverId,
      clientId,
      startTime: start instanceof Date ? start.toISOString() : start,
      endTime: end instanceof Date ? end.toISOString() : end,
      notes,
    });
    alert("Appointment booked!");
  };

  return (
    <div>
      <DateTimePicker
        label='Pick Start Date & Time'
        value={start}
        onChange={setStart}
        mb='sm'
      />
      <DateTimePicker
        label='Pick End Date & Time'
        value={end}
        onChange={setEnd}
        mb='sm'
      />
      <Textarea
        label='Special Notes'
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        mb='md'
      />
      <Button onClick={handleBook} fullWidth>
        Request Appointment
      </Button>
    </div>
  );
}
