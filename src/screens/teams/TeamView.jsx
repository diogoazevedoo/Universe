import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import LayoutContainer from '../../layout/LayoutContainer';
import { PlusCircle, ArrowLeft, Info, VideoCamera, X, Paperclip } from 'phosphor-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase';
import PostsSection from '../../components/PostsSection';
import FilesSection from '../../components/FilesSection';
import TasksSection from '../../components/TasksSection';
import { nanoid } from 'nanoid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../contexts/AuthContext';

function TeamView() {
  const { teamId } = useParams();
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamImageUrl, setTeamImageUrl] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamChannels, setTeamChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState('General');
  const [activeChannelId, setActiveChannelId] = useState('');

  const [channelModal, setChannelModal] = useState(false);
  const channelNameRef = useRef();

  const [infoOpen, setInfoOpen] = useState(false);
  const [membersWithInfo, setMembersWithInfo] = useState([]);

  const [channelActiveTab, setChannelActiveTab] = useState('posts');

  const { currentUser } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  function handleDropdownToggle(memberId) {
    if (dropdownOpen === memberId) {
      setDropdownOpen(false);
    } else {
      setDropdownOpen(memberId);
    }
  }

  function changeChannelTab(tab) {
    return () => {
        setChannelActiveTab(tab);
    }
  }

  function toggleInfo() {
    setInfoOpen(!infoOpen);
  }

  function openChannelModal() {
    setChannelModal(true);
  }

  function closeChannelModal() {
    setChannelModal(false);
  }

  function createChannel() {
    db.collection('teams')
      .doc(teamId)
      .collection('channels')
      .add({
        channelName: channelNameRef.current.value,
      })
      .then((docRef) => {
        const channelId = docRef.id;
        docRef.update({
          channelId,
        });
      });
    closeChannelModal();
  }

  useEffect(() => {
    if (!teamId) return;
  
    const unsubscribe = db
      .collection('teams')
      .doc(teamId)
      .onSnapshot((snapshot) => {
        setTeamName(snapshot.data().teamName);
        setTeamDescription(snapshot.data().description);
        setTeamImageUrl(snapshot.data().teamPictureURL);
        setTeamMembers(snapshot.data().members || []);
      });
  
    const unsubscribe2 = db
      .collection('teams')
      .doc(teamId)
      .collection('channels')
      .onSnapshot((snapshot) => {
        setTeamChannels(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            channelName: doc.data().channelName,
          }))
        );
      });
  
    return () => {
      unsubscribe();
      unsubscribe2();
    };
  }, [teamId]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!teamMembers || teamMembers.length === 0) return;
  
      const membersWithInfo = await Promise.all(
        teamMembers.map(async (member) => {
          const uid = member.userId;
          const role = member.role;
  
          const userSnapshot = await db.collection('users').doc(uid).get();
          const userData = userSnapshot.data();
  
          return {
            id: uid,
            displayName: userData.displayName,
            profilePictureURL: userData.profilePictureURL,
            role: role,
          };
        })
      );
  
      setMembersWithInfo(membersWithInfo);
    };
  
    fetchMembers();
  }, [teamMembers]);
  
  useEffect(() => {
    //Get active channel id
    const activeChannelId = teamChannels.find(channel => channel.channelName === activeChannel)?.id;

    setActiveChannelId(activeChannelId);

  }, [activeChannel, teamChannels]);
  
  async function createInviteCode(teamId) {
    const code = nanoid(4);
    const inviteCode = teamId + "#" + code;
  
    try {
      const teamRef = db.collection('teams').doc(teamId);
      const teamDoc = await teamRef.get();
      const existingInviteCodes = teamDoc.data().inviteCodes || [];
      const updatedInviteCodes = [...existingInviteCodes, inviteCode];
  
      await teamRef.update({
        inviteCodes: updatedInviteCodes,
      });
  
      navigator.clipboard.writeText(inviteCode);
      toast.success("Invite code created and copied to clipboard");
    } catch (error) {
      toast.error("Error creating invite code");
      console.error("Error creating invite code: ", error);
    }
  }

  async function turnAdmin(userId) {
    try {
      const teamRef = db.collection('teams').doc(teamId);
      const teamDoc = await teamRef.get();
      const existingMembers = teamDoc.data().members || [];
      const updatedMembers = existingMembers.map(member => {
        if (member.userId === userId) {
          return {
            ...member,
            role: "admin"
          }
        } else {
          return member;
        }
      });

      await teamRef.update({
        members: updatedMembers,
      });

      toast.success("User turned admin");
    } catch (error) {
      toast.error("Error turning user admin");
      console.error("Error turning user admin: ", error);
    }
  }

  async function removeAdmin(userId) {
    try {
      const teamRef = db.collection('teams').doc(teamId);
      const teamDoc = await teamRef.get();
      const existingMembers = teamDoc.data().members || [];
      const updatedMembers = existingMembers.map(member => {
        if (member.userId === userId) {
          return {
            ...member,
            role: "member"
          }
        } else {
          return member;
        }
      });

      await teamRef.update({
        members: updatedMembers,
      });

      toast.success("User removed admin");
    } catch (error) {
      toast.error("Error removing user admin");
      console.error("Error removing user admin: ", error);
    }
  }

  const navigate = useNavigate();

  function handleStartMeeting() {
    const meetingId = nanoid(10);
    navigate(`/teams/${teamId}/meeting/${meetingId}`);
  }

  return (
    <LayoutContainer>
      <div className="flex">

        <ToastContainer position='bottom-right' />

        <div className="w-full h-[808px] bg-gray-100 px-3 flex">
          {/* Side */}
          <div className="flex flex-col w-[240px] bg-white border-r border-gray-200 -ml-3 shadow-sm">
            <Link to="/teams" className="flex items-center justify-between mt-4 px-4">
              <div className="flex items-center space-x-2">
                <ArrowLeft size={16} className="text-gray-700" />
                <div className="text-xs text-gray-700">All teams</div>
              </div>
            </Link>
            <div className="flex items-center justify-between h-[60px] px-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <img src={teamImageUrl} alt="team" className="w-10 h-10 rounded-full mr-1" />
                <div className="text-sm font-semibold">{teamName}</div>
              </div>
            </div>

            <div className="flex flex-col flex-grow overflow-y-auto">
              <div className="flex items-center justify-between h-[60px] px-4">
                <div className="text-sm font-semibold">Channels</div>
                {teamMembers.find(member => member.userId === currentUser?.uid)?.role === "admin" || teamMembers.find(member => member.userId === currentUser?.uid)?.role === "creator" ? (
                  <button className="w-6 h-6 text-indigo-800 hover:text-gray-700 mt-0.5" onClick={openChannelModal}>
                    <PlusCircle size={20} />
                  </button>
                ) : (
                  <div></div>
                )}
              </div>

              <div className="flex flex-col space-y-1">
                {teamChannels.map((channel) => (
                  <div
                    key={channel.channelName}
                    onClick={() => setActiveChannel(channel.channelName)}
                    className={
                      activeChannel === channel.channelName
                        ? 'flex items-center h-[40px] px-4 rounded bg-gray-100 text-black cursor-pointer'
                        : 'flex items-center h-[40px] px-4 rounded text-gray-500 hover:bg-gray-100 hover:text-black cursor-pointer'
                    }
                  >
                    <div className="text-sm">{channel.channelName}</div>
                  </div>
                ))}
              </div>
            </div>

            {teamMembers.find(member => member.userId === currentUser?.uid)?.role === "admin" || teamMembers.find(member => member.userId === currentUser?.uid)?.role === "creator" ? (
              <div className="flex items-center justify-center bg-gray-100 h-[60px] px-4 border-t border-gray-200">
                <button className="flex items-center space-x-2 hover:text-indigo-800" onClick={() => createInviteCode(teamId)}>
                  <Paperclip size={20} />
                  <div className="text-sm font-semibold">Invite people</div>
                </button>
              </div>
            ) : (
              <div></div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex flex-col flex-grow pl-4">
            <div className="flex items-center h-14 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                    <div className="text-lg font-semibold mr-4">{activeChannel}</div>
                    <button onClick={changeChannelTab("posts")} className={channelActiveTab === "posts" ? `px-3 py-1.5 text-sm text-white bg-indigo-800 rounded-lg` : `px-3 py-1.5 text-sm text-indigo-800 bg-white rounded-lg`}>Posts</button>
                    <button onClick={changeChannelTab("files")} className={channelActiveTab === "files" ? `px-3 py-1.5 text-sm text-white bg-indigo-800 rounded-lg` : `px-3 py-1.5 text-sm text-indigo-800 bg-white rounded-lg`}>Files</button>
                    <button onClick={changeChannelTab("tasks")} className={channelActiveTab === "tasks" ? `px-3 py-1.5 text-sm text-white bg-indigo-800 rounded-lg` : `px-3 py-1.5 text-sm text-indigo-800 bg-white rounded-lg`}>Tasks</button>
                </div>

                <div className="ml-auto flex items-center space-x-4">
                    <div className="flex items-center">
                        <button className="px-3 py-1.5 text-sm text-indigo-800 bg-white rounded-lg flex items-center -mr-1" onClick={handleStartMeeting}> 
                            <VideoCamera size={20} className="mr-2" />
                            Start a Meeting
                        </button>
                    </div>
                    <button className='mr-3'>
                        <Info size={20} onClick={toggleInfo} />
                    </button>
                </div>
            </div>
            
            {channelActiveTab === "posts" && <PostsSection teamId={teamId} activeChannel={activeChannelId} />}
            {channelActiveTab === "files" && <FilesSection teamId={teamId} activeChannel={activeChannelId} />}
            {channelActiveTab === "tasks" && <TasksSection teamId={teamId} activeChannel={activeChannelId} teamMembers={membersWithInfo} />}
          </div>

          {infoOpen && (
            <div className="absolute right-0 bottom-0 h-[752px] w-[250px] bg-white border-l border-gray-200 shadow-sm">
              <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200">
                <div className="text-lg font-semibold">Team Info</div>
                <button className="text-gray-700" onClick={toggleInfo}>
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <h1 className="text-xl font-semibold mb-2">About</h1>
                {/* Render About content */}
                <p>{teamDescription}</p>
              </div>
              <div className="p-4">
                <h1 className="text-xl font-semibold mb-2">Members</h1>
                {/* Render Members content */}
                <div className="flex flex-col space-y-2">
                  {membersWithInfo.map((member) => (
                    <div key={member.id} className="relative flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        <img src={member.profilePictureURL} alt="member" className="w-8 h-8 rounded-full" />
                        <div>{member.displayName}</div>
                      </div>
                      {teamMembers.find((member) => member.userId === currentUser?.uid && member.role === "creator") ? (
                        <div className="relative">
                          {member.role === "creator" ? (
                            <div></div>
                          ) : (
                            <button className="text-gray-500" onClick={() => handleDropdownToggle(member.id)}>
                              ...
                            </button>
                          )}
                          {dropdownOpen === member.id && (
                            <div className="absolute right-0 mt-1 bg-white border border-gray-200 shadow-sm">
                              <div className="flex space-x-2">
                                {member.role === "admin" ? (
                                  <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => removeAdmin(member.id)}>Remove Admin</button>
                                ) : (
                                  <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => turnAdmin(member.id)}>Turn Admin</button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={channelModal}
        onRequestClose={closeChannelModal}
        contentLabel="Channel Modal"
        className="modal"
      >
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-slate-50 rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
            <div className="flex w-full"></div>
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl">
                Create a channel
              </h1>

              <form className="space-y-4 md:space-y-6">
                <div>
                  <label
                    htmlFor="channelName"
                    className="block mb-2 text-sm font-medium"
                  >
                    Channel Name
                  </label>
                  <input
                    type="text"
                    name="channelName"
                    id="channelName"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5"
                    ref={channelNameRef}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-800 hover:bg-indigo-700 text-white font-medium rounded-lg px-4 py-2.5 text-sm"
                  onClick={createChannel}
                >
                  Create Channel
                </button>

                <button
                  type="button"
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg px-4 py-2.5 text-sm"
                  onClick={closeChannelModal}
                >
                  Close
                </button>
              </form>
            </div>
          </div>
        </div>
      </Modal>
    </LayoutContainer>
  );
}

export default TeamView;
 