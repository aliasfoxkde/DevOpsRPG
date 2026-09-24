// Quiz content for Apache Kafka (kafka) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const kafkaQuizzes: Record<string, QuizQuestion[]> = {
  kafka_intro: [
    {
      id: 'kafka_intro_q1',
      topicId: 'kafka_intro',
      question: 'What type of system is Apache Kafka?',
      options: [
        'Relational database',
        'Distributed event streaming platform',
        'Message queue only',
        'File storage system',
      ],
      correctIndex: 1,
      explanation:
        'Apache Kafka is a distributed event streaming platform used for building real-time data pipelines and streaming apps.',
    },
    {
      id: 'kafka_intro_q2',
      topicId: 'kafka_intro',
      question: 'What is the primary programming language Kafka is written in?',
      options: ['Python', 'Java and Scala', 'Go', 'Ruby'],
      correctIndex: 1,
      explanation:
        'Kafka is primarily written in Java and Scala, which gives it high performance and scalability.',
    },
  ],

  kafka_topics: [
    {
      id: 'kafka_topic_q1',
      topicId: 'kafka_topics',
      question: 'What is a Kafka topic?',
      options: [
        'A database table',
        'A category/feed name for messages',
        'A network protocol',
        'A user account',
      ],
      correctIndex: 1,
      explanation:
        'A topic is a logical channel or category to which producers send messages and consumers read from.',
    },
    {
      id: 'kafka_topic_q2',
      topicId: 'kafka_topics',
      question: 'What is topic partitioning in Kafka?',
      options: [
        'Compressing topic messages',
        'Dividing a topic into multiple segments',
        'Encrypting topic data',
        'Backing up topic data',
      ],
      correctIndex: 1,
      explanation:
        'Partitioning divides a topic into multiple segments called partitions, enabling parallel processing and scalability.',
    },
  ],

  kafka_producers: [
    {
      id: 'kafka_prod_q1',
      topicId: 'kafka_producers',
      question: 'What is the role of a Kafka producer?',
      options: [
        'To consume messages from topics',
        'To publish/send messages to Kafka topics',
        'To manage Kafka broker storage',
        'To authenticate Kafka users',
      ],
      correctIndex: 1,
      explanation:
        'Producers are applications that publish/send records (messages) to Kafka topics.',
    },
    {
      id: 'kafka_prod_q2',
      topicId: 'kafka_producers',
      question: 'What determines which partition a message is sent to?',
      options: [
        'Random selection only',
        'Message key or round-robin',
        'Consumer preference only',
        'Broker availability',
      ],
      correctIndex: 1,
      explanation:
        'If a message has a key, Kafka hashes it to determine the partition. Otherwise, it uses round-robin.',
    },
  ],

  kafka_consumers: [
    {
      id: 'kafka_cons_q1',
      topicId: 'kafka_consumers',
      question: 'What is a Kafka consumer group?',
      options: [
        'A group of Kafka administrators',
        'A set of consumers that jointly consume topics',
        'A collection of related topics',
        'A security group for Kafka access',
      ],
      correctIndex: 1,
      explanation:
        'A consumer group is a set of consumers cooperating to consume messages from topics, with each partition assigned to one consumer.',
    },
    {
      id: 'kafka_cons_q2',
      topicId: 'kafka_consumers',
      question: 'What is offset in Kafka consumer context?',
      options: [
        'The timestamp of a message',
        'The sequential position of a message in a partition',
        'The size of the message queue',
        'The network latency measurement',
      ],
      correctIndex: 1,
      explanation:
        'An offset is a sequential index number that uniquely identifies each message within a partition.',
    },
  ],

  kafka_streams: [
    {
      id: 'kafka_str_q1',
      topicId: 'kafka_streams',
      question: 'What is Kafka Streams used for?',
      options: [
        'Storing persistent data',
        'Processing streaming data in real-time',
        'Managing Kafka clusters',
        'Creating Kafka topics',
      ],
      correctIndex: 1,
      explanation:
        'Kafka Streams is a client library for building real-time streaming applications that process data from Kafka.',
    },
    {
      id: 'kafka_str_q2',
      topicId: 'kafka_streams',
      question: 'What is a "stream" in Kafka Streams?',
      options: [
        'A network connection',
        'An immutable sequence of data records',
        'A Kafka broker',
        'A consumer group',
      ],
      correctIndex: 1,
      explanation:
        'In Kafka Streams, a stream is an immutable, ordered sequence of data records that can be processed.',
    },
  ],

  kafka_connect: [
    {
      id: 'kafka_conn_q1',
      topicId: 'kafka_connect',
      question: 'What is Kafka Connect?',
      options: [
        'A Kafka client library',
        'A framework for connecting Kafka with external systems',
        'A network configuration tool',
        'A monitoring dashboard',
      ],
      correctIndex: 1,
      explanation:
        'Kafka Connect is a framework for scalably and reliably streaming data between Kafka and other systems.',
    },
    {
      id: 'kafka_conn_q2',
      topicId: 'kafka_connect',
      question: 'What are connectors in Kafka Connect?',
      options: [
        'Network cables for Kafka brokers',
        'Plugins that define how to integrate with external systems',
        'Consumer group configurations',
        'Topic replication settings',
      ],
      correctIndex: 1,
      explanation:
        'Connectors are plugins that implement the integration logic for connecting Kafka to specific external systems.',
    },
  ],
}
