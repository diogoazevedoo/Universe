import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LayoutContainer from '../../layout/LayoutContainer'
import { Check, ArrowLeft, Paperclip, Trash, ArrowCounterClockwise } from 'phosphor-react'
import { useAuth } from '../../contexts/AuthContext'
import { db, storage } from '../../firebase'
import { FileIcon, defaultStyles } from 'react-file-icon';

function TaskView() {

  const { taskId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const [turnInButton, setTurnInButton] = useState('Turn in')

  const handleGoBack = () => {
    navigate(-1)
  }

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

  const [currentTask, setCurrentTask] = useState({})
  const [currentChannel, setCurrentChannel] = useState({})
  const [currentTeam, setCurrentTeam] = useState({})

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
                    if (doc.id === taskId) {
                        tasks.push({
                            id: doc.id,
                            data: doc.data(),
                        });
                    }
                });
            });

            setCurrentTask(tasks[0]);
            setCurrentChannel(snapshot.docs[0].id)
            setCurrentTeam(team.teamId);
            });
        });
        return unsubscribeTasks;
    });

    return () => {
        unsubscribeChannels.forEach((unsubscribe) => unsubscribe());
    };
  }, [currentUserTeams, taskId]);

  const [files, setFiles] = useState([])

  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };  

  //check if if task as been turned in and load files
  useEffect(() => {
    if (currentTask?.data?.deliverys) {
        const delivery = currentTask.data.deliverys.find(
            (delivery) => delivery.userId === currentUser?.uid
        );
        if (delivery) {
            setTurnInButton('Undo turn in');
            if (delivery.attachements) {
                setFiles(delivery.attachements);
            }
        }
    }
    }, [currentTask, currentUser]);

  function handleTurnIn() {
    if (files.length === 0) {
      return db
        .collection('teams')
        .doc(currentTeam)
        .collection('channels')
        .doc(currentChannel)
        .collection('tasks')
        .doc(taskId)
        .update({
          deliverys: [
            {
              userId: currentUser.uid,
              deliveredAt: new Date().toISOString(),
            },
          ],
        })
        .then(() => {
          console.log('Task turned in successfully!');
        })
        .catch((error) => {
          console.error('Error turning in task:', error);
        });
    } else {
        //upload each file to storage and get name and url
        const promises = files.map((file) => {
            const storageRef = storage.ref(`files/${currentTeam}/${currentChannel}/tasks/${file.name}`);
            const fileRef = storageRef.child(file.name);
            return fileRef.put(file)
                .then(() => {
                    return fileRef.getDownloadURL();
                })
                .then((url) => {
                    return {
                        name: file.name,
                        downloadLink: url,
                    };
                });
        });

        Promise.all(promises).then((fileObjects) => {
            return db
                .collection('teams')
                .doc(currentTeam)
                .collection('channels')
                .doc(currentChannel)
                .collection('tasks')
                .doc(taskId)
                .update({
                    deliverys: [
                        {
                            userId: currentUser.uid,
                            deliveredAt: new Date().toISOString(),
                            attachements: fileObjects,
                        },
                    ],
                })
                .then(() => {
                    console.log('Task turned in successfully!');
                })
                .catch((error) => {
                    console.error('Error turning in task:', error);
                });
        });
    }
  }

  return (
    <LayoutContainer>
        <div className="flex">
            <div className="w-full h-[808px] bg-gray-100 px-3">
                <div className="p-4 flex justify-between items-center mt-3">
                    <button className="flex items-center px-3 py-1.5 text-indigo-800" onClick={handleGoBack}>
                        <ArrowLeft size={20} className="mr-2" />
                        <span className="text-sm">Back</span>
                    </button>

                    <button className="flex items-center px-3 py-1.5 text-white bg-indigo-800 rounded-lg mb-2" onClick={handleTurnIn}>
                        {turnInButton === 'Turn in' ? (
                            <>
                                <Check size={20} className="mr-2" />
                                <span className="text-sm">{turnInButton}</span>
                            </>
                        ) : (
                            <>
                                <ArrowCounterClockwise size={20} className="mr-2" />
                                <span className="text-sm">{turnInButton}</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="p-4 mx-3">
                    <h1 className="text-2xl font-semibold tracking-wide">{currentTask?.data?.title}</h1>
                    <p className="text-xs text-gray-500 tracking-wide">{`Due at ${currentTask?.data?.dueDate} - ${currentTask?.data?.dueTime}`}</p>

                    <div className="flex items-center mt-8">
                        <div className="w-1/2">
                            <h2 className="text-sm tracking-wide">Description</h2>
                            <p className="text-sm text-gray-500 tracking-wide mt-1">{currentTask?.data?.description}</p>

                            <h2 className="text-sm tracking-wide mt-8">My work</h2>
                            {files.length > 0 && (
                                <div className="my-4">
                                    <ul className="space-y-1">
                                        {files.map((file, index) => (
                                            <li key={index} className="flex items-center bg-gray-200 rounded-lg p-2 justify-between">
                                                <div className='flex items-center'>
                                                    <div className='w-[20px] h-[20px] mr-3 mb-1'>
                                                        <FileIcon
                                                            extension={file.name.split(".").pop()}
                                                            {...defaultStyles[file.name.split(".").pop()]}
                                                        />
                                                    </div>
                                                    <span className="text-sm">{file.name}</span>
                                                </div>
                                                <button
                                                    className="ml-2 text-sm text-red-500"
                                                    onClick={() => removeFile(index)}
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="flex items-center mt-2 text-indigo-800">
                                <label htmlFor="fileInput" className="flex items-center cursor-pointer">
                                    <Paperclip size={18} className="mr-1" />
                                    <span className="text-sm tracking-wide">Attach</span>
                                </label>
                                <input
                                    id="fileInput"
                                    type="file"
                                    multiple
                                    style={{ display: "none" }}
                                    onChange={(e) => setFiles([...files, ...Array.from(e.target.files)])}
                                />
                            </div>
                        </div>

                        <div className="w-1/2 -mt-56 ml-12">
                            <h2 className="text-sm tracking-wide">Feedback</h2>
                            <p className="text-sm text-gray-500 tracking-wide mt-1">No feedback</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </LayoutContainer>
  )
}

export default TaskView
