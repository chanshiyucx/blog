# Axios 自定义返回值类型

参考文章：[axios 返回值类型能不能改](https://segmentfault.com/q/1010000041697612)

修改 axios 的类型声明，添加 `axios.d.ts`。

```ts
import { AxiosRequestConfig } from "axios"

declare module "axios" {
  export interface AxiosInstance {
    <T = any>(config: AxiosRequestConfig): Promise<T>
    request<T = any>(config: AxiosRequestConfig): Promise<T>
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
    post<T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T>
    put<T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T>
    patch<T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T>
  }
}

interface Result<T = string> {
  code: number
  data: T
}

axios.get<Result>("/url") // 返回 Primise<Result<string>>
```
