# Kaptcha 与数学公式验证码

## kaptcha 实现验证码

Google 的 kaptcha 框架是一个高度可配置的实用验证码生成工具，官方地址：[kaptcha github](https://github.com/penggle/kaptcha)。

Spring 中引入非常简单，首先添加依赖：

```xml
<dependency>
    <groupId>com.github.penggle</groupId>
    <artifactId>kaptcha</artifactId>
    <version>2.3.2</version>
</dependency>
```

配置文件：

```java
@Configuration
public class KaptchaConfig {
    @Bean
    public DefaultKaptcha getDefaultKaptcha() {
        DefaultKaptcha defaultKaptcha = new DefaultKaptcha();
        Properties properties = new Properties();
        // 图片边框
        properties.put("kaptcha.border", "yes");
        // 字体颜色
        properties.put("kaptcha.textproducer.font.color", "black");
        // 图片宽
        properties.put("kaptcha.image.width", "120");
        // 图片高
        properties.put("kaptcha.image.height", "40");
        // 字体大小
        properties.put("kaptcha.textproducer.font.size", "25");
        // 验证码长度
        properties.put("kaptcha.textproducer.char.space", "4");
        // 字体
        properties.setProperty("kaptcha.textproducer.font.names", "宋体,楷体,微软雅黑");
        Config config = new Config(properties);
        defaultKaptcha.setConfig(config);
        return defaultKaptcha;
    }
}
```

食用：

```java
@Controller
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class KaptchaController {

    private final DefaultKaptcha captchaProducer;

    @GetMapping("/code")
    public void defaultKaptcha(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws Exception {
        byte[] captchaOutputStream = null;
        ByteArrayOutputStream imgOutputStream = new ByteArrayOutputStream();
        try {
            //生产验证码字符串并保存到session中
            String verifyCode = captchaProducer.createText();
            httpServletRequest.getSession().setAttribute("verifyCode", verifyCode);
            BufferedImage challenge = captchaProducer.createImage(verifyCode);
            ImageIO.write(challenge, "jpg", imgOutputStream);
        } catch (IllegalArgumentException e) {
            httpServletResponse.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        captchaOutputStream = imgOutputStream.toByteArray();
        httpServletResponse.setHeader("Cache-Control", "no-store");
        httpServletResponse.setHeader("Pragma", "no-cache");
        httpServletResponse.setDateHeader("Expires", 0);
        httpServletResponse.setContentType("image/jpeg");
        ServletOutputStream responseOutputStream = httpServletResponse.getOutputStream();
        responseOutputStream.write(captchaOutputStream);
        responseOutputStream.flush();
        responseOutputStream.close();
    }

    @GetMapping("/verify")
    @ResponseBody
    public String verify(@RequestParam("code") String code, HttpSession session) {
        if (StringUtils.isEmpty(code)) {
            return "验证码不能为空";
        }
        String kaptchaCode = session.getAttribute("verifyCode") + "";
        if (StringUtils.isEmpty(kaptchaCode) || !code.equals(kaptchaCode)) {
            return "验证码错误";
        }
        return "验证成功";
    }
}
```

## 数学公式验证码

引入 redis 依赖并添加工具类：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

RedisUtil 工具类：

```java
@SuppressWarnings("unchecked")
@Component
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class RedisUtil {

    private final RedisTemplate redisTemplate;

    //=============================common============================

    /**
     * 指定缓存失效时间
     * @param key 键
     * @param time 时间(秒)
     * @return boolean
     */
    public boolean expire(String key, long time) {
        try {
            if(time > 0) {
                redisTemplate.expire(key, time, TimeUnit.SECONDS);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 根据key获取过期时间
     * @param key 键 不能为null
     * @return 时间(秒) 返回0代表为永久有效
     */
    public long getExpire(String key) {
        return redisTemplate.getExpire(key, TimeUnit.SECONDS);
    }

    /**
     * 判断key是否存在
     * @param key 键
     * @return true存在 false不存在
     */
    public boolean hasKey(String key) {
        try {
            return redisTemplate.hasKey(key);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 删除缓存
     * @param key 可以传一个值 或多个
     */
    public void del(String ...key){
        if(key != null && key.length > 0){
            if (key.length == 1) {
                redisTemplate.delete(key[0]);
            } else {
                redisTemplate.delete(CollectionUtils.arrayToList(key));
            }
        }
    }

    //============================String=============================

    /**
     * 普通缓存获取
     * @param key 键
     * @return 值
     */
    public Object get(String key) {
        return key == null ? null : redisTemplate.opsForValue().get(key);
    }

    /**
     * 普通缓存放入
     * @param key 键
     * @param value 值
     * @return true成功 false失败
     */
    public boolean set(String key, Object value) {
        try {
            redisTemplate.opsForValue().set(key, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 普通缓存放入并设置时间
     * @param key 键
     * @param value 值
     * @param time 时间(秒) time要大于0 如果time小于等于0 将设置无限期
     * @return true成功 false 失败
     */
    public boolean set(String key, Object value, long time) {
        try {
            if(time > 0) {
                redisTemplate.opsForValue().set(key, value, time, TimeUnit.SECONDS);
            } else {
                set(key, value);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
```

验证码生成服务 GenerateVerifyCodeService：

```java
@Service
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class GenerateVerifyCodeService {

    private final RedisUtil redisUtil;

    private String LOGIN_CODE = "LOGIN_CODE_%s";

    /**
     * 创建验证码
     *
     * @param username 用户
     */
    public BufferedImage createVerifyCode(String username) {
        int width = 80;
        int height = 32;
        // 创建图片
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics g = image.getGraphics();
        // 图片背景颜色
        g.setColor(new Color(0xDCDCDC));
        g.fillRect(0, 0, width, height);
        // 绘制边框
        g.setColor(Color.black);
        g.drawRect(0, 0, width - 1, height - 1);
        // 随机
        Random rdm = new Random();
        // 随便画一些线
        for (int i = 0; i < 50; i++) {
            int x = rdm.nextInt(width);
            int y = rdm.nextInt(height);
            g.drawOval(x, y, 0, 0);
        }
        // 生成验证码
        String verifyCode = generateVerifyCode(rdm);
        g.setColor(new Color(0, 100, 0));
        g.setFont(new Font("Candara", Font.BOLD, 18));
        g.drawString(verifyCode.replace("*", "x"), 8, 24);
        g.dispose();
        // 把验证码存到redis中
        int rnd = calc(verifyCode);
        // 记录数学公司的结果
        redisUtil.set(String.format(LOGIN_CODE, username), String.valueOf(rnd), 60);
        //输出图片
        return image;
    }

    /**
     * 验证验证码是否正确
     *
     * @param username   账号
     * @param verifyCode 验证码
     */
    public boolean checkVerifyCode(String username, int verifyCode) {
        if (username == null) {
            return false;
        }
        String redisKey = String.format(LOGIN_CODE, username);
        String codeOld = (String) redisUtil.get(redisKey);
        if (codeOld == null || Integer.parseInt(codeOld) - verifyCode != 0) {
            return false;
        }
        redisUtil.del(redisKey);
        return true;
    }


    /**
     * 传入数学公式，得到结果
     *
     * @param exp 比如 1+2+3
     * @return 6
     */
    private static int calc(String exp) {
        try {
            ScriptEngineManager manager = new ScriptEngineManager();
            ScriptEngine engine = manager.getEngineByName("JavaScript");
            return (Integer) engine.eval(exp);
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    private static char[] ops = new char[]{'+', '-', '*'};

    /**
     * 随机验证码
     * + - *
     */
    private String generateVerifyCode(Random rdm) {
        int num1 = rdm.nextInt(10);
        int num2 = rdm.nextInt(10);
        int num3 = rdm.nextInt(10);
        char op1 = ops[rdm.nextInt(3)];
        char op2 = ops[rdm.nextInt(3)];
        return "" + num1 + op1 + num2 + op2 + num3;
    }
}
```

食用：

```java
@Controller
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class KaptchaController {

  private final GenerateVerifyCodeService verifyCodeService;

  /**
    * 获取验证码
    */
  @GetMapping("/verifyCode")
  @ResponseBody
  public String verifyCode(
          HttpServletResponse response,
          @RequestParam(value = "username", required = true) String username
  ) {
      try {
          BufferedImage image = this.verifyCodeService.createVerifyCode(username);
          OutputStream out = response.getOutputStream();
          ImageIO.write(image, "JPEG", out);
          out.flush();
          out.close();
          return null;
      } catch (Exception e) {
          e.printStackTrace();
          return "验证码生成失败";
      }
  }

  /**
    * 登录验证
    */
  @PostMapping("/login")
  @ResponseBody
  public String login(
          @RequestParam(value = "username", required = true) String username,
          @RequestParam(value = "password", required = true) String password,
          @RequestParam(value = "code", required = true) Integer code
  ) {
      if (StringUtils.isEmpty(code)) {
          return "验证码不能为空";
      }
      boolean checkVerifyCode = this.verifyCodeService.checkVerifyCode(username, code);
      if (!checkVerifyCode) {
          return "验证码错误";
      }
      return "验证成功";
  }
}
```
