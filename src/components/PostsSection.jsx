import React, { useState, useEffect, useRef } from 'react';
import { PaperPlaneRight, Smiley, Paperclip, Gif, ArrowBendDownLeft } from 'phosphor-react';
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';

function PostsSection({ teamId, activeChannel }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);

  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  const messagesEndRef = useRef(null);

  const [showReactionsMenu, setShowReactionsMenu] = useState(false);
  const [showReactionUsers, setShowReactionUsers] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [selectedEmoji, setSelectedEmoji] = useState('');

  const [showReplyInput, setShowReplyInput] = useState({});
  const [replyMessage, setReplyMessage] = useState('');

  const handleToggleReplyInput = (messageId) => {
    setShowReplyInput((prevShowReplyInput) => ({
      ...prevShowReplyInput,
      [messageId]: !prevShowReplyInput[messageId],
    }));
  };  

  const handleReplyInputChange = (e) => {
    setReplyMessage(e.target.value);
  };

  const handleEmojiHover = (emoji) => {
    setSelectedEmoji(emoji);
  };

  const handleEmojiHoverEnd = () => {
    setSelectedEmoji(null);
  };

  const handleShowReactionsMenu = (message) => {
    setSelectedMessage(message);
    setShowReactionsMenu(true);
  };

  const handleHideReactionsMenu = () => {
    setShowReactionsMenu(false);
  };

  // Fetch user data
  useEffect(() => {
    db.collection('users')
      .doc(currentUser?.uid)
      .get()
      .then((doc) => {
        setDisplayName(doc.data().displayName);
        setProfilePicture(doc.data().profilePictureURL);
      });
  }, [currentUser]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (message.trim() === '') return;

    // Send message to database
    db.collection('teams')
      .doc(teamId)
      .collection('channels')
      .doc(activeChannel)
      .collection('messages')
      .add({
        message,
        displayName,
        profilePicture,
        reactions: [],
        replys: [],
        timestamp: new Date(),
      });

    setMessage('');
  };

  //replys
  const handleReply = (messageId) => {
    const messageRef = db
      .collection('teams')
      .doc(teamId)
      .collection('channels')
      .doc(activeChannel)
      .collection('messages')
      .doc(messageId);

    messageRef.update({
      replys: [
        ...selectedMessage.replys,
        { message, displayName, profilePicture, reactions: [], timestamp: new Date() },
      ],
    });
  };

  // Fetch messages from database
  useEffect(() => {
    if (teamId && activeChannel) {
      db.collection('teams')
        .doc(teamId)
        .collection('channels')
        .doc(activeChannel)
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot((snapshot) => {
          setMessages(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              message: doc.data().message,
              displayName: doc.data().displayName,
              profilePicture: doc.data().profilePicture,
              reactions: doc.data().reactions,
              timestamp: doc.data().timestamp,
            }))
          );
        });
    }
  }, [teamId, activeChannel]);

  const handleEmojiClick = (emojiObject) => {
    const emoji = emojiObject.emoji;
    setMessage(message + emoji);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleReact = async (messageId, emoji) => {
    const currentUserData = {
      displayName,
      profilePicture,
    };
  
    const messageRef = db
      .collection('teams')
      .doc(teamId)
      .collection('channels')
      .doc(activeChannel)
      .collection('messages')
      .doc(messageId);
  
    // Find the current message
    const currentMessage = messages.find((message) => message.id === messageId);
  
    // Check if the current message exists
    if (!currentMessage) {
      console.error('Message not found');
      return;
    }
  
    // Check if the current user already reacted to the message
    const currentUserReactionIndex = currentMessage.reactions.findIndex(
      (reaction) => reaction.user.displayName === displayName
    );
  
    if (currentUserReactionIndex !== -1) {
      // If the current user already reacted, update the existing reaction
      const updatedReactions = [...currentMessage.reactions];
      updatedReactions[currentUserReactionIndex].emoji = emoji;
  
      await messageRef.update({
        reactions: updatedReactions,
      });
    } else {
      // If the current user hasn't reacted yet, add a new reaction
      await messageRef.update({
        reactions: [
          ...currentMessage.reactions,
          { emoji, user: currentUserData },
        ],
      });
    }
  };  
    
  const reactionCounts = [];
    selectedMessage?.reactions?.forEach((reaction) => {
      const existingReaction = reactionCounts.find((r) => r.emoji === reaction.emoji);
      if (existingReaction) {
        existingReaction.count += 1;
      } else {
        reactionCounts.push({ emoji: reaction.emoji, count: 1 });
      }
  });

  const reactionUsers = reactionCounts.map((reaction) => {
    return {
      emoji: reaction.emoji,
      users: selectedMessage?.reactions
        .filter((r) => r.emoji === reaction.emoji)
        .map((r) => r.user),
    };
  });

  return (
    <div className="flex flex-col flex-1 p-5 overflow-y-scroll mb-2">
      <div className="flex flex-col-reverse flex-1">
        <ul className="flex flex-col gap-3 w-full">
          {messages.map((message) => (
            <>
              <li
                key={message.id}
                className="flex flex-col mx-5 bg-white rounded-t-md shadow-md p-4 border-l-4 border-indigo-800 relative"
                onMouseEnter={() => handleShowReactionsMenu(message)}
                onMouseLeave={handleHideReactionsMenu}
              >
                {showReactionsMenu && selectedMessage === message && (
                  <div className="absolute top-0 right-0 -mt-6 mr-2 bg-white w-fit flex flex-row shadow-md rounded-md p-2 space-x-3">
                    <button
                      className={`flex items-center ${
                        !selectedEmoji || selectedEmoji === "like" ? "" : "filter brightness-[75%]"
                      }`}
                      title="Like"
                      onMouseEnter={() => handleEmojiHover("like")}
                      onMouseLeave={handleEmojiHoverEnd}
                      onClick={() => handleReact(message.id, "👍")}
                    >
                      👍
                    </button>
                    <button
                      className={`flex items-center ${
                        !selectedEmoji || selectedEmoji === "heart" ? "" : "filter brightness-[75%]"
                      }`}
                      title="Heart"
                      onMouseEnter={() => handleEmojiHover("heart")}
                      onMouseLeave={handleEmojiHoverEnd}
                      onClick={() => handleReact(message.id, "❤️")}
                    >
                      ❤️
                    </button>
                    <button
                      className={`flex items-center ${
                        !selectedEmoji || selectedEmoji === "smile" ? "" : "filter brightness-[75%]"
                      }`}
                      title="Smile"
                      onMouseEnter={() => handleEmojiHover("smile")}
                      onMouseLeave={handleEmojiHoverEnd}
                      onClick={() => handleReact(message.id, "😆")}
                    >
                      😆
                    </button>
                    <button
                      className={`flex items-center ${
                        !selectedEmoji || selectedEmoji === "surprised" ? "" : "filter brightness-[75%]"
                      }`}
                      title="Surprised"
                      onMouseEnter={() => handleEmojiHover("surprised")}
                      onMouseLeave={handleEmojiHoverEnd}
                      onClick={() => handleReact(message.id, "😮")}
                    >
                      😮
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <img
                      src={message.profilePicture}
                      alt="profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-800">
                      {message.displayName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp?.toDate()).toLocaleString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric'
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-800 mt-2 ">{message.message}</p>
                {message.reactions?.length > 0 && (
                  <div className="flex items-center justify-start mt-3 relative">
                    {reactionCounts?.map((reaction, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-center p-1.5 rounded-xl text-indigo-800 border border-indigo-800 text-xs mr-2 cursor-pointer relative"
                        onMouseEnter={() => setShowReactionUsers(true)}
                        onMouseLeave={() => setShowReactionUsers(false)}
                      >
                        <span role="img" aria-label={reaction?.emoji}>
                          {reaction?.emoji}
                        </span>
                        <span className="ml-1.5 font-semibold">{reaction?.count}</span>
                      </div>
                    ))}
                    {showReactionUsers && (
                      <>
                        {reactionUsers?.map((reaction, index) => (
                          <div key={index} className="absolute bottom-0 left-0 mx-12 bg-white w-44 flex flex-col-reverse gap-2 p-2 rounded-md shadow-md">
                            {reaction?.users?.map((user, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <img
                                  src={user.profilePicture}
                                  alt="profile"
                                  className="w-6 h-6 rounded-full"
                                />
                                <span className="text-xs text-gray-800">{user.displayName}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
                {message.replys?.length > 0 && (
                  <div className="flex flex-col mt-3">
                    {message.replys.map((reply) => (
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <img
                            src={reply.profilePicture}
                            alt="profile"
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-sm font-medium text-gray-800">
                            {reply.displayName}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(reply.timestamp?.toDate()).toLocaleString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric'
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {showReplyInput[message.id] && (
                <>
                <div className='border-[0.5px] border-gray-300 mt-3'></div>
                <form className="flex flex-col w-full px-5 mt-4" onSubmit={() => handleReply(message.id)}>
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={handleReplyInputChange}
                    className="bg-white w-full p-3 resize-none shadow-md shadow-slate-300 border-b-2 border-indigo-700 placeholder:text-neutral-600 focus:outline-0 rounded-md mb-2"
                    placeholder="Write your message here..."
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setShowAttachmentPicker(!showAttachmentPicker)}
                      >
                        <Paperclip size={22} />
                      </button>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <Smiley size={22} />
                      </button>
                      <button type="button" className="text-gray-500 hover:text-gray-700">
                        <Gif size={22} />
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="text-indigo-800 hover:text-indigo-700"
                    >
                      <PaperPlaneRight size={22} weight="light" />
                    </button>
                  </div>
                  {showEmojiPicker && (
                    <div className="absolute mt-2 mx-2 bottom-28">
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                  {showAttachmentPicker && (
                    <div className="absolute mt-2 mx-2 bottom-28 shadow-md">
                      <div className="bg-white p-2 shadow-lg max-w-xs w-40 rounded-md">
                        <button className="w-full text-left hover:bg-gray-100 px-3 py-2">
                          Upload File
                        </button>
                        <div className="my-1 border-b"></div>
                        <button className="w-full text-left hover:bg-gray-100 px-3 py-2">
                          Channel Files
                        </button>
                      </div>
                    </div>
                  )}
                </form>
                </>
              )}
              </li>
              <div className="flex items-center justify-start mt-2 mx-5">
                <button 
                  className="w-full p-1 pl-3 bg-[#F8f9f9] rounded-b-md shadow-sm text-gray-500 hover:text-indigo-800 -mt-5"
                  onClick={() => handleToggleReplyInput(message.id)}
                >
                  <div className="flex items-center">
                    <ArrowBendDownLeft size={20} />
                    <span className="ml-2 text-sm">Reply</span>
                  </div>
                </button>
              </div>
            </>
          ))}
          <div ref={messagesEndRef}></div>
        </ul>
      </div>

      <form className="flex flex-col w-full px-5 mt-4" onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          className="bg-white w-full p-3 resize-none shadow-lg border-b-2 border-indigo-700 placeholder:text-neutral-600 focus:outline-0 rounded-md mb-2"
          placeholder="Write your message here..."
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowAttachmentPicker(!showAttachmentPicker)}
            >
              <Paperclip size={22} />
            </button>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smiley size={22} />
            </button>
            <button type="button" className="text-gray-500 hover:text-gray-700">
              <Gif size={22} />
            </button>
          </div>
          <button
            type="submit"
            className="text-indigo-800 hover:text-indigo-700"
          >
            <PaperPlaneRight size={22} weight="light" />
          </button>
        </div>
        {showEmojiPicker && (
          <div className="absolute mt-2 mx-2 bottom-28">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        {showAttachmentPicker && (
          <div className="absolute mt-2 mx-2 bottom-28 shadow-md">
            <div className="bg-white p-2 shadow-lg max-w-xs w-40 rounded-md">
              <button className="w-full text-left hover:bg-gray-100 px-3 py-2">
                Upload File
              </button>
              <div className="my-1 border-b"></div>
              <button className="w-full text-left hover:bg-gray-100 px-3 py-2">
                Channel Files
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default PostsSection;