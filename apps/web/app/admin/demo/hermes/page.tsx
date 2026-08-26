"use client";

import { FormEvent, useRef, useState } from "react";
import styles from "./styles.module.css";

const OFFLINE_MESSAGE = "The Admin has to launch the app for the local AI to work.";
const initialLines = [
  "Hermes Agent Local · Browser TUI",
  "Siva workspace: /workspace/hermes",
  "Model: nvidia/Qwen3.6-35B-A3B-NVFP4 (offline in demo)",
  "",
  "Welcome. Explore the interface or enter a prompt below.",
];
const demoFiles = [
  ["README.md", "3.2 KB"],
  ["research-notes.md", "8.7 KB"],
  ["tasks", "folder"],
  ["exports", "folder"],
] as const;

export default function HermesDemoPage() {
  const [lines, setLines] = useState(initialLines);
  const [prompt, setPrompt] = useState("");
  const [filesOpen, setFilesOpen] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [toast, setToast] = useState("");
  const timer = useRef<number | undefined>(undefined);

  function notify() {
    setToast(OFFLINE_MESSAGE);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(""), 3200);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = prompt.trim();
    if (!value) return;
    setLines(current => [...current, "", `❯ ${value}`, "[DEMO] Request intercepted — local model is offline."]);
    setPrompt("");
    notify();
  }

  return <main className={styles.shell}>
    <div className={styles.demoBar}><b>DEMO</b><span>Demo Mode — Local AI models are offline.</span></div>
    <header className={styles.toolbar}>
      <div className={styles.identity}><span className={styles.mark}>H</span><div><strong>Hermes Agent Local</strong><small>Browser TUI · Interactive preview</small></div></div>
      <span className={styles.status}><i/>Demo · model offline</span>
      <button type="button" className={selecting ? styles.active : ""} onClick={() => setSelecting(value => !value)}>{selecting ? "Selecting text" : "Select text"}</button>
      <button type="button" onClick={() => void navigator.clipboard?.writeText(lines.join("\n"))}>Copy output</button>
      <button type="button" className={filesOpen ? styles.active : ""} aria-expanded={filesOpen} onClick={() => setFilesOpen(value => !value)}>Files</button>
      <button type="button" className={styles.close} onClick={() => window.close()}>Close TUI</button>
    </header>
    {filesOpen && <section className={styles.files}><div className={styles.filesHead}><strong>Hermes sandbox</strong><span>Demo workspace</span><button type="button" onClick={notify}>Refresh</button></div><div className={styles.fileList}>{demoFiles.map(([name, size]) => <button type="button" key={name} onClick={notify}><span>{size === "folder" ? "▸" : "·"} {name}</span><small>{size}</small><em>DEMO</em></button>)}</div></section>}
    <section className={`${styles.terminal} ${selecting ? styles.selecting : ""}`} aria-label="Hermes demo terminal">
      <div className={styles.terminalHead}><span>hermes@zgx-nano</span><span>local session</span></div>
      <pre>{lines.join("\n")}</pre>
      <form onSubmit={submit}><label htmlFor="hermes-demo-prompt">❯</label><input id="hermes-demo-prompt" autoFocus autoComplete="off" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="Ask Hermes to research, plan, or create…"/><button type="submit">Send</button></form>
    </section>
    <footer className={styles.footer}><span><i/>Interface online</span><span>Inference intercepted</span><span>Nothing leaves this browser</span><b>DEMO</b></footer>
    {toast && <div className={styles.toast} role="status">{toast}</div>}
  </main>;
}
