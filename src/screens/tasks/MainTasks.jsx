import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import LayoutContainer from '../../layout/LayoutContainer'
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase'

function MainTasks() {

  const navigate = useNavigate();

  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('upcoming'); // State to track the active tab

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const [currentUserTeams, setCurrentUserTeams] = useState([]); // State to hold the current user's teams

  useEffect(() => {
    const unsubscribe = db.collection('teams').onSnapshot((snapshot) => {
      const teams = snapshot.docs.map((doc) => doc.data());
      const currentUserTeams = teams.filter((team) =>
        team.members.some((member) => member.userId === currentUser?.uid)
      );
      setCurrentUserTeams(currentUserTeams);
    });
  
    return () => unsubscribe();
  }, [currentUser]);  

  const [tasks, setTasks] = useState([]); // State to hold the tasks

  useEffect(() => {
    const unsubscribeChannels = currentUserTeams.map((team) => {
      const unsubscribeTasks = db
        .collection('teams')
        .doc(team.teamId)
        .collection('channels')
        .onSnapshot((snapshot) => {
          const tasksPromises = snapshot.docs.map((doc) =>
            db
              .collection('teams')
              .doc(team.teamId)
              .collection('channels')
              .doc(doc.id)
              .collection('tasks')
              .get()
          );
  
          Promise.all(tasksPromises).then((taskSnapshots) => {
            const tasks = [];
            taskSnapshots.forEach((taskSnapshot) => {
              taskSnapshot.forEach((doc) => {
                tasks.push({
                  id: doc.id,
                  data: doc.data(),
                });
              });
            });
            setTasks(tasks);
          });
        });
  
      return () => {
        unsubscribeTasks();
      };
    });
  
    return () => {
      unsubscribeChannels.forEach((unsubscribe) => unsubscribe());
    };
  }, [currentUserTeams]);   

  const getTaskStatus = (dueDate, dueTime) => {
    const today = new Date().getTime();
    const dueDateTime = new Date(`${dueDate} ${dueTime}`).getTime();

    if (dueDateTime < today) {
      return 'pastDue';
    }

    if (dueDateTime > today) {
      return 'upcoming';
    }

    const isCompleted = tasks.some((task) =>
      task.data.deliverys.some(
        (delivery) => delivery.userId === currentUser?.uid && delivery.deliveredAt
      )
    );
  
    if (isCompleted) {
      return 'completed';
    }  
  };
  
  const filteredTasks = tasks.filter((task) => {
    const taskStatus = getTaskStatus(task.data.dueDate, task.data.dueTime);
    return taskStatus === activeTab;
  });

  return (
    <LayoutContainer>
      <div className="flex">
        <div className="w-full h-[808px] bg-gray-100 px-3">
          <div className="p-4 flex justify-between items-center">
            <div className="font-semibold">Tasks</div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <button
                className={`${
                  activeTab === 'upcoming' ? 'bg-indigo-800 text-white' : 'text-gray-500 bg-white'
                } flex-1 px-4 py-2 rounded-l-lg`}
                onClick={() => handleTabClick('upcoming')}
              >
                Upcoming
              </button>
              <button
                className={`${
                  activeTab === 'pastDue' ? 'bg-indigo-800 text-white' : 'text-gray-500 bg-white'
                } flex-1 px-4 py-2 flex items-center justify-center`}
                onClick={() => handleTabClick('pastDue')}
              >
                <div className="flex items-center">
                  <span>Past Due</span>
                  {tasks.some((task) => getTaskStatus(task.data.dueDate, task.data.dueTime) === 'pastDue') && (
                    <div className="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
                  )}
                </div>
              </button>
              <button
                className={`${
                  activeTab === 'completed' ? 'bg-indigo-800 text-white' : 'text-gray-500 bg-white'
                } flex-1 px-4 py-2 rounded-r-lg`}
                onClick={() => handleTabClick('completed')}
              >
                Completed
              </button>
            </div>
            <div className="mt-4">
              {/* Placeholder content for each tab */}
              {activeTab === 'upcoming' && (
                <div>
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 mb-2 cursor-pointer" onClick={() => navigate(`tasks/${task.id}`)}> 
                      <div className="flex items-center">
                        <div className="flex flex-col">
                          <h4 className="text-lg font-medium">{task.data.title}</h4>
                          <p className="text-sm text-gray-500">{`Due at ${task.data.dueDate} - ${task.data.dueTime}`}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'pastDue' && (
                <div>
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 mb-2 cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
                      <div className="flex items-center">
                        <div className="flex flex-col">
                          <h4 className="text-lg font-medium">{task.data.title}</h4>
                          <p className="text-sm text-gray-500">{`Due at ${task.data.dueDate} - ${task.data.dueTime}`}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'completed' && (
                <div>
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 mb-2 cursor-pointer" onClick={() => navigate(`tasks/${task.id}`)}> 
                      <div className="flex items-center">
                        <div className="flex flex-col">
                          <h4 className="text-lg font-medium">{task.data.title}</h4>
                          <p className="text-sm text-gray-500">{`Due at ${task.data.dueDate} - ${task.data.dueTime}`}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutContainer>
  )
}

export default MainTasks
