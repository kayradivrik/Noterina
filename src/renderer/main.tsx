import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './app/App'
import './app/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
