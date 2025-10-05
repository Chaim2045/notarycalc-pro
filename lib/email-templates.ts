/**
 * Email Templates
 *
 * Professional HTML email templates
 */

export interface WelcomeEmailData {
  userName: string
  officeName?: string
  trialDays: number
}

export function getWelcomeEmail(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ברוכים הבאים ל-NotaryCalc Pro</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Heebo', Arial, sans-serif; background-color: #F5F6F8; direction: rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F6F8; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">
                🎉 ברוכים הבאים ל-NotaryCalc Pro!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0E0E0E; font-size: 20px; margin: 0 0 16px 0;">
                שלום ${data.userName},
              </h2>

              <p style="color: #3A3B40; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                תודה שהצטרפת ל-NotaryCalc Pro! ${data.officeName ? `משרד ${data.officeName} ` : ''}עכשיו יכול ליהנות ממערכת מקצועית לחישוב תעריפי נוטריון.
              </p>

              <div style="background-color: #EFF6FF; border-right: 4px solid #3B82F6; padding: 20px; margin: 24px 0; border-radius: 8px;">
                <h3 style="color: #1E40AF; font-size: 18px; margin: 0 0 12px 0;">
                  ⏰ תקופת ניסיון ${data.trialDays} ימים מתחילה עכשיו!
                </h3>
                <p style="color: #1E3A8A; font-size: 14px; margin: 0;">
                  יש לך גישה מלאה לכל התכונות. ניתן לבטל בכל עת.
                </p>
              </div>

              <h3 style="color: #0E0E0E; font-size: 18px; margin: 32px 0 16px 0;">
                מה אפשר לעשות עכשיו?
              </h3>

              <ul style="color: #3A3B40; font-size: 15px; line-height: 1.8; padding-right: 24px;">
                <li>✅ צור את החישוב הראשון שלך</li>
                <li>📊 עקוב אחר הכנסות והוצאות</li>
                <li>👥 נהל את רשימת הלקוחות</li>
                <li>📄 ייצא חישובים ל-PDF</li>
                <li>⚙️ התאם אישית את ההגדרות</li>
              </ul>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
                   style="display: inline-block; background-color: #3B82F6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  התחל עכשיו →
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #E8E9ED; margin: 32px 0;" />

              <p style="color: #60626B; font-size: 14px; line-height: 1.6; margin: 0;">
                יש שאלות? אנחנו כאן כדי לעזור!<br />
                צור קשר: <a href="mailto:support@notarycalc.com" style="color: #3B82F6; text-decoration: none;">support@notarycalc.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F5F6F8; padding: 24px 30px; text-align: center;">
              <p style="color: #85878F; font-size: 12px; margin: 0;">
                NotaryCalc Pro © 2025 | מערכת מקצועית לחישוב תעריפי נוטריון
              </p>
              <p style="color: #B0B2BA; font-size: 11px; margin: 8px 0 0 0;">
                קיבלת אימייל זה כי נרשמת ל-NotaryCalc Pro
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export interface TrialEndingEmailData {
  userName: string
  daysLeft: number
}

export function getTrialEndingEmail(data: TrialEndingEmailData): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<body style="font-family: 'Heebo', Arial, sans-serif; direction: rtl; background-color: #F5F6F8; padding: 40px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px;">
    <h1 style="color: #F59E0B; font-size: 24px;">⏰ תקופת הניסיון מסתיימת בקרוב</h1>
    <p style="color: #3A3B40; font-size: 16px; line-height: 1.6;">
      שלום ${data.userName},
    </p>
    <p style="color: #3A3B40; font-size: 16px; line-height: 1.6;">
      תקופת הניסיון שלך ב-NotaryCalc Pro מסתיימת בעוד ${data.daysLeft} ימים.
      כדי להמשיך להשתמש במערכת, אנא שדרג למנוי מלא.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
         style="display: inline-block; background-color: #3B82F6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        שדרג עכשיו
      </a>
    </div>
  </div>
</body>
</html>
  `.trim()
}
