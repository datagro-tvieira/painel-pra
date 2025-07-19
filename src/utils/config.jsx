export const config = {
  auth: {
    clientId: '50a51494-49af-402b-ba61-3d77084b65d8',           
    authority: 'https://login.microsoftonline.com/a78bf229-5c6b-49ed-ba3c-a5de41b71930', 
    redirectUri: 'https://devx.datagro.com/backofficev2/',          
    postLogoutRedirectUri: 'http://localhost:3000/backofficev2/',
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true,
  },
};
