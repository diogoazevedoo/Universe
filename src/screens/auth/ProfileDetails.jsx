import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../firebase';

function ProfileDetails() {

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [profilePicture, setProfilePicture] = useState('default-user.png');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const displayNameRef = useRef();
  const roleRef = useRef();
  const companyRef = useRef();

  function handleProfilePictureChange(e) {
    const file = e.target.files[0];
    setProfilePictureFile(file);

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        setProfilePicture(e.target.result);
      }

      reader.readAsDataURL(file);
    }
  }
  
  async function handleSubmit(e) {
    e.preventDefault();

    const displayName = displayNameRef.current.value;
    const role = roleRef.current.value;
    const company = companyRef.current.value;

    try {
      let profilePictureURL = '';

      if (profilePictureFile) {
        // Upload the image file to Firebase Storage
        const storageRef = storage.ref(`profilePictures/${currentUser?.uid}/${profilePictureFile.name}`);
        const snapshot = await storageRef.put(profilePictureFile);

        // Get the download URL of the uploaded image
        profilePictureURL = await snapshot.ref.getDownloadURL();
      }

      // Save the user profile data, including the profile picture URL, in Firestore
      await db.collection('users').doc(currentUser?.uid).set({
        displayName,
        role,
        company,
        profilePictureURL,
      });

      navigate('/teams');
    }
    catch (error) {
      console.error(error);
    }
  }

  return (
    <section class="bg-indigo-800 w-full h-full">
      <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
          <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Complete your profile
            </h1>

            <form class="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div class="flex items-center justify-center">
                <label htmlFor="avatarInput">
                  <div class="w-32 h-32 border-2 p-1 border-indigo-800 rounded-full flex items-center justify-center cursor-pointer">
                    <img
                      src={profilePicture}
                      alt="Avatar"
                      class="w-full h-full rounded-full"
                    />
                  </div>
                </label>
                <input
                  id="avatarInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  onChange={handleProfilePictureChange}
                />
              </div>

              <div>
                <label htmlFor="displayName" class="block mb-2 text-sm font-medium text-gray-900">Display Name</label>
                <input ref={displayNameRef} type="text" name="displayName" id="displayName" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5" placeholder="Ex: Diogo Azevedo" required />
              </div>

              <div>
                <label htmlFor="role" class="block mb-2 text-sm font-medium text-gray-900">Role</label>
                <input ref={roleRef} type="text" name="role" id="role" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5" placeholder="Ex: Software Engeenier" required />
              </div>

              <div>
                <label htmlFor="company" class="block mb-2 text-sm font-medium text-gray-900">Company</label>
                <input ref={companyRef} type="text" name="company" id="company" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5" placeholder="Ex: Natixis" required />
              </div>

              <button type="submit" class="w-full text-white bg-indigo-800 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Finish</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProfileDetails
