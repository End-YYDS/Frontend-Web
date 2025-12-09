import type { AxiosResponse } from 'axios';
import { client } from '@/lib/apiClient';

// -------------------- Shared API status --------------------
export type ApiStatusResponse = {
  Type: 'Ok' | 'Err';
  Message: string;
};

// -------------------- Module --------------------
export type Mode = 'None' | 'White' | 'Black';

// -------------------- IP --------------------
export interface IpEntry {
  Name: string;   // Rust 中的 name
  Ip: string;     // Rust 中的 ip
}

// 使用 Map-like 結構
export type IpMap = Record<string, IpEntry>;

export interface GetIpResponse {
  Mode: Mode;
  Lists?: IpMap; // 如果為 undefined 代表 None
}

export interface PostIpRequest {
  Mode: Mode;
  Name: string;
  Ip: string;
}

export interface DeleteIpRequest {
  Mode: Mode;
  Did: string; // 規格中的 did
}

export interface PutIpRequest {
  Mode: Mode;
}

// -------------------- Module --------------------
export type LoadStatus = "Load" | "Notload";

export type EnableStatus = "Enable" | "Disable";

export interface Module {
  Name: string;
  Version: string;
  Description: string;
  Author: string;
  LoadStatus: LoadStatus;
  EnableStatus: EnableStatus;
}

export interface ModuleCollection {
  Modules: Record<string, Module>;
  Length: number;
}

// 上傳模組表單
export interface ModuleUploadForm {
  Modules: File[]; // Rust 的 TempFile 對應前端 File
}

// GET /api/module
export interface ModuleReport {
  Load: string[];
  Notload: string[];
  Load_Length: number;
  Notload_Length: number;
}

export interface ModuleResponse {
  Module: ModuleReport;
}

// PUT /api/module
export interface PutModuleReport {
  Success: string[];
  Fail: string[];
  Success_Length: number;
  Fail_Length: number;
}

export interface PutModuleResponse {
  Module: PutModuleReport;
}

// DELETE /api/module
export interface DeleteModuleRequest {
  Modules: string[];
}

export interface DeleteModuleReport {
  Delete: string[];
  Notdelete: string[];
  Delete_Length: number;
  Notdelete_Length: number;
}

export interface DeleteModuleResponse {
  Module: DeleteModuleReport;
}

// -------------------- Values --------------------
export interface Threshold {
  Warn: number;
  Dang: number;
}

export interface Values {
  Cpu_usage: Threshold;
  Disk_usage: Threshold;
  Memory: Threshold;
}

export interface ValuesUpdate {
  Cpu_usage?: Threshold;
  Disk_usage?: Threshold;
  Memory?: Threshold;
}

export interface AlertThresholdResponse {
  Cpu_usage?: Threshold;
  Disk_usage?: Threshold;
  Memory?: Threshold;
}

export type AlertThresholdUpdate = AlertThresholdResponse;

export const getAlertThresholds = () =>
  client.get<AlertThresholdResponse, unknown, true>({
    url: '/chm/setting/values',
    responseType: 'json',
    throwOnError: true,
  }) as unknown as Promise<AxiosResponse<AlertThresholdResponse>>;

export const updateAlertThresholds = (body: AlertThresholdUpdate) =>
  client.put<ApiStatusResponse, unknown, true>({
    url: '/chm/setting/values',
    responseType: 'json',
    body,
    headers: { 'Content-Type': 'application/json' },
    throwOnError: true,
  }) as unknown as Promise<AxiosResponse<ApiStatusResponse>>;
