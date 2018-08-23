import { fromJS } from 'immutable';
import configPageReducer from '../reducer';

describe('configPageReducer', () => {
  it('returns the initial state', () => {
    expect(configPageReducer(undefined, {})).toEqual(fromJS({}));
  });
});
