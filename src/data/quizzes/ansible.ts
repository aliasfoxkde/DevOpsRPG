// Quiz content for Ansible (ansible) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const ansibleQuizzes: Record<string, QuizQuestion[]> = {
  ans_intro: [
    {
      id: 'ans_intro_q1',
      topicId: 'ans_intro',
      question: 'What is Ansible primarily used for?',
      options: [
        'Container orchestration',
        'Configuration management and automation',
        'Database management',
        'Network routing',
      ],
      correctIndex: 1,
      explanation:
        'Ansible is an open-source automation tool for configuration management, application deployment, and task automation.',
    },
    {
      id: 'ans_intro_q2',
      topicId: 'ans_intro',
      question: 'What communication method does Ansible use to connect to servers??',
      options: ['SSH only', 'WinRM only', 'SSH and WinRM', 'Docker API'],
      correctIndex: 2,
      explanation:
        'Ansible uses SSH for Linux/Unix servers and WinRM (Windows Remote Management) for Windows servers.',
    },
  ],

  ans_inventory: [
    {
      id: 'ans_inv_q1',
      topicId: 'ans_inventory',
      question: 'What is an Ansible inventory file?',
      options: [
        'A list of Ansible modules',
        'A file that defines managed hosts and groups',
        'A backup of playbooks',
        'A log file for Ansible runs',
      ],
      correctIndex: 1,
      explanation:
        'The inventory file defines hosts and groups of hosts that Ansible manages and automation tasks target.',
    },
    {
      id: 'ans_inv_q2',
      topicId: 'ans_inventory',
      question: 'What is the default location for the Ansible inventory file?',
      options: ['/etc/ansible/hosts', '~/.ansible/hosts', '/opt/inventory.ini', '~/inventory.yml'],
      correctIndex: 0,
      explanation:
        'By default, Ansible looks for the inventory file at /etc/ansible/hosts, but this can be customized.',
    },
  ],

  ans_playbooks: [
    {
      id: 'ans_play_q1',
      topicId: 'ans_playbooks',
      question: 'What language are Ansible playbooks written in?',
      options: ['Python', 'YAML', 'JSON', 'XML'],
      correctIndex: 1,
      explanation:
        "Ansible playbooks are written in YAML (YAML Ain't Markup Language), making them human-readable.",
    },
    {
      id: 'ans_play_q2',
      topicId: 'ans_playbooks',
      question: 'What is a "play" in an Ansible playbook?',
      options: [
        'A single task to execute',
        'A mapping between hosts and tasks',
        'A configuration file',
        'An inventory group',
      ],
      correctIndex: 1,
      explanation: 'A play defines which hosts to target and what tasks to run on those hosts.',
    },
  ],

  ans_roles: [
    {
      id: 'ans_role_q1',
      topicId: 'ans_roles',
      question: 'What is the purpose of Ansible roles?',
      options: [
        'To define user permissions',
        'To organize and reuse playbook components',
        'To manage server hardware',
        'To monitor server performance',
      ],
      correctIndex: 1,
      explanation:
        'Roles allow you to package tasks, handlers, variables, and other files into a reusable structure.',
    },
    {
      id: 'ans_role_q2',
      topicId: 'ans_roles',
      question: 'Which directory structure is used by Ansible roles?',
      options: [
        'bin/, lib/, doc/',
        'tasks/, handlers/, vars/, templates/, files/',
        'src/, include/, module/',
        'play/, run/, config/',
      ],
      correctIndex: 1,
      explanation:
        'Standard Ansible role directories include tasks/, handlers/, vars/, defaults/, templates/, files/, and more.',
    },
  ],

  ans_modules: [
    {
      id: 'ans_mod_q1',
      topicId: 'ans_modules',
      question: 'What are Ansible modules?',
      options: [
        'Physical server components',
        'Units of code that Ansible executes on targets',
        'Network protocols',
        'Database schemas',
      ],
      correctIndex: 1,
      explanation:
        'Modules are standalone scripts that Ansible executes on target hosts to perform specific tasks.',
    },
    {
      id: 'ans_mod_q2',
      topicId: 'ans_modules',
      question: 'Which module would you use to manage packages on Debian/Ubuntu?',
      options: ['yum_package', 'apt_package', 'brew_package', 'chocolatey'],
      correctIndex: 1,
      explanation:
        'The apt_package module is used for managing packages on Debian-based systems like Ubuntu.',
    },
  ],
}
