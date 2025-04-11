"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { COURSE_BOOKS, COURSE_MODALITIES, CourseModality } from "@/lib/types"
import Link from "next/link"

export default function BooksPage() {
  const [selectedModality, setSelectedModality] = useState<CourseModality>("Adults")

  return (
    <div className="container mx-auto max-w-5xl py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Livros por Modalidade</h1>
        <Link href="/admin">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Tabs defaultValue="Adults" className="w-full" onValueChange={(value) => setSelectedModality(value as CourseModality)}>
        <TabsList className="grid w-full grid-cols-3">
          {COURSE_MODALITIES.map((modality) => (
            <TabsTrigger key={modality} value={modality}>
              {modality}
            </TabsTrigger>
          ))}
        </TabsList>
        {COURSE_MODALITIES.map((modality) => (
          <TabsContent key={modality} value={modality}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {COURSE_BOOKS[modality].map((book) => (
                <Card key={book}>
                  <CardHeader>
                    <CardTitle>{book}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Modalidade: {modality}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 