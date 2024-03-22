import React from 'react';
import  { createRoot } from 'react-dom/client';
import LogTable from './Logs';
import App from './App';
import registerServiceWorker from './registerServiceWorker';


//React 18+
const logs = createRoot(document.getElementById('logs'));
logs.render(<LogTable />);
//pass the objects around in the window
window.logs = logs;

const root = createRoot(document.getElementById('root'));
root.render(<App />);
window.chorus = root;
registerServiceWorker();
