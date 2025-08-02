//TODO: 序號API、更改憑證有效時間，要從後端拿

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

  const handleBackToHome = () => {
    navigate('/');
  };

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
    const reason = revokeReason.trim() || "憑證管理員手動吊銷";
    
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
        title: "憑證處理完成",
        description: `憑證 ${commonName} 已吊銷並重新發布新憑證`,
      });
    }, 1000);

    toast({
      title: "憑證已吊銷",
      description: `憑證 ${commonName} 已成功吊銷，正在重新發布新憑證...`,
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
            <CardTitle className="text-sm font-medium">有效憑證</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCertificates.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已吊銷憑證</CardTitle>
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
            有效憑證列表
          </CardTitle>
          <CardDescription>
            目前有效的CA憑證
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>通用名稱</TableHead>
                  <TableHead>簽名者</TableHead>
                  <TableHead>有效期間</TableHead>
                  <TableHead className="text-right">操作</TableHead>
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
                          至 {cert.validTo}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            吊銷
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>確認吊銷憑證</AlertDialogTitle>
                            <AlertDialogDescription>
                              您確定要吊銷憑證「{cert.commonName}」嗎？
                              <br />
                              序號：{cert.serialNumber}
                              <br />
                              <span className="text-red-600 font-medium">
                                此操作無法復原，憑證吊銷後將立即失效並重新發布新憑證。
                              </span>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="reason" className="text-right">
                                吊銷原因
                              </Label>
                              <Input
                                id="reason"
                                value={revokeReason}
                                onChange={(e) => setRevokeReason(e.target.value)}
                                placeholder="請輸入吊銷原因（可選）"
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setRevokeReason("")}>取消</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRevokeCertificate(cert.id, cert.commonName, cert.issuer, cert.serialNumber)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              確認吊銷
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
                      暫無有效憑證
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
            已吊銷憑證列表
          </CardTitle>
          <CardDescription>
            已被吊銷的CA憑證記錄
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>序號</TableHead>
                  <TableHead>吊銷時間</TableHead>
                  <TableHead>吊銷原因</TableHead>
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
                      暫無已吊銷憑證
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

export default CertificateManagementPage;