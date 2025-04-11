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
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Teacher } from "@/lib/types"
import Link from "next/link"

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "" })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddTeacher = () => {
    if (!newTeacher.name || !newTeacher.email) return

    const teacher: Teacher = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTeacher.name,
      email: newTeacher.email,
      active: true,
    }

    setTeachers([...teachers, teacher])
    setNewTeacher({ name: "", email: "" })
    setIsDialogOpen(false)
  }

  return (
    <div className="container mx-auto max-w-5xl py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Professores</h1>
        <div className="flex gap-4">
          <Link href="/admin">
            <Button variant="outline">Voltar</Button>
          </Link>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Professor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Professor</DialogTitle>
                <DialogDescription>
                  Preencha os dados do professor para cadastrá-lo no sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Nome do professor"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddTeacher}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <Card key={teacher.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{teacher.name}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{teacher.email}</p>
              <p className="text-sm mt-2">
                Status: <span className={teacher.active ? "text-green-500" : "text-red-500"}>
                  {teacher.active ? "Ativo" : "Inativo"}
                </span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 