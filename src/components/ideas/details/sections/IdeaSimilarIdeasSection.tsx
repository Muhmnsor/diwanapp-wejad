
import { FC } from "react";

interface SimilarIdea {
  title: string;
  link: string;
}

interface IdeaSimilarIdeasSectionProps {
  similarIdeas: SimilarIdea[];
}

export const IdeaSimilarIdeasSection: FC<IdeaSimilarIdeasSectionProps> = ({ similarIdeas }) => {
  if (!similarIdeas?.length) return null;

  return (
    <section className="bg-white p-4 rounded-lg border border-purple-100">
      <h3 className="text-base font-semibold mb-2 text-neutral-950">الأفكار المشابهة</h3>
      <div className="overflow-x-auto bg-white rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-right text-gray-800 border-b">عنوان الفكرة</th>
              <th className="p-2 text-right text-gray-800 border-b">الرابط</th>
            </tr>
          </thead>
          <tbody>
            {similarIdeas.map((similar, index) => (
              <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="p-2 text-gray-700">{similar.title}</td>
                <td className="p-2">
                  <a 
                    href={similar.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-700 hover:underline"
                  >
                    عرض الفكرة
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
