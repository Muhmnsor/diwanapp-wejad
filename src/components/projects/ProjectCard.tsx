import { Project } from "@/types/project";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { BeneficiaryCardBadge } from "../events/badges/card/BeneficiaryCardBadge";
import { EventTypeCardBadge } from "../events/badges/card/EventTypeCardBadge";
import { PriceCardBadge } from "../events/badges/card/PriceCardBadge";
import { CertificateCardBadge } from "../events/badges/card/CertificateCardBadge";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const shouldShowCertificate = project.certificate_type && project.certificate_type !== 'none';

  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <CardHeader className="space-y-2">
          <h3 className="font-bold text-xl line-clamp-2">{project.title}</h3>
        </CardHeader>

        <CardContent>
          <p className="text-gray-600 line-clamp-3 mb-4">{project.description}</p>
        </CardContent>

        <CardFooter>
          <div className="flex flex-wrap gap-2" dir="rtl">
            <EventTypeCardBadge eventType={project.event_type} />
            <PriceCardBadge price={project.price} />
            <BeneficiaryCardBadge beneficiaryType={project.beneficiary_type} />
            {shouldShowCertificate && (
              <CertificateCardBadge certificateType={project.certificate_type} />
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};