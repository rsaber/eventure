import CategorySelector from '../common/category-selector';
import {
  dateRegex,
  timeRegex,
  priceRegex,
  getDayMonthYearFromTimestamp,
  getTimeFromTimestamp,
  postData,
  formDataToJsonStr,
  toTimeString
} from './utils';
import React from 'react';

export default class EventForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { autocomplete : null, image : null, loading: true, formLoading: false };
    this.getSubmitForm = this.getSubmitForm.bind(this);
  }

  componentDidMount() {
    // Create the autocomplete object.
    const autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'));
    autocomplete.addListener('place_changed', 
      () => {
        if (autocomplete.getPlace()) {
          document.getElementById('autocomplete').setCustomValidity('');
        }
      }
    );
    
    this.setState({ 
      autocomplete : autocomplete,
      loading : false
    });
  }

  getSubmitForm(uri) {
    return (e) => {
      e.preventDefault();

      this.setState({ formLoading: true });
      const formData = new FormData(e.target);

      const place = this.state.autocomplete.getPlace();
      if (place) {
        formData.set('locationAddress', place.formatted_address);
        formData.set('locationName', place.name);
        formData.set('latitude', place.geometry.location.lat());
        formData.set('longitude', place.geometry.location.lng());
        formData.set('mapsUrl', place.url);
        
        if (!this.state.image && !this.props.event && place.photos) {
          formData.set('imageUrl', place.photos[0].getUrl({'maxWidth': 800}));
        }
        
        for (let component of place.address_components) {
          if (component.types[0] === 'locality') {
            formData.set('locality', component.short_name);
            break;
          }
        } 
      }

      // format times
      const start = toTimeString(
          formData.get('date'), formData.get('startTime'), formData.get('startTimeSuffix'));
      const end = toTimeString(
          formData.get('date'), formData.get('endTime'), formData.get('endTimeSuffix'));
      formData.set('startTime', start);
      formData.set('endTime', end);

      const sendData = (data) => {
        postData(uri, formDataToJsonStr(data),
          (body) => window.location.replace(`/event/${JSON.parse(body).id}`),
          () => {
            this.setState({ formLoading: false, formError: 'There was an unexpected error! Please try again.' });
          }
        );
      };

      if (this.state.image) {
        const reader  = new FileReader();

        reader.addEventListener('load', function () {
          formData.set('imageUrl', reader.result);
          sendData(formData);
        });

        reader.readAsDataURL(this.state.image);
      } else {
        sendData(formData);
      }
    };
  }


  render() {
      return (
      <form className="create" onSubmit={this.getSubmitForm(this.props.uri)} onInput={() => this.setState({ formError: null })}>
        {this.state.formError && <div className="alert error">There was an error! Please try again.</div>}
        <row>
          <label htmlFor="name">Event Name *</label>
          <input type="text" name="name" placeholder="event name" maxLength="50" required
                 defaultValue={this.props.event ? this.props.event['name'] : ''}
                 onInvalid={(e) => e.target.setCustomValidity('Event name is required.')}
                 onInput={(e) => e.target.setCustomValidity('')}/>
        </row>
        <row>
          <label htmlFor="date">Event Date *</label>
          <input type="text" name="date" placeholder="dd/mm/yy" maxLength="8" pattern={dateRegex} required
                 defaultValue={this.props.event ? getDayMonthYearFromTimestamp(this.props.event['startTime']) : ''}
                 onInvalid={(e) => e.target.setCustomValidity('Valid date in the dd/mm/yy format is required.')}
                 onInput={(e) => e.target.setCustomValidity('')}/>
        </row>
        <row>
          <label htmlFor="startTime">Start Time *</label>
          <input type="text" name="startTime" placeholder="hh:mm" maxLength="5" pattern={timeRegex} required
                 defaultValue={this.props.event ? getTimeFromTimestamp(this.props.event['startTime'])['time'] : ''}
                 onInvalid={(e) => e.target.setCustomValidity('Valid 12hr time in the hh:mm format is required.')}
                 onInput={(e) => e.target.setCustomValidity('')}/>
          <select name="startTimeSuffix"
                  defaultValue={this.props.event ? getTimeFromTimestamp(this.props.event['startTime'])['meridiem'] : 'am'}>
            <option value="am">AM</option>
            <option value="pm">PM</option>
          </select>
        </row>
        <row>
          <label htmlFor="endTime">Finish Time *</label>
          <input type="text" name="endTime" placeholder="hh:mm" maxLength="5" pattern={timeRegex} required
                 defaultValue={this.props.event ? getTimeFromTimestamp(this.props.event['endTime'])['time'] : ''}
                 onInvalid={(e) => e.target.setCustomValidity('Valid 12hr time in the hh:mm format is required.')}
                 onInput={(e) => e.target.setCustomValidity('')}/>
          <select name="endTimeSuffix"
                  defaultValue={this.props.event ? getTimeFromTimestamp(this.props.event['endTime'])['meridiem'] : 'am'}>
            <option value="am">AM</option>
            <option value="pm">PM</option>
          </select>
        </row>
        <row>
          <label htmlFor="address">Location *</label>
          <input type="text" name="locationAddress" id="autocomplete" placeholder="enter an address" required
                defaultValue={this.props.event ? this.props.event['locationAddress'] : ''}
                onInput={(e) => e.target.setCustomValidity('Please enter a valid location.')}/>
        </row>
        <row>
          <label htmlFor="date">Link</label>
          <input type="text" name="link" placeholder="enter a URL" maxLength="255"
                 defaultValue={this.props.event ? this.props.event['link'] : ''}/>
        </row>
        <row>
          <label htmlFor="price">Price</label>
          <input type="text" name="price" placeholder="$" maxLength="255" pattern={priceRegex}
                 defaultValue={this.props.event ? this.props.event['price'] : ''}
                 onInvalid={(e) => e.target.setCustomValidity('Price must be valid with up to 2 decimal points.')}
                 onInput={(e) => e.target.setCustomValidity('')}/>
        </row>
        <row>
          <label htmlFor="category">Category *</label>
          <CategorySelector event={this.props.event} required={true}/>
        </row>
        <row-lg>
          <label htmlFor="description">Description *</label>
          <textarea name="description" placeholder="give us a short description of your event" maxLength="990"
                    required defaultValue={this.props.event ? this.props.event['description'] : ''}
                    onInvalid={(e) => e.target.setCustomValidity('Description is required.')}
                    onInput={(e) => e.target.setCustomValidity('')}/>
        </row-lg>
        <row>
          <label>Image</label>
          <div className={this.state.image ? "file-name" : "file-name placeholder"}>
            {this.state.image ? this.state.image.name : "choose an image"}
          </div>
          <label htmlFor="image" className="upload-button">
            <img src="/images/icons/picture.svg"/>
          </label>
          <input name="image" id="image" type="file" accept="image/*"
                 onChange={(e) => this.setState({ image: e.target.files[0] })}/>
        </row>
        <div className="buttons">
          {this.props.cancelButton && this.props.cancelButton(this.state.formLoading)}
          {this.props.submitButton(this.state.formLoading)}
        </div>
      </form>
    );
  }
}
