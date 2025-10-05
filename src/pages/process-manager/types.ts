export interface ProcessEntry {
  Status: boolean;
  Boot: boolean;
}

// Get /api/process/all
export interface PcProcess {
  Hostname: string;
  Process: Record<string, ProcessEntry>; // pname -> entry
  Length: number;
}

export interface GetAllProcessResponse {
  Pcs: Record<string, PcProcess>; // uuid -> PcProcess
  Length: number;
}

// Post /api/process/one
export interface OneProcessRequest {
  Uuid: string;
}

export interface OneProcessResponse {
  Process: Record<string, ProcessEntry>; // pname -> entry
  Length: number;
}

export interface ActionRequest {
  Uuid: string;
  Process: string;
}
