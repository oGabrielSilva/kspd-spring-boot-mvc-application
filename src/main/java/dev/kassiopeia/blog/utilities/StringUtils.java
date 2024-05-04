package dev.kassiopeia.blog.utilities;

public class StringUtils {
    public static boolean isNullOrBlank(String test) {
        return test == null || test.isBlank();
    }

    public static boolean isNotNullOrBlank(String test) {
        return test != null && !test.isBlank();
    }

    public static boolean isNotEquals(String test, String compare) {
        return !test.equals(compare);
    }

}
