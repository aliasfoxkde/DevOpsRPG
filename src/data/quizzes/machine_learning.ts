// Quiz content for Machine Learning (machine_learning) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const machineLearningQuizzes: Record<string, QuizQuestion[]> = {
  ml_intro: [
    {
      id: 'ml_intro_q1',
      topicId: 'ml_intro',
      question: 'What is Machine Learning?',
      options: [
        'A programming language',
        'A type of hardware',
        'A subset of AI that enables systems to learn from data',
        'A database management system',
      ],
      correctIndex: 2,
      explanation:
        'Machine Learning is a subset of AI that enables computers to learn from data without being explicitly programmed.',
    },
    {
      id: 'ml_intro_q2',
      topicId: 'ml_intro',
      question: 'Which company developed TensorFlow?',
      options: ['Facebook', 'Microsoft', 'Google', 'Amazon'],
      correctIndex: 2,
      explanation:
        'TensorFlow was developed by Google Brain team and released as open source in 2015.',
    },
  ],

  ml_types: [
    {
      id: 'ml_types_q1',
      topicId: 'ml_types',
      question: 'What are the main types of Machine Learning?',
      options: [
        'Supervised, Unsupervised, and Reinforcement',
        'Classification, Regression, and Clustering',
        'Linear, Non-linear, and Decision Tree',
        'Neural, Deep, and Shallow',
      ],
      correctIndex: 0,
      explanation:
        'The three main types of ML are Supervised, Unsupervised, and Reinforcement learning.',
    },
    {
      id: 'ml_types_q2',
      topicId: 'ml_types',
      question: 'Which type of ML uses labeled data?',
      options: [
        'Unsupervised Learning',
        'Reinforcement Learning',
        'Supervised Learning',
        'All types',
      ],
      correctIndex: 2,
      explanation:
        'Supervised Learning uses labeled datasets to train algorithms to classify data or predict outcomes.',
    },
  ],

  ml_supervised: [
    {
      id: 'ml_sup_q1',
      topicId: 'ml_supervised',
      question: 'What is a common algorithm for classification problems?',
      options: ['Linear Regression', 'K-Means', 'Decision Tree', 'PCA'],
      correctIndex: 2,
      explanation:
        'Decision Trees are commonly used for classification problems. Linear Regression is for regression (continuous values).',
    },
    {
      id: 'ml_sup_q2',
      topicId: 'ml_supervised',
      question: 'What is overfitting in ML?',
      options: [
        'When the model is too simple',
        'When the model performs poorly on training data',
        'When the model performs well on training data but poorly on new data',
        'When the model uses too little data',
      ],
      correctIndex: 2,
      explanation:
        'Overfitting occurs when a model learns the training data too well but cannot generalize to new data.',
    },
  ],

  ml_unsupervised: [
    {
      id: 'ml_unsup_q1',
      topicId: 'ml_unsupervised',
      question: 'What is clustering used for in Unsupervised Learning?',
      options: [
        'Predicting continuous values',
        'Grouping similar data points together',
        'Classifying data with labels',
        'Training with labeled data',
      ],
      correctIndex: 1,
      explanation:
        'Clustering groups similar data points together based on their features, without pre-existing labels.',
    },
    {
      id: 'ml_unsup_q2',
      topicId: 'ml_unsupervised',
      question: 'Which algorithm is commonly used for clustering?',
      options: ['Linear Regression', 'Decision Tree', 'K-Means', 'Naive Bayes'],
      correctIndex: 2,
      explanation:
        'K-Means is a popular clustering algorithm that partitions data into K clusters.',
    },
  ],

  ml_neural_nets: [
    {
      id: 'ml_nn_q1',
      topicId: 'ml_neural_nets',
      question: 'What is a neuron in a neural network?',
      options: [
        'A biological cell in the brain',
        'A function that receives inputs and produces an output',
        'A type of hardware',
        'A programming language',
      ],
      correctIndex: 1,
      explanation:
        'In neural networks, a neuron (or node) receives inputs, applies weights, sums them, and passes through an activation function.',
    },
    {
      id: 'ml_nn_q2',
      topicId: 'ml_neural_nets',
      question: 'What is deep learning?',
      options: [
        'Learning with deep thoughts',
        'Neural networks with many layers',
        'Learning at a slow pace',
        'A type of hardware acceleration',
      ],
      correctIndex: 1,
      explanation:
        'Deep learning uses neural networks with multiple hidden layers to learn hierarchical representations of data.',
    },
  ],

  ml_mlops: [
    {
      id: 'ml_mlops_q1',
      topicId: 'ml_mlops',
      question: 'What does MLOps stand for?',
      options: [
        'Machine Learning Operations',
        'Model Lifecycle Operations',
        'Machine Language Optimization',
        'Model Learning Operations',
      ],
      correctIndex: 0,
      explanation:
        'MLOps (Machine Learning Operations) applies DevOps principles to machine learning systems.',
    },
    {
      id: 'ml_mlops_q2',
      topicId: 'ml_mlops',
      question: 'What is a key benefit of MLOps?',
      options: ['Faster training', 'Reproducible ML pipelines', 'Bigger models', 'More data'],
      correctIndex: 1,
      explanation: 'MLOps enables reproducible ML pipelines with automated testing and deployment.',
    },
  ],

  ml_sklearn: [
    {
      id: 'ml_sklearn_q1',
      topicId: 'ml_sklearn',
      question: 'What is scikit-learn primarily used for?',
      options: [
        'Web development',
        'Machine learning',
        'Database management',
        'Network programming',
      ],
      correctIndex: 1,
      explanation:
        'scikit-learn is a popular Python library for machine learning algorithms and tools.',
    },
    {
      id: 'ml_sklearn_q2',
      topicId: 'ml_sklearn',
      question: 'What type of algorithm is Linear Regression in sklearn?',
      options: ['Classification', 'Regression', 'Clustering', 'Dimensionality reduction'],
      correctIndex: 1,
      explanation:
        'Linear Regression is a regression algorithm used for predicting continuous values.',
    },
  ],

  ml_tensorflow: [
    {
      id: 'ml_tensorflow_q1',
      topicId: 'ml_tensorflow',
      question: 'What is a Tensor in TensorFlow?',
      options: [
        'A type of neural network',
        'A multi-dimensional array',
        'A training step',
        'An activation function',
      ],
      correctIndex: 1,
      explanation: 'Tensors are multi-dimensional arrays - the core data structure in TensorFlow.',
    },
    {
      id: 'ml_tensorflow_q2',
      topicId: 'ml_tensorflow',
      question: 'What is Keras in relation to TensorFlow?',
      options: [
        'A separate language',
        'An API for building neural networks',
        'A database',
        'A deployment tool',
      ],
      correctIndex: 1,
      explanation:
        'Keras is a high-level API built on TensorFlow that makes building neural networks easier.',
    },
  ],
}
