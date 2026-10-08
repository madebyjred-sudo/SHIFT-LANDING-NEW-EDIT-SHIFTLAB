"use client";

import AutoplayLoopVideo from "@/components/common/AutoplayLoopVideo";

export default function HomeInfluenceBackgroundVideo() {
  return (
    <AutoplayLoopVideo
      src="/assets/videos/home/EQUIPO TRABAJANDO FULL_compressed.mp4"
      mimeType="video/mp4"
      poster="/assets/images/influence/banner.webp"
      ariaLabel="Video de influencia con equipo de trabajo"
    />
  );
}
