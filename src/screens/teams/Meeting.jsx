import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft } from 'phosphor-react';

function Meeting() {
  const { teamId, meetingId } = useParams();
  const [teamName, setTeamName] = useState('');
  const [teamImage, setTeamImage] = useState('');
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [insideMeeting, setInsideMeeting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeamName = async () => {
      try {
        const doc = await db.collection('teams').doc(teamId).get();
        const teamName = doc.data().teamName;
        const teamImage = doc.data().teamPictureURL;
        setTeamName(teamName);
        setTeamImage(teamImage);
      } catch (error) {
        console.log('Error fetching team name:', error);
      }
    };

    fetchTeamName();
  }, [teamId]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser) {
          const doc = await db.collection('users').doc(currentUser.uid).get();
          const displayName = doc.data().displayName;
          const profilePicture = doc.data().profilePictureURL;
          setDisplayName(displayName);
          setProfilePicture(profilePicture);
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleJoinRoom = async (element) => {
    try {
      const appID = 1397484251;
      const serverSecret = "f24c3a68badef143e86d5fd9561aa0eb";
      const kitToken = await ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, meetingId, Date.now().toString(), displayName);
      const zc = ZegoUIKitPrebuilt.create(kitToken);
  
      zc.joinRoom({
        container: element,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: true,
        onUserAvatarSetter: (userList) => {
          userList.forEach(user => {
            user.setUserAvatar(profilePicture);
          });
        },
        videoResolutionDefault: "720p",
        maxUsers: 50,
        layout: "Auto",
        showLayoutButton: true,
        scenario: {
          mode: "GroupCall",
          config: {
            role: "Host",
          },
        },
      });
  
      zc.on("roomStateUpdate", (roomState) => {
        if (roomState.state === "DISCONNECTED") {
          setInsideMeeting(false);
        }
      });
  
      zc.on("roomStateUpdate", (roomState) => {
        if (roomState.state === "CONNECTED") {
          setInsideMeeting(true);
        }
      });
    } catch (error) {
      console.log('Error joining room:', error);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-indigo-800">
      {!insideMeeting && (
        <div className="absolute top-0 left-0 mt-4 ml-4">
          <a href={`/teams/${teamId}`} className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500" onClick={handleGoBack}>
            <ArrowLeft size={24} />
          </a>
        </div>
      )}
      <div style={{ width: '100vw', height: '100vh' }} ref={element => handleJoinRoom(element)} />
    </div>
  );
}

export default Meeting;