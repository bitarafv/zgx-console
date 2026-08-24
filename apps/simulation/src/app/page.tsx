"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-provider";
import type { Platform } from "@/lib/types";
import nanoImage from "./products/zgx-nano.png";
import furyImage from "./products/zgx-fury.png";

const platforms = [
  { id: "nano" as Platform, label: "HP ZGX Nano", subtitle: "AI development and experimentation", detail: "Prototype, fine-tune, and validate substantial AI models locally in an extraordinarily compact footprint.", image: nanoImage, imageClass: "nano" },
  { id: "fury" as Platform, label: "HP ZGX Fury", subtitle: "Departmental AI development and production", detail: "Scale to frontier-class models, production inference, agents, and concurrent departmental workloads.", image: furyImage, imageClass: "fury" },
];

export default function Home() {
  const { selection, setSelection } = useApp();
  const router = useRouter();
  const selectPlatform = (platform: Platform) => { setSelection({ platform }); router.push(`/${platform}/markets`); };
  return <>
    <section className="shell relative overflow-hidden pb-9 pt-10 text-center lg:pt-14">
      <div className="grid-lines absolute inset-x-0 top-0 -z-10 h-full opacity-40"/>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow">Interactive AI solution explorer</p>
        <h1 className="gradient-text mx-auto mt-3 max-w-3xl text-3xl font-black leading-[1.04] tracking-[-.045em] md:text-[42px]">See what AI could look like in your organization.</h1>
        <p className="muted mx-auto mt-4 max-w-2xl leading-7">Choose a local AI platform, select an industry, and explore an interactive software experience.</p>
      </motion.div>
    </section>

    <section className="shell">
      <div className="platform-grid grid gap-5 lg:grid-cols-2">
        {platforms.map((item, index) => <motion.button key={item.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 + index * .07 }} onClick={() => selectPlatform(item.id)} className={`platform-card panel relative overflow-hidden rounded-2xl text-left transition ${selection?.platform === item.id ? "selected" : "hover:-translate-y-1"}`}>
          <div className="platform-glow"/>
          <div className="platform-visual"><Image src={item.image} sizes="(max-width: 1024px) 92vw, 570px" alt={`${item.label} AI station`} priority={index===0} className={item.imageClass}/></div>
          <div className="platform-copy">
            {selection?.platform === item.id && <span className="platform-check" aria-label="Selected"><Check size={15}/></span>}
            <p className="platform-subtitle">{item.subtitle}</p>
            <h2>{item.label}</h2>
            <p className="muted platform-detail">{item.detail}</p>
            <span className="platform-cta">Explore {item.id === "nano" ? "focused" : "departmental"} solutions <span aria-hidden>→</span></span>
          </div>
        </motion.button>)}
      </div>
    </section>
  </>;
}
