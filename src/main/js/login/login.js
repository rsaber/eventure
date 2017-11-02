'use strict';

import Page from '../common/page';
import { formElToJsonStr, getLoggedInUserId, postData, emailRegex } from '../common/utils';
import React from 'react';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, login: true, formError: false, formLoading: false, password: '' };
    this.toggleLogin = this.toggleLogin.bind(this);
    this.setPassword = this.setPassword.bind(this);
    this.getSubmitForm = this.getSubmitForm.bind(this);
  }

  componentDidMount() {
    if (getLoggedInUserId()) {
      window.location.replace('/');
    } else {
      this.setState({ loading: false });
    }
  }

  toggleLogin() {
    this.setState({ login: !this.state.login, formError: '' });
  }

  setPassword(e) {
    this.setState({ password: e.target.value });
  }

  getSubmitForm(uri) {
    return (e) => {
      e.preventDefault();
      this.setState({ formLoading: true });
      postData(uri, formElToJsonStr(e.target),
        () => window.location.replace('/'),
        (err) => {
          if (err.message === '401') {
            this.setState({ formError: 'Incorrect credentials.', formLoading: false });
          } else if (err.message === '409') {
            this.setState({ formError: 'Email is unavailable. Please use a different email.', formLoading: false });
          } else {
            this.setState({ formError: 'There was an unexpected error! Please try again.', formLoading: false });
          }
        }
      );
    };
  }

  render() {
    return (
      <Page loading={this.state.loading} error={this.state.error}>
        <h1>Log in to eventure.</h1>
        <h3>With an eventure account you can find, create and save events near you</h3>
        <div className="formContainer">
          <table className={this.state.login ? '' : 'shifted'}><tbody>
            <tr><td>
              <form className="login" onSubmit={this.getSubmitForm('/api/login')} onInput={() => this.setState({ formError: null })}>
                {this.state.formError && <div className="alert error">{this.state.formError}</div>}
                <div>
                  <label htmlFor="email">Email</label><br />
                  <input type="text" name="email" placeholder="email@email.com" maxLength="255" pattern={emailRegex} required
                         onInvalid={(e) => e.target.setCustomValidity('Valid email is required.')}
                         onInput={(e) => e.target.setCustomValidity('')} /><br />
                </div>
                <div>
                  <label htmlFor="password">Password</label><br />
                  <input type="password" name="password" placeholder="password" maxLength="255" required
                         onInvalid={(e) => e.target.setCustomValidity('Password is required.')}
                         onInput={(e) => e.target.setCustomValidity('')} /><br />
                </div>
                <button type="submit" disabled={this.state.formLoading}>Log in</button>
              </form>
              <b className="centerText">Or <a onClick={this.toggleLogin}>sign up</a> for an account</b>
            </td>
            <td>
              <form className="login" onSubmit={this.getSubmitForm('/api/signup')} onInput={() => this.setState({ formError: null })}>
                {this.state.formError && <div className="alert error">{this.state.formError}</div>}
                <div>
                  <label htmlFor="name">Name *</label><br />
                  <input type="text" name="name" placeholder="Your Name" maxLength="80" required
                         onInvalid={(e) => e.target.setCustomValidity('Name is required.')}
                         onInput={(e) => e.target.setCustomValidity('')} /><br />
                </div>
                <div>
                  <label htmlFor="email">Email *</label><br />
                  <input type="text" name="email" placeholder="email@email.com" maxLength="255" pattern=".+@.+\..+" required
                         onInvalid={(e) => e.target.setCustomValidity('Valid email is required.')}
                         onInput={(e) => e.target.setCustomValidity('')} /><br />
                </div>
                <div>
                  <label htmlFor="password">Password *</label><br />
                  <input type="password" name="password" placeholder="password" minLength="6" maxLength="255" required onChange={this.setPassword}
                         onInvalid={(e) => e.target.setCustomValidity('Password is required and must be at least 6 characters long.')}
                         onInput={(e) => e.target.setCustomValidity('')} /><br />
                </div>
                <div>
                  <label htmlFor="passwordConfirmation">Confirm Password *</label><br />
                  <input type="password" name="passwordConfirmation" placeholder="password" maxLength="255" pattern={this.state.password} required
                         onInvalid={(e) => e.target.setCustomValidity('Passwords must match.')}
                         onInput={(e) => e.target.setCustomValidity('')} /><br />
                </div>
                <button type="submit" disabled={this.state.formLoading}>Sign up</button>
              </form>
              <b className="centerText">Or <a onClick={this.toggleLogin}>log in</a></b>
            </td></tr>
          </tbody></table>
        </div>
      </Page>
    );
  }
}
