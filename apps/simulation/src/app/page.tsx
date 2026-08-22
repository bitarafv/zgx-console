"use client";

import { motion } from "framer-motion";
import { Check, Cpu, Network } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-provider";
import type { Platform } from "@/lib/types";

const platforms = [
  { id: "nano" as Platform, label: "HP ZGX Nano", subtitle: "AI development and experimentation", detail: "For local prototyping, model exploration, fine-tuning, and focused AI development workflows.", icon: Cpu },
  { id: "fury" as Platform, label: "HP ZGX Fury", subtitle: "Departmental AI development and production", detail: "For frontier-class models, production inference, agents, and multiple concurrent users—subject to workload validation.", icon: Network },
];

export default function Home() {
  const { selection, setSelection } = useApp();
  const router = useRouter();
  const selectPlatform = (platform: Platform) => { setSelection({ platform }); router.push(`/${platform}/markets`); };
  return <>
    <section className="shell relative overflow-hidden pb-8 pt-10 text-center lg:pt-14">
      <div className="grid-lines absolute inset-x-0 top-0 -z-10 h-full opacity-40"/>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow">Interactive AI solution explorer</p>
        <h1 className="gradient-text mx-auto mt-3 max-w-3xl text-3xl font-black leading-[1.04] tracking-[-.045em] md:text-[42px]">See what AI could look like in your organization.</h1>
        <p className="muted mx-auto mt-4 max-w-2xl leading-7">Choose a local AI platform, select an industry, and explore an interactive software experience.</p>
      </motion.div>
    </section>

    <section className="shell">
      <div className="grid gap-4 lg:grid-cols-2">
        {platforms.map((item, index) => <motion.button key={item.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 + index * .07 }} onClick={() => selectPlatform(item.id)} className={`panel relative overflow-hidden rounded-2xl p-5 text-left transition ${selection?.platform === item.id ? "border-blue-500 ring-2 ring-blue-500/20" : "hover:-translate-y-1"}`}>
          <div className="absolute -right-14 -top-14 size-48 rounded-full bg-blue-500/10 blur-3xl"/>
          <div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500"><item.icon size={20}/></span>{selection?.platform === item.id && <span className="grid size-7 place-items-center rounded-full bg-blue-600 text-white"><Check size={15}/></span>}</div>
          <p className="mt-5 text-xs font-bold text-blue-500">{item.subtitle}</p>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight">{item.label}</h2>
          <p className="muted mt-2.5 max-w-lg text-sm leading-6">{item.detail}</p>
        </motion.button>)}
      </div>
    </section>
  </>;
}
