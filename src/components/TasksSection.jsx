import React, { useState, useEffect } from 'react';
import { Backpack } from 'phosphor-react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Modal from 'react-modal';

function TasksSection({ teamId, activeChannel, teamMembers }) {

  const [activeTab, setActiveTab] = useState('upcoming'); // State to track the active tab

  const { currentUser } = useAuth();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const [tasksModal, setTasksModal] = useState(false);

  const openTasksModal = () => {
    setTasksModal(true);
  };

  const closeTasksModal = () => {
    setTasksModal(false);
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('None');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');

  const today = new Date();
  const todayFormatted = today.toISOString().split('T')[0];

  const isCreatorOrAdmin = teamMembers.find((member) => member.id === currentUser?.uid && (member.role === 'creator' || member.role === 'admin'));

  function createTask(e) {
    e.preventDefault();

    db.collection('teams').doc(teamId).collection('channels').doc(activeChannel).collection('tasks').add({
      title: title,
      description: description || 'None',
      dueDate: dueDate,
      dueTime: dueTime,
      deliverys: [],
      createdAt: new Date()
    }).then(() => {
      setTitle('');
      setDescription('None');
      setDueDate('');
      setDueTime('23:59');
      closeTasksModal();
    }).catch((error) => {
      console.error(error);
    });
  }

  //fecth tasks
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (teamId && activeChannel) {
      db.collection('teams').doc(teamId).collection('channels').doc(activeChannel).collection('tasks').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        setTasks(snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data()
        })));
      });
    }
  }, [teamId, activeChannel]);

  const getTaskStatus = (dueDate, dueTime) => {
    const today = new Date().getTime();
    const dueDateTime = new Date(`${dueDate} ${dueTime}`).getTime();

    if (dueDateTime < today) {
      return 'pastDue';
    }

    if (dueDateTime > today) {
      return 'upcoming';
    }
  };
  
  const filteredTasks = tasks.filter((task) => {
    const taskStatus = getTaskStatus(task.data.dueDate, task.data.dueTime);
    return taskStatus === activeTab;
  });

  return (
    <div className="relative overflow-x-auto shadow-sm sm:rounded-lg p-6">
      <div className="flex items-center justify-between p-2">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
          Tasks
        </h3>

        {isCreatorOrAdmin && (
        <button className="flex items-center px-3 py-1.5 text-indigo-800 bg-white rounded-lg mb-2" onClick={openTasksModal}>
          <Backpack size={20} className="mr-2" />
          <span className="text-sm">Create Task</span>
        </button>
        )}
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
                <div key={task.id} className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 mb-2 cursor-pointer"> 
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
                <div key={task.id} className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 mb-2 cursor-pointer">
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
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={tasksModal}
        onRequestClose={closeTasksModal}
        contentLabel="Tasks Modal"
        className="modal"
      >
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-slate-50 rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
            <div className="flex w-full"></div>
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl">
                Create a task
              </h1>

              <form className="space-y-4 md:space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block mb-2 text-sm font-medium"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5"
                    required
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block mb-2 text-sm font-medium"
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows="3"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5"
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>

                <div className="flex">
                  <div className="flex-1 mr-2">
                    <label
                      htmlFor="dueDate"
                      className="block mb-2 text-sm font-medium"
                    >
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      id="dueDate"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5"
                      min={todayFormatted}
                      required
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex-1 ml-2">
                    <label
                      htmlFor="dueTime"
                      className="block mb-2 text-sm font-medium"
                    >
                      Due Time
                    </label>
                    <input
                      type="time"
                      name="dueTime"
                      id="dueTime"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5"
                      onChange={(e) => setDueTime(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-800 hover:bg-indigo-700 text-white font-medium rounded-lg px-4 py-2.5 text-sm"
                  onClick={createTask}
                >
                  Create Task
                </button>

                <button
                  type="button"
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg px-4 py-2.5 text-sm"
                  onClick={closeTasksModal}
                >
                  Close
                </button>
              </form>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TasksSection;