import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>🅱️ite + 🅱️eact</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 100)}>
          🅱️lick me {count}
        </button>
        <p>
          🅱️asic structure is all set up 👍👍👍
        </p>
      </div>
      <p className="read-the-docs">
        🅱️lick on the Vite and React logos to learn less
      </p>
    </>
  )
}

export default App
