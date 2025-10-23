import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatSecurityDate } from "../lib/format-date"
import { Shield, AlertTriangle, CheckCircle, Activity, ScanLine, Zap, FileX } from "lucide-react"

interface SecurityStatsProps {
  stats: {
    totalScans: number
    criticalIssues: number
    resolvedIssues: number
    averageScore: number
    lastScan: string
  }
}

export function DashboardStats({ stats }: SecurityStatsProps) {
  const statCards = [
    {
      title: "Total Scans",
      value: stats.totalScans,
      change: "+12%",
      icon: ScanLine,
      description: "Security scans performed",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      trend: "up"
    },
    {
      title: "Critical Issues",
      value: stats.criticalIssues,
      change: "-5%",
      icon: AlertTriangle,
      description: "High-priority vulnerabilities",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
      trend: "down"
    },
    {
      title: "Resolved Issues",
      value: stats.resolvedIssues,
      change: "+18%",
      icon: CheckCircle,
      description: "Issues fixed this month",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      trend: "up"
    },
    {
      title: "Security Score",
      value: `${Math.round(stats.averageScore)}%`,
      change: "+3%",
      icon: Shield,
      description: "Average security rating",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      trend: "up",
      showProgress: true,
      progressValue: stats.averageScore
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="relative overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                {stat.showProgress ? (
                  <div className="space-y-2">
                    <Progress value={stat.progressValue} className="h-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{stat.description}</span>
                      <Badge variant="outline" className="text-green-600">
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                    <Badge variant={stat.trend === 'up' ? "default" : "destructive"} className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Security Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Security Health Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Security Posture</span>
                <span className="font-medium">{Math.round(stats.averageScore)}%</span>
              </div>
              <Progress value={stats.averageScore} className="h-3" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Vulnerability Resolution Rate</span>
                <span className="font-medium">
                  {stats.totalScans > 0 ? Math.round((stats.resolvedIssues / stats.totalScans) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={stats.totalScans > 0 ? (stats.resolvedIssues / stats.totalScans) * 100 : 0}
                className="h-3"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Monitoring</span>
                <span className="font-medium">94%</span>
              </div>
              <Progress value={94} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}