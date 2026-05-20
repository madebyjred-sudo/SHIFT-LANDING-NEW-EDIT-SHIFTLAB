

import SectorsNewsroomInnerSection from "./_/SectorsNewsroomInnerSection";
import SectorsKeepReadingSection from "./_/SectorsKeepReadingSection";
import NewsroomInnerBannerSection from "./_/NewsroomInnerBannerSection";

export default function NewsroomInnerPage() {
  return (
    <main className="overflow-x-hidden">
      <NewsroomInnerBannerSection />
      <SectorsNewsroomInnerSection />
      <SectorsKeepReadingSection />
    </main>
  );
}
