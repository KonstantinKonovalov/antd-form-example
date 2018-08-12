import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './components/app/App';

import * as moment from 'moment';
require('moment/locale/ru');
moment.locale('ru');

require('antd/dist/antd.css');
require('./components/app/antd.css');
require('./components/app/index.css');

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
