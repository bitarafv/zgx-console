import { DashboardWorkspace } from "../../components/DashboardWorkspace";

/** Independent read-only monitor; never grants an admin capability. */
export default function MonitorPage() {
  return <main><DashboardWorkspace monitorOnly/></main>;
}
