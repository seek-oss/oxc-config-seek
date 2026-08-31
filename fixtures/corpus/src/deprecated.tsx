import React from 'react';

// `componentWillMount` is deprecated; its UNSAFE_ counterpart is not, so only
// the first must be reported.
export class Legacy extends React.Component {
  componentWillMount() {
    return null;
  }

  UNSAFE_componentWillUnmount() {
    return null;
  }

  render() {
    return null;
  }
}
