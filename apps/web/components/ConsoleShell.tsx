"use client";
import { useState, useSyncExternalStore } from "react";
import { Calculator,Cpu,GraduationCap,LayoutDashboard } from "lucide-react";
import { SimulationFrame } from "./SimulationFrame"; import { DashboardWorkspace } from "./DashboardWorkspace"; import { EnterpriseInsights } from "./EnterpriseInsights"; import { TcoCalculator } from "./TcoCalculator";
const tabs=[{id:"simulation",number:"01",label:"Simulation Dashboard",icon:LayoutDashboard},{id:"node",number:"02",label:"ZGX Node",icon:Cpu},{id:"insights",number:"03",label:"Enterprise AI Insights",icon:GraduationCap},{id:"tco",number:"04",label:"TCO Calculator",icon:Calculator}] as const;
type TabId=(typeof tabs)[number]["id"];
const hashSnapshot=()=>window.location.hash.slice(1);
const emptyHash=()=>"";
function subscribeHash(notify:()=>void){window.addEventListener("hashchange",notify);window.addEventListener("popstate",notify);return()=>{window.removeEventListener("hashchange",notify);window.removeEventListener("popstate",notify)}}
export function ConsoleShell({initialTab="simulation",adminView=false}:{initialTab?:TabId;adminView?:boolean}){
 const hash=useSyncExternalStore(subscribeHash,hashSnapshot,emptyHash);
 const[selected,setTab]=useState<TabId>(initialTab);
 const tab=tabs.find(item=>item.id===hash)?.id??selected;
 function select(id:TabId){setTab(id);window.history.replaceState(window.history.state,"",`#${id}`);window.dispatchEvent(new Event("hashchange"))}
 return <main className="shell"><header className="topbar"><a className="brand" href="#simulation" onClick={()=>select("simulation")}><span className="brand-mark">Z</span><span><strong>ZGX Console</strong><small>Personal AI infrastructure</small></span></a><span className="nano-pill"><i/> {adminView?"Authorized admin":"ZGX Console"}</span></header><nav className="tabs" aria-label="ZGX Console sections">{tabs.map(item=><button key={item.id} className={tab===item.id?"active":""} onClick={()=>select(item.id)} aria-current={tab===item.id?"page":undefined}><b>{item.number}</b><item.icon size={17}/><span>{item.label}</span></button>)}</nav><section className="page" key={tab}>{tab==="simulation"&&<SimulationFrame/>}{tab==="node"&&<DashboardWorkspace adminView={adminView}/>}  {tab==="insights"&&<EnterpriseInsights/>}{tab==="tco"&&<TcoCalculator/>}</section></main>
}
