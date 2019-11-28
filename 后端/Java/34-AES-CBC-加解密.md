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

public class CryptoAesUtil {

    private static final Base64.Decoder decoder = Base64.getDecoder();

    private static final Base64.Encoder encoder = Base64.getEncoder();

    public static String encrypt(String data, String key, String iv) throws Exception {
        byte[] result = handleMsg(data, key, iv, Cipher.ENCRYPT_MODE);
        return encoder.encodeToString(result);
    }

    public static String decrypt(String data, String key, String iv) throws Exception {
        byte[] result = handleMsg(data, key, iv, Cipher.DECRYPT_MODE);
        return new String(result);
    }

    private static byte[] handleMsg(String data, String key, String iv, int mode) throws Exception {
        // 先把 Base64 格式的数据转成原始格式
        byte[] dataByte = decoder.decode(data);
        byte[] keyByte = decoder.decode(key);
        byte[] ivByte = decoder.decode(iv);
        // 指定算法，模式，填充方法 创建一个 Cipher 实例
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS7Padding", "BC");
        // 生成 Key 对象
        Key sKeySpec = new SecretKeySpec(keyByte, "AES");
        // 把向量初始化到算法参数
        AlgorithmParameters params = AlgorithmParameters.getInstance("AES");
        params.init(new IvParameterSpec(ivByte));
        // 指定模式、密钥、参数，初始化 Cipher 对象
        cipher.init(mode, sKeySpec, params);
        // 执行加解密
        return cipher.doFinal(dataByte);
    }

}
```
