type ResultType = "Ok" | "Err";

interface ProcessPname {
  Status: boolean,
  Boot: boolean
}

interface PcsUuid extends ProcessPname {
  Hostname: string,
  Length: number
}

interface GetAllProcessResponse extends PcsUuid {
  Length: number
}

interface PostOneProcessRequest {
  Uuid: string
}

interface PostOneProcessResponse extends ProcessPname {
  Length: number
}

// start、stop、restart、enable、disable、start_enable、stop_disable
interface PostActionRequest {
  Uuid: string,
  Process: string
}

interface PostActionResponse {
  Type: ResultType,
  Message: string
}

export type {GetAllProcessResponse, PostOneProcessRequest, PostOneProcessResponse, PostActionRequest, PostActionResponse}