---
title: Full Screen
date: 2024-12-04 11:30:45
tags:
  - Web/React
---

```jsx {10-15}
import type { ReactNode } from 'react'

export type Fruit = 'apple' | 'kiwi' | 'cherry' | 'grape'

const Apple = () => <span>🍎</span>
const Kiwi = () => <span>🥝</span>
const Cherry = () => <span>🍒</span>
const Grape = () => <span>🍇</span>

const icon: Record<Fruit, ReactNode> = {
  apple: <Apple />,
  kiwi: <Kiwi />,
  cherry: <Cherry />,
  grape: <Grape />,
}

export const ConditionalFruitFacts = ({ fruit }: { fruit: Fruit }) => {
  return <>{icon[fruit]}</>
}
```
