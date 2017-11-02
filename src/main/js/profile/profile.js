'use strict';

import Page from '../common/page';
import {
  getData,
  getLoggedInUserId,
  toggleSaveHandler,
  getPriceString
} from '../common/utils';
import React from 'react';

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      loading: true,
      pastLoading: true,
      error: false,
      events: [],
      pastEvents: [],
      pastFilter: false,
      isOwnProfile: false,
      page: 0,
      pastPage: 0,
      nextPage: false,
      pastNextPage: false
    };
    this.eventsToTable = this.eventsToTable.bind(this);
    this.getSave = this.getSave.bind(this);
    this.getEvents = this.getEvents.bind(this);
    this.changePage = this.changePage.bind(this);
  }

  componentDidMount() {
    getData(this, '/api/profile/' + this.props.params.id, (data) => {
      this.setState({
        user: data,
        isOwnProfile: (data.id === parseInt(getLoggedInUserId()))
      });
      
    });
    
    this.getEvents();
  }
  
  getEvents() {
    this.setState({ loading: true, pastLoading: true });
    getData(this, `/api/event/filter?searchUserId=${this.props.params.id}&page=${this.state.page}`, (data) => {
      if (data.length > 20) {
        this.setState({ events: data.slice(0,20), nextPage: true, loading: false });
      } else {
        this.setState({ events: data, nextPage: false, loading: false });
      }
    });
    this.setState({ loading: true });
    getData(this, `/api/event/filter?searchUserId=${this.props.params.id}&pastEventsOnly=true&page=${this.state.pastPage}`, (data) => {
      if (data.length > 20) {
        this.setState({ pastEvents: data.slice(0,20), pastNextPage: true, pastLoading: false });
      } else {
        this.setState({ pastEvents: data, pastNextPage: false, pastLoading: false });
      }
    });
  }
  
  changePage(next) {
    if (next) {
      if (this.state.pastFilter) {
      	this.state.pastPage = this.state.pastPage + 1;
      } else {
      	this.state.page = this.state.page + 1;
      }
    } else {
      if (this.state.pastFilter) {
      	this.state.pastPage = this.state.pastPage - 1;
      } else {
      	this.state.page = this.state.page - 1;
      }
    }
    
    this.getEvents();
    window.scroll({ top: 0, left: 0 });
  }

  getSave(event) {
    return toggleSaveHandler(this, event);
  }

  eventsToTable(events, emptyMessage) {
    const listEvents = events.map((event, idx, arr) => {
      emptyMessage = null;
      const month = event.timeString.split(' ').slice(5, 7).join(' ');
      const lastMonth = idx === 0 ? '' : arr[idx - 1].timeString.split(' ').slice(5, 7).join(' ');

      return (
        <tr key={event.id}>
          <td>
            <a href={"/event/" + event.id}>
              <div className="event myevent">
                <div className="imageContainer">
                  <img src={event.imageUrl ? event.imageUrl : '/images/events/default.png'}/>
                  <div className="hover">
                    <img src={event.saved ? '/images/icons/star.svg' : '/images/icons/star-o.svg'} onClick={this.getSave(event)}/>
                  </div>
                </div>
                <p>
                  <b className="title">{event.name}</b><br/>
                  <div className="address">{event.locationName}, {event.locationAddress}</div>
                </p>
                <p>
                  <b>{event.timeString}{getPriceString(event.price, ', ')}</b>
                  <span className="description">{event.description}</span>
                </p>
              </div>
            </a>
          </td>
        </tr>
      );
    });

    return (
      <div><br/>
        <table className="wide"><tbody>
          <tr><td>
            <div className="hosted">Events hosted by {this.state.user['name']}</div>
            <div className="past" onClick={() => this.setState({ pastFilter: !this.state.pastFilter })}>
              show {this.state.pastFilter ? 'upcoming' : 'past'} events
            </div>
          </td></tr>
          {listEvents}
          <tr><td>
            <div className={this.state.page !== 0 && !this.state.pastFilter ? 'prev' : 'hidden'} 
                onClick={() => this.changePage(false)}>
            <img src="/images/icons/left.svg" />
            <div>previous page</div>
            </div>
            <div className={this.state.nextPage && !this.state.pastFilter ? 'next' : 'hidden'} 
                  onClick={() => this.changePage(true)}>
              <div>next page</div>
              <img src="/images/icons/right.svg" />
            </div>
            <div className={this.state.pastFilter && this.state.pastPage !== 0 ? 'prev' : 'hidden'} 
                onClick={() => this.changePage(false)}>
              <img src="/images/icons/left.svg" />
              <div>previous page</div>
            </div>
            <div className={this.state.pastFilter && this.state.pastNextPage ? 'next' : 'hidden'} 
                  onClick={() => this.changePage(true)}>
              <div>next page</div>
              <img src="/images/icons/right.svg" />
            </div>
          </td></tr>
        </tbody></table>
        {emptyMessage}
      </div>
    );
  }

  render() {
    const events = this.eventsToTable(
      this.state.events,
      (<h3 className="centerText">Looks like {this.state.user['name']} hasn't created any upcoming events.<br/>
        <a href={"/"}>Click here</a> to find more events.
      </h3>)
    );
    
    const pastEvents = this.eventsToTable(
      this.state.pastEvents, 
      (<h3 className="centerText">Looks like {this.state.user['name']} hasn't created any past events.<br/>
      	<a href={"/"}>Click here</a> to find more events.
      </h3>)
    );

    return (
      <Page loading={this.state.loading || this.state.pastLoading} error={this.state.error}>
        <div className="profile">
          <img className="profilePicture" 
              src={this.state.user['profilePicture'] ? this.state.user['profilePicture'] 
                  : '/images/users/default_profile.png'} />
          <div className={this.state.isOwnProfile ? 'name left' : 'name'}>
            {this.state.user['name']}
            {this.state.isOwnProfile ?
              <span><a href="/settings"><img className="icon" src="/images/icons/edit_blue.svg"/></a></span> :
              null
            }
          </div>
          <h4 className="bio">{this.state.user['bio']}</h4>
        </div> 
        <div className={this.state.pastFilter ? 'hidden' : ''}>
          {events}
        </div>
        <div className={this.state.pastFilter ? '' : 'hidden'}>
          {pastEvents}
        </div>
      </Page>
    );
  }

}
