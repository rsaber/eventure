import React from 'react';

// When adding new categories, note that details.js assumes that there are no special
// characters in the value such as &, ? etc.
// If you absolutely want this, then you will need to call encodeURIComponent in details.js
export default class CategorySelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: this.props.event ? this.props.event.category : '' };
  }

  render() {
    return (
      <select name="category" className={'category' + (!this.state.value ? ' invalid' : '')}
              defaultValue={this.state.value} required={this.props.required}
              onChange={(e) => this.setState({ value: e.target.value })}>
        <option value="" disabled={this.props.required} hidden={this.props.required}>select a category</option>
        <option value="Art">Art</option>
        <option value="Film">Film</option>
        <option value="Drinks">Drinks</option>
        <option value="Party">Party</option>
        <option value="Music">Music</option>
        <option value="Retail">Retail</option>
        <option value="Food">Food</option>
        <option value="Sports">Sports</option>
        <option value="Crafts">Crafts</option>
        <option value="Educational">Educational</option>
        <option value="Theatre">Theatre</option>
        <option value="Social">Social</option>
        <option value="Nature">Nature</option>
        <option value="Dance">Dance</option>
        <option value="Adventure">Adventure</option>
        <option value="Other">Other</option>
      </select>
    );
  }
}
