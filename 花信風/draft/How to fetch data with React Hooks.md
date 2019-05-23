## Data Fetching with React Hooks

我们的目标是在 hook 中通过接口获取文章列表，并且每次点击按钮就向下翻一页。这个功能很简单，如果熟悉 react hook 很快就能实现。我们可以先用 `useState` 初始化文章列表和初始页码，然后使用 `useEffect` 获取当前页的文章列表，并在页码更新时重新获取文章列表。第一阶段的代码如下：

```javascript
import React, { useState, useEffect } from 'react'

const GITHUB_API = 'https://api.github.com/repos/chanshiyucx/blog/issues?page=10&per_page='

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
          <h3 key={o.id}>{o.title}</h3>
        ))}
      </ul>
    </div>
  )
}
```

## Add Loading and Error

上面的简易版本已经可以正常工作了，但是有时我们需要在接口请求时将页面置于 loading 状态，并且请求出错时进行错误处理。根据这个需求，我们在第二个版本加入 loading 和 error 处理：

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
          <h3 key={o.id}>{o.title}</h3>
        ))}
      </ul>

      {isError && <div>Something went wrong ...</div>}
      {isLoading && <div>Loading ...</div>}
    </div>
  )
}
```

## Custom Data Fetching Hook

我们第二版本的数据请求方法已经基本可以满足需求，但是实际业务中数据请求并不只限于一个地方存在，所有往往会封装一个通用的数据请求方法以供多处调用。我们通过 `useReducer` 对请求进行统一封装，实现一个可重复使用的自定义 hook，最终版代码如下：

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
          <h3 key={o.id}>{o.title}</h3>
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
