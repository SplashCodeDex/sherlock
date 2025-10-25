import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, AlertTriangle, Shield, CheckCircle } from "lucide-react"

interface RiskAssessmentProps {
  analysis: any[]
}

interface RiskFactor {
  id: string
  category: string
  risk: 'low' | 'medium' | 'high' | 'critical'
  score: number
  description: string
  recommendations: string[]
}

export function RiskAssessment({ analysis }: RiskAssessmentProps) {
  const mockRiskFactors: RiskFactor[] = [
    {
      id: '1',
      category: 'SSL/TLS Security',
      risk: 'medium',
      score: 75,
      description: 'Certificate expires soon and some deprecated cipher suites detected',
      recommendations: [
        'Renew SSL certificate before expiration',
        'Update cipher suite configuration',
        'Enable HSTS header'
      ]
    },
    {
      id: '2',
      category: 'Web Application Security',
      risk: 'high',
      score: 45,
      description: 'Multiple OWASP Top 10 vulnerabilities detected',
      recommendations: [
        'Implement input validation and sanitization',
        'Add CSRF protection',
        'Update dependencies to latest secure versions'
      ]
    },
    {
      id: '3',
      category: 'Network Security',
      risk: 'low',
      score: 90,
      description: 'Strong firewall configuration and secure protocols in use',
      recommendations: [
        'Regular firewall rule reviews',
        'Monitor for unusual traffic patterns'
      ]
    },
    {
      id: '4',
      category: 'Data Protection',
      risk: 'critical',
      score: 25,
      description: 'Sensitive data may be exposed through insecure API endpoints',
      recommendations: [
        'Implement proper authentication and authorization',
        'Encrypt sensitive data in transit and at rest',
        'Add rate limiting to API endpoints'
      ]
    }
  ]

  const riskFactors = mockRiskFactors

  const getRiskColor = (risk: string) => {
    switch (risk) {
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

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />
      case 'high':
        return <TrendingDown className="h-4 w-4" />
      case 'medium':
        return <TrendingUp className="h-4 w-4" />
      case 'low':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const overallRiskScore = riskFactors.reduce((acc, factor) => acc + factor.score, 0) / riskFactors.length
  const criticalCount = riskFactors.filter(f => f.risk === 'critical').length
  const highCount = riskFactors.filter(f => f.risk === 'high').length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Risk Assessment</span>
        </CardTitle>
        <CardDescription>
          Comprehensive security risk analysis and mitigation recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Risk Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{Math.round(overallRiskScore)}</p>
                    <p className="text-xs text-muted-foreground">Overall Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{criticalCount}</p>
                    <p className="text-xs text-muted-foreground">Critical Issues</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{highCount}</p>
                    <p className="text-xs text-muted-foreground">High Risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Factors */}
          <div className="space-y-4">
            {riskFactors.map((factor) => (
              <div key={factor.id} className="border rounded-lg p-4 space-y-4">
                {/* Risk Factor Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getRiskIcon(factor.risk)}
                    <div>
                      <h3 className="font-semibold">{factor.category}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getRiskColor(factor.risk)}>
                          {factor.risk.toUpperCase()} RISK
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Score: {factor.score}/100
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{factor.score}%</div>
                    <Progress value={factor.score} className="w-16 h-2 mt-1" />
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground">{factor.description}</p>

                {/* Recommendations */}
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {factor.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Generate Report
                  </Button>
                  <Button size="sm">
                    Start Mitigation
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Risk Mitigation Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Mitigation Plan</CardTitle>
              <CardDescription>
                Prioritized actions to reduce security risks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded">
                  <div>
                    <p className="font-medium">Critical: Fix Data Exposure Vulnerabilities</p>
                    <p className="text-sm text-muted-foreground">Immediate action required</p>
                  </div>
                  <Badge className="bg-red-100 text-red-800">Priority 1</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded">
                  <div>
                    <p className="font-medium">High: Address OWASP Top 10 Issues</p>
                    <p className="text-sm text-muted-foreground">Complete within 7 days</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Priority 2</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded">
                  <div>
                    <p className="font-medium">Medium: SSL/TLS Configuration Updates</p>
                    <p className="text-sm text-muted-foreground">Complete within 14 days</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Priority 3</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}