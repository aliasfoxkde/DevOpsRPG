// Quiz content for AWS (aws) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const awsQuizzes: Record<string, QuizQuestion[]> = {
  aws_intro: [
    {
      id: 'aws_intro_q1',
      topicId: 'aws_intro',
      question: 'What does AWS stand for?',
      options: [
        'Advanced Web Services',
        'Amazon Web Services',
        'Automated Web Solutions',
        'Application Workload Services',
      ],
      correctIndex: 1,
      explanation: 'AWS stands for Amazon Web Services - a comprehensive cloud computing platform.',
    },
    {
      id: 'aws_intro_q2',
      topicId: 'aws_intro',
      question: 'Which AWS service provides virtual servers in the cloud?',
      options: ['S3', 'EC2', 'RDS', 'Lambda'],
      correctIndex: 1,
      explanation:
        'EC2 (Elastic Compute Cloud) provides resizable compute capacity - virtual servers.',
    },
  ],

  'aws-ec2': [
    {
      id: 'aws-ec2_q1',
      topicId: 'aws-ec2',
      question: 'What does EC2 stand for?',
      options: [
        'Elastic Compute Cloud',
        'Essential Computing Center',
        'Enterprise Cloud Core',
        'E-Commerce 2.0',
      ],
      correctIndex: 0,
      explanation: "EC2 stands for Elastic Compute Cloud - AWS's resizable compute service.",
    },
    {
      id: 'aws-ec2_q2',
      topicId: 'aws-ec2',
      question: 'What does "t2.micro" represent in AWS?',
      options: [
        'A storage type',
        'An instance type (size and family)',
        'A region',
        'A security group',
      ],
      correctIndex: 1,
      explanation:
        'Instance types like t2.micro specify the size (vCPUs, memory) and family of the instance.',
    },
  ],

  'aws-s3': [
    {
      id: 'aws-s3_q1',
      topicId: 'aws-s3',
      question: 'What does S3 stand for?',
      options: [
        'Simple Storage Service',
        'Server Storage System',
        'Secure Software Service',
        'Standard Storage Solution',
      ],
      correctIndex: 0,
      explanation: 'S3 stands for Simple Storage Service - object storage in AWS.',
    },
    {
      id: 'aws-s3_q2',
      topicId: 'aws-s3',
      question: 'What is an S3 bucket?',
      options: [
        'A compute resource',
        'A container for storing objects',
        'A database table',
        'A networking feature',
      ],
      correctIndex: 1,
      explanation: 'An S3 bucket is a container for storing objects (files) in Amazon S3.',
    },
  ],
}
