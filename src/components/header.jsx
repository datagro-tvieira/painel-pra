import PropTypes from 'prop-types'
import { ChevronsLeft, Eye, EyeClosed } from 'lucide-react';
import CustomInput from './relatorios/calendar/DateInput';

export const Header = ({ collapsed, setCollapsed }, component) => {
  return (
    <header className='relative z-10 flex h-[50px] items-center justify-between bg-white px-4 shadow-md transition-colors dark:bg-[#2A3529]'>
      <div className='flex items-center gap-x-3'>
        <button 
          className='btn-ghost size-10' 
          onClick={() => setCollapsed(!collapsed)}> 
          <ChevronsLeft className={collapsed && 'rotate-180'}/>
        </button>
        <h1 className='text-lg font-medium text-slate-900 transition-colors dark:text-slate-50'>
          {component?.title || 'Dashboard'}
        </h1>
          <div className='flex items-center gap-x-2'>
            {component?.id === 1 && (
                    <div className="flex items-center space-x-2">

                      <span className="text-white">Data Selecionada:</span>
                      <div className="relative flex items-center">
                          <CustomInput
                              onDateChange={(date) => setDataSelecionada(formatDate(date))}
                              value={dataSelecionada}
                          />
                      </div>
                      
                      <button
                          className="bg-[#394B74] hover:bg-[#0B0E1A] text-white px-4 py-2 rounded flex items-center justify-center"
                          onClick={() => setShowArquivos(!showArquivos)}
                      >
                          {showArquivos ? <Eye /> : <EyeClosed />}
                      </button>
                  </div>
            )}
          </div>
      </div>
    </header>
  )
}

Header.propTypes = {
  collapsed: PropTypes.bool,
  setCollapsed: PropTypes.func,
};