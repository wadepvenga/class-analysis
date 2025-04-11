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
  teacherAppearance: {
    uniform: boolean
    details: string
  }
  languageUsage: {
    englishPercentage: number
    portuguesePercentage: number
  }
  bodyLanguage: {
    teacher: string
    students: string
  }
  classAtmosphere: string
  recommendations: string[]
}

export async function analyzeClassContent(transcript: string, guideText: string): Promise<AnalysisResults> {
  try {
    // Em um ambiente de produção, você usaria o Google AI Studio com o prompt fornecido
    // Para fins de demonstração, retornamos resultados de amostra em português

    return {
      contentCoverage: {
        score: 85,
        details: [
          "Cobriu o tema principal de forma completa",
          "Explicou conceitos-chave com exemplos",
          "Abordou todos os objetivos de aprendizagem necessários",
        ],
        missingTopics: [
          "Poderia ter expandido mais sobre aplicações práticas",
          "Conceitos avançados foram mencionados mas não explorados em profundidade",
        ],
      },
      studentInteraction: {
        score: 75,
        details: [
          "Bons segmentos de perguntas e respostas durante a aula",
          "Alunos foram engajados através de atividades interativas",
          "Professor verificou a compreensão regularmente",
        ],
        interactionCount: 12,
      },
      languageLevel: {
        estimatedLevel: "Intermediário",
        details: [
          "Linguagem foi apropriada para o público-alvo",
          "Termos técnicos foram explicados claramente",
          "Instruções foram claras e concisas",
        ],
        vocabulary: {
          advanced: ["curriculum", "pedagogy", "assessment", "differentiation"],
          intermediate: ["lesson", "activity", "objective", "evaluation"],
          basic: ["learn", "teach", "student", "class"],
        },
      },
      pacing: {
        score: 80,
        details: [
          "Bom ritmo geral durante a lição",
          "Tempo adequado alocado para cada seção",
          "Transições suaves entre os tópicos",
        ],
      },
      teacherAppearance: {
        uniform: true,
        details:
          "Professor estava usando o jaleco azul marinho com detalhes amarelos, logo no peito e crachá conforme o padrão.",
      },
      languageUsage: {
        englishPercentage: 85,
        portuguesePercentage: 15,
      },
      bodyLanguage: {
        teacher:
          "Professor demonstrou confiança, movimentação adequada pela sala e gestos que auxiliaram na explicação do conteúdo.",
        students: "Alunos mostraram-se atentos, com postura participativa e engajamento nas atividades propostas.",
      },
      classAtmosphere: "Ambiente positivo e colaborativo, com alunos motivados e participativos.",
      recommendations: [
        "Considere adicionar mais elementos interativos para aumentar o engajamento dos alunos",
        "Forneça mais exemplos do mundo real para ilustrar conceitos abstratos",
        "Reserve mais tempo para perguntas dos alunos ao final de cada seção",
        "Inclua uma breve recapitulação no final para reforçar os principais pontos de aprendizagem",
      ],
    }
  } catch (error) {
    console.error("Erro ao analisar conteúdo:", error)
    throw new Error("Falha ao analisar conteúdo")
  }
}
