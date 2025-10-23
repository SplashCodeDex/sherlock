import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Target,
  Zap,
  FileText,
  Calendar,
  Users,
  DollarSign
} from "lucide-react"

interface RiskAssessmentProps {
  analysis: any[]
}

interface RiskMetric {
  category: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  score: number
  trend: 'improving' | 'degrading' | 'stable'
  description: string
  recommendations: string[]
}

export function RiskAssessment({ analysis }: RiskAssessmentProps) {
  const riskMetrics: RiskMetric[] = [
    {
      category: 'SSL/TLS Security',
      riskLevel: 'medium',
      score: 75,
      trend: 'improving',
      description: 'Certificate management and encryption strength',
      recommendations: [
        'Implement certificate monitoring alerts',
        'Enable HTTP Strict Transport Security (HSTS)',
        'Configure SSL session resumption'
      ]
    },
    {
      category: 'Web Application Security',
      riskLevel: 'high',
      score: 68,
      trend: 'stable',
      description: 'OWASP Top 10 vulnerabilities and injection attacks',
      recommendations: [
        'Implement Content Security Policy (CSP)',
        'Add input validation and sanitization',
        'Regular security code reviews'
      ]
    },
    {
      category: 'Network Security',
      riskLevel: 'low',
      score: 92,
      trend: 'improving',
      description: 'Firewall, DDoS protection, and access controls',
      recommendations: [
        'Implement rate limiting',
        'Configure web application firewall',
        'Regular security audits'
      ]
    },
    {
      category: 'Data Protection',
      riskLevel: 'medium',
      score: 78,
      trend: 'degrading',
      description: 'Data encryption, backup security, and privacy compliance',
      recommendations: [
        'Implement data encryption at rest',
        'Regular backup security testing',
        'GDPR compliance review'
      ]
    }
  ]

  const overallRisk = {
    score: 78,
    level: 'medium',
    trend: 'stable' as const,
    lastAssessment: '2024-01-15T10:00:00Z'
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-600 bg-red-50 dark:bg-red-950'
      case 'high':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950'
      case 'low':
        return 'text-green-600 bg-green-50 dark:bg-green-950'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950'
    }
  }

  const getRiskBadge = (level: string) => {
    const variants = {
      critical: "destructive",
      high: "destructive",
      medium: "outline",
      low: "secondary"
    } as const

    return (
      <Badge variant={variants[level as keyof typeof variants] || "outline"}>
        {level.toUpperCase()}
      </Badge>
    )
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'degrading':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Target className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Risk Assessment */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Overall Risk Assessment</span>
          </CardTitle>
          <CardDescription>
            Comprehensive security risk analysis and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold p-4 rounded-lg ${getRiskColor(overallRisk.level)}`}>
                {overallRisk.score}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">Risk Score</p>
            </div>
            <div className="text-center">
              {getRiskBadge(overallRisk.level)}
              <p className="text-sm text-muted-foreground mt-2">Risk Level</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mt-2">
                {getTrendIcon(overallRisk.trend)}
                <span className="capitalize text-sm font-medium">{overallRisk.trend}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Trend</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Risk Mitigation Progress</span>
              <span>{overallRisk.score}%</span>
            </div>
            <Progress value={overallRisk.score} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Risk Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {riskMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{metric.category}</CardTitle>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(metric.trend)}
                  {getRiskBadge(metric.riskLevel)}
                </div>
              </div>
              <CardDescription>{metric.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Risk Score</span>
                  <span>{metric.score}%</span>
                </div>
                <Progress value={metric.score} className="h-2" />
              </div>

              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <div className="space-y-1">
                  {metric.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start space-x-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis Summary</CardTitle>
          <CardDescription>Key findings and priority actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span>High Priority Actions</span>
              </h4>
              <div className="space-y-2">
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <strong>SSL Certificate Renewal:</strong> 3 certificates expire within 30 days
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Security Headers:</strong> Missing CSP and HSTS headers on production sites
                  </AlertDescription>
                </Alert>
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Dependency Updates:</strong> 12 packages have known vulnerabilities
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-600" />
                <span>Positive Developments</span>
              </h4>
              <div className="space-y-2">
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      Firewall Implementation
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Web Application Firewall successfully deployed across all production sites
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">
                      Security Training
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Development team completed OWASP security training program
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Trend Analysis</CardTitle>
          <CardDescription>Security risk changes over the past 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium">Risk Score Improved</span>
              </div>
              <Badge className="bg-green-100 text-green-800">+5 points</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">SSL Certificates Due</span>
              </div>
              <Badge variant="outline">7 certificates</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Security Investment</span>
              </div>
              <Badge variant="outline">$12,500/month</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}