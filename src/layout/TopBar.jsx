import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import { SearchIcon, XIcon } from '@heroicons/react/solid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';

function TopBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { currentUser, signout } = useAuth();
  const [profilePicture, setProfilePicture] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const navigate = useNavigate();

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }

  }, []);

  useEffect(() => {
    const unsubscribe = db
      .collection('users')
      .doc(currentUser?.uid)
      .onSnapshot((snapshot) => {
        const userData = snapshot.data();
        setProfilePicture(userData.profilePictureURL);
        setDisplayName(userData.displayName);
        setEmail(currentUser.email);
        setRole(userData.role);
        setCompany(userData.company);
      });
  
    return () => {
      unsubscribe();
    };
  }, [currentUser]);  

  async function handleSignOut() {
    try {
      await signout();
      navigate('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  return (
    <nav className="bg-indigo-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center -ml-6">
            <img
              className="block h-16 w-auto mr-2"
              src="/icon-white.png"
              alt="logo"
            />
            <span className="-ml-2 text-lg font-bold text-white">UniVerse</span>
          </div>

          {/* Middle Section */}
          <div className="flex items-center justify-center flex-1">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none"
                placeholder="Search"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center">

            {/* Dropdown menu */}
            <div className="ml-3 mt-2 relative" ref={dropdownRef}>
              <div>
                <button
                  type="button"
                  id="user-menu-button"
                  aria-expanded={dropdownOpen ? 'true' : 'false'}
                  aria-haspopup="true"
                  onClick={handleDropdownToggle}
                >
                  <img className="w-10 h-10 rounded-full" src={profilePicture} alt="avatar" />
                </button>
              </div>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                  tabIndex="-1"
                >
                  {/* Dropdown items */}
                  <div className="flex items-center px-4 py-2 text-sm text-gray-700">
                    <img className="w-12 h-12 rounded-full" src={profilePicture} alt="avatar" />
                    <div className="ml-2">
                      <p className="font-medium text-gray-900">{displayName}</p>
                      <p className="text-gray-500 font-light text-xs -mt-[2px]">{email}</p>
                      <p className="text-gray-500 text-s mt-1">{role} at {company}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100"></div>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    tabIndex="-1"
                    id="user-menu-item-0"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Profile
                  </a>
                  <div className="border-t border-gray-100"></div>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    tabIndex="-1"
                    id="user-menu-item-2"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </a>
                </div>
              )}

              {/* Modal */}
              <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                className="modal"
                contentLabel="Update Profile"
              >
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                  <div className="w-full bg-indigo-800 rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                    <div className="flex items-center justify-end -mb-[69px] mt-6">
                      <button
                        type="button"
                        className="text-white hover:text-slate-50 focus:ring-4 focus:outline-none focus:ring-indigo-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        onClick={() => setIsModalOpen(false)}
                      >
                        <XIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                      <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
                        Update your profile
                      </h1>

                      <form className="space-y-4 md:space-y-6">
                        <div className="flex items-center justify-center">
                          <label htmlFor="avatarInput">
                            <div className="w-32 h-32 border-2 p-1 border-white rounded-full flex items-center justify-center cursor-pointer">
                              <img
                                src={profilePicture}
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
                          />
                        </div>

                        <div>
                          <label htmlFor="displayName" className="block mb-2 text-sm font-medium text-white">
                            Display Name
                          </label>
                          <input
                            type="text"
                            name="displayName"
                            id="displayName"
                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5"
                            defaultValue={displayName}
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5"
                            defaultValue={email}
                          />
                        </div>

                        <div>
                          <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">
                            Password
                          </label>
                          <input
                            type="password"
                            name="password"
                            id="password"
                            className="bg-gray-50 border border-gray-300 text-white sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5"
                            placeholder="Leave blank to keep the same"
                          />
                        </div>

                        <div className="flex">
                          <div className="flex-1 mr-2">
                            <label htmlFor="role" className="block mb-2 text-sm font-medium text-white">
                              Role
                            </label>
                            <input
                              type="text"
                              name="role"
                              id="role"
                              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5"
                              defaultValue={role}
                            />
                          </div>
                          <div className="flex-1 ml-2">
                            <label htmlFor="company" className="block mb-2 text-sm font-medium text-white">
                              Company
                            </label>
                            <input
                              type="text"
                              name="company"
                              id="company"
                              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5"
                              defaultValue={company}
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-white hover:bg-slate-50 text-indigo-800 font-medium rounded-lg px-4 py-2.5 text-sm"
                        >
                          Save Changes
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default TopBar;
