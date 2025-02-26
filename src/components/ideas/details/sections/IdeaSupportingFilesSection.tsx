
import { FC } from "react";

interface SupportingFile {
  name: string;
  file_path: string;
}

interface IdeaSupportingFilesSectionProps {
  files: SupportingFile[];
}

export const IdeaSupportingFilesSection: FC<IdeaSupportingFilesSectionProps> = ({ files }) => {
  return (
    <section className="bg-white p-6 rounded-lg border border-purple-100">
      <h3 className="text-lg font-semibold mb-4 text-purple-800">الملفات الداعمة</h3>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-purple-100 rounded-t-lg">
              <th className="p-3 text-right text-purple-800 border-b first:rounded-tr-lg">اسم الملف</th>
              <th className="p-3 text-center text-purple-800 border-b last:rounded-tl-lg">التحميل</th>
            </tr>
          </thead>
          <tbody>
            {(!files || files.length === 0) ? (
              <tr>
                <td colSpan={2} className="p-4 text-center text-gray-500">
                  لا توجد ملفات داعمة
                </td>
              </tr>
            ) : (
              files.map((file, index) => (
                <tr key={index} className="border-b border-purple-50 hover:bg-purple-50/50 transition-colors">
                  <td className="p-3 text-gray-700">{file.name}</td>
                  <td className="p-3 text-center">
                    <a
                      href={file.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 hover:underline text-sm"
                    >
                      تحميل الملف
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
