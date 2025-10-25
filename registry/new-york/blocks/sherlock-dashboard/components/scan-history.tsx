import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScanDetails } from "./scan-details"; // Assuming you'll create this next
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";;
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSecurityDate } from "../lib/format-date";
import { CheckCircle, AlertTriangle, Clock, Info, FileText } from "lucide-react";
import { ScanDetails } from "./scan-details"; // Assuming you'll create this next
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SecurityAnalysis {
  id: string;
  url: string;
  domain: string;
  scanType: 'comprehensive' | 'quick' | 'api' | 'compliance';
  status: 'completed' | 'failed' | 'in_progress' | 'pending';
  securityScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  scanDuration: number;
  lastScanned: string;
  findings: string[];
  sslInfo?: {
    valid: boolean;
    expires: string;
    issuer: string;
  };
  headers: Record<string, string>;
  technologies: string[];
}

interface ScanHistoryProps {
  analysis: SecurityAnalysis[];
}

export function ScanHistory({ analysis }: ScanHistoryProps) {
  const [selectedScan, setSelectedScan] = useState<SecurityAnalysis | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <Info className="h-4 w-4 text-gray-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      failed: "destructive",
      in_progress: "outline",
      pending: "secondary",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  const getRiskBadge = (riskLevel: string) => {
    const variants = {
      critical: "destructive",
      high: "destructive",
      medium: "outline",
      low: "secondary",
    } as const;

    return (
      <Badge variant={variants[riskLevel as keyof typeof variants] || "outline"}>
        {riskLevel.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan History</CardTitle>
        <CardDescription>Overview of all past security scans.</CardDescription>
      </CardHeader>
      <CardContent>
        {analysis.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No security scans have been performed yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Last Scanned</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="font-medium">{scan.url}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(scan.status)}
                      {getStatusBadge(scan.status)}
                    </div>
                  </TableCell>
                  <TableCell>{scan.securityScore}%</TableCell>
                  <TableCell>{getRiskBadge(scan.riskLevel)}</TableCell>
                  <TableCell>{formatSecurityDate(scan.lastScanned)}</TableCell>
                  <TableCell>
                    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedScan(scan)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      {selectedScan && (
                        <DialogContent className="sm:max-w-[800px]">
                          <DialogHeader>
                            <DialogTitle>Scan Details: {selectedScan.url}</DialogTitle>
                          </DialogHeader>
                          <ScanDetails scan={selectedScan} />
                        </DialogContent>
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
