//TODO: 序號API、更改憑證有效時間，要從後端拿

import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ShieldX} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import type { PageMeta } from '@/types';

interface Certificate {
  id: string;
  commonName: string;
  issuer: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  status: 'active' | 'revoked';
  keySize: number;
  algorithm: string;
}

interface RevokedCertificateInfo {
  id: string;
  serialNumber: string;
  revokedAt: string;
  reason: string;
}

const CertificateManagementPage = () => {
  // const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: "1",
      commonName: "www.example.com",
      issuer: "CA Root Authority",
      serialNumber: "1A:2B:3C:4D:5E:6F",
      validFrom: "2024-01-01",
      validTo: "2025-01-01",
      status: "active",
      keySize: 2048,
      algorithm: "RSA"
    },
    {
      id: "2",
      commonName: "api.example.com",
      issuer: "CA Root Authority",
      serialNumber: "2A:3B:4C:5D:6E:7F",
      validFrom: "2024-02-01",
      validTo: "2025-02-01",
      status: "active",
      keySize: 2048,
      algorithm: "RSA"
    }
  ]);

  const [revokedCertificates, setRevokedCertificates] = useState<RevokedCertificateInfo[]>([]);
  const [revokeReason, setRevokeReason] = useState("");

  // const handleBackToHome = () => {
  //   navigate('/');
  // };

  const generateNewCertificate = (commonName: string, issuer: string) => {
    const newCert: Certificate = {
      id: Date.now().toString(),
      commonName,
      issuer,
      serialNumber: generateSerialNumber(),
      validFrom: new Date().toISOString().split('T')[0],
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      keySize: 2048,
      algorithm: 'RSA'
    };
    return newCert;
  };

  const generateSerialNumber = () => {
    const chars = '0123456789ABCDEF';
    let result = '';
    for (let i = 0; i < 6; i++) {
      if (i > 0) result += ':';
      result += chars[Math.floor(Math.random() * 16)] + chars[Math.floor(Math.random() * 16)];
    }
    return result;
  };

  const handleRevokeCertificate = (certificateId: string, commonName: string, issuer: string, serialNumber: string) => {
    const reason = revokeReason.trim() || "Manually revoked by certificate administrator";
    
    // 移除原憑證並標記為已吊銷
    setCertificates(prev => prev.filter(cert => cert.id !== certificateId));
    
    // 添加到已吊銷憑證列表
    const revokedInfo: RevokedCertificateInfo = {
      id: certificateId,
      serialNumber,
      revokedAt: new Date().toLocaleString('zh-TW'),
      reason
    };
    
    setRevokedCertificates(prev => [...prev, revokedInfo]);
    
    // 重新發布新憑證
    setTimeout(() => {
      const newCert = generateNewCertificate(commonName, issuer);
      setCertificates(prev => [...prev, newCert]);
      
      toast({
        title: "Certificate process completed",
        description: `Certificate ${commonName} has been revoked and a new one has been issued.`,
      });
    }, 1000);

    toast({
      title: "Certificate revoked",
      description: `Certificate ${commonName} was successfully revoked. Reissuing a new certificate...`,
    });
    
    setRevokeReason("");
  };

  // 只顯示有效憑證，移除已過期憑證
  const activeCertificates = certificates.filter(cert => cert.status === 'active');

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="bg-[#A8AEBD] py-3 mb-3">
        <h1 className="text-2xl font-extrabold text-center text-[#E6E6E6]">
          mCA
        </h1>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Certificates</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCertificates.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revoked Certificates</CardTitle>
            <ShieldX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{revokedCertificates.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* 有效憑證列表 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            Active Certificates List
          </CardTitle>
          <CardDescription>
            Currently active CA certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Common Name</TableHead>
                  <TableHead>Issuer</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead className="text-right">Operation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeCertificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">
                      {cert.commonName}
                    </TableCell>
                    <TableCell>{cert.issuer}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{cert.validFrom}</div>
                        <div className="text-gray-500">
                          to {cert.validTo}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Revoke
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Revocation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to revoke certificate "{cert.commonName}"?
                              <br />
                              Serial Number: {cert.serialNumber}
                              <br />
                              <span className="text-red-600 font-medium">
                                This action cannot be undone. The certificate will be immediately invalidated and a new one will be issued.
                              </span>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="reason" className="text-right">
                                Revocation Reason
                              </Label>
                              <Input
                                id="reason"
                                value={revokeReason}
                                onChange={(e) => setRevokeReason(e.target.value)}
                                placeholder="Enter revocation reason (optional)"
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setRevokeReason("")}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRevokeCertificate(cert.id, cert.commonName, cert.issuer, cert.serialNumber)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Confirm Revocation
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                
                {activeCertificates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No active certificates
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 已吊銷憑證列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldX className="h-5 w-5 text-red-500" />
            Revoked Certificates List
          </CardTitle>
          <CardDescription>
            Records of revoked CA certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Revoked At</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revokedCertificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-mono text-sm">
                      {cert.serialNumber}
                    </TableCell>
                    <TableCell>{cert.revokedAt}</TableCell>
                    <TableCell>{cert.reason}</TableCell>
                  </TableRow>
                ))}
                
                {revokedCertificates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      No revoked certificates
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

(CertificateManagementPage as any).meta = {
  requiresAuth: false, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;

export default CertificateManagementPage;