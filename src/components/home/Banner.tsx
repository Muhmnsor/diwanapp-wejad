import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Banner {
  desktop_image: string;
  mobile_image: string;
}

export const Banner = () => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const fetchBanner = async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('desktop_image, mobile_image')
        .eq('active', true)
        .single();

      if (error) {
        console.error('Error fetching banner:', error);
        return;
      }

      if (data) {
        setBanner(data);
      }
    };

    fetchBanner();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!banner) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mb-8">
      <img
        src={isMobile ? banner.mobile_image : banner.desktop_image}
        alt="Banner"
        className="w-full h-auto rounded-lg shadow-lg"
      />
    </div>
  );
};