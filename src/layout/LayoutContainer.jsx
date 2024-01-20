import React from 'react'
import TopBar from './TopBar'
import LeftBar from './LeftBar'

function LayoutContainer({ children }) {
  return (
    <>
      <TopBar />
      <div className="flex">
        <LeftBar />
        <div className="w-full">
          {children}
        </div>
      </div>
    </>
  )
}

export default LayoutContainer
