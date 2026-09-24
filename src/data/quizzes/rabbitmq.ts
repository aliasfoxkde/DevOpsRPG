// Quiz content for RabbitMQ (rabbitmq) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const rabbitmqQuizzes: Record<string, QuizQuestion[]> = {
  rmq_intro: [
    {
      id: 'rmq_intro_q1',
      topicId: 'rmq_intro',
      question: 'What is RabbitMQ?',
      options: [
        'A database management system',
        'An open-source message broker',
        'A web server',
        'A container runtime',
      ],
      correctIndex: 1,
      explanation:
        'RabbitMQ is an open-source message broker that implements the AMQP protocol for asynchronous messaging.',
    },
    {
      id: 'rmq_intro_q2',
      topicId: 'rmq_intro',
      question: 'What protocol does RabbitMQ primarily implement?',
      options: ['HTTP', 'AMQP (Advanced Message Queuing Protocol)', 'FTP', 'SSH'],
      correctIndex: 1,
      explanation:
        'RabbitMQ primarily implements the AMQP protocol, though it also supports other protocols like MQTT and STOMP.',
    },
  ],

  rmq_exchanges: [
    {
      id: 'rmq_exch_q1',
      topicId: 'rmq_exchanges',
      question: 'What is a RabbitMQ exchange?',
      options: [
        'A message storage location',
        'A routing entity that receives and routes messages',
        'A user authentication service',
        'A network gateway',
      ],
      correctIndex: 1,
      explanation:
        'An exchange receives messages from producers and routes them to queues based on routing rules and bindings.',
    },
    {
      id: 'rmq_exch_q2',
      topicId: 'rmq_exchanges',
      question: 'Which exchange type routes messages to all bound queues?',
      options: ['direct', 'fanout', 'topic', 'headers'],
      correctIndex: 1,
      explanation:
        'Fanout exchange routes messages to ALL queues bound to it, regardless of routing key.',
    },
  ],

  rmq_queues: [
    {
      id: 'rmq_queue_q1',
      topicId: 'rmq_queues',
      question: 'What is a queue in RabbitMQ?',
      options: [
        'A type of exchange',
        'A FIFO buffer that stores messages',
        'A network connection',
        'A user permission set',
      ],
      correctIndex: 1,
      explanation:
        'A queue is a FIFO (first-in-first-out) buffer that stores messages until they are consumed.',
    },
    {
      id: 'rmq_queue_q2',
      topicId: 'rmq_queues',
      question: 'What happens when a queue is durable?',
      options: [
        'It can only be accessed by durable connections',
        'It survives broker restarts',
        'It encrypts all messages',
        'It has unlimited storage',
      ],
      correctIndex: 1,
      explanation:
        'A durable queue is persisted to disk and survives broker restarts, unlike transient queues.',
    },
  ],

  rmq_bindings: [
    {
      id: 'rmq_bind_q1',
      topicId: 'rmq_bindings',
      question: 'What is a binding in RabbitMQ?',
      options: [
        'A network connection between brokers',
        'A link between an exchange and a queue',
        'A user authentication mechanism',
        'A message encryption key',
      ],
      correctIndex: 1,
      explanation:
        'A binding defines the relationship between an exchange and a queue, often with a routing key pattern.',
    },
    {
      id: 'rmq_bind_q2',
      topicId: 'rmq_bindings',
      question: 'What is a binding key?',
      options: [
        'A password for accessing queues',
        'A pattern used to match routing keys',
        'A certificate for TLS connections',
        'A message priority level',
      ],
      correctIndex: 1,
      explanation:
        'A binding key is a pattern (like "*.stock.*") that the exchange uses to determine which queues should receive messages.',
    },
  ],

  rmq_publish: [
    {
      id: 'rmq_pub_q1',
      topicId: 'rmq_publish',
      question: 'What is the difference between direct and persistent message delivery?',
      options: [
        'Direct uses TCP, persistent uses UDP',
        'Direct is fire-and-forget, persistent is saved to disk',
        'Direct is encrypted, persistent is not',
        'There is no difference',
      ],
      correctIndex: 1,
      explanation:
        'Persistent messages are saved to disk before acknowledgment, surviving broker restarts. Direct messages are not.',
    },
    {
      id: 'rmq_pub_q2',
      topicId: 'rmq_publish',
      question: 'What does it mean when publishing with mandatory=true?',
      options: [
        'The message is encrypted',
        'The message is guaranteed to be routed to a queue',
        'The message has highest priority',
        'The message is compressed',
      ],
      correctIndex: 1,
      explanation:
        'With mandatory=true, if a message cannot be routed to any queue, it is returned to the producer.',
    },
  ],
}
