import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const CultureContext = createContext({
  culture: 'boi',
  setCulture: () => {},
});

export const CultureProvider = ({ children }) => {
  const [culture, setCulture] = useState('boi');

  return (
    <CultureContext.Provider value={{ culture, setCulture }}>
      {children}
    </CultureContext.Provider>
  );
};

CultureProvider.propTypes = {
  children: PropTypes.node,
};
