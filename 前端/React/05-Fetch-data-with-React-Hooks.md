# Fetch data with React Hooks

在 Reack Hook 中处理网络请求似乎要比 class 组件麻烦一点，毕竟没有 `this` 实例对象可以在上面封装方法。不要拘束于之前的思维，Hook 的数据请求也许会有更好的方式。

这次我们的实验目标是通过 Github Api 来获取 issues 文章列表，通过传入不同的页码来实现分页。通过实践来研究一下在 hook 中如何优雅地实现数据请求，并在最后封装一个通用的自定义数据请求 hook，以便在今后的项目中复用。

## Data Fetching with React Hooks

我们先实现一个简单的函数组件，该组件渲染一个文章列表，并添加一个翻页按钮，每次点击按钮就向下翻一页并向 Github Api 请求文章列表数据。不要问我为什么没有上一页按钮或者分页溢出了怎么办，不要在意这些细节，我们这里只是实验 hook 网络请求，不考虑这种业务细节。

这个功能很简单，如果稍微熟悉 react hook 的使用的话很快就能实现。我们可以先用 `useState` 初始化文章列表和初始页码，然后使用 `useEffect` 获取当前页的文章列表，并在页码更新时重新获取文章列表。第一阶段的代码如下：

```javascript
import React, { useState, useEffect } from 'react'

const GITHUB_API = 'https://api.github.com/repos/chanshiyucx/blog/issues?per_page=10&page='

export default () => {
  const [list, setList] = useState([])
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      const url = `${GITHUB_API}${page}`
      const response = await fetch(url)
      const data = await response.json()
      setList(data)
    }
    fetchData()
  }, [page])

  const handleNextPage = () => setPage(page + 1)

  return (
    <div>
      <button onClick={handleNextPage}>NextPage</button>
      <ul>
        {list.map(o => (
          <li key={o.id}>{o.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

需要注意的是使用 `useEffect` 的时候第一个函数参数不能是一个异步的 async 函数或者是返回一个 Promise，也就是我们不能像下面这样调用，否则会报出警告：

```javascript
useEffect(async () => {
  const url = `${GITHUB_API}${page}`
  const response = await fetch(url)
  const data = await response.json()
  setList(data)
}, [page])
```

> useEffect function must return a cleanup function or nothing. Promises and useEffect(async () =&gt; …) are not supported, but you can call an async function inside an effect.

## Add Loading and Error

上面的简易版本已经可以正常工作了，但是有时我们需要在接口请求时处理更多的页面状态。比如将页面置于 loading，并且在网络请求出错时进行错误处理。根据这个需求，我们在第二个版本加入 loading 和 error 处理，并在渲染组件时候根据不同的状态展示不同的内容：

```javascript
import React, { useState, useEffect } from 'react'

const GITHUB_API = 'https://api.github.com/repos/chanshiyucx/blog/issues?page=10&per_page='

export default () => {
  const [list, setList] = useState([])
  const [page, setPage] = useState(1)
  // 添加 loading 和 error 状态
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false)
      setIsLoading(true)
      try {
        const url = `${GITHUB_API}${page}`
        const response = await fetch(url)
        const data = await response.json()
        setList(data)
      } catch (error) {
        setIsError(true)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [page])

  const handleNextPage = () => setPage(page + 1)

  return (
    <div>
      <button onClick={handleNextPage}>NextPage</button>
      <ul>
        {list.map(o => (
          <li key={o.id}>{o.title}</li>
        ))}
      </ul>

      {/* 不同的状态展示不同的提示内容 */}
      {isError && <div>Something went wrong ...</div>}
      {isLoading && <div>Loading ...</div>}
    </div>
  )
}
```

## Custom Data Fetching Hook

我们第二版本的数据请求方法已经基本可以满足需求，但是实际业务中数据请求并不只限于一个地方存在，所有往往会封装一个通用的数据请求方法以供多处调用。我们通过 `useReducer` 对请求进行统一封装，实现一个可重复使用的自定义 hook。最终版代码如下：

```javascript
import React, { useState, useEffect, useReducer } from 'react'

const GITHUB_API = 'https://api.github.com/repos/chanshiyucx/blog/issues?page=10&per_page='

export default () => {
  const [list, setList] = useState([])
  const [page, setPage] = useState(1)

  const { data, doFetch } = useDataApi(`${GITHUB_API}${page}`, [])
  // 翻页时重新获取列表
  useEffect(() => doFetch(`${GITHUB_API}${page}`), [page])
  useEffect(() => setList(data), [data])

  const handleNextPage = () => setPage(page + 1)

  return (
    <div>
      <button onClick={handleNextPage}>NextPage</button>
      <ul>
        {list.map(o => (
          <li key={o.id}>{o.title}</li>
        ))}
      </ul>

      {isError && <div>Something went wrong ...</div>}
      {isLoading && <div>Loading ...</div>}
    </div>
  )
}

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      }
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      }
    default:
      throw new Error()
  }
}

const useDataApi = (initialUrl, initialData) => {
  const [url, setUrl] = useState(initialUrl)

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  })

  useEffect(() => {
    let didCancel = false

    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' })
      try {
        const response = await fetch(url)
        const data = await response.json()
        if (!didCancel) {
          dispatch({ type: 'FETCH_SUCCESS', payload: data })
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_FAILURE' })
        }
      }
    }
    fetchData()

    return () => {
      didCancel = true
    }
  }, [url])

  const doFetch = url => {
    setUrl(url)
  }

  return { ...state, doFetch }
}
```

参考文章：  
[React-hooks-fetch-data](https://www.robinwieruch.de/react-hooks-fetch-data/)
