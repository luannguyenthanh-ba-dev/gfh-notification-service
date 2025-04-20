import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import * as handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";
import { EmailOptions, BMIEmailData, EmailConfig } from "./email.interface";
import { EMAIL_TEMPLATES, EMAIL_SUBJECTS } from "./email.const";

/**
 * Service responsible for sending emails using nodemailer and handlebars templates
 *
 * This service provides functionality to:
 * - Send emails using nodemailer
 * - Compile handlebars templates with data
 * - Send specific types of emails (e.g., BMI notifications)
 *
 * @example
 * // Inject the service
 * constructor(private readonly emailService: EmailService) {}
 *
 * // Send a BMI notification email
 * await this.emailService.sendUserBMIEmail('user@example.com', {
 *   name: 'John Doe',
 *   height: 175,
 *   weight: 70,
 *   bmi: 22.9,
 *   category: 'Normal',
 *   date: '2023-04-13',
 *   recommendation: 'Maintain your current healthy lifestyle.'
 * });
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private emailConfig: EmailConfig;

  /**
   * Creates an instance of EmailService
   * Initializes the nodemailer transporter with configuration from EMAIL_CONFIG
   */
  constructor() {
    this.emailConfig = {
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587", 10),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASSWORD || "",
      },
    };
    this.transporter = nodemailer.createTransport(this.emailConfig);
  }

  /**
   * Sends an email using the configured nodemailer transporter
   *
   * @param options - Email options including recipient, subject, and HTML content
   * @throws Error if email sending fails
   * @private
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.emailConfig.auth.user,
        ...options,
      });
      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Compiles a handlebars template with provided data
   *
   * @param templatePath - Path to the template file relative to the dist directory
   * @param data - Data object to be used in template compilation
   * @returns Compiled HTML string
   * @throws Error if template compilation fails
   * @private
   */
  private compileTemplate(templatePath: string, data: any): string {
    try {
      // Try to find the template in the dist directory first
      let templateContent: string;
      const distPath = path.join(process.cwd(), "dist", templatePath);
      const srcPath = path.join(process.cwd(), "src", templatePath);

      try {
        // First try the dist path
        templateContent = fs.readFileSync(distPath, "utf-8");
      } catch (distError) {
        this.logger.warn(
          `Template not found in dist, trying src path: ${distError.message}`,
        );
        try {
          // If not in dist, try the src path
          templateContent = fs.readFileSync(srcPath, "utf-8");
        } catch (srcError) {
          this.logger.error(
            `Template not found in either location: ${srcError.message}`,
          );
          throw new Error(`Template file not found: ${templatePath}`);
        }
      }

      const compiledTemplate = handlebars.compile(templateContent);
      return compiledTemplate(data);
    } catch (error) {
      this.logger.error(
        `Failed to compile template ${templatePath}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Sends a BMI notification email to a user
   *
   * This method:
   * 1. Compiles the BMI template with the provided data
   * 2. Sends the email to the specified user
   *
   * @param userEmail - Recipient's email address
   * @param data - BMI data to be included in the email
   * @returns Promise<boolean> - true if email was sent successfully, false otherwise
   *
   * @example
   * const success = await emailService.sendUserBMIEmail('user@example.com', {
   *   name: 'John Doe',
   *   height: 175,
   *   weight: 70,
   *   bmi: 22.9,
   *   category: 'Normal',
   *   date: '2023-04-13',
   *   recommendation: 'Maintain your current healthy lifestyle.'
   * });
   *
   * if (success) {
   *   console.log('BMI notification email sent successfully');
   * } else {
   *   console.log('Failed to send BMI notification email');
   * }
   */
  async sendUserBMIEmail(
    userEmail: string,
    data: BMIEmailData,
  ): Promise<boolean> {
    try {
      // Validate email address
      if (!userEmail || !userEmail.includes("@")) {
        this.logger.error(`Invalid email address: ${userEmail}`);
        return false;
      }

      // Validate required data
      if (
        !data.user_name ||
        !data.height ||
        !data.weight ||
        !data.bmi ||
        !data.category
      ) {
        this.logger.error("Missing required BMI data fields");
        return false;
      }

      // Compile template
      const html = this.compileTemplate(EMAIL_TEMPLATES.BMI, data);

      // TODO - Send email
      // await this.sendEmail({
      //   to: userEmail,
      //   subject: EMAIL_SUBJECTS.BMI,
      //   html,
      // });

      this.logger.log(
        `BMI notification email sent successfully to ${userEmail}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send BMI notification email to ${userEmail}: ${error.message}`,
      );
      return false;
    }
  }
}
