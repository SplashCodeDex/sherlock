import { useState, useEffect } from "react"

interface SecurityAnalysis {
  id: string
  url: string
  domain: string
  scanType: 'comprehensive' | 'quick' | 'api' | 'compliance'
  status: 'completed' | 'failed' | 'in_progress' | 'pending'
  securityScore: number
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  vulnerabilities: {
    critical: number
    high: number
    medium: number
    low: number
  }
  scanDuration: number
  lastScanned: string
  findings: string[]
  sslInfo?: {
    valid: boolean
    expires: string
    issuer: string
  }
  headers: Record<string, string>
  technologies: string[]
}

interface SecurityHookReturn {
  analysis: SecurityAnalysis[]
  loading: boolean
  error: string | null
  startScan: (url: string, scanType: string) => Promise<void>
  monitorSites: (urls: string[]) => Promise<void>
  getScanResults: (scanId: string) => SecurityAnalysis | null
}

export function useSecurityAnalysis(): SecurityHookReturn {
  const [analysis, setAnalysis] = useState<SecurityAnalysis[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Realistic mock data for security analysis
  const mockAnalysis: SecurityAnalysis[] = [
    {
      id: 'scan-001',
      url: 'https://example.com',
      domain: 'example.com',
      scanType: 'comprehensive',
      status: 'completed',
      securityScore: 87,
      riskLevel: 'medium',
      vulnerabilities: { critical: 0, high: 2, medium: 5, low: 8 },
      scanDuration: 45,
      lastScanned: '2024-01-15T10:30:00Z',
      findings: [
        'SSL certificate expires in 30 days',
        'Missing security headers (CSP, HSTS)',
        'Outdated jQuery library detected',
        'Directory listing enabled on /admin/',
        'Server information disclosure'
      ],
      sslInfo: {
        valid: true,
        expires: '2024-02-15',
        issuer: 'Let\'s Encrypt Authority X3'
      },
      headers: {
        'server': 'nginx/1.20.1',
        'x-powered-by': 'PHP/8.1.0',
        'content-security-policy': 'default-src \'self\''
      },
      technologies: ['nginx', 'PHP', 'jQuery', 'Bootstrap']
    },
    {
      id: 'scan-002',
      url: 'https://api.example.com',
      domain: 'api.example.com',
      scanType: 'api',
      status: 'completed',
      securityScore: 92,
      riskLevel: 'low',
      vulnerabilities: { critical: 0, high: 1, medium: 2, low: 3 },
      scanDuration: 32,
      lastScanned: '2024-01-15T09:15:00Z',
      findings: [
        'API rate limiting not configured',
        'CORS policy too permissive',
        'API versioning not implemented'
      ],
      sslInfo: {
        valid: true,
        expires: '2024-06-20',
        issuer: 'DigiCert SHA2 Secure Server CA'
      },
      headers: {
        'server': 'nginx/1.20.1',
        'access-control-allow-origin': '*',
        'x-ratelimit-limit': '100'
      },
      technologies: ['nginx', 'Node.js', 'Express', 'MongoDB']
    },
    {
      id: 'scan-003',
      url: 'https://staging.example.com',
      domain: 'staging.example.com',
      scanType: 'quick',
      status: 'completed',
      securityScore: 64,
      riskLevel: 'high',
      vulnerabilities: { critical: 1, high: 4, medium: 7, low: 12 },
      scanDuration: 18,
      lastScanned: '2024-01-15T08:45:00Z',
      findings: [
        'Debug mode enabled in production',
        'Database credentials exposed',
        'Unpatched security vulnerabilities',
        'Weak password policy'
      ],
      sslInfo: {
        valid: false,
        expires: '2023-12-01',
        issuer: 'Self-signed certificate'
      },
      headers: {
        'server': 'Apache/2.4.41',
        'x-debug': 'true',
        'x-powered-by': 'PHP/7.4.3'
      },
      technologies: ['Apache', 'PHP', 'MySQL', 'WordPress']
    }
  ]

  useEffect(() => {
    // Initialize with mock security analysis data
    setAnalysis(mockAnalysis)
  }, [])

  const startScan = async (url: string, scanType: string) => {
    setLoading(true)
    setError(null)

    try {
      // Validate URL
      if (!isValidUrl(url)) {
        throw new Error('Invalid URL format. Please enter a valid website URL.')
      }

      // Simulate comprehensive security scan
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Generate realistic scan results based on URL and scan type
      const newScan: SecurityAnalysis = {
        id: `scan-${Date.now()}`,
        url,
        domain: extractDomain(url),
        scanType: scanType as SecurityAnalysis['scanType'],
        status: 'completed',
        securityScore: Math.floor(Math.random() * 40) + 60, // 60-100 range
        riskLevel: getRandomRiskLevel(),
        vulnerabilities: {
          critical: Math.floor(Math.random() * 3),
          high: Math.floor(Math.random() * 5),
          medium: Math.floor(Math.random() * 8),
          low: Math.floor(Math.random() * 12)
        },
        scanDuration: Math.floor(Math.random() * 60) + 30,
        lastScanned: new Date().toISOString(),
        findings: generateFindings(scanType),
        sslInfo: {
          valid: Math.random() > 0.3,
          expires: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          issuer: 'Let\'s Encrypt Authority X3'
        },
        headers: {
          'server': 'nginx/1.20.1',
          'x-powered-by': 'PHP/8.1.0'
        },
        technologies: ['nginx', 'PHP', 'React']
      }

      setAnalysis(prev => [newScan, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Security scan failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const monitorSites = async (urls: string[]) => {
    setLoading(true)
    setError(null)

    try {
      // Simulate monitoring setup
      await new Promise(resolve => setTimeout(resolve, 1500))

      // In a real implementation, this would set up continuous monitoring
      console.log('Monitoring sites:', urls)
    } catch (err) {
      setError("Failed to setup monitoring. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getScanResults = (scanId: string): SecurityAnalysis | null => {
    return analysis.find(scan => scan.id === scanId) || null
  }

  return {
    analysis,
    loading,
    error,
    startScan,
    monitorSites,
    getScanResults
  }
}

// Utility functions
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (_) {
    return false
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch (_) {
    return 'unknown-domain.com'
  }
}

function getRandomRiskLevel(): SecurityAnalysis['riskLevel'] {
  const levels: SecurityAnalysis['riskLevel'][] = ['low', 'medium', 'high', 'critical']
  const weights = [0.4, 0.35, 0.2, 0.05] // Higher probability for lower risk levels

  let random = Math.random()
  for (let i = 0; i < levels.length; i++) {
    random -= weights[i]
    if (random <= 0) return levels[i]
  }
  return 'medium'
}

function generateFindings(scanType: string): string[] {
  const findingTemplates = {
    comprehensive: [
      'SSL certificate expires in 30 days',
      'Missing security headers',
      'Outdated software components',
      'Directory listing enabled',
      'Server information disclosure',
      'Weak password policy detected',
      'Unpatched security vulnerabilities'
    ],
    quick: [
      'SSL certificate validation',
      'Basic header security check',
      'Common port scanning'
    ],
    api: [
      'API rate limiting not configured',
      'CORS policy too permissive',
      'API versioning not implemented',
      'Authentication mechanism review'
    ],
    compliance: [
      'GDPR compliance check',
      'Data protection assessment',
      'Privacy policy review'
    ]
  }

  const templates = findingTemplates[scanType as keyof typeof findingTemplates] || findingTemplates.comprehensive
  const numFindings = Math.floor(Math.random() * 4) + 2 // 2-5 findings

  return templates
    .sort(() => Math.random() - 0.5)
    .slice(0, numFindings)
}