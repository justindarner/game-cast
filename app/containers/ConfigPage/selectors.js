import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the configPage state domain
 */

const selectConfigPageDomain = state => state.get('configPage', initialState);

/**
 * Other specific selectors
 */

/**
 * Default selector used by ConfigPage
 */

const makeSelectConfigPage = () =>
  createSelector(selectConfigPageDomain, substate => substate.toJS());

export default makeSelectConfigPage;
export { selectConfigPageDomain };
