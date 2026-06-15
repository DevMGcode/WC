package com.mundial2026.backend.user.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;


@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    private static final String LOGO_GITHUB_URL =
        "https://raw.githubusercontent.com/DevMGcode/WC/main/Frontend/mundial-app/public/logotipo_Orionix_Gol.png";

    private String logoImgSrc() {
        // En prod usa el dominio propio; en dev usa GitHub (accesible por Gmail)
        if (frontendUrl.startsWith("https://")) {
            return frontendUrl + "/logotipo_Orionix_Gol.png";
        }
        return LOGO_GITHUB_URL;
    }

    private void addLogoIfCid(MimeMessageHelper helper) {
        // Logo se sirve via URL pública, no se adjunta inline
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
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width,initial-scale=1.0">
              <meta name="color-scheme" content="light">
              <meta name="supported-color-schemes" content="light">
              <style>:root{color-scheme:light;}</style>
            </head>
            <body style="margin:0;padding:0;background:#030810;font-family:'Segoe UI',Arial,sans-serif;" bgcolor="#030810">
              <table width="100%%" cellpadding="0" cellspacing="0" bgcolor="#030810"
                     style="background:#030810;padding:36px 16px;">
                <tr><td align="center">
                  <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%%;">
                    <tr>
                      <td bgcolor="#06101e"
                          style="background:linear-gradient(160deg,#06101e 0%%,#070d1c 55%%,#04090f 100%%);
                                 border-radius:20px;border:1px solid #0d3545;">
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td bgcolor="#10b981" height="4"
                                style="height:4px;font-size:0;line-height:0;
                                       background:linear-gradient(90deg,#22d3ee 0%%,#10b981 40%%,#38bdf8 70%%,#22d3ee 100%%);
                                       border-radius:20px 20px 0 0;">&nbsp;</td>
                          </tr>
                          <tr>
                            <td bgcolor="#06101e" style="padding:40px 36px 28px;text-align:center;">
                              <img src="%s" alt="Orionix Gol" width="200"
                                   style="display:block;margin:0 auto;width:200px;height:auto;border:0;" />
                              <div style="height:1px;background:#0d3040;margin:24px auto 0;width:75%%;"></div>
                              <div style="display:inline-block;margin-top:18px;padding:6px 20px;border-radius:20px;
                                          background:#051a26;border:1px solid #0e3545;">
                                <span style="color:#8096a8;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">
                                  Verificacion de Cuenta
                                </span>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td bgcolor="#06101e" style="padding:8px 36px 36px;">
                              <p style="color:#22d3ee;font-size:20px;font-weight:700;text-align:center;margin:0 0 12px;">
                                Hola, %s &#128075;
                              </p>
                              <p style="color:#8096a8;font-size:14px;line-height:1.75;margin:0 0 28px;text-align:center;">
                                Gracias por registrarte en <strong style="color:#38bdf8;">Orionix Gol</strong>.<br>
                                Haz clic en el boton para activar tu cuenta y comenzar a predecir.
                              </p>
                              <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                <tr>
                                  <td align="center">
                                    <table cellpadding="0" cellspacing="0">
                                      <tr>
                                        <td align="center" bgcolor="#10b981"
                                            style="background:linear-gradient(135deg,#22d3ee,#10b981);
                                                   border-radius:12px;">
                                          <a href="%s"
                                             style="display:inline-block;padding:16px 40px;
                                                    color:#030810;font-size:15px;font-weight:800;
                                                    text-decoration:none;border-radius:12px;
                                                    letter-spacing:0.5px;">
                                            &#10003; Verificar mi cuenta
                                          </a>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                              <p style="color:#3e4d5c;font-size:11px;line-height:1.65;margin:0;text-align:center;">
                                Si no creaste esta cuenta, ignora este correo.<br>
                                El enlace expira en 24 horas.
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td bgcolor="#06101e" style="padding:0 36px;">
                              <div style="height:1px;background:#111827;"></div>
                            </td>
                          </tr>
                          <tr>
                            <td bgcolor="#06101e" style="padding:18px 36px 26px;text-align:center;">
                              <p style="margin:0;color:#404e5f;font-size:10px;letter-spacing:1px;">
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

    /**
     * Envía un enlace seguro de recuperación de contraseña (no un password en claro).
     * El password real del usuario no cambia hasta que confirme con este enlace.
     */
    public void sendPasswordResetLink(String toEmail, String resetUrl) {
        if (fromAddress == null || fromAddress.isBlank()) {
            log.warn("[Email DEV MODE] To: {} | ResetUrl: {}", toEmail, resetUrl);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, "Orionix Gol");
            helper.setTo(toEmail);
            helper.setSubject("Recupera tu contrasena - Orionix Gol");
            helper.setText(buildResetLinkHtml(resetUrl), true);
            addLogoIfCid(helper);

            mailSender.send(message);
            log.info("[Email] Password reset link sent to {}", toEmail);
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
              <meta name="color-scheme" content="light">
              <meta name="supported-color-schemes" content="light">
              <style>:root{color-scheme:light;}</style>
            </head>
            <body style="margin:0;padding:0;background:#030810;font-family:'Segoe UI',Arial,sans-serif;" bgcolor="#030810">
              <table width="100%%" cellpadding="0" cellspacing="0" bgcolor="#030810"
                     style="background:#030810;padding:36px 16px;">
                <tr><td align="center">
                  <table width="520" cellpadding="0" cellspacing="0"
                         style="max-width:520px;width:100%%;">
                    <tr>
                      <td bgcolor="#06101e"
                          style="background:linear-gradient(160deg,#06101e 0%%,#070d1c 55%%,#04090f 100%%);
                                 border-radius:20px;border:1px solid #0d3545;">
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td bgcolor="#10b981" height="4"
                                style="height:4px;font-size:0;line-height:0;
                                       background:linear-gradient(90deg,#22d3ee 0%%,#10b981 40%%,#38bdf8 70%%,#22d3ee 100%%);
                                       border-radius:20px 20px 0 0;">&nbsp;</td>
                          </tr>
                          <tr>
                            <td bgcolor="#06101e" style="padding:40px 36px 28px;text-align:center;">
                              <img src="%s" alt="Orionix Gol" width="200"
                                   style="display:block;margin:0 auto;width:200px;height:auto;border:0;" />
                              <div style="height:1px;background:#0d3040;margin:24px auto 0;width:75%%;"></div>
                              <div style="display:inline-block;margin-top:18px;padding:6px 20px;border-radius:20px;
                                          background:#051c13;border:1px solid #0a2e1c;">
                                <span style="color:#8096a8;font-size:10px;letter-spacing:3px;
                                             text-transform:uppercase;font-weight:700;">&#161;Bienvenido!</span>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td bgcolor="#06101e" style="padding:8px 36px 36px;">
                              <p style="color:#22d3ee;font-size:22px;font-weight:700;text-align:center;margin:0 0 16px;">
                                Hola, %s &#128075;
                              </p>
                              <p style="color:#8096a8;font-size:14px;line-height:1.75;
                                        margin:0 0 24px;text-align:center;">
                                Tu cuenta en <strong style="color:#38bdf8;">Orionix Gol</strong> est&#225; lista.<br>
                                Ya puedes hacer tus predicciones del Mundial 2026 y competir con amigos.
                              </p>
                              <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                <tr>
                                  <td bgcolor="#04120d"
                                      style="background:#04120d;border:1.5px solid #0e3a22;
                                             border-radius:14px;padding:20px;text-align:center;">
                                    <p style="margin:0;color:#8096a8;font-size:13px;line-height:1.65;">
                                      &#9917; Predice resultados &middot; &#127942; Sube en el ranking &middot; &#127757; Sigue todos los partidos
                                    </p>
                                  </td>
                                </tr>
                              </table>
                              <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                                <tr>
                                  <td align="center">
                                    <table cellpadding="0" cellspacing="0">
                                      <tr>
                                        <td align="center" bgcolor="#16a34a"
                                            style="background:linear-gradient(90deg,#16a34a,#22c55e);
                                                   border-radius:10px;">
                                          <a href="%s" target="_blank"
                                             style="display:inline-block;color:#ffffff;font-size:14px;
                                                    font-weight:700;text-decoration:none;
                                                    padding:14px 36px;border-radius:10px;letter-spacing:0.05em;">
                                            Ir a Orionix Gol &#8594;
                                          </a>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                              <p style="color:#3e4d5c;font-size:11px;line-height:1.65;
                                        margin:0;text-align:center;">
                                Si no creaste esta cuenta, puedes ignorar este mensaje.
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td bgcolor="#06101e" style="padding:0 36px;">
                              <div style="height:1px;background:#111827;"></div>
                            </td>
                          </tr>
                          <tr>
                            <td bgcolor="#06101e" style="padding:18px 36px 26px;text-align:center;">
                              <p style="margin:0;color:#404e5f;font-size:10px;letter-spacing:1px;">
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
            """).formatted(logoImgSrc(), username, frontendUrl);
    }

    private String buildResetLinkHtml(String resetUrl) {
        return ("""
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta name="color-scheme" content="light">
              <meta name="supported-color-schemes" content="light">
              <style>:root{color-scheme:light;}</style>
            </head>
            <body style="margin:0;padding:0;background:#030810;font-family:'Segoe UI',Arial,sans-serif;" bgcolor="#030810">

              <table width="100%%" cellpadding="0" cellspacing="0" bgcolor="#030810"
                     style="background:#030810;padding:36px 16px;">
                <tr><td align="center">
                  <table width="520" cellpadding="0" cellspacing="0"
                         style="max-width:520px;width:100%%;">

                    <tr>
                      <td bgcolor="#06101e"
                          style="background:linear-gradient(160deg,#06101e 0%%,#070d1c 55%%,#04090f 100%%);
                                 border-radius:20px;
                                 border:1px solid #0d3545;">
                        <table width="100%%" cellpadding="0" cellspacing="0">

                          <tr>
                            <td bgcolor="#10b981" height="4"
                                style="height:4px;font-size:0;line-height:0;
                                       background:linear-gradient(90deg,#22d3ee 0%%,#10b981 40%%,#38bdf8 70%%,#22d3ee 100%%);
                                       border-radius:20px 20px 0 0;">&nbsp;</td>
                          </tr>

                          <tr>
                            <td bgcolor="#06101e" style="padding:40px 36px 28px;text-align:center;">
                              <img src="%s"
                                   alt="Orionix Gol"
                                   width="200"
                                   style="display:block;margin:0 auto;width:200px;max-width:200px;
                                          height:auto;border:0;outline:none;" />
                              <div style="height:1px;background:#0d3040;margin:24px auto 0;width:75%%;"></div>
                              <div style="display:inline-block;margin-top:18px;
                                          padding:6px 20px;border-radius:20px;
                                          background:#051a26;
                                          border:1px solid #0e3545;">
                                <span style="color:#8096a8;font-size:10px;
                                             letter-spacing:3px;text-transform:uppercase;font-weight:700;">
                                  Recuperacion de Contrasena
                                </span>
                              </div>
                            </td>
                          </tr>

                          <tr>
                            <td bgcolor="#06101e" style="padding:8px 36px 36px;">
                              <p style="color:#8096a8;font-size:14px;
                                        line-height:1.75;margin:0 0 28px;text-align:center;">
                                Recibimos una solicitud para restablecer tu contrasena.<br>
                                Haz clic en el boton para elegir una nueva.
                              </p>
                              <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                <tr>
                                  <td align="center">
                                    <table cellpadding="0" cellspacing="0">
                                      <tr>
                                        <td align="center" bgcolor="#10b981"
                                            style="background:linear-gradient(135deg,#22d3ee,#10b981);
                                                   border-radius:12px;">
                                          <a href="%s" target="_blank"
                                             style="display:inline-block;padding:16px 40px;
                                                    color:#030810;font-size:15px;font-weight:800;
                                                    text-decoration:none;border-radius:12px;
                                                    letter-spacing:0.5px;">
                                            &#128273; Restablecer contrasena
                                          </a>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                              <table width="100%%" cellpadding="0" cellspacing="0"
                                     style="border:1px solid #3b2a08;
                                            border-radius:10px;margin-bottom:16px;">
                                <tr>
                                  <td bgcolor="#1a1408"
                                      style="background:#1a1408;padding:14px 18px;border-radius:10px;">
                                    <p style="color:#8096a8;font-size:12px;
                                              line-height:1.65;margin:0;">
                                      &#x26A0;&#xFE0F;&nbsp;
                                      <strong style="color:#f9b900;">
                                        El enlace expira en 1 hora.
                                      </strong>
                                      Tu contrasena actual sigue funcionando hasta que la cambies.
                                    </p>
                                  </td>
                                </tr>
                              </table>
                              <p style="color:#3e4d5c;font-size:11px;
                                        line-height:1.65;margin:0;text-align:center;">
                                Si no solicitaste esto, ignora este correo &mdash; tu cuenta sigue segura.
                              </p>
                            </td>
                          </tr>

                          <tr>
                            <td bgcolor="#06101e" style="padding:0 36px;">
                              <div style="height:1px;background:#111827;"></div>
                            </td>
                          </tr>

                          <tr>
                            <td bgcolor="#06101e" style="padding:18px 36px 26px;text-align:center;">
                              <p style="margin:0;color:#404e5f;font-size:10px;letter-spacing:1px;">
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
            """).formatted(logoImgSrc(), resetUrl);
    }
}
