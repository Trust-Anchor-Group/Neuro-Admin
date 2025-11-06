import React from 'react';
import { FaFileAlt } from 'react-icons/fa';
import { useLanguage, content } from '../../../context/LanguageContext';

export const DetailpageStatus = ({ user, adminActions }) => {
  const { language } = useLanguage();
  const t = content[language];
  // Define a helper function to return the JSX
  const renderStatus = () => {
    if (user && user.state.includes('Created')) {
      return (
        <div className={`text-center inline-block px-2 font-semibold bg-neuroOrange/20 text-neuroDarkOrange rounded-lg max-sm:mx-10 max-sm:mb-5`}>
          <span>{t?.Identity?.statuses?.pending || 'Pending ID application'}</span>
        </div>
      );
    }
    if (user && user.state.includes('Approved')) {
      return (
        <div className={`text-activeGreen bg-activeGreen/20 font-semibold px-3 inline-block py-1 rounded-lg max-sm:mx-10 max-sm:mb-5`}>
          <span>{t?.Identity?.statuses?.active || 'Active ID'}</span>
        </div>
      );
    }
    if (user && user.state.includes('Obsoleted')) {
      return (
        <div className={`text-obsoletedRed bg-obsoletedRed/20 font-semibold px-3 inline-block py-1 rounded-lg max-sm:mx-10 max-sm:mb-5`}>
          <span>{t?.Identity?.statuses?.obsoleted || 'Obsoleted ID'}</span>
        </div>
      );
      
    }
    if (user && user.state.includes('Compromised')) {
      return (
        <div className={`text-orange-500 bg-orange-500/30 font-semibold px-3 inline-block py-1 rounded-lg max-sm:mx-10 max-sm:mb-5`}>
          <span>{t?.Identity?.statuses?.compromised || 'Compromised ID'}</span>
        </div>
      );}
      if (user && user.state.includes('Rejected')) {
        return (
          <div className={`text-obsoletedRed bg-neuroRed/20 font-semibold px-3 inline-block py-1 rounded-lg max-sm:mx-10 max-sm:mb-5`}>
            <span>{t?.Identity?.statuses?.obsoleted || 'Obsoleted ID'}</span>
          </div>
        );}
    return null;
  };

  return (
    <div className="">
      {user && user.properties.FIRST ? renderStatus() : ''}
    </div>
  );
};
