"use client";

import React, { useCallback } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  label: React.ReactNode;
  onFileAccepted: (file: File) => void;
  accept?: DropzoneOptions['accept'];
  className?: string;
}

export function UploadZone({ label, onFileAccepted, accept, className }: UploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onFileAccepted(acceptedFiles[0]);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center w-full h-[220px] rounded-3xl border-2 border-dashed transition-all cursor-pointer active:scale-90",
        isDragActive ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-slate-300 bg-white",
        className
      )}
    >
      <input {...getInputProps()} />
      {label}
    </div>
  );
}
