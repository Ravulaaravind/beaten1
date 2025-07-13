const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service:  "gmail",
    auth: {
      user: process.env.EMAIL_USER || "laptoptest7788@gmail.com",
      pass: process.env.EMAIL_PASS || "uqfiabjkiqudrgdw",
    },
  });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Send OTP email
// purpose: 'login' or 'reset' (default 'reset')
const sendOTPEmail = async (email, otp, userType = "user", purpose = "reset") => {
  try {
    const transporter = createTransporter();

    let subject, heading, message;
    if (purpose === "login") {
      subject = "Your BEATEN Login OTP";
      heading = "Login OTP";
      message = "Use the following OTP to log in to your account.";
    } else {
      subject = userType === "admin"
        ? "Admin Password Reset OTP - BEATEN"
        : "Password Reset OTP - BEATEN";
      heading = "Password Reset OTP";
      message = `We received a request to reset your password for your ${userType === "admin" ? "admin" : ""} account. Use the following OTP to complete the password reset process:`;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${heading}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .otp-container {
            background-color: #f8f9fa;
            border: 2px solid #1a1a1a;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #1a1a1a;
            letter-spacing: 5px;
            margin: 10px 0;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background-color: #1a1a1a;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BEATEN</div>
            <h2>${heading}</h2>
          </div>
          
          <p>Hello,</p>
          
          <p>${message}</p>
          
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
            <p><strong>This OTP is valid for 10 minutes only.</strong></p>
          </div>
          
          <div class="warning">
            <strong>Important:</strong>
            <ul>
              <li>This OTP will expire in 10 minutes</li>
              <li>Do not share this OTP with anyone</li>
              <li>If you didn't request this password reset, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you have any questions or need assistance, please contact our support team.</p>
          
          <div class="footer">
            <p>Best regards,<br>The BEATEN Team</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"BEATEN" <${process.env.EMAIL_USER || "laptoptest7788@gmail.com"}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Failed to send email");
  }
};

// Send password reset success email
const sendPasswordResetSuccessEmail = async (email, userType = "user") => {
  try {
    const transporter = createTransporter();

    const subject =
      userType === "admin"
        ? "Admin Password Reset Successful - BEATEN"
        : "Password Reset Successful - BEATEN";

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .success-icon {
            font-size: 48px;
            color: #28a745;
            margin-bottom: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BEATEN</div>
            <div class="success-icon">✅</div>
            <h2>Password Reset Successful</h2>
          </div>
          
          <p>Hello,</p>
          
          <p>Your ${userType === "admin" ? "admin" : ""} account password has been successfully reset.</p>
          
          <p>If you did not perform this action, please contact our support team immediately as your account may have been compromised.</p>
          
          <p>For security reasons, we recommend:</p>
          <ul>
            <li>Using a strong, unique password</li>
            <li>Enabling two-factor authentication if available</li>
            <li>Regularly updating your password</li>
          </ul>
          
          <div class="footer">
            <p>Best regards,<br>The BEATEN Team</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"BEATEN" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Success email sent: ", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending success email: ", error);
    // Don't throw error for success email as it's not critical
    return false;
  }
};

// Send order status update email
const sendOrderStatusEmail = async (email, status, orderId, userName) => {
  try {
    const transporter = createTransporter();
    const statusMessages = {
      pending: "Your order is pending.",
      processing: "Your order is being processed.",
      shipped: "Your order has been shipped!",
      "out-for-delivery": "Your order is out for delivery!",
      delivered: "Your order has been delivered!",
      cancelled: "Your order has been cancelled.",
    };
    const subject = `Order #${orderId} Status Update: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9;">
        <h2 style="color: #1a1a1a;">Hi ${userName || ""},</h2>
        <p>Your order <b>#${orderId}</b> status has been updated to <b>${status.charAt(0).toUpperCase() + status.slice(1)}</b>.</p>
        <p>${statusMessages[status] || "Order status updated."}</p>
        <p>Thank you for shopping with BEATEN!</p>
        <hr style="margin: 32px 0;" />
        <p style="font-size: 13px; color: #888;">This is an automated email. Please do not reply.</p>
      </div>
    `;
    const mailOptions = {
      from: `"BEATEN" <${process.env.EMAIL_USER || "laptoptest7788@gmail.com"}>`,
      to: email,
      subject,
      html: htmlContent,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Order status email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending order status email:", error);
    return false;
  }
};

// Send order confirmed email with special styling
const sendOrderConfirmedEmail = async (email, orderId, userName) => {
  try {
    const transporter = createTransporter();
    const subject = `Order #${orderId} Confirmed! 🎉`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fffbe6; border-radius: 12px; border: 2px solid #ffe066; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
          <h1 style="color: #ff9900; margin-bottom: 8px;">Order Confirmed!</h1>
        </div>
        <h2 style="color: #1a1a1a;">Hi ${userName || ""},</h2>
        <p style="font-size: 18px; color: #333;">We're excited to let you know that your order <b>#${orderId}</b> has been <b>confirmed</b> and is being prepared for shipment.</p>
        <ul style="font-size: 16px; color: #444; margin: 24px 0;">
          <li>You'll receive another email when your order ships.</li>
          <li>Track your order status anytime in your BEATEN account.</li>
        </ul>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://beaten.in/account/orders" style="background: #ff9900; color: #fff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-size: 18px; font-weight: bold;">View My Order</a>
        </div>
        <p style="font-size: 16px; color: #333;">Thank you for shopping with <b>BEATEN</b>!<br/>We appreciate your trust and support.</p>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #ffe066;" />
        <p style="font-size: 13px; color: #888; text-align: center;">This is an automated email. Please do not reply.</p>
      </div>
    `;
    const mailOptions = {
      from: `"BEATEN" <${process.env.EMAIL_USER || "laptoptest7788@gmail.com"}>`,
      to: email,
      subject,
      html: htmlContent,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Order confirmed email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending order confirmed email:", error);
    return false;
  }
};

// Send return placed email
const sendReturnPlacedEmail = async (email, userName, orderId, productId, reason) => {
  try {
    const transporter = createTransporter();
    const subject = `Return Request Placed for Order #${orderId}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9;">
        <h2 style="color: #1a1a1a;">Hi ${userName || ""},</h2>
        <p>We have received your return request for:</p>
        <ul>
          <li><b>Order ID:</b> ${orderId}</li>
          <li><b>Product ID:</b> ${productId}</li>
          <li><b>Reason:</b> ${reason}</li>
        </ul>
        <p>Our team will review your request and update you soon.</p>
        <p>Thank you for shopping with BEATEN!</p>
        <hr style="margin: 32px 0;" />
        <p style="font-size: 13px; color: #888;">This is an automated email. Please do not reply.</p>
      </div>
    `;
    const mailOptions = {
      from: `"BEATEN" <${process.env.EMAIL_USER || "laptoptest7788@gmail.com"}>`,
      to: email,
      subject,
      html: htmlContent,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Return placed email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending return placed email:", error);
    return false;
  }
};

// Send return status update email (approved/rejected)
const sendReturnStatusEmail = async (email, userName, orderId, productId, status) => {
  try {
    const transporter = createTransporter();
    const statusText = status === 'approved' ? 'Approved' : 'Rejected';
    const statusMsg = status === 'approved'
      ? 'Your return request has been approved. Please follow the instructions for returning your product.'
      : 'Your return request has been rejected. If you have questions, please contact support.';
    const subject = `Return Request ${statusText} for Order #${orderId}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9;">
        <h2 style="color: #1a1a1a;">Hi ${userName || ""},</h2>
        <p>Your return request for:</p>
        <ul>
          <li><b>Order ID:</b> ${orderId}</li>
          <li><b>Product ID:</b> ${productId}</li>
        </ul>
        <p><b>Status:</b> ${statusText}</p>
        <p>${statusMsg}</p>
        <p>Thank you for shopping with BEATEN!</p>
        <hr style="margin: 32px 0;" />
        <p style="font-size: 13px; color: #888;">This is an automated email. Please do not reply.</p>
      </div>
    `;
    const mailOptions = {
      from: `"BEATEN" <${process.env.EMAIL_USER || "laptoptest7788@gmail.com"}>`,
      to: email,
      subject,
      html: htmlContent,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Return status email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending return status email:", error);
    return false;
  }
};

module.exports = {
  generateOTP,
  generateResetToken,
  sendOTPEmail,
  sendPasswordResetSuccessEmail,
  sendOrderStatusEmail,
  sendOrderConfirmedEmail,
  sendReturnPlacedEmail,
  sendReturnStatusEmail,
};
