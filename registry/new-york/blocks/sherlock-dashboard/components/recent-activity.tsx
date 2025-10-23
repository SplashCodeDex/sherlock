import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatTimeAgo } from "../lib/format-date"
import { CheckCircle, AlertTriangle, Clock, Search, Shield } from "lucide-react"

interface RecentActivityProps {
  data: any[]
  detailed?: boolean
}

interface ActivityItem {
  id: string
  type: 'scan' | 'alert' | 'resolved' | 'new_site'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
  site?: string
}

export function RecentActivity({ data, detailed = false }: RecentActivityProps) {
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'scan',
      title: 'Security scan completed',
      description: 'Completed comprehensive security analysis',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'success',
      site: 'example.com'
    },
    {
      id: '2',
      type: 'alert',
      title: 'SSL certificate warning',
      description: 'SSL certificate expires in 7 days',
      timestamp: '2024-01-15T09:45:00Z',
      status: 'warning',
      site: 'test-site.org'
    },
    {
      id: '3',
      type: 'resolved',
      title: 'Issue resolved',
      description: 'Mixed content warnings have been fixed',
      timestamp: '2024-01-15T08:20:00Z',
      status: 'success',
      site: 'demo-website.net'
    },
    {
      id: '4',
      type: 'new_site',
      title: 'New site added',
      description: 'Added new-site.com to monitoring',
      timestamp: '2024-01-14T16:15:00Z',
      status: 'info',
      site: 'new-site.com'
    }
  ]

  const activities = mockActivities

  const getActivityIcon = (type: string, status: string) => {
    if (status === 'success') return <CheckCircle className="h-4 w-4 text-green-600" />
    if (status === 'warning') return <AlertTriangle className="h-4 w-4 text-orange-600" />
    if (type === 'scan') return <Search className="h-4 w-4 text-blue-600" />
    if (type === 'new_site') return <Shield className="h-4 w-4 text-purple-600" />
    return <Clock className="h-4 w-4 text-gray-600" />
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      success: "default",
      warning: "destructive",
      error: "destructive",
      info: "secondary"
    } as const

    const colors = {
      success: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
      warning: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
      error: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
      info: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
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

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (!detailed) {
    // Compact view for dashboard overview
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest security scans and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                  {getActivityIcon(activity.type, activity.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.site && `${activity.site} • `}
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                  {getStatusBadge(activity.status)}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }

  // Detailed view for activity tab
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id}>
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                {getActivityIcon(activity.type, activity.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{activity.title}</h4>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(activity.status)}
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                {activity.site && (
                  <Badge variant="outline" className="text-xs">
                    {activity.site}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}