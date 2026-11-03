import HackathonTimerProvider from "@/components/hackathon-timer/HackathonTimerProvider";
import HackathonTimerControls from "@/components/admin/HackathonTimerControls";

export default function AdminTimerPage() {
  return (
    <HackathonTimerProvider>
      <HackathonTimerControls />
    </HackathonTimerProvider>
  );
}
