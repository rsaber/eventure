'use strict';

import Page from '../common/page';
import CategorySelector from '../common/category-selector';
import { 
  getData, 
  getLoggedInUserId, 
  toTimeString, 
  toggleSaveHandler,
  dateRegex, 
  getPriceString,
  priceRegex 
} from '../common/utils';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

export default class Find extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      events: [],
      loading: true, 
      search: false, 
      title: 'Find an event.', 
      page: this.props.location.query.page ? Number(this.props.location.query.page) : 0, 
      nextPage: false,
      query: this.props.location.search ? this.props.location.search : '',
      autocomplete: null,
      displayList: true,
      displayListRadio: true,
      markers: [],
      centre: null,
      radius: 10,
    };
    
    this.getEvents = this.getEvents.bind(this);
    this.getSave = this.getSave.bind(this);
    this.changePage = this.changePage.bind(this);
    this.doSearch = this.doSearch.bind(this);
  }

  componentDidMount() {
    this.getEvents(this.props.location.search);
    const { title, longitude, latitude, radius } = this.props.location.query;
    if (title) {
      this.setState({ title });
    }
    if (longitude && latitude) {
      this.setState({ centre: { lat: Number(latitude), lng: Number(longitude) } });
    }
    if (radius) {
      this.setState({ radius: Number(radius) });
    }

    // Create the autocomplete object.
    const autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'));
    autocomplete.addListener('place_changed', function() {
      if (autocomplete.getPlace()) {
        document.getElementById('autocomplete').setCustomValidity('');
      }
    });

    this.setState({ autocomplete: autocomplete });
  }

  componentDidUpdate() {
    const mapEl = document.getElementById('map');
    if (!mapEl || this.state.events.length === 0) {
      this.state.map = null;
      return;
    } else if (this.state.map) {
      return;
    }
    // Function that creates and sets the map in the page. Takes in the user's current location.
    // Centre of map will be one of the following, in order of priority:
    // 1. searched location (this.state.centre)
    // 2. event that is closest to the user's current location
    // 3. the user's current location
    const createMap = (location) => {
      let closestLocation = null;
      let closestDistance = null;
      if (this.state.centre) {
        closestLocation = this.state.centre;
      } else {
        for (let event of this.state.events) {
          const distance = Math.pow(event.latitude - location.lat, 2) + Math.pow(event.longitude - location.lng, 2);
          if (event.latitude && event.longitude && (closestDistance === null || distance < closestDistance)) {
            closestLocation = {lat: event.latitude, lng: event.longitude};
            closestDistance = distance;
          }
        }
      }
      const bounds = new google.maps.Circle({
        radius: this.state.radius * 1000,
        center: closestLocation === null ? location : closestLocation
      });
      const map = new google.maps.Map(mapEl, {
        zoom: 14,
        center: closestLocation === null ? location : closestLocation
      });
      map.fitBounds(bounds.getBounds(), 0);
      this.setState({ map });
    };
    let location = { lat: -33.8781, lng: 151.1919 };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        createMap(location);
      }, () => {
        createMap(location);
      });
    }
  }

  getEvents(query) {
    this.setState({ loading: true });
    
    getData(this, '/api/event/filter' + query, (data) => {
      // check if size > 20 - this means there's a next page
      if (data.length > 20) {
        this.setState({ events: data.slice(0,20), nextPage: true });
      } else {
        this.setState({ events: data, nextPage: false });        
      }

      this.setState({ loading: false, displayList: this.state.displayListRadio });
    });
  }

  getSave(event) {
    return toggleSaveHandler(this, event);
  }
  
  changePage(next) {
    if (next) {
      this.state.page = this.state.page + 1;
    } else {
      this.state.page = this.state.page - 1;
    }
    let query = this.state.query.replace(/(&|\?)page=\d+$/,'');
    query += (query === '' ? '?' : '&') + 'page=' + this.state.page;
    
    this.getEvents(query);
    window.history.pushState('', '', query);
    window.scroll({ top: 0, left: 0 });
  }

  doSearch(e) {
    e.preventDefault();
    const form = new FormData(e.target);

    const place = this.state.autocomplete.getPlace();
    if (place && place.geometry && form.get('location')) {
      form.set('location', place.name);
      form.set('latitude', place.geometry.location.lat());
      form.set('longitude', place.geometry.location.lng());
      if (!form.get('radius')) {
        form.set('radius', 10);
      }
      this.setState({
        centre: {
          lat: Number(form.get('latitude')),
          lng: Number(form.get('longitude'))
        },
        radius: Number(form.get('radius'))
      });
    } else {
      this.setState({ centre: null, radius: form.get('radius') ? Number(form.get('radius')) : 10 });
    }

    // Create title for resulting search
    let title = 'Showing results';
    const lat = form.get('latitude');
    const long = form.get('longitude');
    const location = form.get('location');
    const radius = form.get('radius');
    if (lat && long && location && radius) {
      title += ` within ${radius}km of ${location}`;
    }
    const searchTerm = form.get('searchTerm');
    if (searchTerm) {
      title += ` including '${searchTerm}'`;
    }
    const startDate = form.get('startDate');
    const endDate = form.get('endDate');
    if (startDate && endDate) {
      title += ` between ${startDate} and ${endDate}`;
    } else if (startDate) {
      title += ` after ${startDate}`;
    } else if (endDate) {
      title += ` before ${endDate}`;
    }
    const price = form.get('priceMax');
    if (price) {
      title += ` for under $${price}`;
    }
    const category = form.get('category');
    if (category) {
      title += ` in the ${category} category`;
    }

    // Convert dates to correct format
    form.set('startDate', toTimeString(form.get('startDate'), '12:00', 'am'));
    form.set('endDate', toTimeString(form.get('endDate'), '11:59', 'pm'));

    // Build corresponding query string
    let queryString = '?';
    let emptySearch = true;
    for (let key of form.keys()) {
      if (form.get(key)) {
        emptySearch = false;
      }
      queryString += encodeURIComponent(key) + '=' + encodeURIComponent(form.get(key)) + '&';
    }

    // Reset title if no search parameters entered
    if (emptySearch) {
      title = 'Find an event.'
    } else {
      title += '.';
      queryString += encodeURIComponent('title') + '=' + encodeURIComponent(title);
    }

    this.setState({ title, search: false, query : queryString, page: 0 });
    this.getEvents(queryString);
    window.history.pushState('', '', queryString);
  }
    
  render() {
    this.state.markers.forEach(marker => marker.setMap(null));
    this.state.markers = [];
    const Spinner = require('react-spinkit');
    
    const listEvents = this.state.events.map((event) => {
      if (this.state.map && event.longitude && event.latitude) {
        const mapEl = (
          <a href={"/event/" + event.id} key={event.id} className="event">
            <div className="mapEl">
              <div className="title">
                <strong>{event.name}</strong> in {event.locality}
              </div>
              <br/>
              <div className="date">{event.timeString}{getPriceString(event.price, ', ')}</div>
            </div>
          </a>
        );
        const infowindow = new google.maps.InfoWindow({
          content: ReactDOMServer.renderToString(mapEl)
        });

        const marker = new google.maps.Marker({
          position: { lat: event.latitude, lng: event.longitude },
          map: this.state.map,
          title: event.name
        });
        marker.addListener('click', function () {
          infowindow.open(map, marker);
        });
        this.state.markers.push(marker);
      }

      return (
        <a href={"/event/" + event.id} key={event.id}>
          <div className='event'>
            <div className="imageContainer">
              <img
                src={event.imageUrl ? event.imageUrl : '/images/events/default.png'}
                className="image" />
              <div className={'hover' + (getLoggedInUserId() ? ' show' : '')}>
                <img src={event.saved ? '/images/icons/star.svg' : '/images/icons/star-o.svg'} onClick={this.getSave(event)}/>
              </div>
            </div>
            <div className="title">
              <strong>{event.name}</strong> in {event.locality}
            </div>
            <br/>
            <div className="date">{event.timeString}</div>
            <div className="date">{event.locationName}{getPriceString(event.price, ', ')}</div>
            <br/>
            <div className="descr">{event.description}</div>
          </div>
        </a>
      );
    });

    // When adding more input fields, increase the height of this form in the
    // `.search form` section of the css
    const search = (
      <div className={this.state.search || 'closed'}>
        <img
          src={this.state.search ? '/images/icons/cross.svg' : '/images/icons/sliders.svg'}
          className="toggle"
          onClick={() => this.setState({ search: !this.state.search })}
        />
        <div className="title"><h1>{this.state.title}</h1></div>
        <form onSubmit={this.doSearch}>
          <div>
            <label>Where</label>
            <input className="location" type="text" name="location" id="autocomplete" placeholder="enter a location"
                  onInput={(e) => e.target.setCustomValidity(
                      e.target.value ? 'Please enter a valid location.' : '')}/>
            <label>within</label>
            <input className="radius" type="text" name="radius" placeholder="km" pattern="[0-9]*"
                  onInvalid={(e) => e.target.setCustomValidity('A valid number is required.')}
                  onInput={(e) => e.target.setCustomValidity('')} />
          </div>
          <div className="two">
            <label>When</label>
            <input type="text" name="startDate" placeholder="dd/mm/yy" pattern={dateRegex}
                   onInvalid={(e) => e.target.setCustomValidity('Valid date is required.')}
                   onInput={(e) => e.target.setCustomValidity('')} />
            <label>to</label>
            <input type="text" name="endDate" placeholder="dd/mm/yy" pattern={dateRegex}
                   onInvalid={(e) => e.target.setCustomValidity('Valid date is required.')}
                   onInput={(e) => e.target.setCustomValidity('')} />
          </div>
          <div className="two">
            <label>What</label>
            <CategorySelector event={this.props.location.query} required={null}/>
            <label>&</label>
            <input className="second" type="text" name="priceMax" placeholder="$ price limit" pattern={priceRegex}
                   onInvalid={(e) => e.target.setCustomValidity('Price must be valid.')}
                   onInput={(e) => e.target.setCustomValidity('')} />
          </div>
          <div className="one">
            <input type="text" name="searchTerm" placeholder="search by term in name, description, location, and user" />
          </div>
          <table className="radio"><tbody><tr>
            <td>Show results as a</td>
            <td>
              <div className={this.state.displayListRadio ? 'selected' : ''} onClick={() => this.setState({ displayListRadio: true })} />
              <div className="back" />
            </td>
            <td className="words">List</td>
            <td>
              <div className={!this.state.displayListRadio ? 'selected' : ''} onClick={() => this.setState({ displayListRadio: false })} />
              <div className="back" />
            </td>
            <td className="words">Map</td>
          </tr></tbody></table>
          <button type="submit">Search</button>
        </form>
      </div>
    );

    return (
      <Page error={this.state.error}>
        <div className="search">
          {search}
        </div>
        <Page loading={this.state.loading}>
          <h2>{this.state.events.length === 0 ? 'No results were found.' : ''}</h2>
          <div className="myeventTable">
            <table className={this.state.displayList ? '' : 'other'}><tbody><tr>
              <td>{listEvents}</td>
              <td><div id="map">
                {this.state.events.length !== 0 &&
                  <Spinner className="centreSpinner" name="wandering-cubes" color="fuchsia"/>
                }
              </div></td>
            </tr></tbody></table>
          </div>
          <div className={this.state.page !== 0 && this.state.displayList ? 'prev' : 'hidden'} onClick={() => this.changePage(false)}>
            <img src="/images/icons/left.svg" />
            <div>previous page</div>
          </div>
          <div className={this.state.nextPage && this.state.displayList ? 'next' : 'hidden'} onClick={() => this.changePage(true)}>
            <div>next page</div>
            <img src="/images/icons/right.svg" />
          </div>
          <br/><br/><br/>
        </Page>
      </Page>
    );
  }
  
}