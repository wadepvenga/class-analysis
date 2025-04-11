export interface AnalysisResults {
  contentCoverage: {
    score: number
    details: string[]
    missingTopics: string[]
  }
  studentInteraction: {
    score: number
    details: string[]
    interactionCount: number
  }
  languageLevel: {
    estimatedLevel: string
    details: string[]
    vocabulary: {
      advanced: string[]
      intermediate: string[]
      basic: string[]
    }
  }
  pacing: {
    score: number
    details: string[]
  }
  teacherAppearance?: {
    uniform: boolean
    details: string
  }
  languageUsage?: {
    englishPercentage: number
    portuguesePercentage: number
  }
  bodyLanguage?: {
    teacher: string
    students: string
  }
  classAtmosphere?: string
  recommendations: string[]
  status: string
  transcript: string
  analysis: string
  timestamp: string
}

export interface AnalysisData {
  status: string
  step?: string
  error?: string
  markdown?: string
  analysis?: string
  transcript: string
  timestamp: string
  videoUrl?: string
  metadata?: {
    modality: string
    book: string
    classNumber: string
    teacherName: string
  }
}

export type CourseModality = "Adults" | "Teens" | "Kids"

export interface Book {
  id: string
  name: string
  modality: CourseModality
}

export interface Teacher {
  id: string
  name: string
  email: string
  active: boolean
}

export interface Class {
  id: string
  bookId: string
  teacherId: string
  classNumber: number
  topic: string
  createdAt: string
}

export const COURSE_BOOKS: Record<CourseModality, string[]> = {
  Adults: ["INSIGHT", "CONNECTION", "IMPULSE", "OVERCOME", "TARGET", "MASTER"],
  Teens: ["FRESHMAN", "SOPHOMORE", "JUNIOR", "SENIOR"],
  Kids: ["ROCKET 1", "ROCKET 2", "ROCKET 3", "BLINK 1", "BLINK 2"]
}

export const COURSE_MODALITIES: CourseModality[] = ["Adults", "Teens", "Kids"]
