// Quiz content for Kubernetes (kubernetes) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const kubernetesQuizzes: Record<string, QuizQuestion[]> = {
  k8s_intro: [
    {
      id: 'k8s_intro_q1',
      topicId: 'k8s_intro',
      question: 'What is Kubernetes?',
      options: [
        'A programming language',
        'An open-source container orchestration platform',
        'A database',
        'A web server',
      ],
      correctIndex: 1,
      explanation:
        'Kubernetes is an open-source platform for automating deployment, scaling, and management of containerized applications.',
    },
    {
      id: 'k8s_intro_q2',
      topicId: 'k8s_intro',
      question: 'What company originally developed Kubernetes?',
      options: ['AWS', 'Google', 'Microsoft', 'Docker'],
      correctIndex: 1,
      explanation:
        'Google originally developed Kubernetes, which was then donated to the Cloud Native Computing Foundation.',
    },
  ],

  k8s_pods: [
    {
      id: 'k8s_pods_q1',
      topicId: 'k8s_pods',
      question: 'What is a Kubernetes Pod?',
      options: [
        'A type of container',
        'The smallest deployable unit in Kubernetes',
        'A networking tool',
        'A storage volume',
      ],
      correctIndex: 1,
      explanation:
        'Pods are the smallest deployable units in Kubernetes. A Pod represents a single instance of a running process.',
    },
    {
      id: 'k8s_pods_q2',
      topicId: 'k8s_pods',
      question: 'How many containers can a Pod typically contain?',
      options: ['Exactly one', 'One or more', 'Always two', 'At most three'],
      correctIndex: 1,
      explanation:
        'A Pod can contain one or more containers (usually one), that share storage and network.',
    },
  ],

  k8s_services: [
    {
      id: 'k8s_svc_q1',
      topicId: 'k8s_services',
      question: 'What does a Kubernetes Service provide?',
      options: [
        'Persistent storage',
        'An abstract way to expose an application running on Pods',
        'Container orchestration',
        'Load balancing for databases only',
      ],
      correctIndex: 1,
      explanation:
        'A Service is an abstract way to expose an application running on a set of Pods as a network service.',
    },
    {
      id: 'k8s_svc_q2',
      topicId: 'k8s_services',
      question: 'What type of Service exposes an application on each Node IP at a specific port?',
      options: ['ClusterIP', 'NodePort', 'LoadBalancer', 'Ingress'],
      correctIndex: 1,
      explanation:
        "NodePort exposes the Service on each Node's IP at a static port (the NodePort).",
    },
  ],
}
