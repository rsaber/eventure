'use strict';

import Page from '../common/page';
import { getData, toggleSaveHandler, getPriceString } from '../common/utils';
import React from 'react';

export default class My extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = { 
      myEvents: [], 
      savedEvents: [],
      pastMyEvents: [],
      pastSavedEvents: [], 
      saveFilter: true, 
      pastFilter: false,
      myLoading: true, 
      savedLoading: true,
      pastSavedLoading: true,
      pastMyLoading: true,
      savePage: 0,
      myPage: 0,
      pastSavePage: 0,
      pastMyPage: 0,
      myNextPage: false,
      saveNextPage: false,
      pastMyNextPage: false,
      pastSaveNextPage: false
    }

    this.getEvents = this.getEvents.bind(this);
    this.eventsToTable = this.eventsToTable.bind(this);
    this.getSave = this.getSave.bind(this);
  }

  componentDidMount() {

    this.getEvents(true);
    this.getEvents(false);
  }
  
  getEvents(saveFilter) {
    if (saveFilter) {
      this.setState({ savedLoading: true });
      getData(this, `/api/event/filter?savedEventsOnly=true&page=${this.state.savePage}`, (data) => {
        if (data.length > 20) {
          this.setState({ savedEvents: data.slice(0,20), saveNextPage: true, savedLoading: false });
        } else {
          this.setState({ savedEvents: data, saveNextPage: false, savedLoading: false });
        }
      });
      this.setState({ pastSavedLoading: true });
      getData(this, `/api/event/filter?savedEventsOnly=true&pastEventsOnly=true&page=${this.state.pastSavePage}`, (data) => {
        if (data.length > 20) {
          this.setState({ pastSavedEvents: data.slice(0,20), pastSaveNextPage: true, pastSavedLoading: false });
        } else {
          this.setState({ pastSavedEvents: data, pastSaveNextPage: false, pastSavedLoading: false });
        }
      });
    } else {
      this.setState({ myLoading: true });
      getData(this, `/api/event/filter?myEventsOnly=true&page=${this.state.myPage}`, (data) => {
        if (data.length > 20) {
          this.setState({ myEvents: data.slice(0,20), myNextPage: true, myLoading: false });
        } else {
          this.setState({ myEvents: data, myNextPage: false, myLoading: false });
        }
      });
      this.setState({ pastMyLoading: true});
      getData(this, `/api/event/filter?myEventsOnly=true&pastEventsOnly=true&page=${this.state.pastMyPage}`, (data) => {
        if (data.length > 20) {
          this.setState({ pastMyEvents: data.slice(0,20), pastMyNextPage: true, pastMyLoading: false});
        } else {
          this.setState({ pastMyEvents: data, pastMyNextPage: false, pastMyLoading: false});
        }
      });
    }
  }

  getSave(event) {
    return toggleSaveHandler(this, event);
  }
  
  changePage(next) {
    if (next) {
      if (this.state.saveFilter) {
      	if (this.state.pastFilter) {
      		this.state.pastSavePage = this.state.pastSavePage + 1;
      	} else {
        	this.state.savePage = this.state.savePage + 1;
        }
      } else {
      	if (this.state.pastFilter) {
      		this.state.pastMyPage = this.state.pastMyPage + 1;
      	} else {
        	this.state.myPage = this.state.myPage + 1;
        }        
      }
    } else {
      if (this.state.saveFilter) {
      	if (this.state.pastFilter) {
      		this.state.pastSavePage = this.state.pastSavePage - 1;
      	} else {
        	this.state.savePage = this.state.savePage - 1;
        
        }
      } else {
      	if (this.state.pastFilter) {
      		this.state.pastMyPage = this.state.pastMyPage - 1;
      	} else {
        	this.state.myPage = this.state.myPage - 1;
        }
      }
    }
    
    this.getEvents(this.state.saveFilter);
    window.scroll({ top: 0, left: 0 });
  }

  eventsToTable(events, emptyEl) {
    const listEvents = events.map((event, idx, arr) => {
      emptyEl = null;
      const month = event.timeString.split(' ').slice(5, 7).join(' ');
      const lastMonth = idx === 0 ? '' : arr[idx - 1].timeString.split(' ').slice(5, 7).join(' ');

      return (
        <tr key={event.id}>
          <td className="first">{month !== lastMonth && month}</td>
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
                <p><b>{event.timeString}{getPriceString(event.price, ', ')}</b>
                  <span className="description">{event.description}</span>
                </p>
              </div>
            </a>
          </td>
        </tr>
      );
    });

    return (
      <div>
        <table className="wide"><tbody>
          {listEvents}
          <tr><td></td><td>
            <div className={!this.state.pastFilter && ((this.state.myPage !== 0 && !this.state.saveFilter) 
                || (this.state.savePage !== 0 && this.state.saveFilter)) ? 'prev' : 'hidden'} 
                onClick={() => this.changePage(false)}>
            <img src="/images/icons/left.svg" />
            <div>previous page</div>
            </div>
            <div className={!this.state.pastFilter && ((this.state.myNextPage && !this.state.saveFilter)
                  || (this.state.saveNextPage && this.state.saveFilter)) ? 'next' : 'hidden'} 
                  onClick={() => this.changePage(true)}>
              <div>next page</div>
              <img src="/images/icons/right.svg" />
            </div>
            <div className={this.state.pastFilter && ((this.state.pastMyPage !== 0 && !this.state.saveFilter) 
                || (this.state.pastSavePage !== 0 && this.state.saveFilter)) ? 'prev' : 'hidden'} 
                onClick={() => this.changePage(false)}>
              <img src="/images/icons/left.svg" />
              <div>previous page</div>
            </div>
            <div className={this.state.pastFilter && ((this.state.pastMyNextPage && !this.state.saveFilter)
                  || (this.state.pastSaveNextPage && this.state.saveFilter)) ? 'next' : 'hidden'} 
                  onClick={() => this.changePage(true)}>
              <div>next page</div>
              <img src="/images/icons/right.svg" />
            </div>
          </td></tr>
        </tbody></table>
        {emptyEl}
      </div>
    );
  }

  render() {
    const my = this.eventsToTable(
      this.state.myEvents,
      (<h3 className="centerText">You have no upcoming created events!<br/>
        <a href="/create">Click here</a> to create events.</h3>)
    );
    const saved = this.eventsToTable(
      this.state.savedEvents,
      (<h3 className="centerText">You have no upcoming saved events!<br/>
        <a href="/">Click here</a> to find events.</h3>)
    );
    const pastSaved = this.eventsToTable(
      this.state.pastSavedEvents,
      (<h3 className="centerText">You have no past saved events!<br/>
        <a href="/">Click here</a> to find events.</h3>)
    );
    const pastMy = this.eventsToTable(
    	this.state.pastMyEvents,
    	(<h3 className="centerText">You have no past created events!<br/>
    	  <a href="/create">Click here</a> to create events.</h3>)
    );

    return (
      <Page loading={this.state.myLoading || this.state.savedLoading || this.state.pastSavedLoading || this.state.pastMyLoading} error={this.state.error}>
        <h1>My Events.</h1>
        <h3>See all of your events.</h3>
      
        <table className="options"><tbody><tr>
          <td>
            <div className={this.state.saveFilter ? 'fill selected' : 'fill'} onClick={() => this.setState({ saveFilter: true })} />
            <div className="check" />
            <span>My saved events</span>
          </td>
          <td>
            <div className={!this.state.saveFilter ? 'fill selected' : 'fill'} onClick={() => this.setState({ saveFilter: false })} />
            <div className="check" />
            <span>My created events</span>
          </td>
          <td>
            <span className="past" onClick={() => this.setState({ pastFilter: !this.state.pastFilter })}>
              show {this.state.pastFilter ? 'upcoming' : 'past'} events
            </span>
          </td>
        </tr></tbody></table>
        
        <div className={this.state.pastFilter ? 'hidden' : ''}>
        	<div className="myeventTable">
          	<table className={this.state.saveFilter ? '' : 'other'}><tbody><tr>
            	<td>{saved}</td>
            	<td>{my}</td>
          	</tr></tbody></table>
          </div>
        </div>
        
        <div className={this.state.pastFilter ? '' : 'hidden'}>
        	<div className="myeventTable">
          		<table className={this.state.saveFilter ? '' : 'other'}><tbody><tr>
            		<td>{pastSaved}</td>
            		<td>{pastMy}</td>
          		</tr></tbody></table>
          	</div>
        </div>
      </Page>
    );
  }
}
