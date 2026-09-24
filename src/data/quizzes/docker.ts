// Quiz content for Docker (docker) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const dockerQuizzes: Record<string, QuizQuestion[]> = {
  docker_intro: [
    {
      id: 'docker_intro_q1',
      topicId: 'docker_intro',
      question: 'What is a Docker container?',
      options: [
        'A type of database',
        'A runnable instance of an image',
        'A programming language',
        'A web browser',
      ],
      correctIndex: 1,
      explanation:
        "A container is a runnable instance of an image - it's isolated from other containers.",
    },
    {
      id: 'docker_intro_q2',
      topicId: 'docker_intro',
      question: 'What is a Docker image?',
      options: [
        'A screenshot of an application',
        'A read-only template with instructions for creating containers',
        'A video recording',
        'A type of database backup',
      ],
      correctIndex: 1,
      explanation:
        'An image is a read-only template with instructions for creating Docker containers.',
    },
  ],

  docker_images: [
    {
      id: 'docker_img_q1',
      topicId: 'docker_images',
      question: 'What command lists Docker images?',
      options: ['docker list', 'docker images', 'docker show', 'docker ps'],
      correctIndex: 1,
      explanation: 'docker images lists all local images.',
    },
    {
      id: 'docker_img_q2',
      topicId: 'docker_images',
      question: 'What does docker pull do?',
      options: [
        'Removes an image',
        'Downloads an image from a registry',
        'Uploads an image',
        'Lists images',
      ],
      correctIndex: 1,
      explanation: 'docker pull downloads an image from Docker Hub or another registry.',
    },
  ],

  docker_containers: [
    {
      id: 'docker_cont_q1',
      topicId: 'docker_containers',
      question: 'What command runs a new container?',
      options: ['docker create', 'docker run', 'docker start', 'docker new'],
      correctIndex: 1,
      explanation: 'docker run creates and starts a new container. docker create just creates it.',
    },
    {
      id: 'docker_cont_q2',
      topicId: 'docker_containers',
      question: 'What does docker ps show?',
      options: [
        'All containers (running and stopped)',
        'Only running containers',
        'Only stopped containers',
        'Docker images',
      ],
      correctIndex: 1,
      explanation: 'docker ps shows only running containers. docker ps -a shows all containers.',
    },
  ],

  docker_dockerfile: [
    {
      id: 'docker_df_q1',
      topicId: 'docker_dockerfile',
      question: 'What does the FROM instruction in a Dockerfile specify?',
      options: [
        'The output image name',
        'The base image',
        'The working directory',
        'The port to expose',
      ],
      correctIndex: 1,
      explanation: 'FROM specifies the base image to use for building this image.',
    },
    {
      id: 'docker_df_q2',
      topicId: 'docker_dockerfile',
      question: 'What does CMD in a Dockerfile specify?',
      options: [
        'The image author',
        'The default command to run when container starts',
        'Comments',
        'Environment variables',
      ],
      correctIndex: 1,
      explanation: 'CMD specifies the default command that runs when a container starts.',
    },
  ],
}
