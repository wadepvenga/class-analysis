'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { FileText, Upload } from 'lucide-react';

interface PDFUploaderProps {
  onAnalysisComplete: (analysisId: string) => void;
}

export function PDFUploader({ onAnalysisComplete }: PDFUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const pdfFile = acceptedFiles[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);

      const response = await fetch('/api/upload/pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload PDF');
      }

      toast.success('PDF enviado com sucesso! Analisando...');
      onAnalysisComplete(data.analysisId);
    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      toast.error(error.message || 'Erro ao enviar o PDF. Por favor, tente novamente.');
    } finally {
      setIsUploading(false);
    }
  }, [onAnalysisComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isUploading,
    onDrop
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
      onClick={(e) => {
        e.stopPropagation();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.multiple = false;
        input.onchange = async (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            await onDrop([files[0]]);
          }
        };
        input.click();
      }}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        {isUploading ? (
          <>
            <div className="h-12 w-12 animate-pulse rounded-full bg-gray-700" />
            <p className="text-sm text-gray-400">Enviando PDF...</p>
          </>
        ) : isDragActive ? (
          <>
            <Upload className="h-12 w-12 text-blue-500" />
            <p className="text-sm text-blue-500">Solte o PDF aqui...</p>
          </>
        ) : (
          <>
            <FileText className="h-12 w-12 text-gray-400" />
            <div>
              <p className="text-sm text-gray-300">
                Arraste e solte um PDF aqui, ou clique para selecionar
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Apenas arquivos PDF são aceitos
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 