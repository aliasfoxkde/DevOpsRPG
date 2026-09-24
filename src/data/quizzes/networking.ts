// Quiz content for Networking (networking) topics, split out of
// quizzes.ts for maintainability; assembled by the barrel there.
import type { QuizQuestion } from '../quizzes'

export const networkingQuizzes: Record<string, QuizQuestion[]> = {
  net_intro: [
    {
      id: 'net_intro_q1',
      topicId: 'net_intro',
      question: 'What does HTTP stand for?',
      options: [
        'Hyper Text Transfer Protocol',
        'High Tech Transfer Protocol',
        'Hyperlink Text Transfer Protocol',
        'Home Tool Transfer Protocol',
      ],
      correctIndex: 0,
      explanation:
        'HTTP stands for Hyper Text Transfer Protocol - the foundation of data communication on the web.',
    },
    {
      id: 'net_intro_q2',
      topicId: 'net_intro',
      question: 'What is the default port for HTTPS?',
      options: ['80', '443', '8080', '22'],
      correctIndex: 1,
      explanation: 'HTTPS defaults to port 443, while HTTP defaults to port 80.',
    },
  ],

  net_tcpip: [
    {
      id: 'net_tcp_q1',
      topicId: 'net_tcpip',
      question: 'What does TCP stand for?',
      options: [
        'Transfer Control Protocol',
        'Transmission Control Protocol',
        'Technical Control Protocol',
        'Text Control Protocol',
      ],
      correctIndex: 1,
      explanation:
        'TCP stands for Transmission Control Protocol - it ensures reliable, ordered delivery of data.',
    },
    {
      id: 'net_tcp_q2',
      topicId: 'net_tcpip',
      question: 'What is the difference between TCP and UDP?',
      options: [
        'TCP is faster than UDP',
        'UDP is more reliable than TCP',
        'TCP provides reliable, ordered delivery; UDP is faster but unreliable',
        'There is no difference',
      ],
      correctIndex: 2,
      explanation:
        "TCP ensures reliability and order with handshake and acknowledgments. UDP is simpler and faster but doesn't guarantee delivery.",
    },
  ],

  net_dns: [
    {
      id: 'net_dns_q1',
      topicId: 'net_dns',
      question: 'What does DNS stand for?',
      options: [
        'Domain Name System',
        'Dynamic Network Service',
        'Domain Network Setup',
        'Data Name Service',
      ],
      correctIndex: 0,
      explanation:
        'DNS (Domain Name System) translates human-readable domain names into IP addresses.',
    },
    {
      id: 'net_dns_q2',
      topicId: 'net_dns',
      question: 'What type of DNS record points to an IP address?',
      options: ['A record', 'CNAME record', 'MX record', 'TXT record'],
      correctIndex: 0,
      explanation: 'A (Address) records point a domain name directly to an IPv4 IP address.',
    },
  ],

  net_http: [
    {
      id: 'net_http_q1',
      topicId: 'net_http',
      question: 'Which HTTP method is used to create a resource?',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      correctIndex: 1,
      explanation:
        'POST is typically used to create new resources. PUT is used to update or create at a specific URI.',
    },
    {
      id: 'net_http_q2',
      topicId: 'net_http',
      question: 'What status code indicates "Not Found"?',
      options: ['200', '201', '404', '500'],
      correctIndex: 2,
      explanation: '404 is the standard status code for "Not Found" - the resource does not exist.',
    },
  ],

  net_loadbalancers: [
    {
      id: 'net_loadbalancers_q1',
      topicId: 'net_loadbalancers',
      question: 'What is the main purpose of a load balancer?',
      options: [
        'Increase security',
        'Distribute traffic across servers',
        'Store data',
        'Cache content',
      ],
      correctIndex: 1,
      explanation:
        'Load balancers distribute incoming traffic across multiple servers to ensure reliability and performance.',
    },
    {
      id: 'net_loadbalancers_q2',
      topicId: 'net_loadbalancers',
      question: 'What is a health check in load balancing?',
      options: ['Security scan', 'Server availability test', 'Data backup', 'Cache validation'],
      correctIndex: 1,
      explanation:
        'Health checks monitor server health and route traffic away from unhealthy servers.',
    },
  ],
}
