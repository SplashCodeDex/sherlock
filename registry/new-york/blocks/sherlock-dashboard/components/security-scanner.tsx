import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, XCircle, Clock, Shield, Wifi, Lock, Eye } from "lucide-react"

interface SecurityScannerProps {
  analysis: any[]
  loading: boolean
}

interface ScanResult {
  id: string
  url: string
  scanType: string
  status: 'completed' | 'failed' | 'in_progress'
  securityScore: number
  issues: {
    critical: number
    high: number
    medium: number
    low: number
  }
  scanDuration: number
  lastScanned: string
  findings: string[]
}

export function SecurityScanner({ analysis, loading }: SecurityScannerProps) {
  const mockResults: ScanResult[] = [
    {
      id: '1',
      url: 'https://example.com',
      scanType: 'comprehensive',
      status: 'completed',
      securityScore: 87,
      issues: { critical: 0, high: 2, medium: 5, low: 8 },
      scanDuration: 45,
      lastScanned: '2024-01-15T10:30:00Z',
      findings: [
        'SSL certificate expires in 30 days',
        'Missing security headers',
        'Outdated jQuery library detected'
      ]
    },
    {
      id: '2',
      url: 'https://api.example.com',
      scanType: 'api',
      status: 'completed',
      securityScore: 92,
      issues: { critical: 0, high: 1, medium: 2, low: 3 },
      scanDuration: 32,
      lastScanned: '2024-01-15T09:15:00Z',
      findings: [
        'API rate limiting not configured',
        'CORS policy too permissive'
      ]
    }
  ]

  const results = analysis || mockResults

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 dark:bg-green-950'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950'
    return 'text-red-600 bg-red-50 dark:bg-red-950'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: "default" as const, text: "Excellent" }
    if (score >= 80) return { variant: "secondary" as const, text: "Good" }
    if (score >= 60) return { variant: "outline" as const, text: "Fair" }
    return { variant: "destructive" as const, text: "Poor" }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Scan in Progress</span>
          </CardTitle>
          <CardDescription>Performing comprehensive security analysis...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scan Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SSL/TLS Analysis</span>
              <span className="text-sm text-muted-foreground">Complete</span>
            </div>
            <Progress value={100} className="h-2" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Header Security Check</span>
              <span className="text-sm text-muted-foreground">75%</span>
            </div>
            <Progress value={75} className="h-2" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Vulnerability Scan</span>
              <span className="text-sm text-muted-foreground">In Progress</span>
            </div>
            <Progress value={45} className="h-2" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Malware Detection</span>
              <span className="text-sm text-muted-foreground">Queued</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>

          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Scanning in progress... This may take 2-3 minutes for comprehensive analysis.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Scan Results</CardTitle>
          <CardDescription>No scans performed yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Start your first security scan to see results here</p>
            <Button>Start New Scan</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Security Scan Results</span>
        </CardTitle>
        <CardDescription>
          Latest security analysis results and vulnerability assessments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {results.map((result) => (
            <div key={result.id} className="border rounded-lg p-4 space-y-4">
              {/* Scan Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <h3 className="font-semibold">{result.url}</h3>
                    <p className="text-sm text-muted-foreground">
                      {result.scanType} scan • {result.scanDuration}s duration
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getScoreColor(result.securityScore)}>
                    {result.securityScore}% Secure
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(result.lastScanned).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Security Score */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Security Score</span>
                  <span>{result.securityScore}%</span>
                </div>
                <Progress value={result.securityScore} className="h-2" />
              </div>

              {/* Issues Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-2 bg-red-50 dark:bg-red-950 rounded">
                  <div className="text-lg font-bold text-red-600">{result.issues.critical}</div>
                  <div className="text-xs text-red-600">Critical</div>
                </div>
                <div className="text-center p-2 bg-orange-50 dark:bg-orange-950 rounded">
                  <div className="text-lg font-bold text-orange-600">{result.issues.high}</div>
                  <div className="text-xs text-orange-600">High</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                  <div className="text-lg font-bold text-yellow-600">{result.issues.medium}</div>
                  <div className="text-xs text-yellow-600">Medium</div>
                </div>
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded">
                  <div className="text-lg font-bold text-blue-600">{result.issues.low}</div>
                  <div className="text-xs text-blue-600">Low</div>
                </div>
              </div>

              {/* Key Findings */}
              <div>
                <h4 className="font-medium mb-2">Key Findings</h4>
                <div className="space-y-1">
                  {result.findings.slice(0, 3).map((finding, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <AlertTriangle className="h-3 w-3 text-orange-500 flex-shrink-0" />
                      <span>{finding}</span>
                    </div>
                  ))}
                  {result.findings.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{result.findings.length - 3} more findings
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm">
                  View Full Report
                </Button>
                <Button variant="outline" size="sm">
                  Export PDF
                </Button>
                <Button size="sm">
                  Rescan
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}