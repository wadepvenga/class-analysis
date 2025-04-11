"use client"

import type React from "react"

import { useState, useRef, type ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploaderProps {
  icon: ReactNode
  title: string
  description: string
  accept: string
  file: File | null
  setFile: (file: File | null) => void
  disabled?: boolean
  color?: "blue" | "yellow"
}

export function FileUploader({
  icon,
  title,
  description,
  accept,
  file,
  setFile,
  disabled = false,
  color = "blue",
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleRemove = () => {
    setFile(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const getBorderColor = () => {
    if (isDragging) {
      return color === "blue" ? "border-neon-blue bg-neon-blue/5" : "border-neon-yellow bg-neon-yellow/5"
    }
    return color === "blue" ? "border-neon-blue/30" : "border-neon-yellow/30"
  }

  const getTextColor = () => {
    return color === "blue" ? "text-neon-blue" : "text-neon-yellow"
  }

  const getButtonColor = () => {
    return color === "blue"
      ? "bg-neon-blue hover:bg-neon-blue/80 text-black"
      : "bg-neon-yellow hover:bg-neon-yellow/80 text-black"
  }

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed p-6 transition-colors ${getBorderColor()} ${
        disabled ? "opacity-60" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {file ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className={`font-medium ${getTextColor()}`}>{file.name}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remover arquivo</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className={`rounded-full bg-background p-3 shadow-sm ${getTextColor()}`}>{icon}</div>
          <div>
            <p className={`font-medium ${getTextColor()}`}>{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <Button
            type="button"
            className={getButtonColor()}
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            Escolher arquivo
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  )
}
