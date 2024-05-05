package dev.kassiopeia.blog.utilities;

import java.security.SecureRandom;

public class IdUtils {
    private static SecureRandom random = new SecureRandom();
    private static String alf = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public static String generate(int len) {
        StringBuilder code = new StringBuilder();

        for (int i = 0; i < len; i++) {
            int index = random.nextInt(alf.length());
            code.append(alf.charAt(index));
        }

        return code.toString();
    }
}
