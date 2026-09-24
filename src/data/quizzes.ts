// Quiz questions for each topic - these are auto-generated from W3Schools
// content and serve as knowledge checks before completing quests.
// Content lives in per-technology modules under ./quizzes/; this barrel
// assembles them into the topic-keyed record the app consumes.

import { htmlQuizzes } from './quizzes/html'
import { cssQuizzes } from './quizzes/css'
import { javascriptQuizzes } from './quizzes/javascript'
import { gitQuizzes } from './quizzes/git'
import { sqlQuizzes } from './quizzes/sql'
import { pythonQuizzes } from './quizzes/python'
import { bashQuizzes } from './quizzes/bash'
import { dockerQuizzes } from './quizzes/docker'
import { reactQuizzes } from './quizzes/react'
import { nodejsQuizzes } from './quizzes/nodejs'
import { postgresqlQuizzes } from './quizzes/postgresql'
import { mongodbQuizzes } from './quizzes/mongodb'
import { awsQuizzes } from './quizzes/aws'
import { kubernetesQuizzes } from './quizzes/kubernetes'
import { terraformQuizzes } from './quizzes/terraform'
import { cicdQuizzes } from './quizzes/cicd'
import { prometheusQuizzes } from './quizzes/prometheus'
import { securityQuizzes } from './quizzes/security'
import { machineLearningQuizzes } from './quizzes/machine_learning'
import { networkingQuizzes } from './quizzes/networking'
import { apiDesignQuizzes } from './quizzes/api_design'
import { observabilityQuizzes } from './quizzes/observability'
import { ansibleQuizzes } from './quizzes/ansible'
import { kafkaQuizzes } from './quizzes/kafka'
import { rabbitmqQuizzes } from './quizzes/rabbitmq'
import { istioQuizzes } from './quizzes/istio'

type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'code_challenge'

export interface QuizQuestion {
  id: string
  topicId: string
  question: string
  type?: QuestionType // defaults to 'multiple_choice' if not specified
  options?: string[]
  correctIndex?: number
  correctAnswer?: string
  explanation: string
  // For code challenges
  codeTemplate?: string
  expectedOutput?: string
  hint?: string
}

// Generate quiz questions from technologies data

// Assemble every technology's quiz bank, keyed by topic id.
function generateQuizzes(): Record<string, QuizQuestion[]> {
  return {
    ...htmlQuizzes,
    ...cssQuizzes,
    ...javascriptQuizzes,
    ...gitQuizzes,
    ...sqlQuizzes,
    ...pythonQuizzes,
    ...bashQuizzes,
    ...dockerQuizzes,
    ...reactQuizzes,
    ...nodejsQuizzes,
    ...postgresqlQuizzes,
    ...mongodbQuizzes,
    ...awsQuizzes,
    ...kubernetesQuizzes,
    ...terraformQuizzes,
    ...cicdQuizzes,
    ...prometheusQuizzes,
    ...securityQuizzes,
    ...machineLearningQuizzes,
    ...networkingQuizzes,
    ...apiDesignQuizzes,
    ...observabilityQuizzes,
    ...ansibleQuizzes,
    ...kafkaQuizzes,
    ...rabbitmqQuizzes,
    ...istioQuizzes,
  }
}

export const quizzes = generateQuizzes()

// Quiz topic ID aliases for mismatched naming conventions
const QUIZ_ALIASES: Record<string, string[]> = {
  python_intro: ['py_intro'],
  python_syntax: ['py_syntax'],
  python_variables: ['py_variables', 'py_var'],
  python_lists: ['py_lists', 'py_list'],
  python_functions: ['py_functions', 'py_func'],
  css_boxmodel: ['css_box_model'],
}

// Record lookups by an arbitrary key can miss at runtime even though
// index-access typing reports the value type as always present, so misses are
// surfaced through these helpers' return types instead.
function lookupQuiz(id: string): QuizQuestion[] | undefined {
  return quizzes[id]
}

function lookupAliases(topicId: string): string[] | undefined {
  return QUIZ_ALIASES[topicId]
}

// Get quiz for a specific topic
export function getQuizForTopic(topicId: string): QuizQuestion[] {
  // Direct lookup first
  const direct = lookupQuiz(topicId)
  if (direct && direct.length > 0) {
    return direct
  }
  // Try aliases for known mismatches
  const aliases = lookupAliases(topicId)
  if (aliases) {
    for (const alias of aliases) {
      const aliasQuiz = lookupQuiz(alias)
      if (aliasQuiz && aliasQuiz.length > 0) {
        return aliasQuiz
      }
    }
  }
  return []
}
