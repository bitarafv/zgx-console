"use client";
import { useCallback,useEffect,useRef } from "react";
import { normalizeSimulationPath } from "@/lib/navigation";
type Theme="light"|"dark";
export function SimulationFrame({theme,path,onPathChange}:{theme:Theme;path:string;onPathChange:(path:string)=>void}){
 const base=process.env.NEXT_PUBLIC_ZGX_SIMULATION_URL??"/simulation",frame=useRef<HTMLIFrameElement>(null),route=normalizeSimulationPath(path);
 const source=`${base}${route==="/"?"":route}`;
 const sync=useCallback(()=>frame.current?.contentWindow?.postMessage({type:"zgx:set-theme",theme},window.location.origin),[theme]);
 useEffect(sync,[sync]);
 useEffect(()=>{const receive=(event:MessageEvent)=>{if(event.source!==frame.current?.contentWindow||event.origin!==window.location.origin)return;if(event.data?.type!=="zgx:simulation-route"||typeof event.data.path!=="string")return;onPathChange(normalizeSimulationPath(event.data.path))};window.addEventListener("message",receive);return()=>window.removeEventListener("message",receive)},[onPathChange]);
 return <section className="simulation-frame-shell" aria-label="Demo Display"><iframe ref={frame} className="simulation-frame" src={source} title="Demo Display" allow="clipboard-read; clipboard-write" onLoad={sync}/></section>;
}
