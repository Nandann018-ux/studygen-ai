import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    const savedUser = localStorage.getItem('studygen_user');
    try {
      return savedUser ? JSON.parse(savedUser) : { name: 'User', email: '', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Julian' };
    } catch (e) {
      return { name: 'User', email: '', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Julian' };
    }
  });

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUserState(updatedUser);
    localStorage.setItem('studygen_user', JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
