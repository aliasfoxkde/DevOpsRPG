// Quiz content for Terraform (terraform) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const terraformQuizzes: Record<string, QuizQuestion[]> = {
  tf_intro: [
    {
      id: 'tf_intro_q1',
      topicId: 'tf_intro',
      question: 'What is Terraform?',
      options: [
        'A programming language',
        'An infrastructure as code tool',
        'A container platform',
        'A monitoring tool',
      ],
      correctIndex: 1,
      explanation:
        'Terraform is an infrastructure as code tool for building, changing, and versioning infrastructure safely.',
    },
    {
      id: 'tf_intro_q2',
      topicId: 'tf_intro',
      question: 'What language does Terraform use for configuration?',
      options: ['Python', 'YAML', 'HashiCorp Configuration Language (HCL)', 'JSON'],
      correctIndex: 2,
      explanation:
        'Terraform uses HashiCorp Configuration Language (HCL) for its configuration files.',
    },
  ],

  tf_resources: [
    {
      id: 'tf_res_q1',
      topicId: 'tf_resources',
      question: 'In Terraform, what does a "resource" block define?',
      options: ['A variable', 'An infrastructure object', 'An output value', 'A provider'],
      correctIndex: 1,
      explanation:
        'Resource blocks define infrastructure objects like servers, databases, networks, etc.',
    },
    {
      id: 'tf_res_q2',
      topicId: 'tf_resources',
      question: 'What does the resource type "aws_instance" specify?',
      options: ['An S3 bucket', 'A VPC', 'An EC2 instance', 'An RDS database'],
      correctIndex: 2,
      explanation: '"aws_instance" is the Terraform resource type for creating AWS EC2 instances.',
    },
  ],
}
