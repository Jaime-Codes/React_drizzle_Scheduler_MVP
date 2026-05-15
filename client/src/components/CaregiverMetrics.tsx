import { Button, Card, Text } from "@mantine/core";
import type { User } from "../hooks/auth";

type Props = {
  user: User;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const CaregiverMetrics = ({ user, setDrawerOpen }: Props) => {
  return (
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
          Review clients scheduling choices on the left sidebar pane, or click
          below to adjust your active work hours.
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
  );
};

export default CaregiverMetrics;
