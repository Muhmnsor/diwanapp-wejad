interface FilesSectionProps {
  files: File[];
  onFileUpload: (file: File) => void;
}

export const FilesSection = ({ files, onFileUpload }: FilesSectionProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">تحميل الملفات</label>
      <input 
        type="file" 
        multiple 
        onChange={(e) => {
          if (e.target.files) {
            Array.from(e.target.files).forEach(onFileUpload);
          }
        }} 
      />
      {files.length > 0 && (
        <ul className="list-disc list-inside space-y-1">
          {files.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};