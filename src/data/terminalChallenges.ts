export interface TerminalChallenge {
  id: string
  category: 'git' | 'docker' | 'kubernetes' | 'bash' | 'terraform' | 'aws'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  description: string
  command: string
  hint?: string
  explanation: string
  expectedOutput?: string
}

export const TERMINAL_CHALLENGES: TerminalChallenge[] = [
  // Git Challenges
  {
    id: 'git_status',
    category: 'git',
    difficulty: 'beginner',
    description: 'Check the status of your repository',
    command: 'git status',
    hint: 'The most common git command to start with',
    explanation: 'git status shows the current state of your working directory and staging area.',
  },
  {
    id: 'git_add_all',
    category: 'git',
    difficulty: 'beginner',
    description: 'Stage all changes for commit',
    command: 'git add .',
    hint: 'The dot means all files',
    explanation: 'git add . stages all changes in the current directory for commit.',
  },
  {
    id: 'git_commit',
    category: 'git',
    difficulty: 'beginner',
    description: 'Commit staged changes with a message',
    command: 'git commit -m "Initial commit"',
    hint: 'Use -m flag for the message',
    explanation: 'git commit creates a snapshot of staged changes with a descriptive message.',
  },
  {
    id: 'git_branch',
    category: 'git',
    difficulty: 'intermediate',
    description: 'Create a new branch',
    command: 'git checkout -b new-feature',
    hint: 'checkout with -b creates and switches',
    explanation: 'git checkout -b creates a new branch and switches to it in one command.',
  },
  {
    id: 'git_merge',
    category: 'git',
    difficulty: 'intermediate',
    description: 'Merge a branch into current branch',
    command: 'git merge feature-branch',
    hint: 'Specify the branch to merge',
    explanation: 'git merge combines the changes from another branch into your current branch.',
  },
  {
    id: 'git_push',
    category: 'git',
    difficulty: 'beginner',
    description: 'Push commits to remote repository',
    command: 'git push origin main',
    hint: 'origin is the remote, main is the branch',
    explanation: 'git push uploads your local commits to the remote repository.',
  },
  {
    id: 'git_pull',
    category: 'git',
    difficulty: 'beginner',
    description: 'Pull latest changes from remote',
    command: 'git pull origin main',
    hint: 'The opposite of push',
    explanation: 'git pull fetches and integrates changes from the remote repository.',
  },
  {
    id: 'git_log',
    category: 'git',
    difficulty: 'intermediate',
    description: 'View recent commit history',
    command: 'git log --oneline',
    hint: '--oneline makes it compact',
    explanation: 'git log shows the commit history. The --oneline flag makes output compact.',
  },

  // Docker Challenges
  {
    id: 'docker_ps',
    category: 'docker',
    difficulty: 'beginner',
    description: 'List running containers',
    command: 'docker ps',
    hint: 'ps shows processes',
    explanation: 'docker ps lists all currently running Docker containers.',
  },
  {
    id: 'docker_images',
    category: 'docker',
    difficulty: 'beginner',
    description: 'List local Docker images',
    command: 'docker images',
    hint: 'Similar to ps but for images',
    explanation: 'docker images shows all locally stored Docker images.',
  },
  {
    id: 'docker_run',
    category: 'docker',
    difficulty: 'beginner',
    description: 'Run a new container',
    command: 'docker run -d nginx',
    hint: '-d runs in detached mode',
    explanation: 'docker run creates and starts a new container from an image. -d runs it in background.',
  },
  {
    id: 'docker_build',
    category: 'docker',
    difficulty: 'intermediate',
    description: 'Build an image from Dockerfile',
    command: 'docker build -t myapp .',
    hint: '-t tags the image with a name',
    explanation: 'docker build builds a Docker image from a Dockerfile in the current directory.',
  },
  {
    id: 'docker_exec',
    category: 'docker',
    difficulty: 'intermediate',
    description: 'Execute command in running container',
    command: 'docker exec -it container_name bash',
    hint: '-it for interactive terminal',
    explanation: 'docker exec runs a command inside a running container.',
  },
  {
    id: 'docker_logs',
    category: 'docker',
    difficulty: 'intermediate',
    description: 'View container logs',
    command: 'docker logs -f container_name',
    hint: '-f follows the log output',
    explanation: 'docker logs shows the logs from a container. -f follows output in real-time.',
  },
  {
    id: 'docker_compose_up',
    category: 'docker',
    difficulty: 'intermediate',
    description: 'Start services with Docker Compose',
    command: 'docker-compose up -d',
    hint: 'docker-compose manages multi-container apps',
    explanation: 'docker-compose up starts all services defined in docker-compose.yml.',
  },

  // Kubernetes Challenges
  {
    id: 'k8s_get_pods',
    category: 'kubernetes',
    difficulty: 'beginner',
    description: 'List all pods in default namespace',
    command: 'kubectl get pods',
    hint: 'kubectl is the K8s CLI',
    explanation: 'kubectl get pods lists all pods in the current namespace.',
  },
  {
    id: 'k8s_get_all',
    category: 'kubernetes',
    difficulty: 'beginner',
    description: 'List all resources in namespace',
    command: 'kubectl get all',
    hint: 'get all shows everything',
    explanation: 'kubectl get all lists all Kubernetes resources in the namespace.',
  },
  {
    id: 'k8s_describe',
    category: 'kubernetes',
    difficulty: 'intermediate',
    description: 'Show pod details',
    command: 'kubectl describe pod nginx',
    hint: 'describe gives detailed info',
    explanation: 'kubectl describe shows detailed information about a resource.',
  },
  {
    id: 'k8s_logs',
    category: 'kubernetes',
    difficulty: 'intermediate',
    description: 'View pod logs',
    command: 'kubectl logs nginx',
    hint: 'Same as docker logs concept',
    explanation: 'kubectl logs retrieves logs from a pod.',
  },
  {
    id: 'k8s_apply',
    category: 'kubernetes',
    difficulty: 'intermediate',
    description: 'Apply configuration from file',
    command: 'kubectl apply -f deployment.yaml',
    hint: 'apply creates or updates resources',
    explanation: 'kubectl apply creates or updates Kubernetes resources from a YAML file.',
  },
  {
    id: 'k8s_scale',
    category: 'kubernetes',
    difficulty: 'advanced',
    description: 'Scale a deployment',
    command: 'kubectl scale deployment nginx --replicas=3',
    hint: 'scale changes replica count',
    explanation: 'kubectl scale changes the number of replicas in a deployment.',
  },

  // Bash Challenges
  {
    id: 'bash_ls',
    category: 'bash',
    difficulty: 'beginner',
    description: 'List files in directory',
    command: 'ls -la',
    hint: '-l for long format, -a for hidden',
    explanation: 'ls lists files. -la shows detailed info including hidden files.',
  },
  {
    id: 'bash_cd',
    category: 'bash',
    difficulty: 'beginner',
    description: 'Change to home directory',
    command: 'cd ~',
    hint: '~ is home directory shorthand',
    explanation: 'cd changes the current directory. ~ is a shortcut for your home directory.',
  },
  {
    id: 'bash_grep',
    category: 'bash',
    difficulty: 'intermediate',
    description: 'Search for pattern in file',
    command: 'grep -r "error" ./logs',
    hint: '-r searches recursively',
    explanation: 'grep searches for patterns in files. -r searches recursively through directories.',
  },
  {
    id: 'bash_chmod',
    category: 'bash',
    difficulty: 'advanced',
    description: 'Make script executable',
    command: 'chmod +x script.sh',
    hint: '+x adds execute permission',
    explanation: 'chmod modifies file permissions. +x makes a script executable.',
  },
  {
    id: 'bash_pipe',
    category: 'bash',
    difficulty: 'intermediate',
    description: 'Count lines in file using pipe',
    command: 'cat file.txt | wc -l',
    hint: 'pipe sends output to next command',
    explanation: 'The pipe operator | sends the output of one command as input to another.',
  },

  // AWS Challenges
  {
    id: 'aws_s3_ls',
    category: 'aws',
    difficulty: 'beginner',
    description: 'List S3 buckets',
    command: 'aws s3 ls',
    hint: 's3 ls lists buckets',
    explanation: 'aws s3 ls shows all S3 buckets in your AWS account.',
  },
  {
    id: 'aws_ec2_describe',
    category: 'aws',
    difficulty: 'intermediate',
    description: 'List EC2 instances',
    command: 'aws ec2 describe-instances',
    hint: 'describe shows detailed info',
    explanation: 'aws ec2 describe-instances shows all EC2 instances in your account.',
  },
  {
    id: 'aws_lambda_list',
    category: 'aws',
    difficulty: 'intermediate',
    description: 'List Lambda functions',
    command: 'aws lambda list-functions',
    hint: 'list-functions shows all Lambda',
    explanation: 'aws lambda list-functions displays all Lambda functions in your account.',
  },

  // Terraform Challenges
  {
    id: 'tf_init',
    category: 'terraform',
    difficulty: 'beginner',
    description: 'Initialize Terraform working directory',
    command: 'terraform init',
    hint: 'init is always the first command',
    explanation: 'terraform init initializes a Terraform working directory containing configuration files.',
  },
  {
    id: 'tf_plan',
    category: 'terraform',
    difficulty: 'beginner',
    description: 'Generate execution plan',
    command: 'terraform plan',
    hint: 'plan shows what will change',
    explanation: 'terraform plan creates an execution plan showing what Terraform will do.',
  },
  {
    id: 'tf_apply',
    category: 'terraform',
    difficulty: 'intermediate',
    description: 'Apply changes from plan',
    command: 'terraform apply',
    hint: 'apply executes the plan',
    explanation: 'terraform apply executes the actions proposed in the Terraform plan.',
  },
]

export function getChallengesByCategory(category: TerminalChallenge['category']) {
  return TERMINAL_CHALLENGES.filter(c => c.category === category)
}

export function getChallengesByDifficulty(difficulty: TerminalChallenge['difficulty']) {
  return TERMINAL_CHALLENGES.filter(c => c.difficulty === difficulty)
}

export function getRandomChallenges(count: number, category?: TerminalChallenge['category']) {
  const pool = category ? getChallengesByCategory(category) : TERMINAL_CHALLENGES
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export const CATEGORY_COLORS: Record<TerminalChallenge['category'], string> = {
  git: '#f05032',
  docker: '#2496ed',
  kubernetes: '#326ce5',
  bash: '#4eaa25',
  terraform: '#7b42bc',
  aws: '#ff9900',
}

export const DIFFICULTY_LABELS: Record<TerminalChallenge['difficulty'], string> = {
  beginner: '🌱 Beginner',
  intermediate: '⚡ Intermediate',
  advanced: '🔥 Advanced',
}
