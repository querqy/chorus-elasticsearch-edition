import React from 'react';
import  { createRoot } from 'react-dom/client';
import App from './App';
import registerServiceWorker from './registerServiceWorker';







//< React18
//ReactDOM.render(<App />, document.getElementById('root'));

//React 18+
const root = createRoot(document.getElementById('root'));
root.render(<App />);
registerServiceWorker();
