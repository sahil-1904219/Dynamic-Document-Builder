import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import DynamicDocumentBuilder from './DynamicDocumentBuilder';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DynamicDocumentBuilder />
  </React.StrictMode>
);

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import { BrowserRouter } from 'react-router-dom';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <BrowserRouter basename="/dynamic-document-builder">
//       <App />
//     </BrowserRouter>
//   </React.StrictMode>
// );
