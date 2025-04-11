"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { COURSE_BOOKS, COURSE_MODALITIES, CourseModality } from "@/lib/types"
import Link from "next/link"

export default function ClassesPage() {
  const [selectedModality, setSelectedModality] = useState<CourseModality>("Adults")
  const [selectedBook, setSelectedBook] = useState("")
  const [classNumber, setClassNumber] = useState("")
  const [topic, setTopic] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCreateClass = () => {
    if (!selectedBook || !classNumber || !topic || !selectedTeacher) return

    // Aqui você adicionaria a lógica para salvar a aula
    // e redirecionar para a página de upload de arquivos

    setIsDialogOpen(false)
  }

  return (
    <div className="container mx-auto max-w-5xl py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Aulas</h1>
        <div className="flex gap-4">
          <Link href="/admin">
            <Button variant="outline">Voltar</Button>
          </Link>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Aula
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Aula</DialogTitle>
                <DialogDescription>
                  Preencha os dados da aula antes de fazer o upload dos arquivos.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Modalidade</Label>
                  <Select
                    value={selectedModality}
                    onValueChange={(value: CourseModality) => {
                      setSelectedModality(value)
                      setSelectedBook("")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a modalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSE_MODALITIES.map((modality) => (
                        <SelectItem key={modality} value={modality}>
                          {modality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Livro</Label>
                  <Select value={selectedBook} onValueChange={setSelectedBook}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o livro" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSE_BOOKS[selectedModality].map((book) => (
                        <SelectItem key={book} value={book}>
                          {book}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Professor</Label>
                  <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o professor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Professor 1</SelectItem>
                      <SelectItem value="2">Professor 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classNumber">Número da Aula</Label>
                  <Input
                    id="classNumber"
                    type="number"
                    placeholder="Ex: 1"
                    value={classNumber}
                    onChange={(e) => setClassNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Tópico da Aula</Label>
                  <Input
                    id="topic"
                    placeholder="Ex: Present Perfect"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateClass}>Continuar para Upload</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aulas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Nenhuma aula cadastrada ainda. Clique em "Nova Aula" para começar.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 