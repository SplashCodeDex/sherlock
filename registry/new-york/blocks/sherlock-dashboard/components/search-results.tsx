import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatSecurityDate } from "../lib/format-date"
import { ExternalLink, AlertTriangle, CheckCircle, Clock, Info } from "lucide-react"

interface SearchResultsProps {
  data: any[]
  loading: boolean
}

interface SiteData {
  name: string
  url: string
  status: 'active' | 'inactive' | 'alert' | 'unknown'
  lastChecked: string
  issues: string[]
  score: number
}

export function SearchResults({ data, loading }: SearchResultsProps) {
  const mockData: SiteData[] = [
    {
      name: "example.com",
      url: "https://example.com",
      status: "active",
      lastChecked: "2024-01-15T10:30:00Z",
      issues: [],
      score: 95
    },
    {
      name: "test-site.org",
      url: "https://test-site.org",
      status: "alert",
      lastChecked: "2024-01-15T09:15:00Z",
      issues: ["SSL certificate expires soon", "Mixed content warnings"],
      score: 72
    },
    {
      name: "demo-website.net",
      url: "https://demo-website.net",
      status: "inactive",
      lastChecked: "2024-01-14T16:45:00Z",
      issues: ["Site unreachable"],
      score: 0
    }
  ]

  const results = data || mockData

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'inactive':
        return <Clock className="h-4 w-4 text-gray-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      alert: "destructive",
      inactive: "secondary",
      unknown: "outline"
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>Scanning sites for security issues...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Analyzing...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>No sites analyzed yet</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Enter a website URL or domain in the search field above to start analysis.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
        <CardDescription>
          Found {results.length} site{results.length !== 1 ? 's' : ''} in the analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Security Score</TableHead>
              <TableHead>Issues</TableHead>
              <TableHead>Last Checked</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((site, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(site.status)}
                    <div>
                      <div className="font-medium">{site.name}</div>
                      <div className="text-sm text-muted-foreground">{site.url}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(site.status)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          site.score >= 80 ? 'bg-green-600' :
                          site.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${site.score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{site.score}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {site.issues.length > 0 ? (
                      <div className="space-y-1">
                        {site.issues.slice(0, 2).map((issue, i) => (
                          <div key={i} className="text-orange-600">• {issue}</div>
                        ))}
                        {site.issues.length > 2 && (
                          <div className="text-muted-foreground">
                            +{site.issues.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-green-600">No issues found</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {new Date(site.lastChecked).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}