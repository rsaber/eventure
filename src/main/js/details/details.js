'use strict';

import Page from '../common/page';
import EventForm from '../common/event-form';
import {
  getData,
  postData,
  getLoggedInUserId,
  toggleSave,
  getPriceString
} from '../common/utils';
import React from 'react';
import Modal from 'react-modal';

export default class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = { event: {}, loading: true, loadingSaveCount: true, isOwner: false, editing: false, deleting: false, deleteLoading: false };
    this.save = this.save.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.toggleDelete = this.toggleDelete.bind(this);
  }

  componentDidMount() {
    getData(this, '/api/event/' + this.props.params.id, (data) => {
      this.setState({
        event: data,
        isOwner: getLoggedInUserId() === data.creator.id.toString(),
        name: data.creator.name,
        save: data.saved,
        loading: false
      });
    });
    getData(this, '/api/event/' + this.props.params.id + '/savecount', (data) => {
      this.setState({
        saveCount: data.saveCount,
        loadingSaveCount: false
      });
    });
  }

  componentDidUpdate() {
    const mapEl = document.getElementById('map');
    if (mapEl && !this.state.loading && !map.innerHTML) {
      const data = this.state.event;
      const map = new google.maps.Map(mapEl, {
        zoom: 14,
        center: {lng: data.longitude, lat: data.latitude}
      });

      new google.maps.Marker({
        position: {lng: data.longitude, lat: data.latitude},
        map: map,
        title: data.name
      });
    }
  }

  toggleEdit() {
    this.setState({ editing: !this.state.editing });
  }

  toggleDelete() {
    this.setState({ deleting: !this.state.deleting });
  }

  deleteEvent() {
    this.setState({ deleteLoading: true });
    postData('/api/event/user/delete/' + this.props.params.id, null,
      () => window.location.replace('/'),
      () => {
        this.setState({ deleteError: 'There was an error deleting the event, please try again.', deleteLoading: false });
      }
    );
  }

  save() {
    toggleSave(this.props.params.id, this.state.save,
      (data) => this.setState({ save: JSON.parse(data).id, saveCount: this.state.saveCount + 1 }),
      () => this.setState({ save: null, saveCount: this.state.saveCount - 1 })
    );
  }

  render() {
    return (
      <Page loading={this.state.loading || this.state.loadingSaveCount} error={this.state.error}>
        {this.state.loading || this.state.loadingSaveCount ||
          (<div>
            <Modal className="modal"
                isOpen={this.state.editing}
                onRequestClose={this.toggleEdit}>
              <h1>Edit Event</h1>
              <div className="createFormContainer">
                <EventForm
                  uri={'/api/event/user/edit/' + this.state.event['id']}
                  event={this.state.event}
                  submitButton={loading => (<button type="submit" disabled={loading}>Update event</button>)}
                  cancelButton={loading => (<button type="button" className="cancel" disabled={loading} onClick={this.toggleEdit}>Cancel</button>)}
                />
              </div>
            </Modal>

            <Modal className="modal delete-modal"
                isOpen={this.state.deleting}
                onRequestClose={this.toggleDelete}>
              {this.state.deleteError && <div className="alert error">{this.state.deleteError}</div>}
              <h1>Are you sure you want to delete &apos;{this.state.event.name}&apos;?</h1>
              <br/><br/>
              <button type="button" className="cancel" onClick={this.toggleDelete} disabled={this.state.deleteLoading}>Cancel</button>
              <button type="button" onClick={this.deleteEvent} disabled={this.state.deleteLoading}>Delete event</button>
            </Modal>

            <div className="details">
              <img
                src={this.state.event['imageUrl'] ? this.state.event['imageUrl'] : '/images/events/default.png'}
                className="details"
              />
              <span className={this.state.isOwner ? 'button delete' : 'hidden'} onClick={this.toggleDelete}>
                <img src="/images/icons/bin.svg"/>
              </span>
              <span className={this.state.isOwner ? 'button edit' : 'hidden'} onClick={this.toggleEdit}>
                <img src="/images/icons/edit.svg"/>
              </span>
              <span className={getLoggedInUserId() ? 'button save' : 'hidden'} onClick={this.save}>
                <img src={this.state.save ? '/images/icons/star.svg' : '/images/icons/star-o.svg'} />
              </span>
              <h2>{this.state.event['name']}</h2>
              <div className="descr">{this.state.event['description']}</div>

              <table><tbody>
                <tr>
                  <td><img src="/images/icons/user-circle.svg" /></td>
                  <td>
                    Hosted by <a href={"/profile/" + this.state.event['creator']['id']}>{this.state.event['creator']['name']}</a>
                  </td>
                </tr>
                <tr>
                  <td><img src="/images/icons/date.svg" /></td>
                  <td>{this.state.event['timeString']}</td>
                </tr>
                {this.state.event['link'] &&
                  <tr>
                    <td><img src="/images/icons/link.svg"/></td>
                    <td><a href={this.state.event['link']}>{this.state.event['link']}</a></td>
                  </tr>
                }
                {typeof this.state.event['price'] === 'number' &&
                  <tr>
                    <td><img src="/images/icons/price.svg" /></td>
                    <td>{getPriceString(this.state.event['price'], '')}</td>
                  </tr>
                }
                <tr>
                  <td><img src="/images/icons/category.svg" /></td>
                  <td>
                    <a href={`/?category=${this.state.event['category']}&title=Showing%20results%20in%20the%20${this.state.event['category']}%20category.`}>
                        {this.state.event['category']}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td><img src="/images/icons/star-grey.svg" /></td>
                  <td>{this.state.saveCount} {this.state.saveCount === 1 ? 'person' : 'people'} saved this event</td>
                </tr>
              </tbody></table>
              <table><tbody><tr>
                <td><img src="/images/icons/location.svg" /></td>
                <td rowSpan="10" className="map">
                      <span><a href={this.state.event['mapsUrl']}>{this.state.event['locationName']}</a>
                      <br/><em>{this.state.event['locationAddress']}</em></span>
                  <div id="map"></div>
                </td>
              </tr></tbody></table>
            </div>
          </div>)
        }
      </Page>
    );
  }
}
