import type { ApiHealthResponse } from "@parkease/contracts";

const bootHealth: ApiHealthResponse = {
  status: "ok",
  timestamp: new Date().toISOString(),
};

export function App() {
  return (
    <main>
      <h1>ParkEase</h1>
      <p>Smart Parking Reservation System</p>
      <p data-testid="boot-health">Shell status: {bootHealth.status}</p>
    </main>
  );
}
