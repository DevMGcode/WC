package com.mundial2026.backend.user.service;

import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    private String logoBase64;

    @PostConstruct
    private void loadLogoBase64() {
        try {
            ClassPathResource logo = new ClassPathResource("static/orionix_logo.png");
            logoBase64 = Base64.getEncoder().encodeToString(logo.getInputStream().readAllBytes());
            log.info("[Email] Logo loaded ({} chars base64)", logoBase64.length());
        } catch (Exception e) {
            log.warn("[Email] Logo unavailable, falling back to CID: {}", e.getMessage());
        }
    }

    private String logoImgSrc() {
        return logoBase64 != null ? "data:image/png;base64," + logoBase64 : "cid:orionixLogo";
    }

    private void addLogoIfCid(MimeMessageHelper helper) throws Exception {
        if (logoBase64 == null) {
            ClassPathResource logo = new ClassPathResource("static/orionix_logo.png");
            helper.addInline("orionixLogo", logo);
        }
    }

    public void sendVerificationEmail(String toEmail, String username, String verifyUrl) {
        if (fromAddress == null || fromAddress.isBlank()) {
            log.info("[Email DEV MODE] Verify URL for {}: {}", username, verifyUrl);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress, "Orionix Gol");
            helper.setTo(toEmail);
            helper.setSubject("Verifica tu cuenta - Orionix Gol");
            helper.setText(buildVerificationHtml(username, verifyUrl), true);
            addLogoIfCid(helper);
            mailSender.send(message);
            log.info("[Email] Verification email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("[Email] Failed to send verification email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("No se pudo enviar el correo de verificación.");
        }
    }

    private String buildVerificationHtml(String username, String verifyUrl) {
        return ("""
            <!DOCTYPE html>
            <html lang="es">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
            <body style="margin:0;padding:0;background:#030810;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#030810;padding:36px 16px;">
                <tr><td align="center">
                  <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%%;">
                    <tr>
                      <td style="background:linear-gradient(160deg,#06101e 0%%,#070d1c 55%%,#04090f 100%%);
                                 border-radius:20px;border:1px solid rgba(34,211,238,0.18);
                                 box-shadow:0 28px 80px rgba(0,0,0,0.80);">
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr><td style="height:4px;background:linear-gradient(90deg,#22d3ee 0%%,#10b981 40%%,#38bdf8 70%%,#22d3ee 100%%);border-radius:20px 20px 0 0;"></td></tr>
                          <tr>
                            <td style="padding:40px 36px 28px;text-align:center;background:linear-gradient(180deg,rgba(34,211,238,0.05) 0%%,transparent 100%%);">
                              <img src="%s" alt="Orionix Gol" width="200"
                                   style="display:block;margin:0 auto;width:200px;height:auto;border:0;" />
                              <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(34,211,238,0.30),transparent);margin:24px auto 0;width:75%%;"></div>
                              <div style="display:inline-block;margin-top:18px;padding:6px 20px;border-radius:20px;
                                          background:rgba(34,211,238,0.07);border:1px solid rgba(34,211,238,0.20);">
                                <span style="color:rgba(148,163,184,0.75);font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">
                                  Verificacion de Cuenta
                                </span>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:8px 36px 36px;">
                              <p style="color:#22d3ee;font-size:20px;font-weight:700;text-align:center;margin:0 0 12px;">
                                Hola, %s &#128075;
                              </p>
                              <p style="color:rgba(148,163,184,0.80);font-size:14px;line-height:1.75;margin:0 0 28px;text-align:center;">
                                Gracias por registrarte en <strong style="color:#38bdf8;">Orionix Gol</strong>.<br>
                                Haz clic en el boton para activar tu cuenta y comenzar a predecir.
                              </p>
                              <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                <tr>
                                  <td align="center">
                                    <a href="%s"
                                       style="display:inline-block;padding:16px 40px;
                                              background:linear-gradient(135deg,#22d3ee,#10b981);
                                              color:#030810;font-size:15px;font-weight:800;
                                              text-decoration:none;border-radius:12px;
                                              letter-spacing:0.5px;">
                                      &#10003; Verificar mi cuenta
                                    </a>
                                  </td>
                                </tr>
                              </table>
                              <p style="color:rgba(71,85,105,0.75);font-size:11px;line-height:1.65;margin:0;text-align:center;">
                                Si no creaste esta cuenta, ignora este correo.<br>
                                El enlace expira en 24 horas.
                              </p>
                            </td>
                          </tr>
                          <tr><td style="padding:0 36px;"><div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);"></div></td></tr>
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
            """).formatted(logoImgSrc(), username, verifyUrl);
    }

    public void sendWelcomeEmail(String toEmail, String username) {
        if (fromAddress == null || fromAddress.isBlank()) {
            log.info("[Email DEV MODE] Welcome email for user: {}", username);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress, "Orionix Gol");
            helper.setTo(toEmail);
            helper.setSubject("¡Bienvenido a Orionix Gol!");
            helper.setText(buildWelcomeHtml(username), true);
            addLogoIfCid(helper);
            mailSender.send(message);
            log.info("[Email] Welcome email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("[Email] Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendPasswordReset(String toEmail, String tempPassword) {
        if (fromAddress == null || fromAddress.isBlank()) {
            log.warn("[Email DEV MODE] To: {} | TempPassword: {}", toEmail, tempPassword);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, "Orionix Gol");
            helper.setTo(toEmail);
            helper.setSubject("Tu contrasena temporal - Orionix Gol");
            helper.setText(buildHtml(tempPassword), true);
            addLogoIfCid(helper);

            mailSender.send(message);
            log.info("[Email] Password reset sent to {}", toEmail);
        } catch (Exception e) {
            log.error("[Email] Failed to send to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("No se pudo enviar el correo. Verifica tu conexion.");
        }
    }

    private String buildWelcomeHtml(String username) {
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
                    <tr>
                      <td style="background:linear-gradient(160deg,#06101e 0%%,#070d1c 55%%,#04090f 100%%);
                                 border-radius:20px;border:1px solid rgba(34,211,238,0.18);
                                 box-shadow:0 28px 80px rgba(0,0,0,0.80);">
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="height:4px;background:linear-gradient(90deg,#22d3ee 0%%,#10b981 40%%,#38bdf8 70%%,#22d3ee 100%%);
                                       border-radius:20px 20px 0 0;"></td>
                          </tr>
                          <tr>
                            <td style="padding:40px 36px 28px;text-align:center;
                                       background:linear-gradient(180deg,rgba(34,211,238,0.05) 0%%,transparent 100%%);">
                              <img src="%s" alt="Orionix Gol" width="200"
                                   style="display:block;margin:0 auto;width:200px;height:auto;border:0;" />
                              <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(34,211,238,0.30),transparent);
                                          margin:24px auto 0;width:75%%;"></div>
                              <div style="display:inline-block;margin-top:18px;padding:6px 20px;border-radius:20px;
                                          background:rgba(16,185,129,0.07);border:1px solid rgba(16,185,129,0.20);">
                                <span style="color:rgba(148,163,184,0.75);font-size:10px;letter-spacing:3px;
                                             text-transform:uppercase;font-weight:700;">&#161;Bienvenido!</span>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:8px 36px 36px;">
                              <p style="color:#22d3ee;font-size:22px;font-weight:700;text-align:center;margin:0 0 16px;">
                                Hola, %s &#128075;
                              </p>
                              <p style="color:rgba(148,163,184,0.80);font-size:14px;line-height:1.75;
                                        margin:0 0 24px;text-align:center;">
                                Tu cuenta en <strong style="color:#38bdf8;">Orionix Gol</strong> est&#225; lista.<br>
                                Ya puedes hacer tus predicciones del Mundial 2026 y competir con amigos.
                              </p>
                              <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                                <tr>
                                  <td style="background:linear-gradient(145deg,rgba(16,185,129,0.08),rgba(4,12,28,0.85));
                                             border:1.5px solid rgba(16,185,129,0.25);border-radius:14px;
                                             padding:20px;text-align:center;">
                                    <p style="margin:0;color:rgba(148,163,184,0.85);font-size:13px;line-height:1.65;">
                                      &#9917; Predice resultados &middot; &#127942; Sube en el ranking &middot; &#127757; Sigue todos los partidos
                                    </p>
                                  </td>
                                </tr>
                              </table>
                              <p style="color:rgba(71,85,105,0.75);font-size:11px;line-height:1.65;
                                        margin:0;text-align:center;">
                                Si no creaste esta cuenta, puedes ignorar este mensaje.
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:0 36px;">
                              <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);"></div>
                            </td>
                          </tr>
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
            """).formatted(logoImgSrc(), username);
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

                    <tr>
                      <td style="background:linear-gradient(160deg,#06101e 0%%,#070d1c 55%%,#04090f 100%%);
                                 border-radius:20px;
                                 border:1px solid rgba(34,211,238,0.18);
                                 box-shadow:0 28px 80px rgba(0,0,0,0.80);">
                        <table width="100%%" cellpadding="0" cellspacing="0">

                          <tr>
                            <td style="height:4px;
                                       background:linear-gradient(90deg,#22d3ee 0%%,#10b981 40%%,#38bdf8 70%%,#22d3ee 100%%);
                                       border-radius:20px 20px 0 0;"></td>
                          </tr>

                          <tr>
                            <td style="padding:40px 36px 28px;text-align:center;
                                       background:linear-gradient(180deg,rgba(34,211,238,0.05) 0%%,transparent 100%%);">
                              <img src="%s"
                                   alt="Orionix Gol"
                                   width="200"
                                   style="display:block;margin:0 auto;width:200px;max-width:200px;
                                          height:auto;border:0;outline:none;" />
                              <div style="height:1px;
                                          background:linear-gradient(90deg,transparent,rgba(34,211,238,0.30),transparent);
                                          margin:24px auto 0;width:75%%;"></div>
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

                          <tr>
                            <td style="padding:8px 36px 36px;">
                              <p style="color:rgba(148,163,184,0.80);font-size:14px;
                                        line-height:1.75;margin:0 0 28px;text-align:center;">
                                Recibimos una solicitud para restablecer tu contrasena.<br>
                                Tu contrasena temporal es:
                              </p>
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
                                Si no solicitaste esto, ignora este correo &mdash; tu cuenta sigue segura.
                              </p>
                            </td>
                          </tr>

                          <tr>
                            <td style="padding:0 36px;">
                              <div style="height:1px;
                                          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);"></div>
                            </td>
                          </tr>

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
            """).formatted(logoImgSrc(), tempPassword);
    }
}
