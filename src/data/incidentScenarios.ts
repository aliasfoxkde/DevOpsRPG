export interface IncidentScenario {
  id: string
  title: string
  icon: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: 'infrastructure' | 'application' | 'network' | 'security' | 'database'
  description: string
  symptoms: string[]
  affectedSystems: string[]
  rootCause: string
  diagnostics: DiagnosticStep[]
  resolution: ResolutionStep[]
  estimatedTime: number // in seconds
  xpReward: number
  goldReward: number
}

export interface DiagnosticStep {
  id: string
  action: string
  command?: string
  expectedResult?: string
  revealsClue: string
  timePenalty: number // seconds added if wrong
}

export interface ResolutionStep {
  id: string
  action: string
  command?: string
  verification?: string
}

export const INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: 'high-cpu-production',
    title: 'High CPU on Production Server',
    icon: '🔥',
    severity: 'critical',
    category: 'infrastructure',
    description: 'Production web servers are showing 95%+ CPU utilization. Users are experiencing slow response times and timeouts.',
    symptoms: [
      'Response times increased from 200ms to 5000ms+',
      'Users reporting "Gateway Timeout" errors',
      'Monitoring alerts firing for high CPU',
      'Load balancer health checks starting to fail',
    ],
    affectedSystems: ['web-server-01', 'web-server-02', 'load-balancer'],
    rootCause: 'A recent deployment included a memory leak in the batch job processor',
    diagnostics: [
      {
        id: 'd1',
        action: 'Check running processes',
        command: 'top -bn1 | head -20',
        expectedResult: 'python batch job using 85% CPU',
        revealsClue: 'The batch job processor is consuming excessive CPU',
        timePenalty: 15,
      },
      {
        id: 'd2',
        action: 'Check process tree',
        command: 'pstree -p | grep python',
        expectedResult: 'Multiple orphaned batch processes',
        revealsClue: 'Zombie batch processes are accumulating',
        timePenalty: 15,
      },
      {
        id: 'd3',
        action: 'Check recent deployments',
        command: 'git log --oneline -5',
        expectedResult: 'batch-processor update deployed 2 hours ago',
        revealsClue: 'Recent batch processor changes may be causing the issue',
        timePenalty: 10,
      },
    ],
    resolution: [
      {
        id: 'r1',
        action: 'Kill the runaway batch processes',
        command: 'pkill -f batch-processor',
        verification: 'CPU usage drops to normal levels',
      },
      {
        id: 'r2',
        action: 'Rollback the batch processor deployment',
        command: 'kubectl rollout undo deployment/batch-processor',
        verification: 'Previous stable version running',
      },
      {
        id: 'r3',
        action: 'Monitor for 5 minutes to confirm resolution',
        verification: 'CPU stable at <40%, response times back to normal',
      },
    ],
    estimatedTime: 180,
    xpReward: 300,
    goldReward: 150,
  },
  {
    id: 'database-connection-exhaustion',
    title: 'Database Connection Pool Exhausted',
    icon: '🗄️',
    severity: 'critical',
    category: 'database',
    description: 'Application is unable to establish new database connections. Users are seeing "Connection refused" errors.',
    symptoms: [
      'Database connection pool at 100% capacity',
      'New user requests failing with connection errors',
      'Background jobs queued and not processing',
      'Error logs showing "Too many connections"',
    ],
    affectedSystems: ['postgresql-primary', 'api-service', 'background-workers'],
    rootCause: 'Connection leak in the API service after a configuration change',
    diagnostics: [
      {
        id: 'd1',
        action: 'Check database connection count',
        command: 'SELECT count(*) FROM pg_stat_activity;',
        expectedResult: '150+ active connections (max is 100)',
        revealsClue: 'Connection count is abnormally high',
        timePenalty: 15,
      },
      {
        id: 'd2',
        action: 'Check idle connections',
        command: 'SELECT count(*) FROM pg_stat_activity WHERE state = \'idle\';',
        expectedResult: '120+ idle connections',
        revealsClue: 'Connections are not being properly released',
        timePenalty: 15,
      },
      {
        id: 'd3',
        action: 'Check application connection pool settings',
        command: 'grep -r "pool_size" /app/config/',
        expectedResult: 'pool_size increased to 200 recently',
        revealsClue: 'Config changed pool size beyond database limit',
        timePenalty: 10,
      },
    ],
    resolution: [
      {
        id: 'r1',
        action: 'Restart the API service to clear connections',
        command: 'systemctl restart api-service',
        verification: 'New connections being established properly',
      },
      {
        id: 'r2',
        action: 'Fix connection pool configuration',
        command: 'Update pool_size to 80 (80% of max_connections)',
        verification: 'Config updated and committed to version control',
      },
      {
        id: 'r3',
        action: 'Terminate idle connections',
        command: 'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = \'idle\' AND query_start < now() - interval \'10 minutes\';',
        verification: 'Connection count drops to healthy level',
      },
    ],
    estimatedTime: 150,
    xpReward: 350,
    goldReward: 175,
  },
  {
    id: 'network-partition',
    title: 'Network Partition Between Services',
    icon: '🌐',
    severity: 'high',
    category: 'network',
    description: 'Microservices cannot communicate with each other. Orders are being placed but not processed.',
    symptoms: [
      'API gateway returning 503 Service Unavailable',
      'Order service cannot reach payment service',
      'Health checks failing between internal services',
      'Increased latency in all service-to-service calls',
    ],
    affectedSystems: ['api-gateway', 'order-service', 'payment-service', 'inventory-service'],
    rootCause: 'Network policy accidentally deleted during maintenance',
    diagnostics: [
      {
        id: 'd1',
        action: 'Test connectivity between services',
        command: 'kubectl exec order-service -- curl -s payment-service:8080/health',
        expectedResult: 'Connection timeout',
        revealsClue: 'Services cannot reach each other',
        timePenalty: 10,
      },
      {
        id: 'd2',
        action: 'Check network policies',
        command: 'kubectl get networkpolicies --all-namespaces',
        expectedResult: 'No network policies found',
        revealsClue: 'Network policies are missing!',
        timePenalty: 10,
      },
      {
        id: 'd3',
        action: 'Check recent changes to network policies',
        command: 'kubectl get events --sort-by=\'.lastTimestamp\' | tail -20',
        expectedResult: 'Network policy deletion event found',
        revealsClue: 'Policies were deleted 30 minutes ago',
        timePenalty: 15,
      },
    ],
    resolution: [
      {
        id: 'r1',
        action: 'Apply network policies from version control',
        command: 'kubectl apply -f network-policies.yaml',
        verification: 'Network policies created in all namespaces',
      },
      {
        id: 'r2',
        action: 'Verify service connectivity restored',
        command: 'kubectl exec order-service -- curl -s payment-service:8080/health',
        verification: 'Health check returns 200 OK',
      },
      {
        id: 'r3',
        action: 'Monitor service mesh traffic',
        command: 'istioctl proxy-status',
        verification: 'All services reporting healthy',
      },
    ],
    estimatedTime: 120,
    xpReward: 250,
    goldReward: 125,
  },
  {
    id: 'ssl-certificate-expiry',
    title: 'SSL Certificate Expiring Soon',
    icon: '🔐',
    severity: 'high',
    category: 'security',
    description: 'SSL certificate for production domain expires in 24 hours. Automated renewal has failed.',
    symptoms: [
      'SSL certificate expiry alert received',
      'Let\'s Encrypt renewal cron job failing',
      'Certificate expires tomorrow at midnight UTC',
      'Browser warnings starting for some users',
    ],
    affectedSystems: ['nginx-ingress', 'api-gateway', 'cdn'],
    rootCause: 'LetsEncrypt rate limit hit due to misconfigured staging environment',
    diagnostics: [
      {
        id: 'd1',
        action: 'Check current certificate status',
        command: 'openssl s_client -connect api.example.com:443 -servername api.example.com 2>/dev/null | openssl x509 -noout -dates',
        expectedResult: 'NotAfter shows tomorrow\'s date',
        revealsClue: 'Certificate expires in less than 24 hours',
        timePenalty: 10,
      },
      {
        id: 'd2',
        action: 'Check cert-manager logs',
        command: 'kubectl logs -n cert-manager deployment/cert-manager | grep -i error',
        expectedResult: 'Rate limit exceeded error',
        revealsClue: 'Let\'s Encrypt rate limit has been exceeded',
        timePenalty: 15,
      },
      {
        id: 'd3',
        action: 'Check certificate request history',
        command: 'kubectl get certificaterequests -n production',
        expectedResult: 'Multiple failed requests visible',
        revealsClue: 'Failed attempts have exhausted our quota',
        timePenalty: 10,
      },
    ],
    resolution: [
      {
        id: 'r1',
        action: 'Manually trigger certificate renewal with staging disabled',
        command: 'kubectl annotate certificate -n production cert-manager.io/disable-staging=true',
        verification: 'Certificate request updated',
      },
      {
        id: 'r2',
        action: 'Force certificate reissuance',
        command: 'kubectl delete certificate production-tls && kubectl apply -f certificate.yaml',
        verification: 'New certificate request created',
      },
      {
        id: 'r3',
        action: 'Verify new certificate',
        command: 'kubectl get certificate production-tls -n production',
        verification: 'Ready status shows True, expiry date extended',
      },
    ],
    estimatedTime: 90,
    xpReward: 200,
    goldReward: 100,
  },
  {
    id: 'memory-leak-service',
    title: 'Memory Leak in Order Service',
    icon: '💾',
    severity: 'medium',
    category: 'application',
    description: 'Order service memory usage steadily climbing over the past week. Garbage collection not reclaiming memory.',
    symptoms: [
      'Memory usage increasing 5% per hour',
      'GC pauses causing latency spikes',
      'Eventually will hit memory limits and crash',
      'OOM killer may terminate the pod',
    ],
    affectedSystems: ['order-service'],
    rootCause: 'Order events not being acknowledged in message queue, causing memory buildup',
    diagnostics: [
      {
        id: 'd1',
        action: 'Check memory usage trend',
        command: 'kubectl top pods -n orders --sort-by=memory',
        expectedResult: 'order-service pod using 4GB, increasing',
        revealsClue: 'Memory is steadily growing',
        timePenalty: 10,
      },
      {
        id: 'd2',
        action: 'Generate heap dump for analysis',
        command: 'kubectl exec order-service-xxx -- curl localhost:8080/debug/pprof/heap',
        expectedResult: 'Heap dump shows unacknowledged messages',
        revealsClue: 'Message queue consumers holding references',
        timePenalty: 15,
      },
      {
        id: 'd3',
        action: 'Check message queue consumer lag',
        command: 'kubectl exec rabbitmq-xxx -- rabbitmqctl list_consumers',
        expectedResult: 'order-events queue has 0 acknowledgers',
        revealsClue: 'Consumer is not acknowledging messages',
        timePenalty: 10,
      },
    ],
    resolution: [
      {
        id: 'r1',
        action: 'Restart the order service to clear memory',
        command: 'kubectl rollout restart deployment/order-service',
        verification: 'New pod starts with normal memory usage',
      },
      {
        id: 'r2',
        action: 'Fix message acknowledgment code',
        command: 'Apply patch to add channel.basicAck() after processing',
        verification: 'Code change deployed to production',
      },
      {
        id: 'r3',
        action: 'Monitor memory over next 24 hours',
        command: 'Watch memory graph in Grafana',
        verification: 'Memory stays stable, no gradual increase',
      },
    ],
    estimatedTime: 120,
    xpReward: 200,
    goldReward: 100,
  },
  {
    id: 'dns-resolution-failure',
    title: 'DNS Resolution Failures',
    icon: '📡',
    severity: 'high',
    category: 'network',
    description: 'Internal DNS is intermittently failing. Some services cannot find each other by hostname.',
    symptoms: [
      'Random 404 errors for internal service calls',
      'CoreDNS pods showing restarts',
      'Flapping connectivity between services',
      'Error message: "No such host"',
    ],
    affectedSystems: ['core-dns', 'multiple services'],
    rootCause: 'CoreDNS running out of memory due to large upstream response',
    diagnostics: [
      {
        id: 'd1',
        action: 'Check CoreDNS pod status',
        command: 'kubectl get pods -n kube-system -l k8s-app=kube-dns',
        expectedResult: 'Pods restarting repeatedly (CrashLoopBackOff)',
        revealsClue: 'DNS pods are crashing',
        timePenalty: 10,
      },
      {
        id: 'd2',
        action: 'Check CoreDNS logs',
        command: 'kubectl logs -n kube-system -l k8s-app=kube-dns --tail=100',
        expectedResult: '"bufio.Scanner: token too long" errors',
        revealsClue: 'Large DNS response causing buffer overflow',
        timePenalty: 15,
      },
      {
        id: 'd3',
        action: 'Check forward configuration',
        command: 'kubectl configmap coredns -n kube-system -o yaml',
        expectedResult: 'Forward to large upstream DNS server',
        revealsClue: 'Upstream returning responses too large for buffer',
        timePenalty: 10,
      },
    ],
    resolution: [
      {
        id: 'r1',
        action: 'Scale CoreDNS to temporary extra replicas',
        command: 'kubectl scale deployment coredns -n kube-system --replicas=5',
        verification: 'Additional pods running',
      },
      {
        id: 'r2',
        action: 'Update CoreDNS config to increase buffer size',
        command: 'Edit ConfigMap to add "buffer 8m" directive',
        verification: 'ConfigMap updated successfully',
      },
      {
        id: 'r3',
        action: 'Restart CoreDNS pods',
        command: 'kubectl rollout restart deployment/coredns -n kube-system',
        verification: 'Pods restart with new configuration',
      },
    ],
    estimatedTime: 100,
    xpReward: 225,
    goldReward: 110,
  },
]

export const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-900/50', text: 'text-red-300', border: 'border-red-600', label: '🔴 Critical' },
  high: { bg: 'bg-orange-900/50', text: 'text-orange-300', border: 'border-orange-600', label: '🟠 High' },
  medium: { bg: 'bg-yellow-900/50', text: 'text-yellow-300', border: 'border-yellow-600', label: '🟡 Medium' },
  low: { bg: 'bg-blue-900/50', text: 'text-blue-300', border: 'border-blue-600', label: '🔵 Low' },
}

export const CATEGORY_ICONS: Record<IncidentScenario['category'], string> = {
  infrastructure: '🖥️',
  application: '💻',
  network: '🌐',
  security: '🔒',
  database: '🗄️',
}
