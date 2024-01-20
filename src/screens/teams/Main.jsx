import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import LayoutContainer from '../../layout/LayoutContainer';
import { PlusCircle } from 'phosphor-react';
import TeamSquare from '../../components/TeamSquare';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../firebase';
import { useNavigate } from 'react-router-dom';

function Main() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('create');

  const { currentUser } = useAuth();

  const [teamPicture, setTeamPicture] = useState('default-user.png');
  const [teamPictureFile, setTeamPictureFile] = useState(null);
  const teamNameRef = useRef();
  const descriptionRef = useRef();

  const inviteCodeRef = useRef();

  const [currentUserTeams, setCurrentUserTeams] = useState([]);

  const navigate = useNavigate();

  function handleTeamPictureChange(e) {
    const file = e.target.files[0];
    setTeamPictureFile(file);

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        setTeamPicture(e.target.result);
      }

      reader.readAsDataURL(file);
    }
  }

  async function handleCreateTeam(e) {
    e.preventDefault();
  
    const teamName = teamNameRef.current.value;
    const description = descriptionRef.current.value;
  
    try {
      // Create a new team document and get the generated team ID
      const teamRef = await db.collection('teams').doc();
      const teamId = teamRef.id;
  
      let teamPictureURL = '';
  
      if (teamPictureFile) {
        // Upload the image file to Firebase Storage
        const storageRef = storage.ref(`teamPictures/${teamId}/${teamPictureFile.name}`);
        const snapshot = await storageRef.put(teamPictureFile);
  
        // Get the download URL of the uploaded image
        teamPictureURL = await snapshot.ref.getDownloadURL();
      }
  
      // Save the team data, including the team picture URL, in Firestore
      await teamRef.set({
        teamId,
        teamName,
        description,
        teamPictureURL,
        members: [{
          userId: currentUser?.uid,
          role: "creator"
        }],
        inviteCodes: [],
      });
  
      // Create a default channel for the team
      const defaultChannelRef = await teamRef.collection('channels').doc();
  
      // Save the default channel data in Firestore
      await defaultChannelRef.set({
        channelId: defaultChannelRef.id,
        channelName: 'General',
      });

      handleCloseModal();
      navigate(`/teams/${teamId}`);
    } catch (error) {
      console.log(error);
    }
  }

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
  
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  function handleJoinTeam(e) {
    e.preventDefault();

    const inviteCode = inviteCodeRef.current.value;
    const teamId = inviteCode.split('#')[0];

    //check if team and invite code exists
    db.collection('teams')
      .doc(teamId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const team = doc.data();
          const inviteCodes = team.inviteCodes;

          if (inviteCodes.includes(inviteCode)) {
            //add user to team
            db.collection('teams')
              .doc(teamId)
              .update({
                members: [
                  ...team.members,
                  { userId: currentUser?.uid, role: 'member' },
                ],
                inviteCodes: inviteCodes.filter((code) => code !== inviteCode),
              });

              setModalOpen(false);
              navigate(`/teams/${teamId}`);
          } else {
            console.log('invite code does not exist');
          }
        } else {
          console.log('team does not exist');
        }
      });
  }

  return (
    <LayoutContainer>
      <div className="flex">
        <div className="w-full h-[808px] bg-gray-100 px-3">
          <div className="p-4 flex justify-between items-center">
            <div className="font-semibold">Teams</div>
            <div>
              <button
                className="flex items-center px-3 py-1.5 bg-white text-indigo-800 font-semibold text-sm rounded-md mr-2"
                onClick={handleOpenModal}
              >
                <PlusCircle size={18} className="mr-1.5" />
                Join or Create Team
              </button>
            </div>
          </div>

          <div className="grid grid-cols-6 px-4 py-2">
            {currentUserTeams.map((team, index) => (
              <TeamSquare
                key={index}
                teamId={team.teamId}
                imageUrl={team.teamPictureURL}
                teamName={team.teamName}
              />
            ))}
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onRequestClose={handleCloseModal}
          contentLabel="Team Modal"
          className="modal"
        >
          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full bg-slate-50 rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
              <div className="flex w-full">
                <button
                  className={`w-1/2 py-2 mt-4 font-semibold ${
                    activeTab === 'create'
                      ? 'text-indigo-800 border-b-2 border-indigo-800'
                      : ''
                  }`}
                  onClick={() => handleTabChange('create')}
                >
                  Create Team
                </button>

                <button
                  className={`w-1/2 py-2 mt-4 font-semibold ${
                    activeTab === 'join'
                      ? 'text-indigo-800 border-b-2 border-indigo-800'
                      : ''
                  }`}
                  onClick={() => handleTabChange('join')}
                >
                  Join Team
                </button>
              </div>

              {activeTab === 'create' ? (
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                  <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl">
                    Create a new team
                  </h1>

                  <form className="space-y-4 md:space-y-6" onSubmit={handleCreateTeam}>
                    <div className="flex items-center justify-center">
                      <label htmlFor="avatarInput">
                        <div className="w-32 h-32 border-2 p-1 border-indigo-800 rounded-full flex items-center justify-center cursor-pointer">
                          <img
                            src={teamPicture}
                            alt="Avatar"
                            className="w-full h-full rounded-full"
                          />
                        </div>
                      </label>
                      <input
                        id="avatarInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleTeamPictureChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="displayName"
                        className="block mb-2 text-sm font-medium"
                      >
                        Team Name
                      </label>
                      <input
                        type="text"
                        name="teamName"
                        id="teamName"
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5"
                        ref={teamNameRef}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium"
                      >
                        Description
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        maxLength={200}
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5"
                        ref={descriptionRef}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-800 hover:bg-indigo-700 text-white font-medium rounded-lg px-4 py-2.5 text-sm"
                    >
                      Create Team
                    </button>

                    <button
                      type="button"
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg px-4 py-2.5 text-sm"
                      onClick={handleCloseModal}
                    >
                      Close
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                  <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl">
                    Join a team
                  </h1>

                  <form className="space-y-4 md:space-y-6" onSubmit={handleJoinTeam}>
                    <div>
                      <label
                        htmlFor="displayName"
                        className="block mb-2 text-sm font-medium"
                      >
                        Code
                      </label>
                      <input
                        ref={inviteCodeRef}
                        type="text"
                        name="displayName"
                        id="displayName"
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-800 hover:bg-indigo-700 text-white font-medium rounded-lg px-4 py-2.5 text-sm"
                    >
                      Join Team
                    </button>

                    <button
                      type="button"
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg px-4 py-2.5 text-sm"
                      onClick={handleCloseModal}
                    >
                      Close
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </LayoutContainer>
  );
}

export default Main;
