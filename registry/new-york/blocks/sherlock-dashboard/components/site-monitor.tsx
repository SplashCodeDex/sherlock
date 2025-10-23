import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatSecurityDate } from "../lib/format-date"
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Plus,
  Wifi,
  WifiOff,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown
} from "lucide-react"

interface SiteMonitorProps {
  sites: any[]
  onMonitor?: (url: string) => void
  detailed?: boolean
}

interface MonitoredSite {
  id: string
  url: string
  name: string
  status: 'online' | 'offline' | 'warning' | 'critical'
  uptime: number
  responseTime: number
  lastChecked: string
  sslExpiry?: string
  issues: number
  trend: 'up' | 'down' | 'stable'
}

export function SiteMonitor({ sites, onMonitor, detailed = false }: SiteMonitorProps) {
  const mockSites: MonitoredSite[] = [
    {
      id: '1',
      url: 'https://example.com',
      name: 'Example Corp',
      status: 'online',
      uptime: 99.9,
      responseTime: 245,
      lastChecked: '2024-01-15T10:30:00Z',
      sslExpiry: '2024-04-15',
      issues: 0,
      trend: 'stable'
    },
    {
      id: '2',
      url: 'https://test-site.org',
      name: 'Test Site',
      status: 'warning',
      uptime: 97.5,
      responseTime: 1250,
      lastChecked: '2024-01-15T10:29:00Z',
      sslExpiry: '2024-02-01',
      issues: 3,
      trend: 'down'
    },
    {
      id: '3',
      url: 'https://demo-website.net',
      name: 'Demo Website',
      status: 'critical',
      uptime: 85.2,
      responseTime: 3500,
      lastChecked: '2024-01-15T10:25:00Z',
      sslExpiry: '2023-12-01',
      issues: 7,
      trend: 'down'
    },
    {
      id: '4',
      url: 'https://api.example.com',
      name: 'API Service',
      status: 'online',
      uptime: 99.8,
      responseTime: 180,
      lastChecked: '2024-01-15T10:30:00Z',
      sslExpiry: '2024-06-20',
      issues: 1,
      trend: 'up'
    }
  ]

  const monitoredSites = sites || mockSites

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'offline':
        return <WifiOff className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-blue-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      online: "default",
      warning: "outline",
      critical: "destructive",
      offline: "secondary"
    } as const

    const colors = {
      online: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
      warning: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
      critical: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
      offline: "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300"
    }

    return (
      <Badge
        variant={variants[status as keyof typeof variants] || "outline"}
        className={colors[status as keyof typeof colors] || ""}
      >
        {status}
      </Badge>
    )
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />
      default:
        return <Activity className="h-3 w-3 text-gray-600" />
    }
  }

  if (!detailed) {
    // Compact view for dashboard sidebar
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Site Monitor</span>
            </span>
            <Button size="sm" variant="outline">
              <Plus className="h-3 w-3 mr-1" />
              Add Site
            </Button>
          </CardTitle>
          <CardDescription>Real-time monitoring status</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {monitoredSites.map((site) => (
                <div key={site.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                  {getStatusIcon(site.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{site.name}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-muted-foreground">{site.uptime}% uptime</p>
                      {getTrendIcon(site.trend)}
                    </div>
                  </div>
                  {getStatusBadge(site.status)}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }

  // Detailed view for monitoring tab
  return (
    <div className="space-y-6">
      {/* Add Site Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Site to Monitor</CardTitle>
          <CardDescription>Start monitoring a new website for security issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input placeholder="https://example.com" className="flex-1" />
            <Button onClick={() => onMonitor?.('')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Site
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {monitoredSites.filter(s => s.status === 'online').length}
                </p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {monitoredSites.filter(s => s.status === 'warning').length}
                </p>
                <p className="text-xs text-muted-foreground">Warning</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">
                  {monitoredSites.filter(s => s.status === 'critical').length}
                </p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(monitoredSites.reduce((acc, site) => acc + site.uptime, 0) / monitoredSites.length)}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Site List */}
      <Card>
        <CardHeader>
          <CardTitle>Monitored Sites</CardTitle>
          <CardDescription>Detailed monitoring information for all sites</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monitoredSites.map((site) => (
              <div key={site.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(site.status)}
                    <div>
                      <h3 className="font-semibold">{site.name}</h3>
                      <p className="text-sm text-muted-foreground">{site.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(site.trend)}
                    {getStatusBadge(site.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{site.uptime}%</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{site.responseTime}ms</div>
                    <div className="text-xs text-muted-foreground">Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{site.issues}</div>
                    <div className="text-xs text-muted-foreground">Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {site.sslExpiry ? new Date(site.sslExpiry).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">SSL Expiry</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Last checked: {new Date(site.lastChecked).toLocaleString()}</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}