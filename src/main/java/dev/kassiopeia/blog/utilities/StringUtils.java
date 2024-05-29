package dev.kassiopeia.blog.utilities;

public class StringUtils {
    public static boolean isEquals(String test, String compare) {
        return test.equals(compare);
    }

    public static boolean isNullOrBlank(String test) {
        return test == null || test.isBlank();
    }

    public static boolean isNotNullOrBlank(String test) {
        return test != null && !test.isBlank();
    }

    public static boolean isNotEquals(String test, String compare) {
        return !test.equals(compare);
    }

    public static boolean isDescriptionTagTextValidForSEO(String description) {
        return isNotNullOrBlank(description) && description.length() <= 160;
    }

    public static boolean isNotDescriptionTagTextValidForSEO(String description) {
        return !isDescriptionTagTextValidForSEO(description);
    }

    public static boolean endsWith(String str, String suffix) {
        return str != null && suffix != null && str.endsWith(suffix);
    }

    public static String removeEnd(String str, String remove) {
        return endsWith(str, remove) ? str.substring(0, str.length() - remove.length()) : str;
    }

}
