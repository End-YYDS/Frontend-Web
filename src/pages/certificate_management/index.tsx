<<<<<<< HEAD
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
=======
//TODO: 序號API、更改憑證有效時間，要從後端拿
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
>>>>>>> main
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
<<<<<<< HEAD
  TableRow
} from "@/components/ui/table";
=======
  TableRow,
} from '@/components/ui/table';
>>>>>>> main
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
<<<<<<< HEAD
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ShieldX } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import type { PageMeta } from '@/types';
import type { GetValids, GetRevokeds, RevokeRequest, Valid, Revoked } from './types';

const CertificateManagementPage = () => {
  const [certificates, setCertificates] = useState<Valid[]>([]);
  const [revokedCertificates, setRevokedCertificates] = useState<Revoked[]>([]);
  const [revokeReason, setRevokeReason] = useState("");
=======
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ShieldX } from 'lucide-react';
import type { PageMeta } from '@/types';
import type { GetValids, GetRevokeds, RevokeRequest } from './types';
import { toast } from 'sonner';
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
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [revokedCertificates, setRevokedCertificates] = useState<RevokedCertificateInfo[]>([]);
  const [revokeReason, setRevokeReason] = useState('');
>>>>>>> main
  useEffect(() => {
    fetchValids();
    fetchRevoked();
  }, []);
<<<<<<< HEAD
  // 取得有效憑證
  const fetchValids = async () => {
    try {
      const { data } = await axios.get<GetValids>('/api/chm/mCA/valid', { withCredentials: true });
      data && data.Valid && typeof data.Valid === 'object' ?
        setCertificates(data.Valid)
        :
        setCertificates([]);
    } catch (err) {
      console.error('Failed to fetch valids:', err);
      toast({ title: "Fetch Error", description: "無法取得有效憑證列表" });
      setCertificates([]);
    }
  };
  // 取得已吊銷憑證
  const fetchRevoked = async () => {
    try {
      const { data } = await axios.get<GetRevokeds>('/api/chm/mCA/revoked', { withCredentials: true });
      console.log('Revoked data:', data);
      data && data.Revoke && typeof data.Revoke === 'object' ?
        setRevokedCertificates(data.Revoke)
        :
        setRevokedCertificates([]);
=======
  const fetchValids = async () => {
    try {
      const res = await axios.get<GetValids>('/api/chm/mCA/valid', { withCredentials: true });
      // 模擬測試資料可放這裡（若後端尚未串接）
      // res.data = {
      //   Valid: [
      //     { Name: 'www.example.com', Signer: 'CA Root Authority', Period: '2024-01-01~2025-01-01' },
      //     { Name: 'api.example.com', Signer: 'CA Root Authority', Period: '2024-02-01~2025-02-01' }
      //   ],
      //   Length: 2
      // };

      const mapped = res.data.Valid.map((v, idx) => {
        const [from, to] = v.Period.split('~');
        return {
          id: `${idx + 1}`,
          commonName: v.Name,
          issuer: v.Signer,
          serialNumber: `SN-${idx + 1}`,
          validFrom: from.trim(),
          validTo: to.trim(),
          status: 'active',
          keySize: 2048,
          algorithm: 'RSA',
        } as Certificate;
      });
      setCertificates(mapped);
    } catch (err) {
      console.error('Failed to fetch valids:', err);
      toast.error('Fetch Error', { description: 'Failed to fetch the valid certificate list' });
    }
  };

  const fetchRevoked = async () => {
    try {
      const res = await axios.get<GetRevokeds>('/api/chm/mCA/revoked', { withCredentials: true });
      // 模擬測試資料
      // res.data = {
      //   Revoke: [
      //     { Number: '1001', Time: '2025-10-04T09:30', Reason: 'Expired' }
      //   ],
      //   Length: 1
      // };

      const mapped = res.data.Revoke.map((r, idx) => ({
        id: `${idx + 1}`,
        serialNumber: r.Number,
        revokedAt: r.Time,
        reason: r.Reason,
      }));
      setRevokedCertificates(mapped);
>>>>>>> main
    } catch (err) {
      console.error('Failed to fetch revoked list:', err);
      toast.error('Fetch Error', {
        description: 'Failed to fetch the revocation certificate list',
      });
      setRevokedCertificates([]);
    }
  };
<<<<<<< HEAD

  // -----------------------------
  // 吊銷憑證
  // -----------------------------
  const handleRevokeCertificate = async (commonName: string, reason: string) => {
    try {
      if (reason.trim() === "") {
        reason = "None";
      }
      const payload: RevokeRequest = { Name: commonName, Reason: reason };
      const res = await axios.post('/api/chm/mCA/revoke', payload, { withCredentials: true });
      console.log('Revoke response:', res.data);
      toast({ title: "Certificate revoked", description: `Certificate ${commonName} 已被吊銷` });
      setRevokeReason("");
=======
  const handleRevokeCertificate = async (
    _certificateId: string,
    commonName: string,
    _issuer: string,
    _serialNumber: string,
  ) => {
    const reason = revokeReason.trim() || 'Manually revoked by certificate administrator';

    try {
      const payload: RevokeRequest = { Name: commonName, Reason: reason };
      const res = await axios.post('/api/chm/mCA/revoke', payload, { withCredentials: true });
      console.log('Revoke response:', res.data);

      toast.success('Success', { description: `Certificate ${commonName} has been revoked.` });
      setRevokeReason('');
>>>>>>> main
      fetchValids();
      fetchRevoked();
    } catch (err) {
      console.error('Revoke failed:', err);
      toast.error('Revoke Error', { description: 'Revocation failed. Please try again later.' });
    }
  };
<<<<<<< HEAD
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="bg-[#A8AEBD] py-1.5 mb-6">
        <h1 className="text-4xl font-extrabold text-center text-[#E6E6E6]">
          mCA
        </h1>
=======
  // -----------------------------
  // 模擬用：產生序號
  // -----------------------------
  // const generateSerialNumber = () => {
  //   const chars = '0123456789ABCDEF';
  //   let result = '';
  //   for (let i = 0; i < 6; i++) {
  //     if (i > 0) result += ':';
  //     result += chars[Math.floor(Math.random() * 16)] + chars[Math.floor(Math.random() * 16)];
  //   }
  //   return result;
  // };

  // 只顯示有效憑證
  const activeCertificates = certificates.filter((cert) => cert.status === 'active');

  return (
    <div className='container mx-auto py-6 px-4'>
      <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>mCA</h1>
>>>>>>> main
      </div>

      {/* 統計卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Certificates</CardTitle>
            <Shield className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
<<<<<<< HEAD
            <div className="text-2xl font-bold text-green-600">{certificates.length}</div>
=======
            <div className='text-2xl font-bold text-green-600'>{activeCertificates.length}</div>
>>>>>>> main
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Revoked Certificates</CardTitle>
            <ShieldX className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>{revokedCertificates.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* 有效憑證列表 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5 text-green-500' />
            Active Certificates List
          </CardTitle>
          <CardDescription>Currently active CA certificates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Common Name</TableHead>
                  <TableHead>Issuer</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead className='text-right'>Operation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
<<<<<<< HEAD
                {certificates.map((cert) => (
                  <TableRow key={cert.Name}>
                    <TableCell className="font-medium">{cert.Name}</TableCell>
                    <TableCell>{cert.Signer}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(cert.Period).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}</div>
=======
                {activeCertificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className='font-medium'>{cert.commonName}</TableCell>
                    <TableCell>{cert.issuer}</TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        <div>{cert.validFrom}</div>
                        <div className='text-gray-500'>to {cert.validTo}</div>
>>>>>>> main
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant='destructive' size='sm'>
                            Revoke
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Revocation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to revoke certificate?
                              <br />
                              Common Name: {cert.Name}
                              <br />
                              <span className='text-red-600 font-medium'>
                                This action cannot be undone. The certificate will be immediately
                                invalidated and a new one will be issued.
                              </span>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className='grid gap-4 py-4'>
                            <div className='grid grid-cols-4 items-center gap-4'>
                              <Label htmlFor='reason' className='text-right'>
                                Revocation Reason
                              </Label>
                              <Input
                                id='reason'
                                value={revokeReason}
                                onChange={(e) => setRevokeReason(e.target.value)}
                                placeholder='Enter revocation reason (optional)'
                                className='col-span-3'
                              />
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setRevokeReason('')}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
<<<<<<< HEAD
                              onClick={() => handleRevokeCertificate(cert.Name, revokeReason)}
                              className="bg-red-600 hover:bg-red-700"
=======
                              onClick={() =>
                                handleRevokeCertificate(
                                  cert.id,
                                  cert.commonName,
                                  cert.issuer,
                                  cert.serialNumber,
                                )
                              }
                              className='bg-red-600 hover:bg-red-700'
>>>>>>> main
                            >
                              Confirm Revocation
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                {certificates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className='text-center py-4 text-muted-foreground'>
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
          <CardTitle className='flex items-center gap-2'>
            <ShieldX className='h-5 w-5 text-red-500' />
            Revoked Certificates List
          </CardTitle>
          <CardDescription>Records of revoked CA certificates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
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
<<<<<<< HEAD
                  <TableRow key={cert.Number}>
                    <TableCell className="font-mono text-sm">{cert.Number}</TableCell>
                    <TableCell>{new Date(cert.Time).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}</TableCell>
                    <TableCell>{cert.Reason === "None" ? "No reason provided" : cert.Reason}</TableCell>
=======
                  <TableRow key={cert.id}>
                    <TableCell className='font-mono text-sm'>{cert.serialNumber}</TableCell>
                    <TableCell>{cert.revokedAt}</TableCell>
                    <TableCell>{cert.reason}</TableCell>
>>>>>>> main
                  </TableRow>
                ))}

                {revokedCertificates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className='text-center py-4 text-muted-foreground'>
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
  requiresAuth: true, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;

export default CertificateManagementPage;
