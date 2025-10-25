import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Activity, Wifi, WifiOff, Clock, CheckCircle, AlertTriangle } from "lucide-react"

interface SiteMonitorProps {
  sites: any[]
  onMonitor?: (sites: any[]) => void
  detailed?: boolean
}

interface MonitoredSite {
  id: string
  url: string
  status: 'online' | 'offline' | 'degraded'
  uptime: number
  responseTime: number
  lastChecked: string
  alerts: number
}

export function SiteMonitor({ sites, onMonitor, detailed = false }: SiteMonitorProps) {
  const mockSites: MonitoredSite[] = [
    {
      id: '1',
      url: 'https://example.com',
      status: 'online',
      uptime: 99.9,
      responseTime: 245,
      lastChecked: '2024-01-15T10:30:00Z',
      alerts: 0
    },
    {
      id: '2',
      url: 'https://api.example.com',
      status: 'degraded',
      uptime: 97.2,
      responseTime: 1200,
      lastChecked: '2024-01-15T10:29:00Z',
      alerts: 2
    },
    {
      id: '3',
      url: 'https://blog.example.com',
      status: 'offline',
      uptime: 85.4,
      responseTime: 0,
      lastChecked: '2024-01-15T10:25:00Z',
      alerts: 5
    }
  ]

  const monitoredSites = mockSites

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-600" />
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-50 dark:bg-green-950'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950'
      case 'offline':
        return 'text-red-600 bg-red-50 dark:bg-red-950'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950'
    }
  }

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99) return 'text-green-600'
    if (uptime >= 95) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (detailed) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Site Monitoring Dashboard</CardTitle>
            <CardDescription>
              Real-time monitoring of website availability and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {monitoredSites.filter(s => s.status === 'online').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Online Sites</p>
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
                        {monitoredSites.filter(s => s.status === 'degraded').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Degraded</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <WifiOff className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {monitoredSites.filter(s => s.status === 'offline').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Offline</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {monitoredSites.map((site) => (
                <div key={site.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(site.status)}
                      <div>
                        <h3 className="font-semibold">{site.url}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last checked: {new Date(site.lastChecked).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(site.status)}>
                      {site.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">Uptime</p>
                      <p className={`text-lg font-bold ${getUptimeColor(site.uptime)}`}>
                        {site.uptime}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Response Time</p>
                      <p className="text-lg font-bold">
                        {site.responseTime}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Alerts</p>
                      <p className="text-lg font-bold text-red-600">
                        {site.alerts}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge variant="outline" className={getStatusColor(site.status)}>
                        {site.status}
                      </Badge>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Site Monitor</span>
        </CardTitle>
        <CardDescription>
          Monitor website availability and performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {monitoredSites.slice(0, 3).map((site) => (
            <div key={site.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                {getStatusIcon(site.status)}
                <div>
                  <p className="font-medium text-sm">{site.url}</p>
                  <p className="text-xs text-muted-foreground">
                    {site.uptime}% uptime • {site.responseTime}ms
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(site.status)}>
                {site.status}
              </Badge>
            </div>
          ))}

          <Button variant="outline" className="w-full">
            View All Sites
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}