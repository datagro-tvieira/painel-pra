import React from 'react';

import { useMediaQuery } from '@uidotdev/usehooks';
import { useClickOutside } from '@/hooks/use-click-outside';

import { Sidebar } from '@/components/sidebar';
import { Outlet } from 'react-router-dom';

import { cn } from '@/utils/cn';
import { Menu } from 'lucide-react'; // ou qualquer ícone que preferir

export const Layout = () => {
  const isDesktopDevice = useMediaQuery('(min-width: 768px)');
  const [collapsed, setCollapsed] = React.useState(true);

  const sidebarRef = React.useRef(null);

  useClickOutside([sidebarRef], () => {
    if (!collapsed) {
      setCollapsed(true);
    }
  });

  return (
    <div className='min-h-screen transition-colors bg-[#2A3529]'>
      {/* Overlay escurecido */}
      <div
        className={cn(
          'pointer-events-none fixed inset-0 -z-10 bg-black opacity-0 transition-opacity',
          !collapsed && 'pointer-events-auto z-40 opacity-30'
        )}
      />

      {/* Sidebar */}
      <Sidebar className='' ref={sidebarRef} collapsed={collapsed} />

      {/* Botão flutuante */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed bottom-4 left-4 z-50 rounded-md bg-gray-500 hover:bg-green-800 text-black p-3 shadow-lg transition-colors"
      >
        <Menu size={24} />
      </button>

      {/* Conteúdo principal */}
      <div
        className={cn('transition-[margin] duration-300')}>

        {/* <Header collapsed={collapsed} setCollapsed={setCollapsed} /> */}

        <div className='h-screen overflow-y-auto overflow-x-hidden p-3'>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
