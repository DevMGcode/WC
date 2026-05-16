package com.mundial2026.backend.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    public void sendPasswordReset(String toEmail, String tempPassword) {
        if (fromAddress == null || fromAddress.isBlank()) {
            log.warn("[Email DEV MODE] To: {} | TempPassword: {}", toEmail, tempPassword);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            // multipart=true enables inline image attachments (CID)
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, "Orionix Gol");
            helper.setTo(toEmail);
            helper.setSubject("Tu contrasena temporal - Orionix Gol");
            helper.setText(buildHtml(tempPassword), true);

            // Inline CID attachment — renders natively in Gmail, Outlook, Hotmail
            ClassPathResource logo = new ClassPathResource("static/orionix_logo.png");
            helper.addInline("orionixLogo", logo);

            mailSender.send(message);
            log.info("[Email] Password reset sent to {}", toEmail);
        } catch (Exception e) {
            log.error("[Email] Failed to send to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("No se pudo enviar el correo. Verifica tu conexion.");
        }
    }

    private String buildHtml(String tempPassword) {
        return ("""
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:0;background:#030810;font-family:'Segoe UI',Arial,sans-serif;">

              <table width="100%%" cellpadding="0" cellspacing="0"
                     style="background:#030810;padding:36px 16px;">
                <tr><td align="center">
                  <table width="520" cellpadding="0" cellspacing="0"
                         style="max-width:520px;width:100%%;">

                    <!-- ═══ CARD ═══ -->
                    <tr>
                      <td style="background:linear-gradient(160deg,#06101e 0%%,#070d1c 55%%,#04090f 100%%);
                                 border-radius:20px;
                                 border:1px solid rgba(34,211,238,0.18);
                                 box-shadow:0 28px 80px rgba(0,0,0,0.80);">
                        <table width="100%%" cellpadding="0" cellspacing="0">

                          <!-- Top 3-color neon stripe -->
                          <tr>
                            <td style="height:4px;
                                       background:linear-gradient(90deg,#22d3ee 0%%,#10b981 40%%,#38bdf8 70%%,#22d3ee 100%%);
                                       border-radius:20px 20px 0 0;"></td>
                          </tr>

                          <!-- ─── HEADER ─── -->
                          <tr>
                            <td style="padding:40px 36px 28px;text-align:center;
                                       background:linear-gradient(180deg,rgba(34,211,238,0.05) 0%%,transparent 100%%);">

                              <!--
                                Inline CID image — works in Gmail, Outlook, Hotmail.
                                The src="cid:orionixLogo" maps to the addInline() call.
                              -->
                              <img src="cid:orionixLogo"
                                   alt="Orionix Gol"
                                   width="200"
                                   style="display:block;margin:0 auto;width:200px;max-width:200px;
                                          height:auto;border:0;outline:none;" />

                              <!-- Separator line -->
                              <div style="height:1px;
                                          background:linear-gradient(90deg,transparent,rgba(34,211,238,0.30),transparent);
                                          margin:24px auto 0;width:75%%;"></div>

                              <!-- Subtitle badge -->
                              <div style="display:inline-block;margin-top:18px;
                                          padding:6px 20px;border-radius:20px;
                                          background:rgba(34,211,238,0.07);
                                          border:1px solid rgba(34,211,238,0.20);">
                                <span style="color:rgba(148,163,184,0.75);font-size:10px;
                                             letter-spacing:3px;text-transform:uppercase;font-weight:700;">
                                  Recuperacion de Contrasena
                                </span>
                              </div>
                            </td>
                          </tr>

                          <!-- ─── BODY ─── -->
                          <tr>
                            <td style="padding:8px 36px 36px;">

                              <!-- Intro text -->
                              <p style="color:rgba(148,163,184,0.80);font-size:14px;
                                        line-height:1.75;margin:0 0 28px;text-align:center;">
                                Recibimos una solicitud para restablecer tu contrasena.<br>
                                Tu contrasena temporal es:
                              </p>

                              <!-- Password box -->
                              <table width="100%%" cellpadding="0" cellspacing="0"
                                     style="margin-bottom:28px;">
                                <tr>
                                  <td style="background:linear-gradient(145deg,rgba(34,211,238,0.08),rgba(4,12,28,0.85));
                                             border:1.5px solid rgba(34,211,238,0.32);
                                             border-radius:14px;padding:28px 20px;text-align:center;">
                                    <p style="margin:0 0 12px;color:rgba(100,116,139,0.75);
                                              font-size:9px;letter-spacing:4px;
                                              text-transform:uppercase;font-weight:700;">
                                      Contrasena Temporal
                                    </p>
                                    <span style="display:inline-block;font-size:34px;font-weight:900;
                                                 color:#22d3ee;letter-spacing:8px;
                                                 font-family:'Courier New',Courier,monospace;">
                                      %s
                                    </span>
                                  </td>
                                </tr>
                              </table>

                              <!-- Warning box -->
                              <table width="100%%" cellpadding="0" cellspacing="0"
                                     style="background:rgba(251,191,36,0.06);
                                            border:1px solid rgba(251,191,36,0.16);
                                            border-radius:10px;margin-bottom:16px;">
                                <tr>
                                  <td style="padding:14px 18px;">
                                    <p style="color:rgba(148,163,184,0.85);font-size:12px;
                                              line-height:1.65;margin:0;">
                                      &#x26A0;&#xFE0F;&nbsp;
                                      <strong style="color:rgba(251,191,36,0.95);">
                                        Esta contrasena es temporal.
                                      </strong>
                                      Una vez que inicies sesion, cambialas desde tu perfil.
                                    </p>
                                  </td>
                                </tr>
                              </table>

                              <p style="color:rgba(71,85,105,0.75);font-size:11px;
                                        line-height:1.65;margin:0;text-align:center;">
                                Si no solicitaste esto, ignora este correo — tu cuenta sigue segura.
                              </p>
                            </td>
                          </tr>

                          <!-- Divider -->
                          <tr>
                            <td style="padding:0 36px;">
                              <div style="height:1px;
                                          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);"></div>
                            </td>
                          </tr>

                          <!-- ─── FOOTER ─── -->
                          <tr>
                            <td style="padding:18px 36px 26px;text-align:center;">
                              <p style="margin:0;color:rgba(51,65,85,0.85);font-size:10px;letter-spacing:1px;">
                                &#169; 2026 Orionix Gol &#8212; Todos los derechos reservados
                              </p>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>

            </body>
            </html>
            """).formatted(tempPassword);
    }
}
