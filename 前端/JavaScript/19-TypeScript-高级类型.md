# TypeScript 高级类型

> 本文为个人学习摘要笔记。  
> 原文地址：[TypeScript 高级类型及用法](https://juejin.cn/post/6985296521495314445)

## 交叉类型 &

交叉类型是将多个类型合并为一个类型。这让我们可以把现有的多种类型叠加到一起成为一种类型，它包含了所需的所有类型的特性。

语法： `T & U`，其返回类型既要符合 `T` 类型也要符合 `U` 类型。

```typescript
interface Ant {
  name: string
  weight: number
}

interface Fly {
  flyHeight: number
  speed: number
}

// 少了任何一个属性都会报错
const flyAnt: Ant & Fly = {
  name: '蚂蚁呀嘿',
  weight: 0.2,
  flyHeight: 20,
  speed: 1,
}
```

## 联合类型 |

语法：`T | U`，其返回类型为连接的多个类型中的任意一个。

```typescript
class Bird {
  fly() {
    console.log('Bird flying')
  }
  layEggs() {
    console.log('Bird layEggs')
  }
}

class Fish {
  swim() {
    console.log('Fish swimming')
  }
  layEggs() {
    console.log('Fish layEggs')
  }
}

const bird = new Bird()
const fish = new Fish()

function start(pet: Bird | Fish) {
  // 调用 layEggs 没问题，因为 Bird 或者 Fish 都有 layEggs 方法
  pet.layEggs()

  // 会报错：Property 'fly' does not exist on type 'Bird | Fish'
  // pet.fly();

  // 会报错：Property 'swim' does not exist on type 'Bird | Fish'
  // pet.swim();
}
```
