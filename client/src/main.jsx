import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import Connection from './pages/Connection.jsx'
import Transfer from './pages/Transfer.jsx'
import { SocketProvider } from './utils/SocketProvider.jsx'

const router=createBrowserRouter(
  [
    {
      path:"/",
      element:<Connection/>
    },
    {
      path:"/transfer/:roomid",
      element: <Transfer/>
    }
  ]
);

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <SocketProvider>
    <RouterProvider router={router}/>
    </SocketProvider>
  // </StrictMode>,
)