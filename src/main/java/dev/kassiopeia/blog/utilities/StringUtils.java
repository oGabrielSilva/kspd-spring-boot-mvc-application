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

}
