import React, { useState, useEffect } from 'react'
import { Bell, ChatCircleText, Phone, CalendarBlank, UsersThree, Backpack, File, SquaresFour } from 'phosphor-react'
import { useNavigate, useLocation } from 'react-router-dom'

function LeftBar() {

  const navigate = useNavigate();
  const location = useLocation();

  const [activeButton, setActiveButton] = useState('Teams');

  useEffect(() => {
    const path = location.pathname.slice(1); // Remove the leading '/' from the path
    const buttonName = getActiveButtonName(path);
    setActiveButton(buttonName);
  }, [location]);

  const getActiveButtonName = (path) => {
    if (path.startsWith('activity')) {
      return 'Activity';
    } else if (path.startsWith('chat')) {
      return 'Chat';
    } else if (path.startsWith('teams')) {
      return 'Teams';
    } else if (path.startsWith('tasks')) {
      return 'Tasks';
    } else if (path.startsWith('calendar')) {
      return 'Calendar';
    } else if (path.startsWith('calls')) {
      return 'Calls';
    } else if (path.startsWith('files')) {
      return 'Files';
    } else if (path.startsWith('apps')) {
      return 'Apps';
    } else {
      return 'Teams';
    }
  };

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
    navigate(`/${buttonName.toLowerCase()}`);
  };

  return (
    <div className="flex w-[68px] h-[808px] md:max-w-[68px] md:w-full bg-[#ebebeb] shadow-inner">
      <div className="flex flex-col w-[68px] items-center justify-between">
        <div className="flex flex-col items-center justify-center w-full p-[2px] text-neutral-600">

          {activeButton === 'Activity' ? (
            <button className="w-full h-[56px] hover:bg-slate-50 border-y-4 border-transparent hover:text-indigo-700">
              <div className="flex flex-col items-center justify-center h-full w-full border-l-2 border-indigo-700">
                <Bell size={24} color="#5b5fc7" weight="fill" />
                <span className="text-[10px] text-indigo-700">Activity</span>
              </div>
            </button>
          ) : (
            <button className="flex flex-col w-full h-[56px] items-center justify-center hover:bg-slate-50 hover:text-indigo-700" onClick={() => handleButtonClick('Activity')}>
              <Bell size={24} weight="light" />
              <span className="text-[10px]">Activity</span>
            </button>
          )}

          {activeButton === 'Chat' ? (
            <button className="w-full h-[56px] hover:bg-slate-50 border-y-4 border-transparent hover:text-indigo-700">
              <div className="flex flex-col items-center justify-center h-full w-full border-l-2 border-indigo-700">
                <ChatCircleText size={24} color="#5b5fc7" weight="fill" />
                <span className="text-[10px] text-indigo-700">Chat</span>
              </div>
            </button>
          ) : (
            <button className="flex flex-col w-full h-[56px] items-center justify-center hover:bg-slate-50 hover:text-indigo-700" onClick={() => handleButtonClick('Chat')}>
              <ChatCircleText size={24} weight="light" />
              <span className="text-[10px]">Chat</span>
            </button>
          )}

          {activeButton === 'Teams' ? (
            <button className="w-full h-[56px] hover:bg-slate-50 border-y-4 border-transparent hover:text-indigo-700">
              <div className="flex flex-col items-center justify-center h-full w-full border-l-2 border-indigo-700">
                <UsersThree size={24} color="#5b5fc7" weight="fill" />
                <span className="text-[10px] text-indigo-700">Teams</span>
              </div>
            </button>
          ) : (
            <button className="flex flex-col w-full h-[56px] items-center justify-center hover:bg-slate-50 hover:text-indigo-700" onClick={() => handleButtonClick('Teams') }>
              <UsersThree size={24} weight="light" />
              <span className="text-[10px]">Teams</span>
            </button>
          )}

          {activeButton === 'Tasks' ? (
            <button className="w-full h-[56px] hover:bg-slate-50 border-y-4 border-transparent hover:text-indigo-700">
              <div className="flex flex-col items-center justify-center h-full w-full border-l-2 border-indigo-700">
                <Backpack size={24} color="#5b5fc7" weight="fill" />
                <span className="text-[10px] text-indigo-700">Tasks</span>
              </div>
            </button>
          ) : (
            <button className="flex flex-col w-full h-[56px] items-center justify-center hover:bg-slate-50 hover:text-indigo-700" onClick={() => handleButtonClick('Tasks') }>
              <Backpack size={24} weight="light" />
              <span className="text-[10px]">Tasks</span>
            </button>
          )}

          {activeButton === 'Calendar' ? (
            <button className="w-full h-[56px] hover:bg-slate-50 border-y-4 border-transparent hover:text-indigo-700">
              <div className="flex flex-col items-center justify-center h-full w-full border-l-2 border-indigo-700">
                <CalendarBlank size={24} color="#5b5fc7" weight="fill" />
                <span className="text-[10px] text-indigo-700">Calendar</span>
              </div>
            </button>
          ) : (
            <button className="flex flex-col w-full h-[56px] items-center justify-center hover:bg-slate-50 hover:text-indigo-700" onClick={() => handleButtonClick('Calendar')}>
              <CalendarBlank size={24} weight="light" />
              <span className="text-[10px]">Calendar</span>
            </button>
          )}

          {activeButton === 'Calls' ? (
            <button className="w-full h-[56px] hover:bg-slate-50 border-y-4 border-transparent hover:text-indigo-700">
              <div className="flex flex-col items-center justify-center h-full w-full border-l-2 border-indigo-700">
                <Phone size={24} color="#5b5fc7" weight="fill" />
                <span className="text-[10px] text-indigo-700">Calls</span>
              </div>
            </button>
          ) : (
            <button className="flex flex-col w-full h-[56px] items-center justify-center hover:bg-slate-50 hover:text-indigo-700" onClick={() => handleButtonClick('Calls')}>
              <Phone size={24} weight="light" />
              <span className="text-[10px]">Calls</span>
            </button>
          )}

          {activeButton === 'Files' ? (
            <button className="w-full h-[56px] hover:bg-slate-50 border-y-4 border-transparent hover:text-indigo-700">
              <div className="flex flex-col items-center justify-center h-full w-full border-l-2 border-indigo-700">
                <File size={24} color="#5b5fc7" weight="fill" />
                <span className="text-[10px] text-indigo-700">Files</span>
              </div>
            </button>
          ) : (
            <button className="flex flex-col w-full h-[56px] items-center justify-center hover:bg-slate-50 hover:text-indigo-700" onClick={() => handleButtonClick('Files')}>
              <File size={24} weight="light" />
              <span className="text-[10px]">Files</span>
            </button>
          )}

          {activeButton === 'Apps' ? (
            <button className="w-full h-[56px] hover:bg-slate-50 border-y-4 border-transparent hover:text-indigo-700">
              <div className="flex flex-col items-center justify-center h-full w-full border-l-2 border-indigo-700">
                <SquaresFour size={24} color="#5b5fc7" weight="fill" />
                <span className="text-[10px] text-indigo-700">Apps</span>
              </div>
            </button>
          ) : (
            <button className="flex flex-col w-full h-[56px] items-center justify-center hover:bg-slate-50 hover:text-indigo-700" onClick={() => handleButtonClick('Apps')}>
              <SquaresFour size={24} weight="light" />
              <span className="text-[10px]">Apps</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeftBar
