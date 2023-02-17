## React 条件渲染

```typescript
import { ReactNode } from 'react'

const Apple = () => <span>🍎🍏</span>
const Kiwi = () => <span>🥝</span>
const Cherry = () => <span>🍒</span>
const Grape = () => <span>🍇</span>

export type Fruit = 'apple' | 'kiwi' | 'cherry' | 'grape'

export const ConditionalFruitFacts = ({ fruit }: { fruit: Fruit }) => {
  const icon: Record<Fruit, ReactNode> = {
    apple: <Apple />,
    kiwi: <Kiwi />,
    cherry: <Cherry />,
    grape: <Grape />,
  }

  return (
    <div className="inline-block">
      <span className="flex flex-col text-center">{icon[fruit]}</span>
    </div>
  )
}
```
