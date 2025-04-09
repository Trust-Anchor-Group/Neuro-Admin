import React from 'react'
import { FaFileAlt } from 'react-icons/fa';

export const DetailpageStatus = ({user,adminActions}) => {
  return (
    <div className=''>
                 {
                        user && user.data.properties.FIRST ? (
                            (() => {
                                const action = adminActions.find(a => a.actionTitle === user.data.state);
                                if(user && user.data.state.includes('Created')){
                                    return  <div className={`text-center inline-block px-2 font-semibold bg-neuroOrange/20 text-neuroDarkOrange rounded-lg 
                                    max-sm:mx-10 max-sm:mb-5`}>
                                        <span>Pending&nbsp;ID&nbsp;application</span>
                                    </div>
                                }
                                 return action ? (
                                <div className={`text-activeGreen bg-activeGreen/20 font-semibold px-3 inline-block py-1 rounded-lg 
                                max-sm:mx-10 max-sm:mb-5`}>
                                    <span>Active&nbsp;ID</span>
                                </div>
                                    ) : '';
                                })()
                        ) : ''
                            } 
    </div>
  )
}
