import React from 'react';



interface SidebarProps {

  activeItem: string;

  onItemClick: (item: string) => void;

  isCollapsed?: boolean;

  onToggleCollapse?: () => void;

}



const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick, isCollapsed = false, onToggleCollapse }) => {

  const menuItems = [

    {

      id: 'overview',

      label: 'Overview',

      icon: (

        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />

        </svg>

      )

    },

    {

      id: 'appointments',

      label: 'Appointments',

      icon: (

        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />

        </svg>

      )

    },

    {

      id: 'doctors',

      label: 'Doctors List',

      icon: (

        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />

        </svg>

      )

    },

    {

      id: 'history',

      label: 'Patient History',

      icon: (

        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-3.34-6.98M12 3v1m0 16v1m8-9h1M3 12H2" />

        </svg>

      )

    },

    {

      id: 'feedback',

      label: 'Feedback',

      icon: (

        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8m-8 4h5m5 7-3.5-3H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2z" />

        </svg>

      )

    },

    // {

    //   id: 'message',

    //   label: 'Message',

    //   icon: (

    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />

    //     </svg>

    //   )

    // },

    {

      id: 'reports',

      label: 'Reports',

      icon: (

        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v7m3-2h6" />

        </svg>

      )

    },

    // {

    //   id: 'settings',

    //   label: 'Settings',

    //   icon: (

    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />

    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />

    //     </svg>

    //   )

    // },

    {

      id: 'logout',

      label: 'Log out',

      icon: (

        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />

        </svg>

      )

    }

  ];



  return (

    <div className='flex flex-col md:flex-row gap-4'>

      {/* Mobile Toggle Button - Only visible on small screens */}

      <button

        onClick={onToggleCollapse}

        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-all duration-300 group"

      >

        <svg 

          className={`w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}

          fill="none" 

          stroke="currentColor" 

          viewBox="0 0 24 24"

        >

          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />

        </svg>

      </button>

      {/* Desktop Toggle Button - Only visible on large screens */}

      <button

        onClick={onToggleCollapse}

        className="hidden lg:flex fixed left-64 top-1/2 -translate-y-1/2 z-50 bg-white shadow-lg border border-gray-200 rounded-l-lg p-2 hover:bg-gray-50 transition-all duration-300 group"

        style={{

          left: isCollapsed ? '0px' : '256px',

          transition: 'left 0.3s ease-in-out'

        }}

      >

        <svg 

          className={`w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}

          fill="none" 

          stroke="currentColor" 

          viewBox="0 0 24 24"

        >

          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />

        </svg>

      </button>



      {/* Sidebar */}

      <div 

        className={`bg-white shadow-lg h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 ease-in-out z-40 ${
          isCollapsed ? 'w-0' : 'w-64'
        } lg:w-64`}

        style={{

          width: isCollapsed ? '0px' : '256px',

          overflow: isCollapsed ? 'hidden' : 'visible'

        }}

      >

        {/* Healthcare Button */}

        <div className="p-6 border-b border-gray-200">

          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg">

            Healthcare

          </button>

        </div>



        {/* Navigation Menu */}

        <nav className="flex-1 p-4">

          <ul className="space-y-2">

            {menuItems.map((item) => (

              <li key={item.id}>

                <button

                  onClick={() => onItemClick(item.id)}

                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeItem === item.id

                      ? 'bg-blue-100 text-blue-700 font-medium shadow-sm'

                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'

                    }`}

                >

                  <span className={activeItem === item.id ? 'text-blue-700' : 'text-gray-500'}>

                    {item.icon}

                  </span>

                  <span>{item.label}</span>

                </button>

              </li>

            ))}

          </ul>

        </nav>

      </div>

    </div>

  );

};



export default Sidebar;

