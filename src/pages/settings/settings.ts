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
const thresholdSchema = z
  .object({
    warn: z.number().min(0).max(100),
    dang: z.number().min(0).max(100),
  })
  .refine((val) => val.dang >= val.warn, {
    message: 'Danger threshold must be greater than or equal to warning',
    path: ['dang'],
  });

export const alertSettingsSchema = z.object({
  enableNotifications: z.boolean(),
  cpu: thresholdSchema,
  disk: thresholdSchema,
  memory: thresholdSchema,
});

/* ---------------- Backup Config ---------------- */
export const backupConfigSchema = z.object({
  backupLocation: z.string().min(1, '備份位置為必填'),
  backupFrequency: z.string().min(1, '備份頻率為必填'),
  enableAutoBackup: z.boolean(),
  retentionCount: z.number().min(1).max(100),
});

export type BackupConfigFormValues = z.infer<typeof backupConfigSchema>;
