import { z } from "zod";

export const ipAccessSchema = z.object({
  allowedIps: z.string()
    .refine(value => {
      if (!value) return true; // Allow empty string
      const ips = value.split(',').map(ip => ip.trim());
      return ips.every(ip => /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(ip));
    }, "無效的IP格式。請使用有效的IPv4地址，多個IP請用逗號分隔"),
  enableIpRestriction: z.boolean().default(false),
  listType: z.enum(["whitelist", "blacklist"]).default("whitelist"),
  whitelist: z.array(z.object({
    id: z.string(),
    name: z.string(),
    ip: z.string()
  })).default([]),
  blacklist: z.array(z.object({
    id: z.string(),
    name: z.string(),
    ip: z.string()
  })).default([])
});

export const alertSettingsSchema = z.object({
  enableNotifications: z.boolean(),
  cpuUsage: z.number().min(1).max(100),
  diskUsage: z.number().min(1).max(100),
  memory: z.number().min(1).max(100),
  network: z.number().min(1).max(100),
});

export const backupConfigSchema = z.object({
  backupLocation: z.string().min(1, "備份位置為必填"),
  backupFrequency: z.string().min(1, "備份頻率為必填"),
  enableAutoBackup: z.boolean().default(true),
  retentionCount: z.number().min(1).max(100).default(10),
});

export type IpAccessSettings = z.infer<typeof ipAccessSchema>;
export type IpEntry = {
  id: string;
  name: string;
  ip: string;
};