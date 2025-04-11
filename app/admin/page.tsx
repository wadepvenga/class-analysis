"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Book, GraduationCap, Users } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  return (
    <div className="container mx-auto max-w-5xl py-12">
      <h1 className="text-3xl font-bold mb-8">Área Administrativa</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/teachers">
          <Card className="hover:border-blue-500 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Professores
              </CardTitle>
              <CardDescription>Gerenciar professores</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cadastre e gerencie os professores do sistema.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/books">
          <Card className="hover:border-blue-500 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Livros
              </CardTitle>
              <CardDescription>Gerenciar livros por modalidade</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure os livros disponíveis para cada modalidade de curso.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/classes">
          <Card className="hover:border-blue-500 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Aulas
              </CardTitle>
              <CardDescription>Gerenciar aulas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cadastre e gerencie as aulas dos cursos.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
} 