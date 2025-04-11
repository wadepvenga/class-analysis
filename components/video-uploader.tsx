'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { Video, Upload } from 'lucide-react';

interface VideoUploaderProps {
  pdfAnalysisId: string;
  onAnalysisComplete: (analysisId: string) => void;
}

export function VideoUploader({ pdfAnalysisId, onAnalysisComplete }: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 1,
    disabled: isUploading,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const videoFile = acceptedFiles[0];
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('pdfAnalysisId', pdfAnalysisId);

        const response = await fetch('/api/upload/video', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to upload video');
        }

        toast.success('Vídeo enviado com sucesso! Analisando...');
        onAnalysisComplete(data.analysisId);
      } catch (error) {
        console.error('Error uploading video:', error);
        toast.error('Erro ao enviar o vídeo. Por favor, tente novamente.');
      } finally {
        setIsUploading(false);
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative rounded-lg border-2 border-dashed p-8 text-center transition-all
        ${isDragActive 
          ? 'border-blue-500 bg-blue-500/10' 
          : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
        }
        ${isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        {isUploading ? (
          <>
            <div className="h-12 w-12 animate-pulse rounded-full bg-gray-700" />
            <p className="text-sm text-gray-400">Enviando vídeo...</p>
          </>
        ) : isDragActive ? (
          <>
            <Upload className="h-12 w-12 text-blue-500" />
            <p className="text-sm text-blue-500">Solte o vídeo aqui...</p>
          </>
        ) : (
          <>
            <Video className="h-12 w-12 text-gray-400" />
            <div>
              <p className="text-sm text-gray-300">
                Arraste e solte um vídeo aqui, ou clique para selecionar
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Formatos aceitos: MP4, MOV, AVI
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 