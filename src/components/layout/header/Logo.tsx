import { useNavigate } from "react-router-dom";
export const Logo = () => {
  const navigate = useNavigate();
  return <div dir="rtl" className="flex justify-start w-full px-0 py-[27px] my-0 mx-[12px]">
      <img src="/lovable-uploads/6e693a05-5355-4718-95b9-23327287d678.png" alt="ديوان" onClick={() => navigate("/")} className="w-full h-auto max-w-xl" />
    </div>;
};