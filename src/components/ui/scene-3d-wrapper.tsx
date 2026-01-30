"use client";

import dynamic from "next/dynamic";

// Dynamically import 3D scene to avoid SSR issues
const Scene3D = dynamic(
  () => import("./scene-3d").then((mod) => mod.Scene3D),
  { ssr: false }
);

export function Scene3DWrapper() {
  return <Scene3D />;
}
