import { useParams } from "react-router-dom";
import { CertificateVerification } from "@/components/certificates/verify/CertificateVerification";
import { Navigation } from "@/components/Navigation";

const VerifyCertificate = () => {
  const { code } = useParams();

  if (!code) {
    return (
      <div dir="rtl">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">رمز التحقق غير صالح</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 text-center">التحقق من صحة الشهادة</h1>
        <CertificateVerification verificationCode={code} />
      </div>
    </div>
  );
};

export default VerifyCertificate;