# Magic 魔数获取文件类型

魔数有很多种定义，这里我们讨论的主要是在编程领域的定义，文件的起始几个字节的内容是固定的（或是有意填充，或是本就如此），这几个字节的内容也被称为魔数（magic number），因此可以根据这几个字节的内容确定文件类型。

## 常见文件类型的魔数

```java
public enum FileType {
    /**
     * JPEG
     */
    JPEG("JPEG", "FFD8FF"),

    /**
     * PNG
     */
    PNG("PNG", "89504E47"),

    /**
     * GIF
     */
    GIF("GIF", "47494638"),

    /**
     * TIFF
     */
    TIFF("TIFF", "49492A00"),

    /**
     * Windows bitmap
     */
    BMP("BMP", "424D"),

    /**
     * CAD
     */
    DWG("DWG", "41433130"),

    /**
     * Adobe photoshop
     */
    PSD("PSD", "38425053"),

    /**
     * Rich Text Format
     */
    RTF("RTF", "7B5C727466"),

    /**
     * XML
     */
    XML("XML", "3C3F786D6C"),

    /**
     * HTML
     */
    HTML("HTML", "68746D6C3E"),

    /**
     * Outlook Express
     */
    DBX("DBX", "CFAD12FEC5FD746F "),

    /**
     * Outlook
     */
    PST("PST", "2142444E"),

    /**
     * doc;xls;dot;ppt;xla;ppa;pps;pot;msi;sdw;db
     */
    OLE2("OLE2", "0xD0CF11E0A1B11AE1"),

    /**
     * Microsoft Word/Excel
     */
    XLS_DOC("XLS_DOC", "D0CF11E0"),

    /**
     * Microsoft Access
     */
    MDB("MDB", "5374616E64617264204A"),

    /**
     * Word Perfect
     */
    WPB("WPB", "FF575043"),

    /**
     * Postscript
     */
    EPS_PS("EPS_PS", "252150532D41646F6265"),

    /**
     * Adobe Acrobat
     */
    PDF("PDF", "255044462D312E"),

    /**
     * Windows Password
     */
    PWL("PWL", "E3828596"),

    /**
     * ZIP Archive
     */
    ZIP("ZIP", "504B0304"),

    /**
     * ARAR Archive
     */
    RAR("RAR", "52617221"),

    /**
     * WAVE
     */
    WAV("WAV", "57415645"),

    /**
     * AVI
     */
    AVI("AVI", "41564920"),

    /**
     * Real Audio
     */
    RAM("RAM", "2E7261FD"),

    /**
     * Real Media
     */
    RM("RM", "2E524D46"),

    /**
     * Quicktime
     */
    MOV("MOV", "6D6F6F76"),

    /**
     * Windows Media
     */
    ASF("ASF", "3026B2758E66CF11"),

    /**
     * MIDI
     */
    MID("MID", "4D546864");

    private String key;
    private String value;

    FileType(String key, String value) {
        this.key = key;
        this.value = value;
    }

    public String getValue() {
        return value;
    }
    public String getKey() {
         return key;
    }
}
```

## 文件类型工具类

```java
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

public class FileUtil {

    /**
     * 获取文件投
     *
     * @param filePath 文件路径
     * @return 16 进制的文件投信息
     * @throws IOException
     */
    private static String getFileHeader(String filePath) throws IOException {
        byte[] b = new byte[28];
        InputStream inputStream = new FileInputStream(filePath);
        inputStream.read(b, 0, 28);
        inputStream.close();
        return bytes2hex(b);
    }

    /**
     * 将字节数组转换成16进制字符串
     */
    private static String bytes2hex(byte[] src) {
        StringBuilder stringBuilder = new StringBuilder("");
        if (src == null || src.length <= 0) {
            return null;
        }
        for (byte b : src) {
            int v = b & 0xFF;
            String hv = Integer.toHexString(v);
            if (hv.length() < 2) {
                stringBuilder.append(0);
            }
            stringBuilder.append(hv);
        }
        return stringBuilder.toString();
    }

    /**
     * 根据文件路径获取文件类型
     *
     * @param filePath 文件路径
     * @return 文件类型
     * @throws IOException
     */
    public static FileType getFileType(String filePath) throws IOException {
        String fileHead = getFileHeader(filePath);
        if (null == fileHead || fileHead.length() == 0) {
            return null;
        }
        fileHead = fileHead.toUpperCase();
        FileType[] fileTypes = FileType.values();
        for (FileType type : fileTypes) {
            if (fileHead.startsWith(type.getValue())) {
                return type;
            }
        }
        return null;
    }
}
```

## 使用

```java
public static void main(String[] args) throws IOException {
    String filePath = "/Users/ziyou/Downloads/SpringBoot实战.png";
    FileType fileType = getFileType(filePath);
    System.out.println(fileType.getKey());
}
```

参考文章：
[Java 中令人匪夷所思的 Magic 之魔数](http://www.justdojava.com/2019/10/24/magic-num/)
