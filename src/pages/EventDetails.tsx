import { Navigation } from "@/components/Navigation";
import { useParams } from "react-router-dom";

const EventDetails = () => {
  const { id } = useParams();

  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">تفاصيل الفعالية {id}</h1>
        {/* سيتم إضافة تفاصيل الفعالية لاحقاً */}
        <div className="text-center text-gray-500">
          سيتم إضافة تفاصيل الفعالية قريباً
        </div>
      </div>
    </div>
  );
};

export default EventDetails;