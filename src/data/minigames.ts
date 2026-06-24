// Command Typer - typing game for DevOps commands
export interface Command {
  id: string
  command: string
  description: string
  category: 'git' | 'docker' | 'bash' | 'kubernetes' | 'aws'
}

export const commands: Command[] = [
  // Git commands
  { id: 'git_clone', command: 'git clone', description: 'Clone a repository', category: 'git' },
  { id: 'git_commit', command: 'git commit -m', description: 'Commit changes with message', category: 'git' },
  { id: 'git_push', command: 'git push', description: 'Push to remote', category: 'git' },
  { id: 'git_pull', command: 'git pull', description: 'Pull from remote', category: 'git' },
  { id: 'git_branch', command: 'git branch', description: 'List branches', category: 'git' },
  { id: 'git_checkout', command: 'git checkout', description: 'Switch branches', category: 'git' },
  { id: 'git_status', command: 'git status', description: 'Check repository status', category: 'git' },
  { id: 'git_merge', command: 'git merge', description: 'Merge branches', category: 'git' },
  { id: 'git_add', command: 'git add .', description: 'Stage all changes', category: 'git' },
  { id: 'git_log', command: 'git log', description: 'View commit history', category: 'git' },

  // Docker commands
  { id: 'docker_run', command: 'docker run', description: 'Run a container', category: 'docker' },
  { id: 'docker_ps', command: 'docker ps', description: 'List running containers', category: 'docker' },
  { id: 'docker_images', command: 'docker images', description: 'List local images', category: 'docker' },
  { id: 'docker_build', command: 'docker build', description: 'Build an image', category: 'docker' },
  { id: 'docker_stop', command: 'docker stop', description: 'Stop a container', category: 'docker' },
  { id: 'docker_rm', command: 'docker rm', description: 'Remove a container', category: 'docker' },
  { id: 'docker_exec', command: 'docker exec', description: 'Execute command in container', category: 'docker' },
  { id: 'docker_logs', command: 'docker logs', description: 'View container logs', category: 'docker' },

  // Bash commands
  { id: 'bash_ls', command: 'ls -la', description: 'List files with details', category: 'bash' },
  { id: 'bash_cd', command: 'cd', description: 'Change directory', category: 'bash' },
  { id: 'bash_mkdir', command: 'mkdir', description: 'Create directory', category: 'bash' },
  { id: 'bash_cp', command: 'cp -r', description: 'Copy files recursively', category: 'bash' },
  { id: 'bash_rm', command: 'rm -rf', description: 'Remove force recursively', category: 'bash' },
  { id: 'bash_chmod', command: 'chmod +x', description: 'Make file executable', category: 'bash' },
  { id: 'bash_cat', command: 'cat', description: 'Display file contents', category: 'bash' },
  { id: 'bash_grep', command: 'grep', description: 'Search text patterns', category: 'bash' },

  // Kubernetes commands
  { id: 'k8s_get_pods', command: 'kubectl get pods', description: 'List pods', category: 'kubernetes' },
  { id: 'k8s_apply', command: 'kubectl apply -f', description: 'Apply configuration', category: 'kubernetes' },
  { id: 'k8s_describe', command: 'kubectl describe', description: 'Describe resource', category: 'kubernetes' },
  { id: 'k8s_logs', command: 'kubectl logs', description: 'View pod logs', category: 'kubernetes' },
  { id: 'k8s_exec', command: 'kubectl exec -it', description: 'Execute in pod', category: 'kubernetes' },
  { id: 'k8s_delete', command: 'kubectl delete', description: 'Delete resource', category: 'kubernetes' },

  // AWS commands
  { id: 'aws_s3_ls', command: 'aws s3 ls', description: 'List S3 buckets', category: 'aws' },
  { id: 'aws_ec2_desc', command: 'aws ec2 describe-instances', description: 'Describe EC2 instances', category: 'aws' },
  { id: 'aws_s3_cp', command: 'aws s3 cp', description: 'Copy to S3', category: 'aws' },
  { id: 'aws_lambda', command: 'aws lambda invoke', description: 'Invoke Lambda', category: 'aws' },
]

// Memory game cards
export interface MemoryCard {
  id: string
  icon: string
  name: string
  matched: boolean
}

export const memoryIcons = [
  { id: 'html', icon: '📄', name: 'HTML' },
  { id: 'css', icon: '🎨', name: 'CSS' },
  { id: 'js', icon: '⚡', name: 'JavaScript' },
  { id: 'git', icon: '📚', name: 'Git' },
  { id: 'docker', icon: '🐳', name: 'Docker' },
  { id: 'python', icon: '🐍', name: 'Python' },
  { id: 'react', icon: '⚛️', name: 'React' },
  { id: 'aws', icon: '☁️', name: 'AWS' },
  { id: 'kubernetes', icon: '☸️', name: 'Kubernetes' },
  { id: 'nodejs', icon: '🟢', name: 'Node.js' },
  { id: 'database', icon: '🗄️', name: 'Database' },
  { id: 'cloud', icon: '⛅', name: 'Cloud' },
]

// Math challenges
export interface MathChallenge {
  id: string
  question: string
  answer: number
  hint: string
}

export const mathChallenges: MathChallenge[] = [
  { id: 'bits_1', question: 'How many bits in a byte?', answer: 8, hint: 'Each byte = 8 bits' },
  { id: 'bits_2', question: 'How many bytes in a kilobyte (KB)?', answer: 1024, hint: '2^10 bytes' },
  { id: 'bits_3', question: 'How many MB in a GB?', answer: 1024, hint: 'Power of 2' },
  { id: 'docker_tag', question: '2^3 Docker layers - how many?', answer: 8, hint: '2 * 2 * 2' },
  { id: 'port_443', question: 'What is the square root of 81?', answer: 9, hint: '9 * 9' },
  { id: 'cpu_cores', question: '2^6 CPU address lines = how many addresses?', answer: 64, hint: '2^6 = 64' },
  { id: 'hex_ff', question: 'What is 255 in binary (count the 1s)?', answer: 8, hint: '11111111 has 8 ones' },
  { id: 'subnet', question: 'What is 2^16 - 2 for subnet hosts?', answer: 65534, hint: '65536 - 2' },
  { id: 'memory_1', question: '2^10 KB = how many MB?', answer: 1, hint: '1024 KB = 1 MB' },
  { id: 'container_1', question: 'A pod has 3 containers. Each needs 512MB. Total in MB?', answer: 1536, hint: '3 × 512' },
  { id: 'replicas_1', question: 'Scale from 2 to 5 replicas. Added how many?', answer: 3, hint: '5 - 2' },
  { id: 'build_time', question: 'Build takes 90 seconds. How many builds per hour max?', answer: 40, hint: '3600 / 90' },
]

// Code puzzle challenges
export interface CodePuzzle {
  id: string
  title: string
  description: string
  code: string
  answer: string
  options?: string[]
}

export const codePuzzles: CodePuzzle[] = [
  {
    id: 'html_tag',
    title: 'Missing Tag',
    description: 'Complete the HTML paragraph tag',
    code: '<___>Hello World</p>',
    answer: 'p',
    options: ['p', 'div', 'span', 'h1'],
  },
  {
    id: 'css_prop',
    title: 'CSS Property',
    description: 'Which property changes text color?',
    code: 'color: ___;',
    answer: 'red',
    options: ['color', 'background', 'font', 'text'],
  },
  {
    id: 'js_var',
    title: 'Variable Declaration',
    description: 'Declare a constant named "apiKey"',
    code: '___ apiKey = "secret123";',
    answer: 'const',
    options: ['const', 'var', 'let', 'function'],
  },
  {
    id: 'git_cmd',
    title: 'Git Command',
    description: 'Which command stages all changes?',
    code: '___ .',
    answer: 'git add',
  },
  {
    id: 'docker_img',
    title: 'Docker Image',
    description: 'Pull the nginx image',
    code: 'docker ___ nginx:latest',
    answer: 'pull',
    options: ['pull', 'push', 'run', 'build'],
  },
  {
    id: 'array_idx',
    title: 'Array Index',
    description: 'First element of [10, 20, 30]?',
    code: '[10, 20, 30][___]',
    answer: '0',
    options: ['0', '1', 'first', '-1'],
  },
  {
    id: 'python_list',
    title: 'Python List',
    description: 'Create a list with items 1, 2, 3',
    code: 'my_list = [___, 2, 3]',
    answer: '1',
  },
  {
    id: 'yaml_bool',
    title: 'YAML Boolean',
    description: 'Valid YAML boolean values?',
    code: 'enabled: ___',
    answer: 'true',
    options: ['true', 'yes', 'on', 'All of the above'],
  },
  {
    id: 'json_key',
    title: 'JSON Key',
    description: 'Valid JSON key format?',
    code: '{___: "value"}',
    answer: '"key"',
    options: ['"key"', 'key', ':key', '[key]'],
  },
  {
    id: 'sql_select',
    title: 'SQL SELECT',
    description: 'Select all from users table',
    code: 'SELECT ___ FROM users;',
    answer: '*',
    options: ['*', 'all', 'id', 'everything'],
  },
]

export function getCommandsByCategory(category: Command['category']): Command[] {
  return commands.filter(c => c.category === category)
}

export function getRandomCommands(count: number, category?: Command['category']): Command[] {
  const pool = category ? getCommandsByCategory(category) : commands
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
