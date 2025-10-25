import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, Shield, Globe, Server, Code, Lock } from "lucide-react";
import { formatSecurityDate } from "../lib/format-date";

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

interface ScanDetailsProps {
  scan: SecurityAnalysis;
}

export function ScanDetails({ scan }: ScanDetailsProps) {
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
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scan.securityScore}%</div>
            <p className="text-xs text-muted-foreground">Based on comprehensive analysis</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {getRiskBadge(scan.riskLevel)}
            <p className="text-xs text-muted-foreground">Overall assessment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Scanned</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSecurityDate(scan.lastScanned)}</div>
            <p className="text-xs text-muted-foreground">Scan completed in {scan.scanDuration}s</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vulnerabilities Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">{scan.vulnerabilities.critical}</div>
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{scan.vulnerabilities.high}</div>
              <p className="text-sm text-muted-foreground">High</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{scan.vulnerabilities.medium}</div>
              <p className="text-sm text-muted-foreground">Medium</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{scan.vulnerabilities.low}</div>
              <p className="text-sm text-muted-foreground">Low</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Findings</CardTitle>
        </CardHeader>
        <CardContent>
          {scan.findings.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {scan.findings.map((finding, index) => (
                <li key={index} className="text-sm">{finding}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No specific findings reported.</p>
          )}
        </CardContent>
      </Card>

      {scan.sslInfo && (
        <Card>
          <CardHeader>
            <CardTitle>SSL/TLS Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              {scan.sslInfo.valid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <span>Status: {scan.sslInfo.valid ? "Valid" : "Invalid"}</span>
            </div>
            <p className="text-sm">Expires: {formatSecurityDate(scan.sslInfo.expires)}</p>
            <p className="text-sm">Issuer: {scan.sslInfo.issuer}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Headers</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(scan.headers).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(scan.headers).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="font-medium">{key}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No headers captured.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technologies Detected</CardTitle>
        </CardHeader>
        <CardContent>
          {scan.technologies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {scan.technologies.map((tech, index) => (
                <Badge key={index} variant="secondary">
                  <Code className="h-3 w-3 mr-1" /> {tech}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No technologies detected.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
