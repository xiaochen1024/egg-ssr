import Index from 'components/Index';

import IndexStore from 'stores/IndexStore';
import wrapEntry from 'utils/wrapEntry';


import 'styles/pages/index.less';

const storesClass = {
  indexStore: IndexStore,

};

const routes = [
  {
    exact: true,
    path: '/index',
    component: Index,
  },
 
];

export default wrapEntry(routes, storesClass);
