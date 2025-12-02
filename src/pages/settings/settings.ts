import { z } from 'zod';

export const ipAccessSchema = z.object({
  allowedIps: z.string().refine((value) => {
    if (!value) return true; // Allow empty string
    const ips = value.split(',').map((ip) => ip.trim());
    return ips.every((ip) => /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(ip));
  }, '無效的IP格式。請使用有效的IPv4地址，多個IP請用逗號分隔'),

  enableIpRestriction: z.boolean(),

  listType: z.enum(['whitelist', 'blacklist']),

  whitelist: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      ip: z.string(),
    }),
  ),

  blacklist: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      ip: z.string(),
    }),
  ),
});

export type IpEntry = {
  id: string;
  name: string;
  ip: string;
};

export type IpAccessSettings = z.infer<typeof ipAccessSchema>;

/* ---------------- Alert Settings ---------------- */
export const alertSettingsSchema = z.object({
  enableNotifications: z.boolean(),
  cpuUsage: z.number().min(1).max(100),
  diskUsage: z.number().min(1).max(100),
  memory: z.number().min(1).max(100),
  network: z.number().min(1).max(100),
});

/* ---------------- Backup Config ---------------- */
export const backupConfigSchema = z.object({
  backupLocation: z.string().min(1, '備份位置為必填'),
  backupFrequency: z.string().min(1, '備份頻率為必填'),
  enableAutoBackup: z.boolean(),
  retentionCount: z.number().min(1).max(100),
});

export type BackupConfigFormValues = z.infer<typeof backupConfigSchema>;
