import React, { forwardRef, useContext } from 'react'
import { cn } from '@/utils/cn'
import { navbarLinks } from '@/constants';
import { ChevronsLeft } from 'lucide-react';
import boi from '@/assets/pins/BOI.png';
import etanol from '@/assets/pins/ETANOL.png';
import milho from '@/assets/pins/MILHO.png';
import leite from '@/assets/pins/LEITE.png';

import PropTypes from 'prop-types';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CultureContext } from '@/contexts/culture-context';

export const Sidebar = forwardRef(({ collapsed }, ref) => {
  const { setCulture } = useContext(CultureContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    
      <aside
        ref={ref}
        className={cn(
          'fixed z-[100] flex h-full flex-col overflow-x-hidden border-r border-slate-300 bg-white transition-all duration-300 dark:border-slate-700 dark:bg-[#1A1F1A]',
          collapsed ? 'w-0 pointer-events-none opacity-0' : 'w-[240px]',
        )}
      >

      <div className='flex gap-x-3 p-3'>
        <img src='' className='dark:hidden'></img>
        <img src='' className='hidden dark:block'></img>

        {!collapsed &&
        <>          
          <div className=' flex flex-1 items-center  overflow-x-auto'>
            <button
              onClick={() => { setCulture('boi'); navigate('/dashboard/boi'); setIsOpen(!isOpen); }}>
                <img src={boi} className='h-12 w-12 hover:w-20 hover:h-20' />
              </button>

              <button
              onClick={() => { setCulture('milho'); navigate('/dashboard/milho'); setIsOpen(!isOpen); }}>
                <img src={milho} className='w-8 h-12 hover:w-16 hover:h-20' />
              </button>

              <button
              onClick={() => { setCulture('etanol'); navigate('/dashboard/etanol'); setIsOpen(!isOpen); }}>
                <img src={etanol} className='w-12 h-12 hover:w-20 hover:h-20' />
              </button>

              <button
              onClick={() => { setCulture('leite'); navigate('/dashboard/leite'); setIsOpen(!isOpen); }}>
                <img src={leite} className='w-12 h-12 hover:w-20 hover:h-20' />
              </button>
          </div>
          </>
          }
          
      </div>
      
      <div className='flex w-full flex-col gap-y-4 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:_thin]'>
        {navbarLinks.map((navbarLink) => (
          <nav key={navbarLink.title} className={cn('sidebar-group', collapsed && 'md:w-[45px]')} >
            <p className={cn('siderbar-group-title text-white', collapsed && 'md:w-[45px]')}> {navbarLink.title} </p>
            {navbarLink.links.map((link) => (
              <NavLink
                key={Link.label}
                to={link.path}
                className={cn('sidebar-item')}
              >
                <link.icon size={22} className='flex-shrink-0' />
                {!collapsed &&
                  <p className='whitespace-nowra'>{link.label}</p>}
              </NavLink>
            ))}
          </nav>

        ))}
      </div>
    </aside>
  )
});

Sidebar.displayName = 'Sidebar'

Sidebar.propTypes = {
  collapsed: PropTypes.bool,
};
