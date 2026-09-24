// Quiz content for Istio (istio) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const istioQuizzes: Record<string, QuizQuestion[]> = {
  istio_intro: [
    {
      id: 'istio_intro_q1',
      topicId: 'istio_intro',
      question: 'What is Istio?',
      options: [
        'A container orchestration platform',
        'A service mesh solution for microservices',
        'A programming language',
        'A database system',
      ],
      correctIndex: 1,
      explanation:
        'Istio is a service mesh that provides traffic management, security, and observability for microservices.',
    },
    {
      id: 'istio_intro_q2',
      topicId: 'istio_intro',
      question: 'What programming language is Istio primarily written in?',
      options: ['Python', 'Go', 'Java', 'Rust'],
      correctIndex: 1,
      explanation:
        'Istio is primarily written in Go, which is common for cloud-native infrastructure projects.',
    },
  ],

  istio_traffic: [
    {
      id: 'istio_traffic_q1',
      topicId: 'istio_traffic',
      question: 'What is traffic splitting in Istio used for?',
      options: [
        'Dividing network bandwidth',
        'Routing a percentage of traffic to different versions',
        'Load balancing only',
        'Firewall configuration',
      ],
      correctIndex: 1,
      explanation:
        'Traffic splitting allows you to route percentages of traffic to different service versions for canary deployments.',
    },
    {
      id: 'istio_traffic_q2',
      topicId: 'istio_traffic',
      question: 'What is a VirtualService in Istio?',
      options: [
        'A Kubernetes virtual machine',
        'A resource that defines routing rules for traffic',
        'A network cable',
        'A database connection',
      ],
      correctIndex: 1,
      explanation:
        'VirtualService configures how requests are routed to a service within the mesh.',
    },
  ],

  istio_security: [
    {
      id: 'istio_sec_q1',
      topicId: 'istio_security',
      question: "What does Istio's mTLS (mutual TLS) provide?",
      options: [
        'Single-direction authentication',
        'Bidirectional authentication between services',
        'Message encryption only',
        'User authentication only',
      ],
      correctIndex: 1,
      explanation:
        'mTLS ensures both the client and server authenticate each other and encrypt traffic between them.',
    },
    {
      id: 'istio_sec_q2',
      topicId: 'istio_security',
      question: 'What is a PeerAuthentication policy in Istio?',
      options: [
        'A policy for user login',
        'A policy that defines how services authenticate with each other',
        'A policy for database connections',
        'A policy for API access',
      ],
      correctIndex: 1,
      explanation:
        'PeerAuthentication defines how mutual TLS is enforced between services in the mesh.',
    },
  ],

  istio_observability: [
    {
      id: 'istio_obs_q1',
      topicId: 'istio_observability',
      question: 'What is telemetry collection in Istio?',
      options: [
        'Manual logging by developers',
        'Automatic collection of metrics, logs, and traces',
        'Database backup',
        'Network configuration',
      ],
      correctIndex: 1,
      explanation:
        'Istio automatically collects telemetry data (metrics, traces, logs) without requiring changes to application code.',
    },
    {
      id: 'istio_obs_q2',
      topicId: 'istio_observability',
      question: 'Which tool does Istio use for distributed tracing?',
      options: ['CloudWatch', 'Jaeger or Zipkin', 'Datadog', 'New Relic'],
      correctIndex: 1,
      explanation:
        'Istio integrates with Jaeger and Zipkin for distributed tracing across microservices.',
    },
  ],
}
