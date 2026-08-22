import { ConsoleShell } from "@/components/ConsoleShell";
import { isAdmin } from "@/lib/runtime";
export default async function AdminPage(){return <ConsoleShell initialTab="node" adminView={await isAdmin()}/>}
