# Snippets

## 001 循环遍历将列表转为树结构

```java
public List<UmsPermissionNode> treeList() {
    List<UmsPermission> permissionList = list();
    return permissionList.stream()
            .filter(permission -> permission.getPid().equals(0L))
            .map(permission -> covert(permission, permissionList))
            .collect(Collectors.toList());
}

/**
  * 将权限转换为带有子级的权限对象
  * 当找不到子级权限的时候map操作不会再递归调用covert
  */
private UmsPermissionNode covert(UmsPermission permission, List<UmsPermission> permissionList) {
    UmsPermissionNode node = new UmsPermissionNode();
    BeanUtils.copyProperties(permission, node);
    List<UmsPermissionNode> children = permissionList.stream()
            .filter(subPermission -> subPermission.getPid().equals(permission.getId()))
            .map(subPermission -> covert(subPermission, permissionList))
            .collect(Collectors.toList());
    node.setChildren(children);
    return node;
}
```

## 002 查询所有一级分类及子分类

属于上面的变种方式，重点关注 `columnPrefix`，他将 `child_id` 和 `child_name` 归纳到 children 字段里去。

```xml
<mapper namespace="com.macro.mall.dao.PmsProductCategoryDao">
    <resultMap id="listWithChildrenMap" type="com.macro.mall.dto.PmsProductCategoryWithChildrenItem"
               extends="com.macro.mall.mapper.PmsProductCategoryMapper.BaseResultMap">
        <collection property="children" resultMap="com.macro.mall.mapper.PmsProductCategoryMapper.BaseResultMap"
                    columnPrefix="child_"></collection>
    </resultMap>

    <select id="listWithChildren" resultMap="listWithChildrenMap">
        select
            c1.id,
            c1.name,
            c2.id   child_id,
            c2.name child_name
        from pms_product_category c1 left join pms_product_category c2 on c1.id = c2.parent_id
        where c1.parent_id = 0
    </select>
</mapper>
```

## 003 自定义查询分页

```java
@Override
@Transactional(propagation = Propagation.SUPPORTS)
public CommonListResult<UmsAdminVO> list(Integer pageNum, Integer pageSize) {
    Page<UmsAdminVO> page = PageHelper.startPage(pageNum, pageSize).doSelectPage(() -> umsAdminDao.getAdminList());
    ResultAttributes attributes = new ResultAttributes(page.getPageNum(), page.getPageSize(), page.getTotal());
    return new CommonListResult<>(page.getResult(), attributes);
}
```

```xml
<mapper namespace="com.chanshiyu.moemall.admin.dao.UmsAdminDao">
    <resultMap id="AdminResultMap" type="com.chanshiyu.moemall.admin.model.vo.UmsAdminVO" extends="com.chanshiyu.moemall.mbg.mapper.UmsAdminMapper.BaseResultMap">
        <collection property="roleIds" ofType="LONG">
            <result column="role_id"/>
        </collection>
    </resultMap>

    <select id="getAdminList" resultMap="AdminResultMap">
        SELECT
            a.*, ar.role_id role_id
        FROM
            ums_admin a
            LEFT JOIN ums_admin_role_relation ar ON a.id = ar.admin_id
        ORDER BY a.id ASC
    </select>
</mapper>
```

## 004 添加登录日志

```java
private void insertLoginLog(String username) {
    UmsAdmin admin = getAdminByUsername(username);
    UmsAdminLoginLog loginLog = new UmsAdminLoginLog();
    loginLog.setAdminId(admin.getId());
    loginLog.setCreateTime(new Date());
    ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
    assert attributes != null;
    HttpServletRequest request = attributes.getRequest();
    loginLog.setIp(request.getRemoteAddr());
    UserAgent ua = UserAgentUtil.parse(request.getHeader("user-agent"));
    String userAgent = ua.getBrowser().toString() + "/" + ua.getVersion() + ", " + ua.getOs().toString();
    loginLog.setUserAgent(userAgent);
    loginLogMapper.insert(loginLog);
}
```

## 005 Mybatis 排序和模糊查询

```java
@Override
@Transactional(propagation = Propagation.SUPPORTS)
public CommonListResult<PmsBrand> list(Integer pageNum, Integer pageSize, String name) {
    PageHelper.startPage(pageNum, pageSize);
    Example example = new Example(PmsBrand.class);
    example.orderBy("sort").desc();
    Example.Criteria criteria = example.createCriteria();
    if (!StringUtils.isEmpty(name)) {
        criteria.andLike("name", "%" + name + "%");
    }
    List<PmsBrand> pmsBrandList = pmsBrandMapper.selectByExample(example);
    PageInfo<PmsBrand> info = new PageInfo<>(pmsBrandList);
    ResultAttributes attributes = new ResultAttributes(info.getPageNum(), info.getPageSize(), info.getTotal());
    return new CommonListResult<>(pmsBrandList, attributes);
}
```

## 006 Mybatis 批量更新

```java
private void updateRole(Long adminId, List<Long> roleIds) {
    // 先删除原有关系
    Example example = new Example(UmsAdminRoleRelation.class);
    Example.Criteria criteria = example.createCriteria();
    criteria.andEqualTo("adminId", adminId);
    umsAdminRoleRelationMapper.deleteByExample(example);
    // 批量插入新关系
    List<UmsAdminRoleRelation> relationList = roleIds.stream()
            .map(roleId -> {
                UmsAdminRoleRelation relation = new UmsAdminRoleRelation();
                relation.setAdminId(adminId);
                relation.setRoleId(roleId);
                return relation;
            }).collect(Collectors.toList());
    umsAdminRoleRelationMapper.insertList(relationList);
}
```

## 007 自定义验证注解

主要实现：

- `FlagValidator`
- `FlagValidatorClass`

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Constraint(validatedBy = FlagValidatorClass.class)
public @interface FlagValidator {
    String[] value() default {};

    String message() default "flag is not found";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
```

```java
public class FlagValidatorClass implements ConstraintValidator<FlagValidator, Integer> {
    private String[] values;

    @Override
    public void initialize(FlagValidator flagValidator) {
        this.values = flagValidator.value();
    }

    @Override
    public boolean isValid(Integer value, ConstraintValidatorContext constraintValidatorContext) {
        boolean isValid = false;
        if (value == null) {
            // 当状态为空时使用默认值
            return true;
        }
        for (String val : values) {
            if (val.equals(String.valueOf(value))) {
                isValid = true;
                break;
            }
        }
        return isValid;
    }
}
```

使用：

```java
@ApiModelProperty(value = "是否进行显示", required = true)
@FlagValidator(value = {"0","1"}, message = "显示状态不正确")
private Integer showStatus;
```

## 008 简单的文件上传

```java
@RestController
@RequestMapping("/tool")
public class ToolController {

    private static final String uploadUrl = "https://sm.ms/api/v2/upload";

    @ApiOperation(value = "文件上传")
    @PostMapping("/upload")
    public CommonResult<String> upload(@RequestParam("file") MultipartFile file) throws IOException {
        String path = System.getProperty("java.io.tmpdir") + "/" + IdUtil.simpleUUID() + file.getOriginalFilename();
        File convFile = new File(path);
        file.transferTo(convFile);
        HashMap<String, Object> paramMap = new HashMap<>();
        paramMap.put("smfile", convFile);
        String result = HttpUtil.post(uploadUrl, paramMap);
        JSONObject jsonObject = JSONUtil.parseObj(result);
        if (!jsonObject.getStr("code").equals("success")) {
            return CommonResult.failed("上传失败");
        }
        JSONObject data = jsonObject.getJSONObject("data");
        log.info("jsonObject: {}", jsonObject);
        String imgUrl = data.getStr("url");
        return CommonResult.ok(imgUrl);
    }

}
```
