import React from 'react'
import a from '../../assets/a.png'
import dLogo from '../../assets/datagro-logo.png'
import logoIdb from '../../assets/logoIdb.png'
import { useMsal } from '@azure/msal-react'
import { useIsAuthenticated } from '@azure/msal-react'
import { config } from '../../utils/config'
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  
  const handleLogin = async () => {
  if (!isAuthenticated) {
    try {
      await instance.loginPopup(config, {
        prompt: "select_account",
      });

      const account = instance.getAllAccounts()[0];
      const response = await instance.acquireTokenSilent({
        account,
        scopes: ["User.Read"],
      });
      
      const token = response.idToken;
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      console.log('Usuário autenticado:', payload);

      if (payload.groups && payload.groups.includes(config.groupId)) {
        console.log('Usuário autorizado ao SIDB');
        navigate("/");

      } else {
        console.warn('Usuário não autorizado ao SIDB');
        return;
      }
    } catch (error) {
      console.warn('SSO error:', error);
    }
    
  } else {
    console.log('O usuário já está autenticado');
    navigate("/");  // Já autenticado? Vai para Home também
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-4xl w-full flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden bg-white">
        {/* Formulário de Login */}
        <div className="w-full md:w-3/5 p-8">
          <h1 className="text-3xl font-bold mb-2">Entrar</h1>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="flex items-center border rounded px-3 py-2">
              <span className="text-gray-500 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A4 4 0 0112 20a4 4 0 016.879-2.196M15 11a3 3 0 10-6 0 3 3 0 006 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Usuário"
                autoComplete="username"
                className="flex-1 outline-none"
              />
            </div>
            <div className="flex items-center border rounded px-3 py-2">
              <span className="text-gray-500 mr-2">
                <svg xmlns="http://www.w3./2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.105-.895-2-2-2s-2 .895-2 2v2c0 1.105.895 2 2 2s2-.895 2-2v-2zm6 6v-2a6 6 0 00-12 0v2" />
                </svg>
              </span>
              <input
                type="password"
                placeholder="Senha"
                autoComplete="current-password"
                className="flex-1 outline-none"
              />
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Entrar
              </button>
              <span> ou entrar com </span>
              <div className="flex items-center justify-center">
                <button type="button" onClick={handleLogin}>
                  <img src={dLogo} alt="Datagro Logo" />
                </button>
              </div>
            </div>
          </form>
        </div>
        {/* Painel de Cadastro */}
        <div className="hidden md:flex md:w-2/5 bg-secondary text-black flex-col justify-center items-center p-8">
          <div className=" flex">
            <img src={a} alt="Logo" className="w-20 h-20" />
            <img src={logoIdb} alt="IDB Logo" className="w-24 h-24 scale-105 " />
          </div>
          <h2 className="text-2xl font-bold mb-4">SIDB</h2>
        </div>
      </div>
    </div>
  )
}

export default Login
