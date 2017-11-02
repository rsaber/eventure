'use strict';

import Page from '../common/page';
import EventForm from '../common/event-form';
import { getLoggedInUserId } from '../common/utils';
import React from 'react';

export default class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error : null };
  }

  componentDidMount() {
    if (!getLoggedInUserId()) {
      this.setState({ error: { message: '401' } });
    }
  }

  render() {
    return (
      <Page error={this.state.error}>
        <h1>Create an event.</h1>
        <h3>Once this event is created, it will be posted to the events page for all eventure users to find.</h3>
        <div className="createFormContainer">
          <EventForm
            uri={'/api/event/user/create'}
            submitButton={loading => (<button type="submit" disabled={loading}>Create event</button>)}
          />
        </div>
      </Page>
    );
  }

}
