import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import StaffDashboard from "./staff-dashboard";
export const dynamic="force-dynamic";
export default async function StaffPage(){const session=await getSession();if(!session)redirect("/staff/login");return <StaffDashboard name={session.name} role={session.role}/>;}