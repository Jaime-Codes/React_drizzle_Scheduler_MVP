import {
  Container,
  Title,
  Text,
  Card,
  SimpleGrid,
  Badge,
  Paper,
} from "@mantine/core";

const Home = () => {
  return (
    <Container size='lg' py={60}>
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <Badge size='lg' color='blue' variant='light' mb='md'>
          Project Status: MVP Prototype
        </Badge>
        <Title order={1} style={{ fontSize: "42px", fontWeight: 900 }} mb='sm'>
          Caregiver Scheduling Gateway
        </Title>
        <Text
          c='dimmed'
          size='lg'
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          A rapid proof-of-concept built to remove home care scheduling
          bottlenecks. Caregivers manage shifts; clients map exact service hour
          bookings.
        </Text>
      </div>

      <Paper
        withBorder
        p='xl'
        radius='md'
        bg='var(--mantine-color-blue-0)'
        mb={40}
      >
        <Title order={3} mb='xs' c='blue.9'>
          Fast-Track Testing (Pre-seeded Accounts)
        </Title>
        <Text size='sm' mb='md' c='blue.9'>
          Skip registration. Use these pre-loaded profiles to test interactions
          instantly: (see Readme)
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
          <Card withBorder p='sm' radius='md' bg='white'>
            <Text fw={700} size='sm' c='indigo'>
              🩺 Caregiver View Profile
            </Text>
            <Text size='xs' c='dimmed'>
              Email: <b>caregiver@test.com</b>
            </Text>
            <Text size='xs' c='dimmed'>
              Password: <b>password123</b>
            </Text>
          </Card>
          <Card withBorder p='sm' radius='md' bg='white'>
            <Text fw={700} size='sm' c='teal'>
              🏡 Client View Profile
            </Text>
            <Text size='xs' c='dimmed'>
              Email: <b>client@test.com</b>
            </Text>
            <Text size='xs' c='dimmed'>
              Password: <b>password123</b>
            </Text>
          </Card>
        </SimpleGrid>
      </Paper>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing='xl'>
        <Card shadow='sm' padding='lg' radius='md' withBorder>
          <Text fw={700} mb='xs' style={{ fontSize: "18px" }}>
            📅 Shift Windows
          </Text>
          <Text size='sm' c='dimmed'>
            Caregivers state flexible recurring shift availabilities inside an
            interactive overlay drawer menu control panel.
          </Text>
        </Card>
        <Card shadow='sm' padding='lg' radius='md' withBorder>
          <Text fw={700} mb='xs' style={{ fontSize: "18px" }}>
            🎟️ Chip Booking
          </Text>
          <Text size='sm' c='dimmed'>
            Clients select caregiver rows, view highlighted active workdays, and
            click distinct 1-hour chip intervals securely.
          </Text>
        </Card>
        <Card shadow='sm' padding='lg' radius='md' withBorder>
          <Text fw={700} mb='xs' style={{ fontSize: "18px" }}>
            ⚖️ Approval Loops
          </Text>
          <Text size='sm' c='dimmed'>
            Shifts default to pending parameters. Caregivers review contextual
            details, approving or rejecting them live.
          </Text>
        </Card>
      </SimpleGrid>
    </Container>
  );
};

export default Home;
