"use client";

import { useEffect } from "react";
import type { Platform } from "@/lib/types";
import { useApp } from "./app-provider";

export function PlatformSelectionSync({ platform }: { platform: Platform }) {
  const { selection, setSelection } = useApp();
  useEffect(() => { if (selection?.platform !== platform) setSelection({ platform }); }, [platform, selection?.platform, setSelection]);
  return null;
}
