# AES CBC 加解密

```java
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.AlgorithmParameters;
import java.security.Key;
import java.security.Security;
import java.util.Base64;

public class TestMain {

    private static final Base64.Decoder decoder = Base64.getDecoder();

    public static void main(String[] args) throws Exception {
        // 原始数据
        String data = "Hello chanshiyu!";
        // 密钥
        String key = "1234123412ABCDEF";
        // 向量
        String iv = "ABCDEF1234123412";

        // 用Base64编码
        Base64.Encoder encoder = Base64.getEncoder();
        String baseData = encoder.encodeToString(data.getBytes());
        String baseSessionKey = encoder.encodeToString(key.getBytes());
        String baseIv = encoder.encodeToString(iv.getBytes());

        // 导入支持AES/CBC/PKCS7Padding的Provider
        Security.addProvider(new BouncyCastleProvider());
        // 获取加密数据
        String encryptedData = encrypt(baseData, baseSessionKey, baseIv);
        // 通过加密数据获得原始数据
        String dataReborn = decrypt(encryptedData, baseSessionKey, baseIv);

        System.out.println("encryptedData-->" + encryptedData);
        System.out.println("dataReborn-->" + dataReborn);
    }

    public static String encrypt(String data, String key, String iv) throws Exception {
        // 加密之前，先从Base64格式还原到原始格式
        byte[] dataByte = decoder.decode(data);
        byte[] keyByte = decoder.decode(key);
        byte[] ivByte = decoder.decode(iv);

        String encryptedData = null;

        // 指定算法，模式，填充方式，创建一个Cipher
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS7Padding", "BC");

        // 生成Key对象
        Key sKeySpec = new SecretKeySpec(keyByte, "AES");

        // 把向量初始化到算法参数
        AlgorithmParameters params = AlgorithmParameters.getInstance("AES");
        params.init(new IvParameterSpec(ivByte));

        // 指定用途，密钥，参数 初始化Cipher对象
        cipher.init(Cipher.ENCRYPT_MODE, sKeySpec, params);

        // 指定加密
        byte[] result = cipher.doFinal(dataByte);

        // 对结果进行Base64编码，否则会得到一串乱码，不便于后续操作
        Base64.Encoder encoder = Base64.getEncoder();
        encryptedData = encoder.encodeToString(result);

        return encryptedData;
    }


    public static String decrypt(String encryptedData, String key, String iv) throws Exception {
        // 解密之前先把Base64格式的数据转成原始格式
        byte[] dataByte = decoder.decode(encryptedData);
        byte[] keyByte = decoder.decode(key);
        byte[] ivByte = decoder.decode(iv);

        String data = null;

        // 指定算法，模式，填充方法 创建一个Cipher实例
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS7Padding", "BC");

        // 生成Key对象
        Key sKeySpec = new SecretKeySpec(keyByte, "AES");

        // 把向量初始化到算法参数
        AlgorithmParameters params = AlgorithmParameters.getInstance("AES");
        params.init(new IvParameterSpec(ivByte));

        // 指定用途，密钥，参数 初始化Cipher对象
        cipher.init(Cipher.DECRYPT_MODE, sKeySpec, params);

        // 执行解密
        byte[] result = cipher.doFinal(dataByte);

        // 解密后转成字符串
        data = new String(result);

        return data;
    }

}
```
