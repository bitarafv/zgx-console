"use client";
import {useEffect} from "react";

const telemetryPath="/api/telemetry/event";
const optOutKey="zgx-analytics-disabled";

function applyPreference(){
 try{
  const url=new URL(window.location.href),preference=url.searchParams.get("analytics");
  if(preference==="off"){localStorage.setItem(optOutKey,"true");localStorage.removeItem("zgx-analytics-visitor");sessionStorage.removeItem("zgx-analytics-page-view")}
  if(preference==="on")localStorage.removeItem(optOutKey);
  if(preference==="off"||preference==="on"){url.searchParams.delete("analytics");window.history.replaceState(null,"",url.pathname+url.search+url.hash)}
 }catch{}
}

function disabled(){
 try{return localStorage.getItem(optOutKey)==="true"}catch{return false}
}

function visitorId(){
 try{const key="zgx-analytics-visitor";let id=localStorage.getItem(key);if(!id){id=crypto.randomUUID();localStorage.setItem(key,id)}return id}catch{return undefined}
}

function emit(event:string,tab:string,dwellMs?:number,interaction?:{category:string;item:string;context?:string}){
 if(disabled())return;
 if(location.pathname==="/admin"||location.pathname.startsWith("/admin/"))return;
 const payload=JSON.stringify({event,tab,dwellMs,visitorId:visitorId(),path:location.pathname+location.hash,referrer:document.referrer,...interaction});
 if(event==="tab_dwell"&&navigator.sendBeacon){navigator.sendBeacon(telemetryPath,new Blob([payload],{type:"text/plain"}));return}
 void fetch(telemetryPath,{method:"POST",headers:{"content-type":"text/plain"},body:payload,keepalive:true,credentials:"omit"}).catch(()=>{});
}
export function trackZgxInteraction(tab:string,category:string,item:string,context?:string){
 if(!category||!item)return;
 emit("interaction",tab,undefined,{category,item,context});
}

export function useZgxTelemetry(tab:string,enabled=true){
 useEffect(()=>{if(enabled)applyPreference()},[enabled]);
 useEffect(()=>{if(!enabled)return;try{if(!sessionStorage.getItem("zgx-analytics-page-view")){sessionStorage.setItem("zgx-analytics-page-view","1");emit("page_view",tab)}}catch{emit("page_view",tab)}},[tab,enabled]);
 useEffect(()=>{if(!enabled)return;const started=Date.now();emit("tab_view",tab);return()=>emit("tab_dwell",tab,Date.now()-started)},[tab,enabled]);
 useEffect(()=>{if(!enabled)return;const timer=window.setInterval(()=>emit("heartbeat",tab),60000);return()=>window.clearInterval(timer)},[tab,enabled]);
}
