import React, { useState, useRef, useEffect } from 'react';
import { UploadSimple } from 'phosphor-react';
import { FileIcon, defaultStyles } from 'react-file-icon';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';

const FilesSection = ({ teamId, activeChannel }) => {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState('');

  function handleButtonClick() {
    fileInputRef.current.click();
  }
  
  const fetchDisplayName = async () => {  
    const docRef = db.collection('users').doc(currentUser?.uid);
    const doc = await docRef.get();
    if (!doc.exists) {
        console.log('No such document!');
    } else {
        setDisplayName(doc.data().displayName);
    }
  }

  useEffect(() => {
    fetchDisplayName();
  }, );


  function handleFileUpload(e) {
    const file = e.target.files[0];
    const storageRef = storage.ref(`files/${teamId}/${activeChannel}/${file.name}`);
    const fileRef = storageRef.child(file.name);
    
    fileRef.put(file)
      .then(() => {
        return fileRef.getDownloadURL();
      })
      .then((url) => {
        return db
          .collection('teams')
          .doc(teamId)
          .collection('channels')
          .doc(activeChannel)
          .collection('files')
          .add({
            name: file.name,
            date: new Date().toLocaleString().split(',')[0],
            uploader: displayName,
            downloadLink: url,
          });
      })
      .then(() => {
        console.log('File uploaded successfully!');
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
      });
  }  
  
  useEffect(() => {
    const unsubscribe = db
        .collection('teams')
        .doc(teamId)
        .collection('channels')
        .doc(activeChannel)
        .collection('files')
        .orderBy('date', 'desc')
        .onSnapshot((snapshot) => {
            setFiles(
                snapshot.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().name,
                    date: doc.data().date,
                    uploader: doc.data().uploader,
                    downloadLink: doc.data().downloadLink,
                }))
            );
        });
    return () => {
        unsubscribe();
    };
  }, [teamId, activeChannel]);

  return (
    <div className="relative overflow-x-auto shadow-sm sm:rounded-lg p-6">
      <div className="flex items-center justify-between p-2">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
          Files
        </h3>

        <button
          className="flex items-center px-3 py-1.5 text-indigo-800 bg-white rounded-lg mb-2"
          onClick={handleButtonClick}
        >
          <UploadSimple size={20} className="mr-2" />
          <span className="text-sm">Upload File</span>
        </button>

        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
      </div>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Icon
            </th>
            <th scope="col" className="px-6 py-3">
              Name
            </th>
            <th scope="col" className="px-6 py-3">
              Date
            </th>
            <th scope="col" className="px-6 py-3">
              Uploader
            </th>
            <th scope="col" className="px-6 py-3">
              Download
            </th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr
              key={file.id}
              className="bg-white border-b dark:bg-gray-900 dark:border-gray-700"
            >
              <td className="px-6 py-4 w-4">
                <FileIcon
                  extension={file.name.split('.').pop()}
                  {...defaultStyles[file.name.split('.').pop()]}
                />
              </td>
              <td className="px-6 py-4">{file.name}</td>
              <td className="px-6 py-4">{file.date}</td>
              <td className="px-6 py-4">{file.uploader}</td>
              <td className="px-6 py-4">
                <a
                  href={file.downloadLink}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  download
                >
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FilesSection;
