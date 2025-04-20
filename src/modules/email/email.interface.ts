export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface BMIEmailData {
  user_name: string;
  height: number;
  weight: number;
  bmi: number;
  category: string;
  date: string;
  recommendation: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}
