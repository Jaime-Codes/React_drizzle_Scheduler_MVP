import { Button, Card, Text, Group, ScrollArea, Badge } from "@mantine/core";
import dayjs from "dayjs";
import type { PendingRequest } from "../../views/CaregiverDashboard";

type Props = {
  pendingRequests: PendingRequest[];
  handleReviewAction: (
    id: number,
    action: "reject" | "approve",
  ) => Promise<void>;
};

const BookingRequests = ({ pendingRequests, handleReviewAction }: Props) => {
  return (
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
  );
};

export default BookingRequests;
