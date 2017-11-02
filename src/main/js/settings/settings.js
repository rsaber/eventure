'use strict';

import Page from '../common/page';
import { formDataToJsonStr, postData, getData, emailRegex, passwordRegex } from '../common/utils';
import React from 'react';

export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      formLoading: false,
      formStatus: null,
      password: '',
      tab: 'account',
      image: null
    };

    this.getSubmitForm = this.getSubmitForm.bind(this);
    this.getTabContents = this.getTabContents.bind(this);
  }

  componentDidMount() {
    getData(this, '/api/user',  (data) => {
      this.setState ({
        loading: false,
        user_id: data.id,
        name: data.name,
        email: data.email,
        bio: data.bio
      });
    });
  }

  getSubmitForm(uri) {
    return (e) => {
      e.preventDefault();

      this.setState({ formLoading: true });
      const formData = new FormData(e.target);

      const sendData = (data) => {
        postData(uri, formDataToJsonStr(data),
          () => this.setState({ formStatus: { success: true, message: 'Details updated successfully!' }, formLoading: false }),
          (err) => {
            if (err.message === '409') {
              this.setState({ formStatus: { success: false, message: 'Email is unavailable. Please use a different email.' }, formLoading: false });
            } else {
              this.setState({ formStatus: { success: false, message: 'There was an unexpected error! Please try again.' }, formLoading: false });
            }
          }
        );
      };

      this.setState({ password: '' });
      if (e.target.elements.passwordConfirmation) {
        e.target.elements.passwordConfirmation.value = '';
      }

      if (this.state.image) {
        const reader  = new FileReader();

        reader.addEventListener('load', function () {
          formData.set('profilePicture', reader.result);
          sendData(formData);
        });

        reader.readAsDataURL(this.state.image);
      } else {
        sendData(formData);
      }
    }
  }

  getTabContents(type) {
    let result;
    if (type === 'account') {
      result = (
        <tr>
          <row>
            <label htmlFor="email">Email</label>
            <input type="text" name="email" placeholder="enter your new email here" value={this.state.email} maxLength="255" pattern={emailRegex} required
                   onInvalid={(e) => e.target.setCustomValidity('Valid email is required.')}
                   onInput={(e) => e.target.setCustomValidity('')}
                   onChange={(e) => this.setState({ email: e.target.value, })} />
          </row>

          <row>
            <label htmlFor="password">New Password</label>
            <input type="password" name="password" placeholder="enter your new password here" maxLength="255" pattern={passwordRegex}
                   value={this.state.password}
                   onInvalid={(e) => e.target.setCustomValidity('Password must be at least 6 characters long')}
                   onInput={(e) => e.target.setCustomValidity('')}
                   onChange={(e) => this.setState({ password: e.target.value })}/>
          </row>
          <row>
            <label htmlFor="passwordConfirmation">Confirm Password</label>
            <input type="password" name="passwordConfirmation" placeholder="confirm password" maxLength="255" pattern={this.state.password} required={this.state.password.trim() === '' ? false : 'required'}
                   onInvalid={(e) => e.target.setCustomValidity('Passwords must match.')}
                   onInput={(e) => e.target.setCustomValidity('')} />
          </row>
        </tr>
      )
    } else if (type === 'profile') {
      result = (
        <tr>
          <row>
            <h3 className="centerText bold">You can visit your public profile <a href={"/profile/" + this.state.user_id}> here</a></h3>
          </row>
          <row>
            <label htmlFor="name">Name</label>
            <input type="text" name="name" placeholder="enter your new name here" value={this.state.name} maxLength="80" required
                   onInvalid={(e) => e.target.setCustomValidity('Name is required.')}
                   onInput={(e) => e.target.setCustomValidity('')}
                   onChange={(e) => {this.setState({ name: e.target.value })}} />
          </row>
          <row-xlg>
            <label htmlFor="bio">Bio</label>
            <textarea name="bio" placeholder="enter a short description of yourself" value={this.state.bio} maxLength="990"
                   onInput={(e) => e.target.setCustomValidity('')}
                   onChange={(e) => this.setState({ bio: e.target.value })} />
          </row-xlg>
          <row>
            <label>Picture</label>
            <div className={this.state.image ? 'file-name' : 'file-name placeholder'}>
              {this.state.image ? this.state.image.name : 'choose an image'}
            </div>
            <label htmlFor="image" className="upload-button">
              <img src="/images/icons/picture.svg"/>
            </label>
            <input name="image" id="image" type="file" accept="image/*"
                   onChange={(e) => this.setState({ image: e.target.files[0] })}/>
          </row>
        </tr>
      )
    }

    return result;
  }

  render() {
    return (
      <Page loading={this.state.loading} error={this.state.error}>
        <h1>Update your settings</h1>
        <div className="settings">
          <div className="sidebar">
            <button className={this.state.tab === 'account' ? 'highlighted' : ''} onClick={() => this.setState({ tab: 'account', formStatus: null })}>Account</button>
            <button className={this.state.tab === 'profile' ? 'highlighted' : ''} onClick={() => this.setState({ tab: 'profile', formStatus: null })}>Profile</button>
            <button onClick={() => window.location.replace('/api/logout')}>Log Out</button>
          </div>

          <div className="settingsContainer" onInput={() => this.setState({ formStatus: null })}>
            <form className="create" onSubmit={this.getSubmitForm('/api/user/update')}>
              {this.state.formStatus &&
                <div className={'alert ' + (this.state.formStatus.success ? 'success' : 'error')}>
                  {this.state.formStatus.message}
                </div>
              }
              {this.getTabContents(this.state.tab)}
              <button type="submit" disabled={this.state.formLoading}>Update</button>
            </form>
          </div>

        </div>
      </Page>
    );
  }
}
