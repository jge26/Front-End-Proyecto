export interface ResponseError {
  status: string;
  message: string;
  errors?: {
    [key: string]: string[];
  };
}
