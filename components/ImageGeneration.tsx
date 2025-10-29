import React, { useState } from 'react';
import { generateImageFromContent } from '../services/geminiService';
import TaskCard from './common/TaskCard';
import LoadingSpinner from './common/LoadingSpinner';
import { Language, Project } from '../types';
import { translations } from '../i18n';

type UploadedImage = {
  dataUrl: string;
  base64: string;
  mimeType: string;
};

interface ImageGenerationProps {
    language: Language;
    activeProject: Project | null;
    onUpdateProject: (data: any) => void;
}

const ImageGeneration: React.FC<ImageGenerationProps> = ({ language }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true);
    setGeneratedImage(null);
    const imagePayload = uploadedImages.map(({ base64, mimeType }) => ({ base64, mimeType }));
    const result = await generateImageFromContent(prompt, imagePayload);
    setGeneratedImage(result);
    setLoading(false);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${generatedImage}`;
    link.download = 'generated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Fix: Explicitly type `file` as `File` to resolve type inference issues where `file` was treated as `unknown`.
      const newImagePromises = Array.from(files).map((file: File) => {
        return new Promise<UploadedImage>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            const dataUrl = loadEvent.target?.result as string;
            const base64 = dataUrl.split(',')[1];
            resolve({ dataUrl, base64, mimeType: file.type });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(newImagePromises).then(newImages => {
        setUploadedImages(prev => [...prev, ...newImages]);
      });
      e.target.value = ''; // Allow re-uploading the same file
    }
  };
  
  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };


  return (
    <TaskCard
      title={t.imageGenerationName}
      description={t.imageGenerationDescription}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {uploadedImages.map((image, index) => (
             <div key={index} className="relative group w-full aspect-square bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-lg overflow-hidden">
                <img src={image.dataUrl} alt={`Uploaded preview ${index + 1}`} className="w-full h-full object-cover" />
                <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-slate-700/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={t.igRemoveImage}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
          ))}
            <div className="w-full aspect-square">
                <label htmlFor="image-upload" className="w-full h-full cursor-pointer bg-beige-100/50 dark:bg-slate-800/50 border-2 border-dashed border-beige-300 dark:border-slate-600 rounded-lg p-4 text-center text-slate-500 dark:text-slate-400 hover:border-accent-500 hover:text-accent-600 transition-colors flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    <span className="font-semibold text-sm">{t.igAddImages}</span>
                </label>
                <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" multiple />
            </div>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={uploadedImages.length > 0 ? t.igPlaceholderMulti : t.igPlaceholderSingle}
          rows={3}
          className="w-full bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-4 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
        <button
          type="submit"
          disabled={loading || !prompt}
          className="bg-accent-600 text-white font-bold py-3 px-6 rounded-md hover:bg-accent-500 disabled:bg-accent-700/50 disabled:text-white/70 disabled:cursor-not-allowed transition-colors self-start"
        >
          {loading ? t.generating : t.igButton}
        </button>
      </form>

      {loading && <LoadingSpinner text={t.igLoading} />}

      {generatedImage && (
        <div className="mt-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4 dark:text-slate-200">{t.igGeneratedImage}</h3>
          <div className="relative group">
            <img src={`data:image/png;base64,${generatedImage}`} alt={prompt} className="rounded-lg shadow-lg" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={handleDownload} className="bg-slate-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                {t.igDownload}
              </button>
            </div>
          </div>
        </div>
      )}
    </TaskCard>
  );
};

export default ImageGeneration;