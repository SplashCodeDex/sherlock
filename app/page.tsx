"use client"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SecurityScanner } from "./components/security-scanner"
import { VulnerabilityReport } from "./components/vulnerability-report"
import { SiteMonitor } from "./components/site-monitor"
import { RiskAssessment } from "./components/risk-assessment"
import { ErrorBoundary } from "./components/error-boundary"
import { useSecurityAnalysis } from "./hooks/use-sherlock-data"
import { formatSecurityDate } from "./lib/format-date"
import { SecurityValidator } from "./lib/validation"
import { useRateLimit, rateLimiters } from "./lib/rate-limit"
import { Search, Shield, AlertTriangle, CheckCircle, Clock, Activity, Scan, FileSearch, TrendingUp, AlertCircle } from "lucide-react"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export default function SherlockSecurityDashboard() {
  const [targetUrl, setTargetUrl] = useState("")
  const [scanType, setScanType] = useState("comprehensive")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [lastRequestTime, setLastRequestTime] = useState(0)
  const { checkRateLimit } = useRateLimit(rateLimiters.scanning, 'scan-requests')

  const { analysis, loading, error, startScan, monitorSites } = useSecurityAnalysis()

  const handleStartScan = async () => {
    if (targetUrl.trim()) {
      await startScan(targetUrl, scanType)
    }
  }

  const securityMetrics = {
    totalScans: analysis?.length || 0,
    criticalIssues: analysis?.filter(site => site.riskLevel === 'critical').length || 0,
    resolvedIssues: analysis?.filter(site => site.status === 'resolved').length || 0,
    averageScore: analysis?.reduce((acc, site) => acc + site.securityScore, 0) / (analysis?.length || 1) || 85,
    lastScan: new Date().toISOString()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Security Header */}
      <div className="border-b bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Sherlock Security Center</h1>
                <p className="text-muted-foreground">Advanced Website Security Analysis & Monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 mr-1" />
                Protected
              </Badge>
              <div className="text-right">
                <div className="text-sm font-medium">Last Scan</div>
                <div className="text-xs text-muted-foreground">
                  {formatSecurityDate(securityMetrics.lastScan)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Security Scanner */}
        <Card className="mb-8 border-2 border-dashed border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-xl">
              <Scan className="h-6 w-6 text-primary" />
              <span>Security Vulnerability Scanner</span>
            </CardTitle>
            <CardDescription className="text-base">
              Comprehensive security analysis for websites, APIs, and web applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="https://example.com or subdomain.example.com"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="h-12 text-base"
                  onKeyPress={(e) => e.key === 'Enter' && handleStartScan()}
                />
              </div>
              <div className="flex space-x-2">
                <Select value={scanType} onValueChange={setScanType}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select scan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">Quick Scan</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    <SelectItem value="api">API Security</SelectItem>
                    <SelectItem value="compliance">Compliance Check</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleStartScan}
                  disabled={loading || !targetUrl.trim()}
                  size="lg"
                  className="px-8"
                >
                  {loading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Start Scan
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Scan Options */}
            <TooltipProvider>
              <div className="flex flex-wrap gap-2 pt-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                      SSL/TLS Analysis
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Analyze SSL certificate validity and TLS configuration</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                      Header Security
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Check security headers like CSP, HSTS, and X-Frame-Options</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                      OWASP Top 10
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Scan for OWASP Top 10 vulnerabilities</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                      Malware Detection
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Detect malware and malicious scripts</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                      DNS Security
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Analyze DNS configuration and security</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Scan Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Security Dashboard Tabs */}
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-12">
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <FileSearch className="h-4 w-4" />
              <span>Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="vulnerabilities" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Vulnerabilities</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Monitoring</span>
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Risk Assessment</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Security Metrics */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Scan className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-2xl font-bold">{securityMetrics.totalScans}</p>
                          <p className="text-xs text-muted-foreground">Total Scans</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-2xl font-bold">{securityMetrics.criticalIssues}</p>
                          <p className="text-xs text-muted-foreground">Critical Issues</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold">{securityMetrics.resolvedIssues}</p>
                          <p className="text-xs text-muted-foreground">Resolved</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-2xl font-bold">{Math.round(securityMetrics.averageScore)}</p>
                          <p className="text-xs text-muted-foreground">Avg Score</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Security Scanner Component */}
                <SecurityScanner analysis={analysis} loading={loading} />
              </div>

              {/* Site Monitor Sidebar */}
              <div>
                <SiteMonitor sites={analysis} onMonitor={monitorSites} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vulnerabilities">
            <VulnerabilityReport analysis={analysis} />
          </TabsContent>

          <TabsContent value="monitoring">
            <Card>
              <CardHeader>
                <CardTitle>Continuous Monitoring</CardTitle>
                <CardDescription>Real-time security monitoring for registered sites</CardDescription>
              </CardHeader>
              <CardContent>
                <SiteMonitor sites={analysis} onMonitor={monitorSites} detailed />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk">
            <RiskAssessment analysis={analysis} />
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Security Reports</CardTitle>
                <CardDescription>Generate comprehensive security assessment reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <FileSearch className="h-6 w-6" />
                    <span>Executive Summary</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Shield className="h-6 w-6" />
                    <span>Technical Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <TrendingUp className="h-6 w-6" />
                    <span>Risk Analysis</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}