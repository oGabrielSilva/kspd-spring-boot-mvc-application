package dev.kassiopeia.blog.mail.res;

import dev.kassiopeia.blog.modules.user.entities.User;

public class EmailTemplates {
    public static final String VERIFICATION = """
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verificação da Conta</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">

                <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #333;">Verificação da Conta - Por favor, ative sua conta</h2>
                    <p>Olá, [username],</p>
                    <p>Para garantir a segurança da sua conta e fornecer a melhor experiência possível, precisamos que você ative sua conta.</p>
                    <p>Sua solicitação de ativação gerou o código de uso único: <strong>[unique-code]</strong></p>
                    <p>Se não foi você quem solicitou, por favor, ignore esta mensagem.</p>
                </div>

            </body>
            </html>
                """;

    public static String generateVerificationContent(User user, String verification) {
        return VERIFICATION.replace("[username]", user.getUsername()).replace("[unique-code]",
                verification);
    }
}
