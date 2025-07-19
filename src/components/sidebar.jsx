import React, { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { navbarLinks } from '@/constants';
import { ChevronsLeft } from 'lucide-react';

import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';

export const Sidebar = forwardRef(({ collapsed }, ref) => {

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
          <p className='text-lg font-medium text-slate-900 transition-colors dark:text-slate-50'>Pecuária</p>}
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
