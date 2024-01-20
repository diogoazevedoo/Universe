import React from 'react';
import { useNavigate } from 'react-router-dom';

function TeamSquare({ teamId, imageUrl, teamName }) {

  const navigate = useNavigate();

  function handleClick() {
    navigate(`/teams/${teamId}`);
  }

  return (
    <button className="bg-white team-square flex flex-col items-center w-40 h-40 border border-gray-300 rounded p-4 hover:bg-slate-200" onClick={handleClick}>
      <div className='w-20 border-2 p-1 border-indigo-800 rounded-full flex items-center justify-center cursor-pointer'>
        <img src={imageUrl} alt="Team" className="w-full h-full rounded-full" />
      </div>
      <div className="team-square__name mt-2 text-sm font-semibold">{teamName}</div>
    </button>
  );
}

export default TeamSquare;
