import React from 'react';
import { FaFileAlt } from 'react-icons/fa';

export const DetailpageStatus = ({ user, adminActions }) => {
  // Define a helper function to return the JSX
  const renderStatus = () => {
    if (user && user.data.state.includes('Created')) {
      return (
        <div className={`text-center inline-block px-2 font-semibold bg-neuroOrange/20 text-neuroDarkOrange rounded-lg max-sm:mx-10 max-sm:mb-5`}>
          <span>Pending&nbsp;ID&nbsp;application</span>
        </div>
      );
    }
    if (user && user.data.state.includes('Approved')) {
      return (
        <div className={`text-activeGreen bg-activeGreen/20 font-semibold px-3 inline-block py-1 rounded-lg max-sm:mx-10 max-sm:mb-5`}>
          <span>Active&nbsp;ID</span>
        </div>
      );
    }
    if (user && user.data.state.includes('Obsoleted')) {
      return (
        <div className={`text-obsoletedRed bg-obsoletedRed/20 font-semibold px-3 inline-block py-1 rounded-lg max-sm:mx-10 max-sm:mb-5`}>
          <span>Obsoleted&nbsp;ID</span>
        </div>
      );
      
    }
    if (user && user.data.state.includes('Compromised')) {
      return (
        <div className={`text-orange-500 bg-orange-500/30 font-semibold px-3 inline-block py-1 rounded-lg max-sm:mx-10 max-sm:mb-5`}>
          <span>Compromised&nbsp;ID</span>
        </div>
      );}
      if (user && user.data.state.includes('Rejected')) {
        return (
          <div className={`text-obsoletedRed bg-neuroRed/20 font-semibold px-3 inline-block py-1 rounded-lg max-sm:mx-10 max-sm:mb-5`}>
            <span>Obsoleted&nbsp;ID</span>
          </div>
        );}
    return null;
  };

  return (
    <div className="">
      {user && user.data.properties.FIRST ? renderStatus() : ''}
    </div>
  );
};
